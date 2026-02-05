/**
 * 房间信息消息处理器
 * 服务端推送房间数据（标题、描述、出口、坐标）给客户端
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { RoomInfoMessage, RoomCoordinates, NpcBrief } from '../../types/messages/room';
import type { ItemBrief } from '../../types/messages/inventory';

@MessageHandler('roomInfo')
export class RoomInfoHandler implements IMessageHandler {
  create(
    short: string,
    long: string,
    exits: string[],
    coordinates: RoomCoordinates,
    exitNames?: Record<string, string>,
    npcs?: NpcBrief[],
    items?: ItemBrief[],
  ): RoomInfoMessage {
    return {
      type: 'roomInfo',
      data: {
        short,
        long,
        exits,
        exitNames: exitNames ?? {},
        coordinates,
        npcs: npcs ?? [],
        items: items ?? [],
      },
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return (
      typeof data.short === 'string' &&
      typeof data.long === 'string' &&
      Array.isArray(data.exits) &&
      data.exits.every((e: any) => typeof e === 'string') &&
      !!data.coordinates &&
      typeof data.coordinates.x === 'number' &&
      typeof data.coordinates.y === 'number' &&
      typeof data.coordinates.z === 'number'
    );
  }
}
