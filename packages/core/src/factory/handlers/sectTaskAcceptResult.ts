/**
 * 门派任务接取结果消息处理器
 * 服务端返回接取任务的结果
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type {
  SectTaskAcceptResultMessage,
  SectTaskAcceptResultData,
} from '../../types/messages/sect-task';

@MessageHandler('sectTaskAcceptResult')
export class SectTaskAcceptResultHandler implements IMessageHandler {
  create(data: SectTaskAcceptResultData): SectTaskAcceptResultMessage {
    return {
      type: 'sectTaskAcceptResult',
      data,
      timestamp: Date.now(),
    };
  }

  validate(message: SectTaskAcceptResultMessage): boolean {
    return typeof message.data?.success === 'boolean';
  }
}
