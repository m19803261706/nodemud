/**
 * 战斗开始消息处理器
 * 服务端通知客户端进入战斗状态，推送双方初始数据
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { CombatStartMessage } from '../../types/messages/combat';

@MessageHandler('combatStart')
export class CombatStartHandler implements IMessageHandler {
  create(data: CombatStartMessage['data']): CombatStartMessage {
    return {
      type: 'combatStart',
      data,
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return (
      typeof data.combatId === 'string' &&
      !!data.player &&
      typeof data.player.name === 'string' &&
      typeof data.player.level === 'number' &&
      typeof data.player.hp === 'number' &&
      typeof data.player.maxHp === 'number' &&
      typeof data.player.atbPct === 'number' &&
      !!data.enemy &&
      typeof data.enemy.name === 'string' &&
      typeof data.enemy.level === 'number' &&
      typeof data.enemy.hp === 'number' &&
      typeof data.enemy.maxHp === 'number' &&
      typeof data.enemy.atbPct === 'number'
    );
  }
}
