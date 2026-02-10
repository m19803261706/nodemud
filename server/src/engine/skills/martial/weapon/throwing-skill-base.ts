/**
 * ThrowingSkillBase -- 暗器基类
 *
 * 所有暗器技能的抽象基类。
 * 固定 skillType = THROWING，weaponType = 'throwing'。
 *
 * 暗器特点：命中修正极高，伤害波动大
 */
import { SkillSlotType } from '@packages/core';
import { WeaponSkillBase } from './weapon-skill-base';

export abstract class ThrowingSkillBase extends WeaponSkillBase {
  /** 暗器固定对应 THROWING 槽位 */
  get skillType(): SkillSlotType {
    return SkillSlotType.THROWING;
  }

  /** 武器类型为暗器 */
  get weaponType(): string {
    return 'throwing';
  }
}
