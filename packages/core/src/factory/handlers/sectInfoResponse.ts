/**
 * 门派信息响应消息处理器
 * 服务端返回完整门派数据（概览、技能树、进度、NPC位置）
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { SectInfoResponseMessage, SectInfoResponseData } from '../../types/messages/sect';

@MessageHandler('sectInfoResponse')
export class SectInfoResponseHandler implements IMessageHandler {
  create(data: SectInfoResponseData): SectInfoResponseMessage {
    return {
      type: 'sectInfoResponse',
      data,
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return data !== null && typeof data === 'object';
  }
}
