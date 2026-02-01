/**
 * 消息工厂核心类
 * 职责：
 * 1. 自动扫包注册消息处理器
 * 2. 创建标准化消息对象
 * 3. 验证消息格式
 * 4. 序列化/反序列化
 */

import type { ClientMessage, ServerMessage } from '../types/base';

/** 消息处理器接口 */
export interface IMessageHandler {
  create(...args: any[]): ClientMessage | ServerMessage;
  validate(data: any): boolean;
}

/** 消息注册表 */
const messageHandlers = new Map<string, IMessageHandler>();

/** 装饰器：注册消息处理器 */
export function MessageHandler(type: string) {
  return function <T extends { new (...args: any[]): IMessageHandler }>(
    constructor: T
  ) {
    messageHandlers.set(type, new constructor());
    return constructor;
  };
}

/**
 * 消息工厂类
 */
export class MessageFactory {
  /** 创建消息 */
  static create<T extends ClientMessage | ServerMessage>(
    type: string,
    ...args: any[]
  ): T | null {
    const handler = messageHandlers.get(type);
    if (!handler) {
      // 未注册的消息类型
      return null;
    }
    return handler.create(...args) as T;
  }

  /** 验证消息格式 */
  static validate(message: any): boolean {
    if (!message || typeof message !== 'object') return false;
    if (!message.type || typeof message.type !== 'string') return false;
    if (!message.data || typeof message.data !== 'object') return false;
    if (!message.timestamp || typeof message.timestamp !== 'number')
      return false;

    // 调用对应类型的验证器
    const handler = messageHandlers.get(message.type);
    if (!handler) return false;
    return handler.validate(message.data);
  }

  /** 序列化消息为 JSON 字符串 */
  static serialize(message: ClientMessage | ServerMessage): string {
    return JSON.stringify(message);
  }

  /** 反序列化 JSON 字符串为消息对象 */
  static deserialize<T = any>(json: string): T | null {
    try {
      const message = JSON.parse(json);
      return this.validate(message) ? (message as T) : null;
    } catch {
      return null;
    }
  }
}

