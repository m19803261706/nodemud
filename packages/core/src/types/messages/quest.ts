/**
 * 任务系统消息类型定义
 * 客户端与服务端共享的任务相关消息接口
 */

/** 任务目标进度 */
export interface QuestObjectiveProgress {
  description: string;
  current: number;
  required: number;
  completed: boolean;
}

/** 进行中的任务信息 */
export interface ActiveQuestInfo {
  questId: string;
  name: string;
  description: string;
  type: 'deliver' | 'capture' | 'collect' | 'dialogue';
  giverNpcName: string;
  status: 'active' | 'ready';
  objectives: QuestObjectiveProgress[];
  acceptedAt: number;
}

/** 已完成的任务信息 */
export interface CompletedQuestInfo {
  questId: string;
  name: string;
}

/** questUpdate 消息数据（服务端 → 客户端） */
export interface QuestUpdateData {
  active: ActiveQuestInfo[];
  completed: CompletedQuestInfo[];
  exp: number;
  level: number;
  potential: number;
  score: number;
  freePoints: number;
}

/** questUpdate 消息 */
export interface QuestUpdateMessage {
  type: 'questUpdate';
  data: QuestUpdateData;
  timestamp: number;
}

/** questAccept 消息数据（客户端 → 服务端） */
export interface QuestAcceptData {
  questId: string;
  npcId: string;
}

/** questAccept 消息 */
export interface QuestAcceptMessage {
  type: 'questAccept';
  data: QuestAcceptData;
  timestamp: number;
}

/** questAbandon 消息数据（客户端 → 服务端） */
export interface QuestAbandonData {
  questId: string;
}

/** questAbandon 消息 */
export interface QuestAbandonMessage {
  type: 'questAbandon';
  data: QuestAbandonData;
  timestamp: number;
}

/** questComplete 消息数据（客户端 → 服务端） */
export interface QuestCompleteData {
  questId: string;
  npcId: string;
}

/** questComplete 消息 */
export interface QuestCompleteMessage {
  type: 'questComplete';
  data: QuestCompleteData;
  timestamp: number;
}

/** allocatePoints 消息数据（客户端 → 服务端） */
export interface AllocatePointsData {
  allocations: {
    wisdom?: number;
    perception?: number;
    spirit?: number;
    meridian?: number;
    strength?: number;
    vitality?: number;
  };
}

/** allocatePoints 消息 */
export interface AllocatePointsMessage {
  type: 'allocatePoints';
  data: AllocatePointsData;
  timestamp: number;
}
