/**
 * 技能学习消息处理器
 * 服务端通知客户端学会了新技能
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { SkillLearnMessage } from '../../types/messages/skill';

@MessageHandler('skillLearn')
export class SkillLearnHandler implements IMessageHandler {
  create(data: SkillLearnMessage['data']): SkillLearnMessage {
    return {
      type: 'skillLearn',
      data,
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return (
      typeof data.skillId === 'string' &&
      typeof data.skillName === 'string' &&
      typeof data.skillType === 'string' &&
      typeof data.category === 'string' &&
      typeof data.source === 'string' &&
      typeof data.message === 'string'
    );
  }
}
