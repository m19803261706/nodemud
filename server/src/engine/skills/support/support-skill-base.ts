/**
 * SupportSkillBase -- 辅助技能基类
 *
 * 所有辅助技能（医术、毒术、锻造、辨识）的共同基类。
 * 辅技不参与直接战斗，提供非战斗场景的特殊能力。
 *
 * 对标: LPC inherit/skill/support.c
 */
import { SkillCategory } from '@packages/core';
import { SkillBase } from '../skill-base';
import type { ResourceCost } from '../types';
import type { LivingBase } from '../../game-objects/living-base';

export abstract class SupportSkillBase extends SkillBase {
  /** 辅技统一归类为 SUPPORT */
  get category(): SkillCategory {
    return SkillCategory.SUPPORT;
  }

  /**
   * 获取修炼消耗
   * 辅技默认消耗精力（energy）
   * @param player 角色
   * @returns 修炼一次的资源消耗
   */
  getPracticeCost(player: LivingBase): ResourceCost {
    return { resource: 'energy', amount: 10 };
  }
}
