/**
 * DodgeSkillBase -- 轻功基类
 *
 * 所有轻功技能的抽象基类。
 * 固定 skillType = DODGE。
 *
 * 轻功特点：提高闪避率，影响战斗速度和逃跑成功率
 *
 * 对标: LPC inherit/skill/dodge.c
 */
import { SkillSlotType } from '@packages/core';
import { MartialSkillBase } from './martial-skill-base';

export abstract class DodgeSkillBase extends MartialSkillBase {
  /** 轻功固定对应 DODGE 槽位 */
  get skillType(): SkillSlotType {
    return SkillSlotType.DODGE;
  }

  /**
   * 验证装配 -- 轻功只能装配到 DODGE 槽位
   * @param usage 目标槽位类型
   */
  validEnable(usage: SkillSlotType): boolean {
    return usage === SkillSlotType.DODGE;
  }
}
