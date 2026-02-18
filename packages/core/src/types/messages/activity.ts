/**
 * 活动状态更新消息类型定义
 * 服务端通过 ActivityManager 推送活动状态变化给客户端
 * 前端根据状态显示/隐藏停止按钮，无需硬编码特定活动类型
 */

import type { ServerMessage } from '../base';

/** 活动状态更新消息（服务端 → 客户端） */
export interface ActivityUpdateMessage extends ServerMessage {
  type: 'activityUpdate';
  data: {
    /** 活动状态 */
    status: 'started' | 'completed' | 'stopped';
    /** 活动类型标识（如 gathering, crafting 等） */
    activityType: string;
    /** 停止按钮文案（仅 started 时有意义） */
    stopLabel?: string;
  };
}
