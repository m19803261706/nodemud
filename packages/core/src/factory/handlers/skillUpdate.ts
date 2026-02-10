/**
 * 技能更新消息处理器
 * 服务端推送单个技能的增量变更
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { SkillUpdateMessage } from '../../types/messages/skill';

@MessageHandler('skillUpdate')
export class SkillUpdateHandler implements IMessageHandler {
  create(data: SkillUpdateMessage['data']): SkillUpdateMessage {
    return {
      type: 'skillUpdate',
      data,
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return (
      typeof data.skillId === 'string' &&
      typeof data.changes === 'object' &&
      data.changes !== null &&
      typeof data.reason === 'string'
    );
  }
}
