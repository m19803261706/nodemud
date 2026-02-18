/**
 * 门派任务系统消息类型定义
 * 包含门派日常/周常任务的请求/响应/接取/完成/放弃/进度推送
 */

import type { ClientMessage, ServerMessage } from '../base';

/** 任务目标 DTO（发给客户端） */
export interface SectTaskObjectiveDTO {
  type: string;
  description: string;
  count: number;
  current: number;
}

/** 任务奖励 DTO */
export interface SectTaskRewardsDTO {
  contribution: number;
  exp: number;
  potential: number;
  silver?: number;
}

/** 任务实例 DTO（发给客户端） */
export interface SectTaskInstanceDTO {
  templateId: string;
  category: 'daily' | 'weekly';
  name: string;
  description: string;
  objectives: SectTaskObjectiveDTO[];
  rewards: SectTaskRewardsDTO;
  flavorText?: string;
}

/** 任务进度摘要 DTO */
export interface SectTaskProgressDTO {
  dailyCount: number;
  dailyMax: number;
  weeklyCount: number;
  weeklyMax: number;
  totalCompleted: number;
  nextMilestone: number | null;
}

/** 可选模板摘要 */
export interface SectTaskTemplateSummary {
  templateId: string;
  name: string;
}

// ---------- 消息类型 ----------

/** C→S: 请求可用任务列表 */
export interface SectTaskRequestMessage extends ClientMessage {
  type: 'sectTaskRequest';
  data: Record<string, never>;
}

/** S→C: 返回可用任务 + 进度 */
export interface SectTaskResponseData {
  activeDailyTask: SectTaskInstanceDTO | null;
  activeWeeklyTask: SectTaskInstanceDTO | null;
  progress: SectTaskProgressDTO;
  availableDailyTemplates: SectTaskTemplateSummary[];
  availableWeeklyTemplates: SectTaskTemplateSummary[];
  /** 玩家是否在任务发布 NPC 身边（接取/交付需要） */
  nearTaskPublisher: boolean;
  /** 任务发布 NPC 名称（用于提示） */
  taskPublisherName?: string;
}

export interface SectTaskResponseMessage extends ServerMessage {
  type: 'sectTaskResponse';
  data: SectTaskResponseData;
}

/** C→S: 接取任务 */
export interface SectTaskAcceptMessage extends ClientMessage {
  type: 'sectTaskAccept';
  data: {
    templateId: string;
    category: 'daily' | 'weekly';
  };
}

/** S→C: 接取结果 */
export interface SectTaskAcceptResultData {
  success: boolean;
  message: string;
  task?: SectTaskInstanceDTO;
}

export interface SectTaskAcceptResultMessage extends ServerMessage {
  type: 'sectTaskAcceptResult';
  data: SectTaskAcceptResultData;
}

/** C→S: 完成（交付）任务 */
export interface SectTaskCompleteMessage extends ClientMessage {
  type: 'sectTaskComplete';
  data: {
    category: 'daily' | 'weekly';
  };
}

/** S→C: 完成结果 */
export interface SectTaskCompleteResultData {
  success: boolean;
  message: string;
  rewards?: SectTaskRewardsDTO;
  milestoneRewards?: SectTaskRewardsDTO;
  progress?: SectTaskProgressDTO;
}

export interface SectTaskCompleteResultMessage extends ServerMessage {
  type: 'sectTaskCompleteResult';
  data: SectTaskCompleteResultData;
}

/** C→S: 放弃任务 */
export interface SectTaskAbandonMessage extends ClientMessage {
  type: 'sectTaskAbandon';
  data: {
    category: 'daily' | 'weekly';
  };
}

/** S→C: 放弃结果 */
export interface SectTaskAbandonResultData {
  success: boolean;
  message: string;
}

export interface SectTaskAbandonResultMessage extends ServerMessage {
  type: 'sectTaskAbandonResult';
  data: SectTaskAbandonResultData;
}

/** S→C: 进度推送 */
export interface SectTaskProgressUpdateData {
  category: 'daily' | 'weekly';
  task: SectTaskInstanceDTO;
}

export interface SectTaskProgressUpdateMessage extends ServerMessage {
  type: 'sectTaskProgressUpdate';
  data: SectTaskProgressUpdateData;
}
