/**
 * 角色创建处理器
 * 处理 createCharacterStep1 和 createCharacterConfirm 消息
 */

import { Injectable } from '@nestjs/common';
import { MessageFactory } from '@packages/core';
import type { CharacterAttributes, CharacterOrigin } from '@packages/core';
import { CharacterService } from '../../character/character.service';
import { FateService } from '../../fate/fate.service';
import { ORIGIN_CONFIG } from '../../fate/fate.constants';
import type { Session } from '../types/session';

/** 临时数据超时时间（30分钟） */
const PENDING_TIMEOUT = 30 * 60 * 1000;

/** 角色名正则：2-6个中文字符 */
const NAME_REGEX = /^[\u4e00-\u9fa5]{2,6}$/;

/** 合法出身列表 */
const VALID_ORIGINS: CharacterOrigin[] = [
  'noble',
  'wanderer',
  'scholar',
  'soldier',
  'herbalist',
  'beggar',
];

/** 属性键列表 */
const ATTR_KEYS: (keyof CharacterAttributes)[] = [
  'wisdom',
  'perception',
  'spirit',
  'meridian',
  'strength',
  'vitality',
];

@Injectable()
export class CharacterHandler {
  constructor(
    private readonly characterService: CharacterService,
    private readonly fateService: FateService,
  ) {}

  /**
   * 处理第一步：选择出身 → 生成命格
   */
  async handleStep1(
    client: any,
    session: Session,
    data: { origin: CharacterOrigin; gender: 'male' | 'female' },
  ) {
    // 校验已认证
    if (!session.authenticated || !session.accountId) {
      this.sendFailed(client, 'session_expired', '请先登录');
      return;
    }

    // 校验无已有角色
    const existing = await this.characterService.findByAccountId(session.accountId);
    if (existing) {
      this.sendFailed(client, 'already_has_character', '你已经有角色了');
      return;
    }

    // 校验出身合法
    if (!data.origin || !VALID_ORIGINS.includes(data.origin)) {
      this.sendFailed(client, 'invalid_origin', '无效的出身选择');
      return;
    }

    // 校验性别
    if (data.gender !== 'male' && data.gender !== 'female') {
      this.sendFailed(client, 'server_error', '无效的性别选择');
      return;
    }

    try {
      // 调用 FateService 排盘
      const fate = this.fateService.generateFate(data.gender);

      // 存入 Session 临时数据
      session.pendingCharacter = {
        origin: data.origin,
        gender: data.gender,
        fateName: fate.fateName,
        fateType: fate.fateType,
        fatePoem: fate.fatePoem,
        destiny: fate.destiny,
        benefactor: fate.benefactor,
        calamity: fate.calamity,
        fortune: fate.fortune,
        attributeCaps: fate.attributeCaps,
        wuxingju: fate.wuxingju,
        mingzhuStar: fate.mingzhuStar,
        shenzhuStar: fate.shenzhuStar,
        astrolabeJson: fate.astrolabeJson,
        generatedAt: Date.now(),
      };

      // 返回命格消息
      client.send(
        MessageFactory.serialize(
          MessageFactory.create(
            'createCharacterFate',
            fate.fateName,
            fate.fatePoem,
            fate.fateType,
            fate.destiny,
            fate.benefactor,
            fate.calamity,
            fate.fortune,
            fate.attributeCaps,
            fate.wuxingju,
            fate.mingzhuStar,
            fate.shenzhuStar,
          )!,
        ),
      );
    } catch (error) {
      console.error('命格生成失败:', error);
      this.sendFailed(client, 'server_error', '命格生成失败，请重试');
    }
  }

