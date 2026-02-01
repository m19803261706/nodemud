/**
 * 心跳消息处理器
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { PingMessage } from '../../types/messages/ping';

@MessageHandler('ping')
export class PingHandler implements IMessageHandler {
  create(): PingMessage {
    return {
      type: 'ping',
      data: {},
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    // ping 消息 data 为空对象，始终有效
    return typeof data === 'object';
  }
}
