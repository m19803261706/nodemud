/**
 * 门派任务响应消息处理器
 * 服务端返回可用任务列表和进度
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type {
  SectTaskResponseMessage,
  SectTaskResponseData,
} from '../../types/messages/sect-task';

@MessageHandler('sectTaskResponse')
export class SectTaskResponseHandler implements IMessageHandler {
  create(data: SectTaskResponseData): SectTaskResponseMessage {
    return {
      type: 'sectTaskResponse',
      data,
      timestamp: Date.now(),
    };
  }

  validate(message: SectTaskResponseMessage): boolean {
    return message.data != null;
  }
}
