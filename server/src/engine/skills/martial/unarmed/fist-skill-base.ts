/**
 * FistSkillBase -- 拳法基类
 *
 * 所有拳法技能的抽象基类。
 * 固定 skillType = FIST。
 *
 * 拳法特点：攻击速度快，连击频率高
 */
import { SkillSlotType } from '@packages/core';
import { UnarmedSkillBase } from './unarmed-skill-base';

export abstract class FistSkillBase extends UnarmedSkillBase {
  /** 拳法固定对应 FIST 槽位 */
  get skillType(): SkillSlotType {
    return SkillSlotType.FIST;
  }
}
