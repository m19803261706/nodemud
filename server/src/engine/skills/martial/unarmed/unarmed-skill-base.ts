/**
 * UnarmedSkillBase -- 空手武学基类
 *
 * 所有徒手武学（拳法、掌法、指法、爪法）的共同基类。
 * 空手武学不需要装备武器即可使用，但无法获得武器加成。
 *
 * 对标: LPC inherit/skill/unarmed.c
 */
import type { SkillSlotType } from '@packages/core';
import { MartialSkillBase } from '../martial-skill-base';

export abstract class UnarmedSkillBase extends MartialSkillBase {
  /**
   * 验证装配 -- 空手武学只能装配到自身对应的槽位
   * @param usage 目标槽位类型
   */
  validEnable(usage: SkillSlotType): boolean {
    return usage === this.skillType;
  }
}
