/**
 * 门派系统消息类型定义
 * 包含门派信息请求/响应和门派传送消息
 */

import type { ClientMessage, ServerMessage } from '../base';

/** 门派 NPC 位置信息 */
export interface SectNpcLocation {
  npcId: string;
  npcName: string;
  roomId: string;
}

/** 门派职位阶梯 */
export interface SectRankInfo {
  rank: string;
  minContribution: number;
}

/** 门派概览数据 */
export interface SectOverviewData {
  sectId: string;
  sectName: string;
  rank: string;
  contribution: number;
  masterName: string;
  joinedAt: number;
  /** 完整职位阶梯列表 */
  ranks: SectRankInfo[];
  /** 下一职位（已到最高则 null） */
  nextRank: SectRankInfo | null;
}

/** 门派技能树节点 */
export interface SectSkillNode {
  skillId: string;
  skillName: string;
  /** 技能槽位（blade/dodge/parry/force/cognize） */
  slot: string;
  /** 技能阶层（entry/advanced/ultimate/canon） */
  tier: string;
  /** 解锁状态（locked/available/learned/crippled） */
  unlockState: string;
  /** 解锁提示（如"筋骨不足"、"已掌握"、"条件已满足"） */
  unlockMessage: string;
  /** 当前等级（未学为 0） */
  currentLevel: number;
  /** 可读的解锁条件列表 */
  unlockConditions: string[];
}

/** 门派解密链进度 */
export interface SectPuzzleProgress {
  canjuCollected: number;
  canjuState: string;
  duanjuState: string;
  shiyanState: string;
}

/** 门派挑战进度 */
export interface SectChallengeProgress {
  chiefDiscipleWin: boolean;
  sparStreakWin: boolean;
  masterApproval: boolean;
}

/** 门派日常/进度数据 */
export interface SectProgressData {
  daily: {
    sparCount: number;
    sparLimit: number;
  };
  puzzle: SectPuzzleProgress;
  challenges: SectChallengeProgress;
}

/** 门派关键 NPC 位置映射 */
export interface SectNpcLocations {
  master: SectNpcLocation | null;
  deacon: SectNpcLocation | null;
  sparring: SectNpcLocation | null;
}

/** sectInfoResponse 完整数据 */
export interface SectInfoResponseData {
  /** 门派概览（null = 未入门） */
  overview: SectOverviewData | null;
  /** 门派技能树（null = 未入门） */
  skillTree: SectSkillNode[] | null;
  /** 日常/进度（null = 未入门） */
  progress: SectProgressData | null;
  /** 门派 NPC 位置（null = 未入门） */
  npcLocations: SectNpcLocations | null;
}

/** 门派信息请求（客户端 → 服务端） */
export interface SectInfoRequestMessage extends ClientMessage {
  type: 'sectInfoRequest';
  data: Record<string, never>;
}

/** 门派信息响应（服务端 → 客户端） */
export interface SectInfoResponseMessage extends ServerMessage {
  type: 'sectInfoResponse';
  data: SectInfoResponseData;
}

/** 门派传送目标角色 */
export type SectTeleportRole = 'master' | 'deacon' | 'sparring';

/** 门派传送请求（客户端 → 服务端） */
export interface SectTeleportMessage extends ClientMessage {
  type: 'sectTeleport';
  data: {
    targetRole: SectTeleportRole;
  };
}
