/**
 * 登录失败消息处理器
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { LoginFailedMessage } from '../../types/messages/auth';

@MessageHandler('loginFailed')
export class LoginFailedHandler implements IMessageHandler {
  create(reason: string, message: string): LoginFailedMessage {
    return {
      type: 'loginFailed',
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
