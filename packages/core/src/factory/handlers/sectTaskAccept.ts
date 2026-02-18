/**
 * 门派任务接取消息处理器
 * 客户端发送接取指定模板任务
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { SectTaskAcceptMessage } from '../../types/messages/sect-task';

@MessageHandler('sectTaskAccept')
export class SectTaskAcceptHandler implements IMessageHandler {
  create(data: { templateId: string; category: 'daily' | 'weekly' }): SectTaskAcceptMessage {
    return {
      type: 'sectTaskAccept',
      data,
      timestamp: Date.now(),
    };
  }

  validate(message: SectTaskAcceptMessage): boolean {
    return (
      typeof message.data?.templateId === 'string' &&
      (message.data?.category === 'daily' || message.data?.category === 'weekly')
    );
  }
}
