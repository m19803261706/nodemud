/**
 * 驿站传送响应消息处理器
 * 服务端返回传送结果
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type {
  StationTeleportResponseMessage,
  StationTeleportResponseData,
} from '../../types/messages/station';

@MessageHandler('stationTeleportResponse')
export class StationTeleportResponseHandler implements IMessageHandler {
  create(data: StationTeleportResponseData): StationTeleportResponseMessage {
    return {
      type: 'stationTeleportResponse',
      data,
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return typeof data.success === 'boolean' && typeof data.message === 'string';
  }
}
