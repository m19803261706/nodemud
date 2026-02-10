/**
 * 战斗等待行动消息处理器
 * 服务端通知客户端等待玩家选择战斗行动
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { CombatAwaitActionMessage } from '../../types/messages/skill';

@MessageHandler('combatAwaitAction')
export class CombatAwaitActionHandler implements IMessageHandler {
  create(data: CombatAwaitActionMessage['data']): CombatAwaitActionMessage {
    return {
      type: 'combatAwaitAction',
      data,
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return (
      typeof data.combatId === 'string' &&
      typeof data.timeoutMs === 'number' &&
      Array.isArray(data.availableActions)
    );
  }
}
