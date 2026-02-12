/**
 * 导航请求消息处理器
 * 客户端请求自动寻路到目标房间
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { NavigateRequestMessage } from '../../types/messages/map';

@MessageHandler('navigateRequest')
export class NavigateRequestHandler implements IMessageHandler {
  create(targetRoomId: string): NavigateRequestMessage {
    return {
      type: 'navigateRequest',
      data: { targetRoomId },
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return typeof data.targetRoomId === 'string';
  }
}
