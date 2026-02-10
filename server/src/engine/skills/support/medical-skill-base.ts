/**
 * MedicalSkillBase -- 医术基类
 *
 * 所有医术技能的抽象基类。
 * 固定 skillType = MEDICAL。
 *
 * 医术特点：治疗自身和队友，解除异常状态
 */
import { SkillSlotType } from '@packages/core';
import { SupportSkillBase } from './support-skill-base';

export abstract class MedicalSkillBase extends SupportSkillBase {
  /** 医术固定对应 MEDICAL 槽位 */
  get skillType(): SkillSlotType {
    return SkillSlotType.MEDICAL;
  }
}
