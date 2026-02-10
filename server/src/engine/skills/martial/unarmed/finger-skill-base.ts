/**
 * FingerSkillBase -- 指法基类
 *
 * 所有指法技能的抽象基类。
 * 固定 skillType = FINGER。
 *
 * 指法特点：命中极高，穿透防御
 */
import { SkillSlotType } from '@packages/core';
import { UnarmedSkillBase } from './unarmed-skill-base';

export abstract class FingerSkillBase extends UnarmedSkillBase {
  /** 指法固定对应 FINGER 槽位 */
  get skillType(): SkillSlotType {
    return SkillSlotType.FINGER;
  }
}
