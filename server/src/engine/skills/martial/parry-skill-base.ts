/**
 * ParrySkillBase -- 招架基类
 *
 * 所有招架技能的抽象基类。
 * 固定 skillType = PARRY。
 *
 * 招架特点：提高格挡率，降低受到的伤害
 *
 * 对标: LPC inherit/skill/parry.c
 */
import { SkillSlotType } from '@packages/core';
import { MartialSkillBase } from './martial-skill-base';

export abstract class ParrySkillBase extends MartialSkillBase {
  /** 招架固定对应 PARRY 槽位 */
  get skillType(): SkillSlotType {
    return SkillSlotType.PARRY;
  }

  /**
   * 验证装配 -- 招架只能装配到 PARRY 槽位
   * @param usage 目标槽位类型
   */
  validEnable(usage: SkillSlotType): boolean {
    return usage === SkillSlotType.PARRY;
  }
}
