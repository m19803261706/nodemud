/**
 * 心跳检测消息类型定义
 * 用于保持 WebSocket 连接活跃
 */

import type { ClientMessage, ServerMessage } from '../base';

/** 心跳请求 */
export interface PingMessage extends ClientMessage {
  type: 'ping';
  data: Record<string, never>; // 空对象
}

/** 心跳响应 */
export interface PongMessage extends ServerMessage {
  type: 'pong';
  data: {
    serverTime: number; // 服务器时间戳（毫秒）
  };
}
