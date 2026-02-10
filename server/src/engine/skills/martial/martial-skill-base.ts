/**
 * MartialSkillBase -- 武学基类
 *
 * 所有武学技能（兵刃、空手、轻功、招架）的共同基类。
 * 定义武学特有的招式系统、启用验证、自动出招、修炼消耗和战斗经验门槛。
 *
 * 对标: LPC inherit/skill/martial.c
 */
import { SkillCategory, SKILL_CONSTANTS } from '@packages/core';
import { SkillBase } from '../skill-base';
import type { SkillAction, ResourceCost } from '../types';
import type { LivingBase } from '../../game-objects/living-base';

export abstract class MartialSkillBase extends SkillBase {
  /** 武学技能统一归类为 MARTIAL */
  get category(): SkillCategory {
    return SkillCategory.MARTIAL;
  }

  /**
   * 该武学的所有招式列表
   * 子类必须定义具体招式（name, lvl, costs, modifiers）
   */
  abstract get actions(): SkillAction[];

  /**
   * 验证该武学是否可以装配到指定槽位
   * 例如剑法只能装配到 SWORD 槽位
   * @param usage 目标槽位类型
   * @returns 是否可以装配
   */
  abstract validEnable(usage: import('@packages/core').SkillSlotType): boolean;

  /**
   * 获取当前等级可用的招式列表
   * @param level 当前技能等级
   * @returns 已解锁的招式数组
   */
  getAvailableActions(level: number): SkillAction[] {
    return this.actions.filter((action) => action.lvl <= level);
  }

  /**
   * 获取自动战斗时使用的招式
   * 默认选择已解锁招式中等级最高的
   * @param level 当前技能等级
   * @returns 自动使用的招式
   */
  getAutoAction(level: number): SkillAction {
    const available = this.getAvailableActions(level);
    // 选择已解锁的最高等级招式
    return available[available.length - 1] || this.actions[0];
  }

  /**
   * 获取修炼消耗
   * 默认消耗精力（energy），子类可覆写
   * @param player 角色
   * @returns 修炼一次的资源消耗
   */
  getPracticeCost(player: LivingBase): ResourceCost {
    return { resource: 'energy', amount: 10 };
  }

  /**
   * 武学技能的提升条件：基于战斗经验门槛
   * 公式: currentLevel^3 / EXP_THRESHOLD_DIVISOR <= combat_exp
   * @param player 角色
   * @param currentLevel 当前技能等级
   * @returns 是否满足提升条件
   */
  canImprove(player: LivingBase, currentLevel: number): boolean {
    const combatExp = player.get<number>('combat_exp') ?? 0;
    const threshold = Math.pow(currentLevel, 3) / SKILL_CONSTANTS.EXP_THRESHOLD_DIVISOR;
    return combatExp >= threshold;
  }
}
