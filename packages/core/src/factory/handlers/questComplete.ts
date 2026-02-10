/**
 * 完成任务消息处理器
 * 客户端请求向指定 NPC 交付已完成的任务
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { QuestCompleteMessage } from '../../types/messages/quest';

@MessageHandler('questComplete')
export class QuestCompleteHandler implements IMessageHandler {
  create(data: QuestCompleteMessage['data']): QuestCompleteMessage {
    return {
      type: 'questComplete',
      data,
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return typeof data.questId === 'string' && typeof data.npcId === 'string';
  }
}
