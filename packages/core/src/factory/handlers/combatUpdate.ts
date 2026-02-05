/**
 * 战斗更新消息处理器
 * 服务端推送每轮战斗动作和双方最新状态
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { CombatUpdateMessage } from '../../types/messages/combat';

@MessageHandler('combatUpdate')
export class CombatUpdateHandler implements IMessageHandler {
  create(data: CombatUpdateMessage['data']): CombatUpdateMessage {
    return {
      type: 'combatUpdate',
      data,
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return (
      typeof data.combatId === 'string' &&
      Array.isArray(data.actions) &&
      data.actions.every(
        (a: any) =>
          typeof a.attacker === 'string' &&
          typeof a.type === 'string' &&
          typeof a.isCrit === 'boolean' &&
          typeof a.description === 'string',
      ) &&
      !!data.player &&
      typeof data.player.hp === 'number' &&
      typeof data.player.maxHp === 'number' &&
      typeof data.player.atbPct === 'number' &&
      !!data.enemy &&
      typeof data.enemy.hp === 'number' &&
      typeof data.enemy.maxHp === 'number' &&
      typeof data.enemy.atbPct === 'number'
    );
  }
}
