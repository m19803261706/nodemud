/**
 * 门派任务完成消息处理器
 * 客户端发送交付任务请求
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { SectTaskCompleteMessage } from '../../types/messages/sect-task';

@MessageHandler('sectTaskComplete')
export class SectTaskCompleteHandler implements IMessageHandler {
  create(data: { category: 'daily' | 'weekly' }): SectTaskCompleteMessage {
    return {
      type: 'sectTaskComplete',
      data,
      timestamp: Date.now(),
    };
  }

  validate(message: SectTaskCompleteMessage): boolean {
    return message.data?.category === 'daily' || message.data?.category === 'weekly';
  }
}
