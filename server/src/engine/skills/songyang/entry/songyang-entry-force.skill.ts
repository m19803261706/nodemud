/**
 * 吐纳诀（骨架）
 */
import type { CharacterAttrs, SkillAction } from '../../types';
import { QiInternalBase } from '../../internal/qi-internal-base';
import { SONGYANG_SKILL_IDS } from '../songyang-skill-ids';
import { SONGYANG_FACTION_ID, getSongyangSkillMeta } from '../songyang-skill-meta';
import { createSongyangPlaceholderAction } from '../songyang-skill-utils';

const META = getSongyangSkillMeta(SONGYANG_SKILL_IDS.ENTRY_FORCE);

export class SongyangEntryForceSkill extends QiInternalBase {
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
    return [createSongyangPlaceholderAction('吐纳回环')];
  }

  getAttributeBonus(level: number): Partial<CharacterAttrs> {
    return { spirit: Math.floor(level / 20) };
  }

  getResourceBonus(level: number): { maxHp?: number; maxMp?: number } {
    return { maxMp: level * 2 };
  }
}
