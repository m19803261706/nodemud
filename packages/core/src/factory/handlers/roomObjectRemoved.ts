/**
 * 房间对象移除消息处理器
 * 增量推送：NPC 死亡、残骸腐烂等场景通知房间内所有玩家
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { RoomObjectRemovedMessage } from '../../types/messages/room';

@MessageHandler('roomObjectRemoved')
export class RoomObjectRemovedHandler implements IMessageHandler {
  create(objectType: 'npc' | 'item', objectId: string): RoomObjectRemovedMessage {
    return {
      type: 'roomObjectRemoved',
      data: { objectType, objectId },
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return (
      typeof data.objectType === 'string' &&
      (data.objectType === 'npc' || data.objectType === 'item') &&
      typeof data.objectId === 'string'
    );
  }
}
