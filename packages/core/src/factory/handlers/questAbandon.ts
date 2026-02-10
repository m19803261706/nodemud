/**
 * 放弃任务消息处理器
 * 客户端请求放弃指定任务
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { QuestAbandonMessage } from '../../types/messages/quest';

@MessageHandler('questAbandon')
export class QuestAbandonHandler implements IMessageHandler {
  create(data: QuestAbandonMessage['data']): QuestAbandonMessage {
    return {
      type: 'questAbandon',
      data,
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return typeof data.questId === 'string';
  }
}
