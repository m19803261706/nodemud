/**
 * 技能装配请求消息处理器
 * 客户端请求将技能装配到槽位或从槽位卸下
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { SkillMapRequestMessage } from '../../types/messages/skill';

@MessageHandler('skillMapRequest')
export class SkillMapRequestHandler implements IMessageHandler {
  create(data: SkillMapRequestMessage['data']): SkillMapRequestMessage {
    return {
      type: 'skillMapRequest',
      data,
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return (
      typeof data.slotType === 'string' &&
      (data.skillId === null || typeof data.skillId === 'string')
    );
  }
}
