/**
 * 嵩阳技能 ID 常量定义（13 门）
 */

export const SONGYANG_SKILL_IDS = {
  ENTRY_BLADE: 'songyang-entry-blade',
  ENTRY_DODGE: 'songyang-entry-dodge',
  ENTRY_PARRY: 'songyang-entry-parry',
  ENTRY_FORCE: 'songyang-entry-force',

  ADVANCED_BLADE: 'songyang-advanced-blade',
  ADVANCED_DODGE: 'songyang-advanced-dodge',
  ADVANCED_PARRY: 'songyang-advanced-parry',
  ADVANCED_FORCE: 'songyang-advanced-force',

  ULTIMATE_BLADE: 'songyang-ultimate-blade',
  ULTIMATE_DODGE: 'songyang-ultimate-dodge',
  ULTIMATE_PARRY: 'songyang-ultimate-parry',
  ULTIMATE_FORCE: 'songyang-ultimate-force',

  CANON_ESSENCE: 'songyang-canon-essence',
} as const;

export type SongyangSkillId = (typeof SONGYANG_SKILL_IDS)[keyof typeof SONGYANG_SKILL_IDS];

export const SONGYANG_SKILL_ID_LIST: SongyangSkillId[] = [
  SONGYANG_SKILL_IDS.ENTRY_BLADE,
  SONGYANG_SKILL_IDS.ENTRY_DODGE,
  SONGYANG_SKILL_IDS.ENTRY_PARRY,
  SONGYANG_SKILL_IDS.ENTRY_FORCE,
  SONGYANG_SKILL_IDS.ADVANCED_BLADE,
  SONGYANG_SKILL_IDS.ADVANCED_DODGE,
  SONGYANG_SKILL_IDS.ADVANCED_PARRY,
  SONGYANG_SKILL_IDS.ADVANCED_FORCE,
  SONGYANG_SKILL_IDS.ULTIMATE_BLADE,
  SONGYANG_SKILL_IDS.ULTIMATE_DODGE,
  SONGYANG_SKILL_IDS.ULTIMATE_PARRY,
  SONGYANG_SKILL_IDS.ULTIMATE_FORCE,
  SONGYANG_SKILL_IDS.CANON_ESSENCE,
];
