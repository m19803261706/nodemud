/**
 * 战斗结束消息处理器
 * 服务端通知客户端战斗结束，包含结果和描述
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { CombatEndMessage } from '../../types/messages/combat';

@MessageHandler('combatEnd')
export class CombatEndHandler implements IMessageHandler {
  create(data: CombatEndMessage['data']): CombatEndMessage {
    return {
      type: 'combatEnd',
      data,
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return (
      typeof data.combatId === 'string' &&
      typeof data.reason === 'string' &&
      ['victory', 'defeat', 'flee'].includes(data.reason) &&
      typeof data.message === 'string'
    );
  }
}
