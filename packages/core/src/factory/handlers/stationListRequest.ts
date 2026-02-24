/**
 * 驿站列表请求消息处理器
 * 客户端请求可传送驿站列表
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { StationListRequestMessage } from '../../types/messages/station';

@MessageHandler('stationListRequest')
export class StationListRequestHandler implements IMessageHandler {
  create(): StationListRequestMessage {
    return {
      type: 'stationListRequest',
      data: {},
      timestamp: Date.now(),
    };
  }

  validate(): boolean {
    return true;
  }
}
