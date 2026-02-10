/**
 * 任务系统 - 枚举与接口定义
 * 包含任务状态、任务类型、目标类型枚举，以及任务定义相关接口
 */

// ========== 枚举 ==========

/** 任务状态 */
export enum QuestStatus {
  /** 前置未满足 */
  HIDDEN = 'hidden',
  /** 等待接受 */
  AVAILABLE = 'available',
  /** 目标未完成 */
  ACTIVE = 'active',
  /** 等待交付 */
  READY = 'ready',
  /** 奖励已发放 */
  COMPLETED = 'completed',
}

/** 任务类型 */
export enum QuestType {
  DELIVER = 'deliver',
  CAPTURE = 'capture',
  COLLECT = 'collect',
  DIALOGUE = 'dialogue',
}

/** 目标类型 */
export enum ObjectiveType {
  KILL = 'kill',
  DELIVER = 'deliver',
  COLLECT = 'collect',
  TALK = 'talk',
}

// ========== 接口 ==========

/** 任务前置条件 */
export interface QuestPrerequisites {
  /** 需要完成的前置任务 ID 列表 */
  completedQuests?: string[];
  /** 最低等级要求 */
  minLevel?: number;
}

/** 任务目标 */
export interface QuestObjective {
  /** 目标类型 */
  type: ObjectiveType;
  /** 目标对象标识（NPC ID / 物品蓝图 ID 等） */
  targetId: string;
  /** 需要数量 */
  count: number;
  /** 目标描述 */
  description: string;
}

/** 任务奖励 */
export interface QuestRewards {
  /** 经验值奖励 */
  exp?: number;
  /** 银两奖励 */
  silver?: number;
  /** 潜能奖励 */
  potential?: number;
  /** 物品奖励 */
  items?: { blueprintId: string; count: number }[];
}

/** 任务定义（蓝图级） */
export interface QuestDefinition {
  /** 任务唯一 ID */
  id: string;
  /** 任务名称 */
  name: string;
  /** 任务描述 */
  description: string;
  /** 任务类型 */
  type: QuestType;
  /** 发布任务的 NPC 标识 */
  giverNpc: string;
  /** 交付任务的 NPC 标识（缺省则同 giverNpc） */
  turnInNpc?: string;
  /** 前置条件 */
  prerequisites?: QuestPrerequisites;
  /** 任务目标列表 */
  objectives: QuestObjective[];
  /** 完成奖励 */
  rewards: QuestRewards;
  /** 接受任务时给予的物品 */
  giveItems?: { blueprintId: string; count: number }[];
}
