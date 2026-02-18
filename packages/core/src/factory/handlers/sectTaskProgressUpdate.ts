/**
 * 门派任务进度推送消息处理器
 * 服务端在任务目标进度变化时推送给客户端
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type {
  SectTaskProgressUpdateMessage,
  SectTaskProgressUpdateData,
} from '../../types/messages/sect-task';

@MessageHandler('sectTaskProgressUpdate')
export class SectTaskProgressUpdateHandler implements IMessageHandler {
  create(data: SectTaskProgressUpdateData): SectTaskProgressUpdateMessage {
    return {
      type: 'sectTaskProgressUpdate',
      data,
      timestamp: Date.now(),
    };
  }

  validate(message: SectTaskProgressUpdateMessage): boolean {
    return message.data?.task != null;
  }
}
