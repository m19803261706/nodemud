/**
 * 嵩阳守正真意（骨架）
 */
import { SkillCategory, SkillSlotType } from '@packages/core';
import { SkillBase } from '../../skill-base';
import type { LivingBase } from '../../../game-objects/living-base';
import { SONGYANG_SKILL_IDS } from '../songyang-skill-ids';
import { SONGYANG_FACTION_ID, getSongyangSkillMeta } from '../songyang-skill-meta';
import { buildSongyangSkillDescription } from '../songyang-skill-utils';
import { validateSongyangSkillLearn } from '../songyang-unlock-evaluator';

const META = getSongyangSkillMeta(SONGYANG_SKILL_IDS.CANON_ESSENCE);

export class SongyangGuardingEssenceSkill extends SkillBase {
  get skillId(): string {
    return META.skillId;
  }

  get skillName(): string {
    return META.skillName;
  }

  get skillType(): SkillSlotType {
    return SkillSlotType.COGNIZE;
  }

  get category(): SkillCategory {
    return SkillCategory.COGNIZE;
  }

  get factionRequired(): string {
    return SONGYANG_FACTION_ID;
  }

  validLearn(player: LivingBase): true | string {
    return validateSongyangSkillLearn(player, META.skillId);
  }

  getDescription(level: number): string {
    return buildSongyangSkillDescription(META.skillId, level);
  }
}
