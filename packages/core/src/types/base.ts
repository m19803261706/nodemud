/**
 * 消息基础类型定义
 * 前后端共享的基础消息结构
 */

/** 基础消息结构 */
export interface BaseMessage<T = any> {
  type: string; // 消息类型
  data: T; // 消息数据
  timestamp: number; // 时间戳（毫秒）
}

/** 客户端请求消息 */
export interface ClientMessage<T = any> extends BaseMessage<T> {}

/** 服务器响应消息 */
export interface ServerMessage<T = any> extends BaseMessage<T> {}
