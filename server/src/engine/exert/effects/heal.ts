/**
 * HealEffect — 运功疗伤
 *
 * 通用持续效果：非战斗中持续消耗内力恢复气血。
 * 使用 callOut 注册 tick 循环（3 秒间隔），支持多种停止条件。
 *
 * 对标: LPC exert heal
 */
import { ExertEffect, ExertEffectBase, type ExertExecuteResult } from '../exert-effect-base';
import type { PlayerBase } from '../../game-objects/player-base';
import { MessageFactory, rt, bold } from '@packages/core';

@ExertEffect()
export class HealEffect extends ExertEffectBase {
  readonly name = 'heal';
  readonly displayName = '运功疗伤';
  readonly isUniversal = true;
  readonly canUseInCombat = false;

  execute(
    player: PlayerBase,
    forceSkillId: string,
    forceLevel: number,
  ): ExertExecuteResult {
    // 已在疗伤中
    if (player.getTemp<boolean>('exert/healing')) {
      return {
        success: false,
        message: rt('sys', '你已经在运功疗伤中。'),
        resourceChanged: false,
      };
    }

    const mp = player.get<number>('mp') ?? 0;
    const hp = player.get<number>('hp') ?? 0;
    const maxHp = player.getMaxHp();
    const missing = maxHp - hp;

    // 前置检查：内力 >= 50
    if (mp < 50) {
      return {
        success: false,
        message: rt('sys', '你的内力不足，无法运功疗伤。'),
        resourceChanged: false,
      };
    }

    // 前置检查：气血缺失 >= maxHp/5
    if (missing < Math.floor(maxHp / 5)) {
      return {
        success: false,
        message: rt('sys', '你的伤势不重，无需运功疗伤。'),
        resourceChanged: false,
      };
    }

    // 设置疗伤状态
    player.setTemp('exert/healing', true);

    // tick 循环
    const tickFn = () => {
      const currentMp = player.get<number>('mp') ?? 0;
      const currentHp = player.get<number>('hp') ?? 0;
      const currentMaxHp = player.getMaxHp();

      // 停止条件检查
      if (
        currentHp >= currentMaxHp ||
        currentMp < 50 ||
        player.isInCombat() ||
        !player.getTemp<boolean>('exert/healing')
      ) {
        this.stopHealing(player, forceLevel);
        return;
      }

      // 消耗 50 内力
      player.set('mp', currentMp - 50);
      // 恢复 10 + floor(forceLevel / 3) 气血
      const healAmt = 10 + Math.floor(forceLevel / 3);
      const actualHeal = player.recoverHp(healAmt);

      // 推送 tick 消息
      const tickMsg = MessageFactory.create('exertResult', {
        effectName: 'heal',
        displayName: '运功疗伤',
        success: true,
        message: rt(
          'sys',
          `你运功疗伤，恢复了 ${bold(String(actualHeal))} 点气血。`,
        ),
        resourceChanged: true,
      });
      if (tickMsg) {
        player.sendToClient(MessageFactory.serialize(tickMsg));
      }

      // 注册下一 tick
      player.callOut(tickFn, 3000);
    };

    // 启动第一个 tick
    player.callOut(tickFn, 3000);

    return {
      success: true,
      message: rt('sys', '你盘膝坐下，开始运功疗伤……'),
      resourceChanged: false,
      healingStarted: true,
    };
  }

  /** 停止疗伤 */
  stopHealing(player: PlayerBase, forceLevel?: number): void {
    player.delTemp('exert/healing');

    // 收功消耗
    const currentMp = player.get<number>('mp') ?? 0;
    const finalCost = Math.min(100, currentMp);
    if (finalCost > 0) {
      player.set('mp', currentMp - finalCost);
    }

    // 推送停止消息
    const stopMsg = MessageFactory.create('exertResult', {
      effectName: 'heal',
      displayName: '运功疗伤',
      success: true,
      message: rt('sys', '你收起内力，运功疗伤结束。'),
      resourceChanged: true,
      healingStopped: true,
    });
    if (stopMsg) {
      player.sendToClient(MessageFactory.serialize(stopMsg));
    }
  }

  getDescription(): string {
    return '盘膝疗伤，持续消耗内力恢复气血，非战斗使用';
  }
}
