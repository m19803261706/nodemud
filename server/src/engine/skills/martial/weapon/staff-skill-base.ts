/**
 * StaffSkillBase -- 杖法基类
 *
 * 所有杖法技能的抽象基类。
 * 固定 skillType = STAFF，weaponType = 'staff'。
 *
 * 杖法特点：防御出色，招架修正高
 */
import { SkillSlotType } from '@packages/core';
import { WeaponSkillBase } from './weapon-skill-base';

export abstract class StaffSkillBase extends WeaponSkillBase {
  /** 杖法固定对应 STAFF 槽位 */
  get skillType(): SkillSlotType {
    return SkillSlotType.STAFF;
  }

  /** 武器类型为杖 */
  get weaponType(): string {
    return 'staff';
  }
}
