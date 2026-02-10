/**
 * 中岳归元功（骨架）
 */
import type { CharacterAttrs, SkillAction } from '../../types';
import { QiInternalBase } from '../../internal/qi-internal-base';
import { SONGYANG_SKILL_IDS } from '../songyang-skill-ids';
import { SONGYANG_FACTION_ID, getSongyangSkillMeta } from '../songyang-skill-meta';
import { createSongyangPlaceholderAction } from '../songyang-skill-utils';

const META = getSongyangSkillMeta(SONGYANG_SKILL_IDS.ADVANCED_FORCE);

export class SongyangAdvancedForceSkill extends QiInternalBase {
  get skillId(): string {
    return META.skillId;
  }

  get skillName(): string {
    return META.skillName;
  }

  get factionRequired(): string {
    return SONGYANG_FACTION_ID;
  }

  get actions(): SkillAction[] {
    return [createSongyangPlaceholderAction('归元纳气')];
  }

  getAttributeBonus(level: number): Partial<CharacterAttrs> {
    return { spirit: Math.floor(level / 16), meridian: Math.floor(level / 24) };
  }

  getResourceBonus(level: number): { maxHp?: number; maxMp?: number } {
    return { maxMp: level * 3 };
  }
}
