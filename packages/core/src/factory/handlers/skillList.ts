/**
 * 技能列表消息处理器
 * 服务端推送玩家全部技能列表、槽位映射和激活内功
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { SkillListMessage } from '../../types/messages/skill';

@MessageHandler('skillList')
export class SkillListHandler implements IMessageHandler {
  create(data: SkillListMessage['data']): SkillListMessage {
    return {
      type: 'skillList',
      data,
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return (
      Array.isArray(data.skills) &&
      typeof data.skillMap === 'object' &&
      data.skillMap !== null &&
      (data.activeForce === null || typeof data.activeForce === 'string')
    );
  }
}
