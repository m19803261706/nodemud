/**
 * 门派任务完成结果消息处理器
 * 服务端返回任务完成的结果和奖励
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type {
  SectTaskCompleteResultMessage,
  SectTaskCompleteResultData,
} from '../../types/messages/sect-task';

@MessageHandler('sectTaskCompleteResult')
export class SectTaskCompleteResultHandler implements IMessageHandler {
  create(data: SectTaskCompleteResultData): SectTaskCompleteResultMessage {
    return {
      type: 'sectTaskCompleteResult',
      data,
      timestamp: Date.now(),
    };
  }

  validate(message: SectTaskCompleteResultMessage): boolean {
    return typeof message.data?.success === 'boolean';
  }
}
