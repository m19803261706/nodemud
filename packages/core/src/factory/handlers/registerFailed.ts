/**
 * 注册失败消息处理器
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { RegisterFailedMessage } from '../../types/messages/auth';

@MessageHandler('registerFailed')
export class RegisterFailedHandler implements IMessageHandler {
  create(reason: string, message: string): RegisterFailedMessage {
    return {
      type: 'registerFailed',
      data: { reason: reason as any, message },
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return (
      !!data.reason &&
      typeof data.reason === 'string' &&
      !!data.message &&
      typeof data.message === 'string'
    );
  }
}
