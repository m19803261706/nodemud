/**
 * CognizeSkill -- 武学悟性
 *
 * 唯一非 abstract 的技能类。武学悟性是所有角色天生拥有的能力，
 * 影响所有技能的修炼速度和领悟概率。
 *
 * 悟性等级越高，修炼获得经验的效率越高（乘以 COGNIZE_FACTOR）。
 * 悟性无法通过修炼提升，只能通过任务、特殊事件或天赋获得。
 *
 * skillId = 'cognize'
 * skillType = COGNIZE
 * category = COGNIZE
 */
import { SkillSlotType, SkillCategory } from '@packages/core';
import { SkillBase } from './skill-base';
import type { LivingBase } from '../game-objects/living-base';

export class CognizeSkill extends SkillBase {
  /** 技能唯一标识 */
  get skillId(): string {
    return 'cognize';
  }

  /** 技能显示名称 */
  get skillName(): string {
    return '武学悟性';
  }

  /** 悟性对应 COGNIZE 槽位 */
  get skillType(): SkillSlotType {
    return SkillSlotType.COGNIZE;
  }

  /** 悟性归类为 COGNIZE */
  get category(): SkillCategory {
    return SkillCategory.COGNIZE;
  }

  /**
   * 悟性无需学习条件，所有角色天生拥有
   */
  validLearn(player: LivingBase): true | string {
    return true;
  }

  /**
   * 悟性最大等级限制为 100
   */
  validLearnLevel(): number {
    return 100;
  }

  /**
   * 悟性无法通过普通方式提升
   * 只能通过任务奖励、特殊事件等外部途径
   */
  canImprove(player: LivingBase, currentLevel: number): boolean {
    return false;
  }

  /**
   * 死亡不影响悟性等级
   */
  onDeathPenalty(player: LivingBase, currentLevel: number): number {
    return currentLevel;
  }
}
