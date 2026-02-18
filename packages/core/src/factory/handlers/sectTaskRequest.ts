/**
 * 门派任务请求消息处理器
 * 客户端请求可用门派任务列表
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { SectTaskRequestMessage } from '../../types/messages/sect-task';

@MessageHandler('sectTaskRequest')
export class SectTaskRequestHandler implements IMessageHandler {
  create(): SectTaskRequestMessage {
    return {
      type: 'sectTaskRequest',
      data: {},
      timestamp: Date.now(),
    };
  }

  validate(): boolean {
    return true;
  }
}
