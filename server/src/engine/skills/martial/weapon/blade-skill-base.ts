/**
 * BladeSkillBase -- 刀法基类
 *
 * 所有刀法技能的抽象基类。
 * 固定 skillType = BLADE，weaponType = 'blade'。
 *
 * 刀法特点：攻击力强，伤害修正高
 */
import { SkillSlotType } from '@packages/core';
import { WeaponSkillBase } from './weapon-skill-base';

export abstract class BladeSkillBase extends WeaponSkillBase {
  /** 刀法固定对应 BLADE 槽位 */
  get skillType(): SkillSlotType {
    return SkillSlotType.BLADE;
  }

  /** 武器类型为刀 */
  get weaponType(): string {
    return 'blade';
  }
}
