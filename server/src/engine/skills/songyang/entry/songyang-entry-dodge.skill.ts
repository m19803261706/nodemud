/**
 * 松峙步（骨架）
 */
import type { LivingBase } from '../../../game-objects/living-base';
import type { SkillAction } from '../../types';
import { DodgeSkillBase } from '../../martial/dodge-skill-base';
import { SONGYANG_SKILL_IDS } from '../songyang-skill-ids';
import { SONGYANG_FACTION_ID, getSongyangSkillMeta } from '../songyang-skill-meta';
import { buildSongyangSkillDescription, getSongyangSkillActions } from '../songyang-skill-utils';
import { validateSongyangSkillLearn } from '../songyang-unlock-evaluator';

const META = getSongyangSkillMeta(SONGYANG_SKILL_IDS.ENTRY_DODGE);

export class SongyangEntryDodgeSkill extends DodgeSkillBase {
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
    return getSongyangSkillActions(META.skillId);
  }

  getDescription(level: number): string {
    return buildSongyangSkillDescription(META.skillId, level);
  }
}
