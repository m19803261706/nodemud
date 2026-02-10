/**
 * 任务系统 - 进度与玩家任务数据接口
 * QuestProgress 记录单个任务进度，PlayerQuestData 聚合玩家所有任务状态
 */

import { QuestStatus } from './quest-definition';

/** 单个任务的进度数据 */
export interface QuestProgress {
  /** 任务 ID */
  questId: string;
  /** 当前状态（进行中 / 待交付） */
  status: QuestStatus.ACTIVE | QuestStatus.READY;
  /** 各目标的当前进度，key 为目标索引 */
  objectives: { [index: number]: number };
  /** 接受任务的时间戳（毫秒） */
  acceptedAt: number;
}

/** 玩家任务数据（存储在 Character.questData 中） */
export interface PlayerQuestData {
  /** 进行中的任务，key 为任务 ID */
  active: { [questId: string]: QuestProgress };
  /** 已完成的任务 ID 列表 */
  completed: string[];
}
