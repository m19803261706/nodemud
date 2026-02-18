/**
 * 门派信息请求消息处理器
 * 客户端切换到门派 Tab 时发送，请求完整门派数据
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { SectInfoRequestMessage } from '../../types/messages/sect';

@MessageHandler('sectInfoRequest')
export class SectInfoRequestHandler implements IMessageHandler {
  create(): SectInfoRequestMessage {
    return {
      type: 'sectInfoRequest',
      data: {},
      timestamp: Date.now(),
    };
  }

  validate(): boolean {
    return true;
  }
}
