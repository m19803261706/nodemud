/**
 * 房间对象新增消息处理器
 * 增量推送：NPC 重生、残骸生成等场景通知房间内所有玩家
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { RoomObjectAddedMessage, NpcBrief } from '../../types/messages/room';
import type { ItemBrief } from '../../types/messages/inventory';

@MessageHandler('roomObjectAdded')
export class RoomObjectAddedHandler implements IMessageHandler {
  create(objectType: 'npc' | 'item', brief: NpcBrief | ItemBrief): RoomObjectAddedMessage {
    const data: RoomObjectAddedMessage['data'] = { objectType };
    if (objectType === 'npc') {
      data.npc = brief as NpcBrief;
    } else {
      data.item = brief as ItemBrief;
    }
    return {
      type: 'roomObjectAdded',
      data,
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return (
      typeof data.objectType === 'string' &&
      (data.objectType === 'npc' || data.objectType === 'item')
    );
  }
}
