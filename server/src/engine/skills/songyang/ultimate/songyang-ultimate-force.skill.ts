/**
 * 乾元一气功（骨架）
 */
import type { LivingBase } from '../../../game-objects/living-base';
import type { CharacterAttrs, SkillAction } from '../../types';
import { QiInternalBase } from '../../internal/qi-internal-base';
import { SONGYANG_SKILL_IDS } from '../songyang-skill-ids';
import { SONGYANG_FACTION_ID, getSongyangSkillMeta } from '../songyang-skill-meta';
import { createSongyangPlaceholderAction } from '../songyang-skill-utils';
import { validateSongyangSkillLearn } from '../songyang-unlock-evaluator';

const META = getSongyangSkillMeta(SONGYANG_SKILL_IDS.ULTIMATE_FORCE);

export class SongyangUltimateForceSkill extends QiInternalBase {
  get skillId(): string {
    return META.skillId;
  }

  get skillName(): string {
    return META.skillName;
  }

  get factionRequired(): string {
    return SONGYANG_FACTION_ID;
  }

  validLearn(player: LivingBase): true | string {
    return validateSongyangSkillLearn(player, META.skillId);
  }

  get actions(): SkillAction[] {
    return [createSongyangPlaceholderAction('乾元引气')];
  }

  getAttributeBonus(level: number): Partial<CharacterAttrs> {
    return { spirit: Math.floor(level / 12), meridian: Math.floor(level / 16) };
  }

  getResourceBonus(level: number): { maxHp?: number; maxMp?: number } {
    return { maxMp: level * 4 };
  }
}
