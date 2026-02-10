/**
 * SkillBase -- 技能根基类
 *
 * 所有技能（武学、内功、辅技、悟性）的抽象根类。
 * 定义通用契约：学习条件、提升检查、死亡惩罚、子技能、冲突、门派限制等。
 *
 * 对标: LPC inherit/skill/skill.c
 */
import { SkillSlotType, SkillCategory } from '@packages/core';
import type { LivingBase } from '../game-objects/living-base';

export abstract class SkillBase {
  /** 技能唯一标识（如 'jiben-jianfa', 'cognize'） */
  abstract get skillId(): string;

  /** 技能显示名称（如 '基本剑法', '武学悟性'） */
  abstract get skillName(): string;

  /** 技能槽位类型（对应 SkillSlotType 枚举） */
  abstract get skillType(): SkillSlotType;

  /** 技能分类（四大分类之一） */
  abstract get category(): SkillCategory;

  /**
   * 验证角色是否可以学习此技能
   * @param player 角色
   * @returns true 表示可以学习，字符串表示不可学习的原因
   */
  validLearn(player: LivingBase): true | string {
    return true;
  }

  /**
   * 可学习的最大等级上限
   * 默认 999 表示无特殊限制
   */
  validLearnLevel(): number {
    return 999;
  }

  /**
   * 检查角色是否满足提升此技能等级的条件
   * @param player 角色
   * @param currentLevel 当前技能等级
   * @returns 是否可以提升
   */
  canImprove(player: LivingBase, currentLevel: number): boolean {
    return true;
  }

  /**
   * 技能等级提升时的回调
   * 子类可覆写实现等级提升时的额外效果（如属性加成变化）
   * @param player 角色
   * @param newLevel 新的技能等级
   */
  onSkillImproved(player: LivingBase, newLevel: number): void {}

  /**
   * 死亡惩罚 -- 返回惩罚后的新等级
   * 默认降低 1 级，最低为 0
   * @param player 角色
   * @param currentLevel 当前等级
   * @returns 惩罚后的新等级
   */
  onDeathPenalty(player: LivingBase, currentLevel: number): number {
    return Math.max(0, currentLevel - 1);
  }

  /**
   * 获取子技能定义
   * 返回 null 表示无子技能；返回 Record<subSkillId, maxLevel> 表示有子技能
   */
  getSubSkills(): Record<string, number> | null {
    return null;
  }

  /**
   * 获取与本技能冲突的技能 ID 列表
   * 学习本技能时会检查是否已学习冲突技能
   */
  getConflicts(): string[] {
    return [];
  }

  /**
   * 所需门派（null 表示不限门派）
   */
  get factionRequired(): string | null {
    return null;
  }
}
