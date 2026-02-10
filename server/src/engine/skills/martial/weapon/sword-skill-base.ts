/**
 * SwordSkillBase -- 剑法基类
 *
 * 所有剑法技能的抽象基类。
 * 固定 skillType = SWORD，weaponType = 'sword'。
 *
 * 剑法特点：攻守平衡，命中较高
 */
import { SkillSlotType } from '@packages/core';
import { WeaponSkillBase } from './weapon-skill-base';

export abstract class SwordSkillBase extends WeaponSkillBase {
  /** 剑法固定对应 SWORD 槽位 */
  get skillType(): SkillSlotType {
    return SkillSlotType.SWORD;
  }

  /** 武器类型为剑 */
  get weaponType(): string {
    return 'sword';
  }
}
