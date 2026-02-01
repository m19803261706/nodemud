/**
 * 注册成功消息处理器
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { RegisterSuccessMessage } from '../../types/messages/auth';

@MessageHandler('registerSuccess')
export class RegisterSuccessHandler implements IMessageHandler {
  create(accountId: string, username: string, message: string): RegisterSuccessMessage {
    return {
      type: 'registerSuccess',
      data: { accountId, username, message },
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return (
      !!data.accountId &&
      typeof data.accountId === 'string' &&
      !!data.username &&
      typeof data.username === 'string' &&
      !!data.message &&
      typeof data.message === 'string'
    );
  }
}
