/**
 * PoisonSkillBase -- 毒术基类
 *
 * 所有毒术技能的抽象基类。
 * 固定 skillType = POISON。
 *
 * 毒术特点：制作毒药、解毒，战斗中附加毒素伤害
 */
import { SkillSlotType } from '@packages/core';
import { SupportSkillBase } from './support-skill-base';

export abstract class PoisonSkillBase extends SupportSkillBase {
  /** 毒术固定对应 POISON 槽位 */
  get skillType(): SkillSlotType {
    return SkillSlotType.POISON;
  }
}
