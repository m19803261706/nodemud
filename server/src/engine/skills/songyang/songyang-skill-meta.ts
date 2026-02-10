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
  unlockRules: SongyangUnlockRules;
}

export type SongyangAttrKey =
  | 'strength'
  | 'vitality'
  | 'perception'
  | 'spirit'
  | 'wisdom'
  | 'meridian';

export type SongyangPuzzleKey = 'canju' | 'duanju' | 'shiyan';
export type SongyangChallengeKey = 'chiefDiscipleWin' | 'sparStreakWin' | 'masterApproval';

export interface SongyangUnlockRules {
  minRank?: string;
  minAttrs?: Partial<Record<SongyangAttrKey, number>>;
  preSkills?: Partial<Record<SongyangSkillId, number>>;
  puzzle?: SongyangPuzzleKey[];
  challenges?: SongyangChallengeKey[];
}

export const SONGYANG_SKILL_META: Record<SongyangSkillId, SongyangSkillMeta> = {
  [SONGYANG_SKILL_IDS.ENTRY_BLADE]: {
    skillId: SONGYANG_SKILL_IDS.ENTRY_BLADE,
    skillName: '嵩阳入门刀法',
    slot: SkillSlotType.BLADE,
    tier: SkillTier.ENTRY,
    factionRequired: SONGYANG_FACTION_ID,
    unlockRules: {
      minAttrs: { strength: 10 },
    },
  },
  [SONGYANG_SKILL_IDS.ENTRY_DODGE]: {
    skillId: SONGYANG_SKILL_IDS.ENTRY_DODGE,
    skillName: '松峙步',
    slot: SkillSlotType.DODGE,
    tier: SkillTier.ENTRY,
    factionRequired: SONGYANG_FACTION_ID,
    unlockRules: {
      minAttrs: { perception: 10 },
    },
  },
  [SONGYANG_SKILL_IDS.ENTRY_PARRY]: {
    skillId: SONGYANG_SKILL_IDS.ENTRY_PARRY,
    skillName: '守正架',
    slot: SkillSlotType.PARRY,
    tier: SkillTier.ENTRY,
    factionRequired: SONGYANG_FACTION_ID,
    unlockRules: {
      minAttrs: { vitality: 10 },
    },
  },
  [SONGYANG_SKILL_IDS.ENTRY_FORCE]: {
    skillId: SONGYANG_SKILL_IDS.ENTRY_FORCE,
    skillName: '吐纳诀',
    slot: SkillSlotType.FORCE,
    tier: SkillTier.ENTRY,
    factionRequired: SONGYANG_FACTION_ID,
    unlockRules: {
      minAttrs: { spirit: 10 },
    },
  },
  [SONGYANG_SKILL_IDS.ADVANCED_BLADE]: {
    skillId: SONGYANG_SKILL_IDS.ADVANCED_BLADE,
    skillName: '断岳刀',
    slot: SkillSlotType.BLADE,
    tier: SkillTier.ADVANCED,
    factionRequired: SONGYANG_FACTION_ID,
    unlockRules: {
      minRank: '执礼弟子',
      minAttrs: { strength: 16, meridian: 12 },
      preSkills: {
        [SONGYANG_SKILL_IDS.ENTRY_BLADE]: 80,
      },
    },
  },
  [SONGYANG_SKILL_IDS.ADVANCED_DODGE]: {
    skillId: SONGYANG_SKILL_IDS.ADVANCED_DODGE,
    skillName: '登嵩身法',
    slot: SkillSlotType.DODGE,
    tier: SkillTier.ADVANCED,
    factionRequired: SONGYANG_FACTION_ID,
    unlockRules: {
      minRank: '执礼弟子',
      minAttrs: { perception: 16, wisdom: 12 },
      preSkills: {
        [SONGYANG_SKILL_IDS.ENTRY_DODGE]: 80,
      },
    },
  },
  [SONGYANG_SKILL_IDS.ADVANCED_PARRY]: {
    skillId: SONGYANG_SKILL_IDS.ADVANCED_PARRY,
    skillName: '镇关架',
    slot: SkillSlotType.PARRY,
    tier: SkillTier.ADVANCED,
    factionRequired: SONGYANG_FACTION_ID,
    unlockRules: {
      minRank: '执礼弟子',
      minAttrs: { vitality: 16, strength: 12 },
      preSkills: {
        [SONGYANG_SKILL_IDS.ENTRY_PARRY]: 80,
      },
    },
  },
  [SONGYANG_SKILL_IDS.ADVANCED_FORCE]: {
    skillId: SONGYANG_SKILL_IDS.ADVANCED_FORCE,
    skillName: '中岳归元功',
    slot: SkillSlotType.FORCE,
    tier: SkillTier.ADVANCED,
    factionRequired: SONGYANG_FACTION_ID,
    unlockRules: {
      minRank: '执礼弟子',
      minAttrs: { spirit: 16, meridian: 16 },
      preSkills: {
        [SONGYANG_SKILL_IDS.ENTRY_FORCE]: 80,
      },
    },
  },
  [SONGYANG_SKILL_IDS.ULTIMATE_BLADE]: {
    skillId: SONGYANG_SKILL_IDS.ULTIMATE_BLADE,
    skillName: '天柱问岳刀',
    slot: SkillSlotType.BLADE,
    tier: SkillTier.ULTIMATE,
    factionRequired: SONGYANG_FACTION_ID,
    unlockRules: {
      minRank: '嵩阳长老',
      minAttrs: { strength: 24, meridian: 18 },
      preSkills: {
        [SONGYANG_SKILL_IDS.ADVANCED_BLADE]: 160,
      },
      puzzle: ['canju', 'duanju'],
      challenges: ['chiefDiscipleWin'],
    },
  },
  [SONGYANG_SKILL_IDS.ULTIMATE_DODGE]: {
    skillId: SONGYANG_SKILL_IDS.ULTIMATE_DODGE,
    skillName: '云梯九转',
    slot: SkillSlotType.DODGE,
    tier: SkillTier.ULTIMATE,
    factionRequired: SONGYANG_FACTION_ID,
    unlockRules: {
      minRank: '嵩阳长老',
      minAttrs: { perception: 24, wisdom: 18 },
      preSkills: {
        [SONGYANG_SKILL_IDS.ADVANCED_DODGE]: 160,
      },
      puzzle: ['canju', 'shiyan'],
      challenges: ['sparStreakWin'],
    },
  },
  [SONGYANG_SKILL_IDS.ULTIMATE_PARRY]: {
    skillId: SONGYANG_SKILL_IDS.ULTIMATE_PARRY,
    skillName: '不动关山架',
    slot: SkillSlotType.PARRY,
    tier: SkillTier.ULTIMATE,
    factionRequired: SONGYANG_FACTION_ID,
    unlockRules: {
      minRank: '嵩阳长老',
      minAttrs: { vitality: 24, strength: 18 },
      preSkills: {
        [SONGYANG_SKILL_IDS.ADVANCED_PARRY]: 160,
      },
      puzzle: ['duanju', 'shiyan'],
      challenges: ['masterApproval'],
    },
  },
  [SONGYANG_SKILL_IDS.ULTIMATE_FORCE]: {
    skillId: SONGYANG_SKILL_IDS.ULTIMATE_FORCE,
    skillName: '乾元一气功',
    slot: SkillSlotType.FORCE,
    tier: SkillTier.ULTIMATE,
    factionRequired: SONGYANG_FACTION_ID,
    unlockRules: {
      minRank: '嵩阳长老',
      minAttrs: { spirit: 24, meridian: 24 },
      preSkills: {
        [SONGYANG_SKILL_IDS.ADVANCED_FORCE]: 160,
      },
      puzzle: ['canju', 'duanju', 'shiyan'],
      challenges: ['chiefDiscipleWin', 'sparStreakWin'],
    },
  },
  [SONGYANG_SKILL_IDS.CANON_ESSENCE]: {
    skillId: SONGYANG_SKILL_IDS.CANON_ESSENCE,
    skillName: '嵩阳守正真意',
    slot: SkillSlotType.COGNIZE,
    tier: SkillTier.CANON,
    factionRequired: SONGYANG_FACTION_ID,
    unlockRules: {
      minRank: '副掌门',
      minAttrs: { wisdom: 30, spirit: 30, meridian: 30 },
      preSkills: {
        [SONGYANG_SKILL_IDS.ULTIMATE_BLADE]: 200,
        [SONGYANG_SKILL_IDS.ULTIMATE_DODGE]: 200,
        [SONGYANG_SKILL_IDS.ULTIMATE_PARRY]: 200,
        [SONGYANG_SKILL_IDS.ULTIMATE_FORCE]: 220,
      },
      puzzle: ['canju', 'duanju', 'shiyan'],
      challenges: ['chiefDiscipleWin', 'sparStreakWin', 'masterApproval'],
    },
  },
};

export function getSongyangSkillMeta(skillId: SongyangSkillId): SongyangSkillMeta {
  return SONGYANG_SKILL_META[skillId];
}
