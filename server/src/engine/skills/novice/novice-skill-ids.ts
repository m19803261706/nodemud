/**
 * 新手公共武学技能 ID 列表
 * 供新手城武馆/书院教习使用，不绑定门派。
 */

export const NOVICE_SKILL_IDS = {
  BASIC_BLADE: 'novice.basic-blade',
  BASIC_DODGE: 'novice.basic-dodge',
  BASIC_PARRY: 'novice.basic-parry',
  BASIC_FORCE: 'novice.basic-force',
  BASIC_SWORD: 'novice.basic-sword',
  BASIC_FIST: 'novice.basic-fist',
  BASIC_PALM: 'novice.basic-palm',
  BASIC_SPEAR: 'novice.basic-spear',
  BASIC_STAFF: 'novice.basic-staff',
} as const;

export type NoviceSkillId = (typeof NOVICE_SKILL_IDS)[keyof typeof NOVICE_SKILL_IDS];

export const NOVICE_SKILL_ID_LIST: NoviceSkillId[] = Object.values(NOVICE_SKILL_IDS);
