/**
 * WeaponSkillBase -- 兵刃武学基类
 *
 * 所有使用武器的武学（剑、刀、枪、杖、暗器）的共同基类。
 * 兵刃武学在战斗时需要装备对应类型的武器，否则效果大打折扣。
 *
 * 对标: LPC inherit/skill/weapon.c
 */
import type { SkillSlotType } from '@packages/core';
import { MartialSkillBase } from '../martial-skill-base';

export abstract class WeaponSkillBase extends MartialSkillBase {
  /**
   * 该武学对应的武器类型
   * 子类必须定义（与 skillType 一致）
   */
  abstract get weaponType(): string;

  /**
   * 验证装配 -- 兵刃武学只能装配到自身对应的槽位
   * @param usage 目标槽位类型
   */
  validEnable(usage: SkillSlotType): boolean {
    return usage === this.skillType;
  }
}
