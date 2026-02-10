/**
 * SpearSkillBase -- 枪法基类
 *
 * 所有枪法技能的抽象基类。
 * 固定 skillType = SPEAR，weaponType = 'spear'。
 *
 * 枪法特点：攻击距离远，先手优势
 */
import { SkillSlotType } from '@packages/core';
import { WeaponSkillBase } from './weapon-skill-base';

export abstract class SpearSkillBase extends WeaponSkillBase {
  /** 枪法固定对应 SPEAR 槽位 */
  get skillType(): SkillSlotType {
    return SkillSlotType.SPEAR;
  }

  /** 武器类型为枪 */
  get weaponType(): string {
    return 'spear';
  }
}
