/**
 * 技能系统枚举与常量定义
 * 包含技能槽位、分类、丹田、战斗状态、修炼模式、学习来源、更新原因等全部枚举
 */

// ========== 枚举定义 ==========

/** 技能槽位类型（17 种） */
export enum SkillSlotType {
  /** 剑法 */
  SWORD = 'sword',
  /** 刀法 */
  BLADE = 'blade',
  /** 枪法 */
  SPEAR = 'spear',
  /** 杖法 */
  STAFF = 'staff',
  /** 暗器 */
  THROWING = 'throwing',
  /** 拳法 */
  FIST = 'fist',
  /** 掌法 */
  PALM = 'palm',
  /** 指法 */
  FINGER = 'finger',
  /** 爪法 */
  CLAW = 'claw',
  /** 轻功 */
  DODGE = 'dodge',
  /** 招架 */
  PARRY = 'parry',
  /** 内功 */
  FORCE = 'force',
  /** 医术 */
  MEDICAL = 'medical',
  /** 毒术 */
  POISON = 'poison',
  /** 锻造 */
  FORGE = 'forge',
  /** 辨识 */
  APPRAISE = 'appraise',
  /** 悟性 */
  COGNIZE = 'cognize',
}

/** 技能分类（4 大类） */
export enum SkillCategory {
  /** 武学 */
  MARTIAL = 'martial',
  /** 内功 */
  INTERNAL = 'internal',
  /** 辅技 */
  SUPPORT = 'support',
  /** 悟道 */
  COGNIZE = 'cognize',
}

/** 丹田类型（3 种） */
export enum DantianType {
  /** 神 — 关联 wisdom / perception */
  SHEN = 'shen',
  /** 气 — 关联 spirit / meridian */
  QI = 'qi',
  /** 精 — 关联 strength / vitality */
  JING = 'jing',
}

/** 战斗参与者状态（3 种） */
export enum CombatParticipantState {
  /** 蓄力中 */
  CHARGING = 'charging',
  /** 等待行动 */
  AWAITING_ACTION = 'awaiting_action',
  /** 执行中 */
  EXECUTING = 'executing',
}

/** 修炼模式（3 种） */
export enum PracticeMode {
  /** 练习 */
  PRACTICE = 'practice',
  /** 打坐 */
  DAZUO = 'dazuo',
  /** 静坐 */
  JINGZUO = 'jingzuo',
}

/** 技能学习来源（5 种） */
export enum SkillLearnSource {
  /** NPC 传授 */
  NPC = 'npc',
  /** 卷轴学习 */
  SCROLL = 'scroll',
  /** 任务获得 */
  QUEST = 'quest',
  /** 天生技能 */
  INNATE = 'innate',
  /** 书籍研读 */
  BOOK = 'book',
}

/** 书籍类型（3 种） */
export enum BookType {
  /** 技能秘籍 */
  SKILL = 'skill',
  /** 文本读物 */
  TEXT = 'text',
  /** 配方典籍 */
  RECIPE = 'recipe',
}

/** 技能更新原因（7 种） */
export enum SkillUpdateReason {
  /** 升级 */
  LEVEL_UP = 'levelUp',
  /** 已装配 */
  MAPPED = 'mapped',
  /** 已卸下 */
  UNMAPPED = 'unmapped',
  /** 内功激活 */
  FORCE_ACTIVATED = 'forceActivated',
  /** 死亡惩罚 */
  DEATH_PENALTY = 'deathPenalty',
  /** 已锁定 */
  LOCKED = 'locked',
  /** 已解锁 */
  UNLOCKED = 'unlocked',
}

// ========== 常量 ==========

/** 技能系统核心数值常量 */
export const SKILL_CONSTANTS = {
  /** 悟性系数 */
  COGNIZE_FACTOR: 500,
  /** 属性系数 */
  ATTR_FACTOR: 100,
  /** 经验阈值除数 */
  EXP_THRESHOLD_DIVISOR: 10,
  /** 战斗领悟范围 */
  COMBAT_INSIGHT_RANGE: 120,
  /** 武器不匹配系数 */
  WEAPON_MISMATCH_FACTOR: 0.6,
  /** 行动超时时间（ms） */
  ACTION_TIMEOUT_MS: 10000,
  /** 修炼 tick 间隔（ms） */
  PRACTICE_TICK_MS: 5000,
  /** 最大学习次数 */
  MAX_LEARN_TIMES: 100,
} as const;

// ========== 显示名映射 ==========

/** 技能槽位中文名 */
export const SKILL_SLOT_NAMES: Record<SkillSlotType, string> = {
  [SkillSlotType.SWORD]: '剑法',
  [SkillSlotType.BLADE]: '刀法',
  [SkillSlotType.SPEAR]: '枪法',
  [SkillSlotType.STAFF]: '杖法',
  [SkillSlotType.THROWING]: '暗器',
  [SkillSlotType.FIST]: '拳法',
  [SkillSlotType.PALM]: '掌法',
  [SkillSlotType.FINGER]: '指法',
  [SkillSlotType.CLAW]: '爪法',
  [SkillSlotType.DODGE]: '轻功',
  [SkillSlotType.PARRY]: '招架',
  [SkillSlotType.FORCE]: '内功',
  [SkillSlotType.MEDICAL]: '医术',
  [SkillSlotType.POISON]: '毒术',
  [SkillSlotType.FORGE]: '锻造',
  [SkillSlotType.APPRAISE]: '辨识',
  [SkillSlotType.COGNIZE]: '悟性',
};

// ========== 分组映射 ==========

/** 技能槽位分组定义 */
export const SKILL_SLOT_GROUPS: Record<string, SkillSlotType[]> = {
  /** 器械武学 */
  weaponMartial: [
    SkillSlotType.SWORD,
    SkillSlotType.BLADE,
    SkillSlotType.SPEAR,
    SkillSlotType.STAFF,
    SkillSlotType.THROWING,
  ],
  /** 徒手武学 */
  unarmedMartial: [
    SkillSlotType.FIST,
    SkillSlotType.PALM,
    SkillSlotType.FINGER,
    SkillSlotType.CLAW,
  ],
  /** 身法 */
  movement: [SkillSlotType.DODGE, SkillSlotType.PARRY],
  /** 内功 */
  internal: [SkillSlotType.FORCE],
  /** 辅助技能 */
  support: [
    SkillSlotType.MEDICAL,
    SkillSlotType.POISON,
    SkillSlotType.FORGE,
    SkillSlotType.APPRAISE,
  ],
  /** 悟道 */
  cognize: [SkillSlotType.COGNIZE],
};
