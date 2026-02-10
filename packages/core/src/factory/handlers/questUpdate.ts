/**
 * 任务更新消息处理器
 * 服务端推送玩家当前任务列表和经验/等级等状态
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { QuestUpdateMessage } from '../../types/messages/quest';

@MessageHandler('questUpdate')
export class QuestUpdateHandler implements IMessageHandler {
  create(data: QuestUpdateMessage['data']): QuestUpdateMessage {
    return {
      type: 'questUpdate',
      data,
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return (
      Array.isArray(data.active) &&
      Array.isArray(data.completed) &&
      typeof data.exp === 'number' &&
      typeof data.level === 'number' &&
      typeof data.potential === 'number' &&
      typeof data.score === 'number' &&
      typeof data.freePoints === 'number'
    );
  }
}
