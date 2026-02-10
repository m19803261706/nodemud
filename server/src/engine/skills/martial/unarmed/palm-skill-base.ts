/**
 * PalmSkillBase -- 掌法基类
 *
 * 所有掌法技能的抽象基类。
 * 固定 skillType = PALM。
 *
 * 掌法特点：可附加内力伤害，攻守兼备
 */
import { SkillSlotType } from '@packages/core';
import { UnarmedSkillBase } from './unarmed-skill-base';

export abstract class PalmSkillBase extends UnarmedSkillBase {
  /** 掌法固定对应 PALM 槽位 */
  get skillType(): SkillSlotType {
    return SkillSlotType.PALM;
  }
}
