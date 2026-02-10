/**
 * 结束修炼消息处理器
 * 客户端发送结束修炼请求
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { PracticeEndMessage } from '../../types/messages/skill';

@MessageHandler('practiceEnd')
export class PracticeEndHandler implements IMessageHandler {
  create(data: PracticeEndMessage['data']): PracticeEndMessage {
    return {
      type: 'practiceEnd',
      data,
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return data.reason === 'manual' || data.reason === 'exhausted';
  }
}
