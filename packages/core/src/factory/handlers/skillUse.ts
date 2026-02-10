/**
 * 技能使用消息处理器
 * 客户端发送玩家选择的战斗行动
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { SkillUseMessage } from '../../types/messages/skill';

@MessageHandler('skillUse')
export class SkillUseHandler implements IMessageHandler {
  create(data: SkillUseMessage['data']): SkillUseMessage {
    return {
      type: 'skillUse',
      data,
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return typeof data.combatId === 'string' && typeof data.actionIndex === 'number';
  }
}
