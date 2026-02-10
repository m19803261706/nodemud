/**
 * 守正架（骨架）
 */
import type { SkillAction } from '../../types';
import { ParrySkillBase } from '../../martial/parry-skill-base';
import { SONGYANG_SKILL_IDS } from '../songyang-skill-ids';
import { SONGYANG_FACTION_ID, getSongyangSkillMeta } from '../songyang-skill-meta';
import { createSongyangPlaceholderAction } from '../songyang-skill-utils';

const META = getSongyangSkillMeta(SONGYANG_SKILL_IDS.ENTRY_PARRY);

export class SongyangEntryParrySkill extends ParrySkillBase {
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
    return [createSongyangPlaceholderAction('守中格架')];
  }
}
