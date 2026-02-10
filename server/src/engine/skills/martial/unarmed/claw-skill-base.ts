/**
 * ClawSkillBase -- 爪法基类
 *
 * 所有爪法技能的抽象基类。
 * 固定 skillType = CLAW。
 *
 * 爪法特点：高伤害，可附带流血/中毒效果
 */
import { SkillSlotType } from '@packages/core';
import { UnarmedSkillBase } from './unarmed-skill-base';

export abstract class ClawSkillBase extends UnarmedSkillBase {
  /** 爪法固定对应 CLAW 槽位 */
  get skillType(): SkillSlotType {
    return SkillSlotType.CLAW;
  }
}
