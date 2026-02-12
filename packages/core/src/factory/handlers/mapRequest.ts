/**
 * 地图请求消息处理器
 * 客户端请求当前区域地图数据
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { MapRequestMessage } from '../../types/messages/map';

@MessageHandler('mapRequest')
export class MapRequestHandler implements IMessageHandler {
  create(): MapRequestMessage {
    return {
      type: 'mapRequest',
      data: {},
      timestamp: Date.now(),
    };
  }

  validate(): boolean {
    return true;
  }
}
