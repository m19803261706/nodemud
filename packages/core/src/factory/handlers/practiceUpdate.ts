/**
 * 修炼进度更新消息处理器
 * 服务端推送修炼 tick 的进度信息
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { PracticeUpdateMessage } from '../../types/messages/skill';

@MessageHandler('practiceUpdate')
export class PracticeUpdateHandler implements IMessageHandler {
  create(data: PracticeUpdateMessage['data']): PracticeUpdateMessage {
    return {
      type: 'practiceUpdate',
      data,
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return (
      typeof data.skillId === 'string' &&
      typeof data.skillName === 'string' &&
      typeof data.mode === 'string' &&
      typeof data.currentLevel === 'number' &&
      typeof data.learned === 'number' &&
      typeof data.learnedMax === 'number' &&
      typeof data.levelUp === 'boolean' &&
      typeof data.message === 'string' &&
      typeof data.stopped === 'boolean'
    );
  }
}
