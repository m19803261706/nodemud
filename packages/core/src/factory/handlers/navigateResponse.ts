/**
 * 导航响应消息处理器
 * 服务端推送寻路结果给客户端
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { NavigateResponseMessage, NavigateResponseData } from '../../types/messages/map';

@MessageHandler('navigateResponse')
export class NavigateResponseHandler implements IMessageHandler {
  create(data: NavigateResponseData): NavigateResponseMessage {
    return {
      type: 'navigateResponse',
      data,
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return (
      typeof data.success === 'boolean' &&
      typeof data.targetRoomId === 'string' &&
      Array.isArray(data.path) &&
      typeof data.message === 'string'
    );
  }
}
