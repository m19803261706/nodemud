/**
 * 嵩阳技能元数据协议
 * 定义 skillId/skillName/slot/tier/factionRequired 的唯一映射。
 */
import { SkillSlotType } from '@packages/core';
import { SONGYANG_SKILL_IDS, type SongyangSkillId } from './songyang-skill-ids';

export const SONGYANG_FACTION_ID = 'songyang' as const;

export enum SkillTier {
  ENTRY = 'entry',
  ADVANCED = 'advanced',
  ULTIMATE = 'ultimate',
  CANON = 'canon',
}

export interface SongyangSkillMeta {
  skillId: SongyangSkillId;
  skillName: string;
  slot: SkillSlotType;
  tier: SkillTier;
  factionRequired: typeof SONGYANG_FACTION_ID;
}

export const SONGYANG_SKILL_META: Record<SongyangSkillId, SongyangSkillMeta> = {
  [SONGYANG_SKILL_IDS.ENTRY_BLADE]: {
    skillId: SONGYANG_SKILL_IDS.ENTRY_BLADE,
    skillName: '嵩阳入门刀法',
    slot: SkillSlotType.BLADE,
    tier: SkillTier.ENTRY,
    factionRequired: SONGYANG_FACTION_ID,
  },
  [SONGYANG_SKILL_IDS.ENTRY_DODGE]: {
    skillId: SONGYANG_SKILL_IDS.ENTRY_DODGE,
    skillName: '松峙步',
    slot: SkillSlotType.DODGE,
    tier: SkillTier.ENTRY,
    factionRequired: SONGYANG_FACTION_ID,
  },
  [SONGYANG_SKILL_IDS.ENTRY_PARRY]: {
    skillId: SONGYANG_SKILL_IDS.ENTRY_PARRY,
    skillName: '守正架',
    slot: SkillSlotType.PARRY,
    tier: SkillTier.ENTRY,
    factionRequired: SONGYANG_FACTION_ID,
  },
  [SONGYANG_SKILL_IDS.ENTRY_FORCE]: {
    skillId: SONGYANG_SKILL_IDS.ENTRY_FORCE,
    skillName: '吐纳诀',
    slot: SkillSlotType.FORCE,
    tier: SkillTier.ENTRY,
    factionRequired: SONGYANG_FACTION_ID,
  },
  [SONGYANG_SKILL_IDS.ADVANCED_BLADE]: {
    skillId: SONGYANG_SKILL_IDS.ADVANCED_BLADE,
    skillName: '断岳刀',
    slot: SkillSlotType.BLADE,
    tier: SkillTier.ADVANCED,
    factionRequired: SONGYANG_FACTION_ID,
  },
  [SONGYANG_SKILL_IDS.ADVANCED_DODGE]: {
    skillId: SONGYANG_SKILL_IDS.ADVANCED_DODGE,
    skillName: '登嵩身法',
    slot: SkillSlotType.DODGE,
    tier: SkillTier.ADVANCED,
    factionRequired: SONGYANG_FACTION_ID,
  },
  [SONGYANG_SKILL_IDS.ADVANCED_PARRY]: {
    skillId: SONGYANG_SKILL_IDS.ADVANCED_PARRY,
    skillName: '镇关架',
    slot: SkillSlotType.PARRY,
    tier: SkillTier.ADVANCED,
    factionRequired: SONGYANG_FACTION_ID,
  },
  [SONGYANG_SKILL_IDS.ADVANCED_FORCE]: {
    skillId: SONGYANG_SKILL_IDS.ADVANCED_FORCE,
    skillName: '中岳归元功',
    slot: SkillSlotType.FORCE,
    tier: SkillTier.ADVANCED,
    factionRequired: SONGYANG_FACTION_ID,
  },
  [SONGYANG_SKILL_IDS.ULTIMATE_BLADE]: {
    skillId: SONGYANG_SKILL_IDS.ULTIMATE_BLADE,
    skillName: '天柱问岳刀',
    slot: SkillSlotType.BLADE,
    tier: SkillTier.ULTIMATE,
    factionRequired: SONGYANG_FACTION_ID,
  },
  [SONGYANG_SKILL_IDS.ULTIMATE_DODGE]: {
    skillId: SONGYANG_SKILL_IDS.ULTIMATE_DODGE,
    skillName: '云梯九转',
    slot: SkillSlotType.DODGE,
    tier: SkillTier.ULTIMATE,
    factionRequired: SONGYANG_FACTION_ID,
  },
  [SONGYANG_SKILL_IDS.ULTIMATE_PARRY]: {
    skillId: SONGYANG_SKILL_IDS.ULTIMATE_PARRY,
    skillName: '不动关山架',
    slot: SkillSlotType.PARRY,
    tier: SkillTier.ULTIMATE,
    factionRequired: SONGYANG_FACTION_ID,
  },
  [SONGYANG_SKILL_IDS.ULTIMATE_FORCE]: {
    skillId: SONGYANG_SKILL_IDS.ULTIMATE_FORCE,
    skillName: '乾元一气功',
    slot: SkillSlotType.FORCE,
    tier: SkillTier.ULTIMATE,
    factionRequired: SONGYANG_FACTION_ID,
  },
  [SONGYANG_SKILL_IDS.CANON_ESSENCE]: {
    skillId: SONGYANG_SKILL_IDS.CANON_ESSENCE,
    skillName: '嵩阳守正真意',
    slot: SkillSlotType.COGNIZE,
    tier: SkillTier.CANON,
    factionRequired: SONGYANG_FACTION_ID,
  },
};

export function getSongyangSkillMeta(skillId: SongyangSkillId): SongyangSkillMeta {
  return SONGYANG_SKILL_META[skillId];
}
