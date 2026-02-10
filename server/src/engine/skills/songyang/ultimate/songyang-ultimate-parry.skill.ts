/**
 * 不动关山架（骨架）
 */
import type { LivingBase } from '../../../game-objects/living-base';
import type { SkillAction } from '../../types';
import { ParrySkillBase } from '../../martial/parry-skill-base';
import { SONGYANG_SKILL_IDS } from '../songyang-skill-ids';
import { SONGYANG_FACTION_ID, getSongyangSkillMeta } from '../songyang-skill-meta';
import { createSongyangPlaceholderAction } from '../songyang-skill-utils';
import { validateSongyangSkillLearn } from '../songyang-unlock-evaluator';

const META = getSongyangSkillMeta(SONGYANG_SKILL_IDS.ULTIMATE_PARRY);

export class SongyangUltimateParrySkill extends ParrySkillBase {
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
    return [createSongyangPlaceholderAction('关山不移')];
  }
}
