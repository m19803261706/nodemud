/**
 * 接受任务消息处理器
 * 客户端请求接受指定 NPC 提供的任务
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { QuestAcceptMessage } from '../../types/messages/quest';

@MessageHandler('questAccept')
export class QuestAcceptHandler implements IMessageHandler {
  create(data: QuestAcceptMessage['data']): QuestAcceptMessage {
    return {
      type: 'questAccept',
      data,
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return typeof data.questId === 'string' && typeof data.npcId === 'string';
  }
}
