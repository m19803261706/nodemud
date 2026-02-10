/**
 * 开始修炼消息处理器
 * 客户端发送开始修炼请求（练习/打坐/静坐）
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { PracticeStartMessage } from '../../types/messages/skill';

@MessageHandler('practiceStart')
export class PracticeStartHandler implements IMessageHandler {
  create(data: PracticeStartMessage['data']): PracticeStartMessage {
    return {
      type: 'practiceStart',
      data,
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return typeof data.skillId === 'string' && typeof data.mode === 'string';
  }
}
