/**
 * 地图响应消息处理器
 * 服务端推送区域地图数据给客户端
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { MapResponseMessage, MapResponseData } from '../../types/messages/map';

@MessageHandler('mapResponse')
export class MapResponseHandler implements IMessageHandler {
  create(data: MapResponseData): MapResponseMessage {
    return {
      type: 'mapResponse',
      data,
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return (
      typeof data.areaId === 'string' &&
      typeof data.areaName === 'string' &&
      Array.isArray(data.rooms) &&
      typeof data.currentRoomId === 'string'
    );
  }
}
