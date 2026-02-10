/**
 * InternalSkillBase -- 内功基类
 *
 * 所有内功技能（神系、气系、精系）的共同基类。
 * 内功提供属性加成和资源上限加成，需要激活（装配到 FORCE 槽位）才生效。
 * 内功的修炼通过打坐/静坐完成，消耗精力恢复内力。
 *
 * 对标: LPC inherit/skill/force.c
 */
import { SkillCategory, SkillSlotType, DantianType } from '@packages/core';
import { SkillBase } from '../skill-base';
import type { SkillAction, ResourceCost, CharacterAttrs } from '../types';
import type { LivingBase } from '../../game-objects/living-base';

export abstract class InternalSkillBase extends SkillBase {
  /** 内功技能统一归类为 INTERNAL */
  get category(): SkillCategory {
    return SkillCategory.INTERNAL;
  }

  /** 内功固定对应 FORCE 槽位 */
  get skillType(): SkillSlotType {
    return SkillSlotType.FORCE;
  }

  /** 丹田类型（神/气/精），决定主属性加成方向 */
  abstract get dantianType(): DantianType;

  /**
   * 获取该内功在指定等级时提供的属性加成
   * @param level 内功等级
   * @returns 属性加成（Partial，只返回有加成的属性）
   */
  abstract getAttributeBonus(level: number): Partial<CharacterAttrs>;

  /**
   * 获取该内功在指定等级时提供的资源上限加成
   * @param level 内功等级
   * @returns 资源上限加成（maxHp / maxMp）
   */
  abstract getResourceBonus(level: number): { maxHp?: number; maxMp?: number };

  /** 内功招式列表（内功也有攻击/防御型招式） */
  abstract get actions(): SkillAction[];

  /**
   * 验证装配 -- 内功只能装配到 FORCE 槽位
   * @param usage 目标槽位类型
   */
  validEnable(usage: SkillSlotType): boolean {
    return usage === SkillSlotType.FORCE;
  }

  /**
   * 获取修炼消耗
   * 内功默认消耗精力（energy）
   * @param player 角色
   * @returns 修炼一次的资源消耗
   */
  getPracticeCost(player: LivingBase): ResourceCost {
    return { resource: 'energy', amount: 15 };
  }

  /**
   * 获取该内功支持的特殊运功效果列表
   * 子类覆写以声明支持的特殊效果（如 shield、powerup）
   * @returns 效果名称数组（对应 ExertEffectType 的值）
   */
  getExertEffects(): string[] {
    return [];
  }
}
