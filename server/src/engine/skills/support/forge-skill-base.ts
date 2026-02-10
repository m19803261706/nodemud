/**
 * ForgeSkillBase -- 锻造基类
 *
 * 所有锻造技能的抽象基类。
 * 固定 skillType = FORGE。
 *
 * 锻造特点：制作和强化武器、防具
 */
import { SkillSlotType } from '@packages/core';
import { SupportSkillBase } from './support-skill-base';

export abstract class ForgeSkillBase extends SupportSkillBase {
  /** 锻造固定对应 FORGE 槽位 */
  get skillType(): SkillSlotType {
    return SkillSlotType.FORGE;
  }
}
