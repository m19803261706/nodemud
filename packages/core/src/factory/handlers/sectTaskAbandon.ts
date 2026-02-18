/**
 * 门派任务放弃消息处理器
 * 客户端发送放弃当前任务
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { SectTaskAbandonMessage } from '../../types/messages/sect-task';

@MessageHandler('sectTaskAbandon')
export class SectTaskAbandonHandler implements IMessageHandler {
  create(data: { category: 'daily' | 'weekly' }): SectTaskAbandonMessage {
    return {
      type: 'sectTaskAbandon',
      data,
      timestamp: Date.now(),
    };
  }

  validate(message: SectTaskAbandonMessage): boolean {
    return message.data?.category === 'daily' || message.data?.category === 'weekly';
  }
}
