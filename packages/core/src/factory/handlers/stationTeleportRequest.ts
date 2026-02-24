/**
 * 驿站传送请求消息处理器
 * 客户端请求传送到目标城镇
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type {
  StationTeleportRequestMessage,
  StationTeleportRequestData,
} from '../../types/messages/station';

@MessageHandler('stationTeleportRequest')
export class StationTeleportRequestHandler implements IMessageHandler {
  create(data: StationTeleportRequestData): StationTeleportRequestMessage {
    return {
      type: 'stationTeleportRequest',
      data,
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return typeof data.targetAreaId === 'string';
  }
}
