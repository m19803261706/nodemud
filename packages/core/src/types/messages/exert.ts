/**
 * 运功结果消息类型定义
 * 服务端执行运功效果后推送给客户端的结果消息
 */

import type { ServerMessage } from '../base';

/** 运功执行结果数据 */
export interface ExertResultData {
  /** 效果标识（如 'recover', 'heal'） */
  effectName: string;
  /** 效果中文名（如 '调匀气息'） */
  displayName: string;
  /** 是否执行成功 */
  success: boolean;
  /** 富文本结果描述 */
  message: string;
  /** 是否引发资源变化（前端据此决定是否等待 playerStats 更新） */
  resourceChanged: boolean;
  /** buff 应用信息（shield/powerup 生效时） */
  buffApplied?: {
    name: string;
    duration: number;
    bonuses: Record<string, number>;
  };
  /** 移除的 buff 名（buff 到期时） */
  buffRemoved?: string;
  /** 是否开始持续疗伤 */
  healingStarted?: boolean;
  /** 是否停止持续疗伤 */
  healingStopped?: boolean;
}

/** 运功结果服务端消息 */
export interface ExertResultMessage extends ServerMessage {
  type: 'exertResult';
  data: ExertResultData;
}
