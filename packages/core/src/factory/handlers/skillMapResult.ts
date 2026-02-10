/**
 * 技能装配结果消息处理器
 * 服务端返回技能装配操作的结果
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { SkillMapResultMessage } from '../../types/messages/skill';

@MessageHandler('skillMapResult')
export class SkillMapResultHandler implements IMessageHandler {
  create(data: SkillMapResultMessage['data']): SkillMapResultMessage {
    return {
      type: 'skillMapResult',
      data,
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return (
      typeof data.success === 'boolean' &&
      typeof data.slotType === 'string' &&
      (data.skillId === null || typeof data.skillId === 'string') &&
      typeof data.message === 'string' &&
      typeof data.updatedMap === 'object' &&
      data.updatedMap !== null
    );
  }
}
