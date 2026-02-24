/**
 * 驿站列表响应消息处理器
 * 服务端推送驿站列表给客户端
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type {
  StationListResponseMessage,
  StationListResponseData,
} from '../../types/messages/station';

@MessageHandler('stationListResponse')
export class StationListResponseHandler implements IMessageHandler {
  create(data: StationListResponseData): StationListResponseMessage {
    return {
      type: 'stationListResponse',
      data,
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return Array.isArray(data.stations);
  }
}