  /**
   * 处理确认创建：验证属性分配 + 写入数据库
   */
  async handleConfirm(
    client: any,
    session: Session,
    data: { name: string; origin: CharacterOrigin; attributes: CharacterAttributes },
  ) {
    // 校验已认证
    if (!session.authenticated || !session.accountId) {
      this.sendFailed(client, 'session_expired', '请先登录');
      return;
    }

    // 校验 pendingCharacter 存在
    if (!session.pendingCharacter) {
      this.sendFailed(client, 'fate_not_generated', '请先选择出身生成命格');
      return;
    }

    // 校验超时（30分钟）
    if (Date.now() - session.pendingCharacter.generatedAt > PENDING_TIMEOUT) {
      session.pendingCharacter = undefined;
      this.sendFailed(client, 'session_expired', '命格数据已过期，请重新选择出身');
      return;
    }

    // 校验角色名格式
    if (!data.name || !NAME_REGEX.test(data.name)) {
      this.sendFailed(client, 'name_invalid', '角色名须为2-6个中文字符');
      return;
    }

    // 校验角色名唯一
    const nameExists = await this.characterService.isNameExists(data.name);
    if (nameExists) {
      this.sendFailed(client, 'name_exists', '此角色名已被使用');
      return;
    }

    // 校验出身一致
    if (data.origin !== session.pendingCharacter.origin) {
      this.sendFailed(client, 'invalid_origin', '出身与先前选择不一致');
      return;
    }

    // 校验属性分配
    const attrError = this.validateAttributes(data.attributes, session.pendingCharacter.attributeCaps);
    if (attrError) {
      this.sendFailed(client, 'invalid_attributes', attrError);
      return;
    }

    // 校验无已有角色（并发防护）
    const existing = await this.characterService.findByAccountId(session.accountId);
    if (existing) {
      this.sendFailed(client, 'already_has_character', '你已经有角色了');
      return;
    }

    try {
      const pending = session.pendingCharacter;

      // 计算最终属性 = 根基分配 + 出身加成（不超上限）
      const finalAttrs = this.applyOriginBonus(data.attributes, data.origin, pending.attributeCaps);

      // 乞丐出身：机缘+2
      let fortune = pending.fortune;
      if (data.origin === 'beggar') {
        fortune = Math.min(5, fortune + 2);
      }

      // 写入数据库
      const character = await this.characterService.create({
        accountId: session.accountId,
        name: data.name,
        origin: data.origin,
        gender: pending.gender,
        fateName: pending.fateName,
        fateType: pending.fateType,
        fatePoem: pending.fatePoem,
        destiny: pending.destiny,
        benefactor: pending.benefactor,
        calamity: pending.calamity,
        fortune,
        ...finalAttrs,
        wisdomCap: pending.attributeCaps.wisdom,
        perceptionCap: pending.attributeCaps.perception,
        spiritCap: pending.attributeCaps.spirit,
        meridianCap: pending.attributeCaps.meridian,
        strengthCap: pending.attributeCaps.strength,
        vitalityCap: pending.attributeCaps.vitality,
        astrolabeJson: pending.astrolabeJson,
        wuxingju: pending.wuxingju,
        mingzhuStar: pending.mingzhuStar,
        shenzhuStar: pending.shenzhuStar,
      });

      // 清除临时数据
      session.pendingCharacter = undefined;

      // 返回成功消息
      client.send(
        MessageFactory.serialize(
          MessageFactory.create(
            'createCharacterSuccess',
            character.id,
            character.name,
            `少侠${character.name}，江湖路远，望君珍重`,
          )!,
        ),
      );
    } catch (error) {
      console.error('角色创建失败:', error);
      this.sendFailed(client, 'server_error', '创建角色失败，请重试');
    }
  }

  /**
   * 验证属性分配
   * - 总和 = 18
   * - 每项 ≥ 1 且 ≤ 上限
   */
  private validateAttributes(attrs: CharacterAttributes, caps: CharacterAttributes): string | null {
    if (!attrs || typeof attrs !== 'object') {
      return '属性数据无效';
    }

    let sum = 0;
    for (const key of ATTR_KEYS) {
      const val = attrs[key];
      if (typeof val !== 'number' || !Number.isInteger(val)) {
        return `${key} 不是有效整数`;
      }
      if (val < 1) {
        return `${key} 不能小于 1`;
      }
      if (val > caps[key]) {
        return `${key} 超过上限 ${caps[key]}`;
      }
      sum += val;
    }

    if (sum !== 18) {
      return `根基点总和应为 18，当前为 ${sum}`;
    }

    return null;
  }

  /**
   * 叠加出身加成（不超上限）
   */
  private applyOriginBonus(
    base: CharacterAttributes,
    origin: CharacterOrigin,
    caps: CharacterAttributes,
  ): CharacterAttributes {
    const config = ORIGIN_CONFIG[origin];
    const result = { ...base };

    if (config && config.bonus) {
      for (const key of ATTR_KEYS) {
        const bonus = config.bonus[key] || 0;
        result[key] = Math.min(caps[key], result[key] + bonus);
      }
    }

    return result;
  }

  /** 发送创建失败消息 */
  private sendFailed(client: any, reason: string, message: string) {
    client.send(
      MessageFactory.serialize(
        MessageFactory.create('createCharacterFailed', reason, message)!,
      ),
    );
  }
}
