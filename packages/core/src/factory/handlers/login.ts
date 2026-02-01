/**
 * 登录消息处理器
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { LoginMessage } from '../../types/messages/auth';

@MessageHandler('login')
export class LoginHandler implements IMessageHandler {
  create(username: string, password: string): LoginMessage {
    return {
      type: 'login',
      data: { username, password },
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return (
      !!data.username &&
      typeof data.username === 'string' &&
      !!data.password &&
      typeof data.password === 'string'
    );
  }
}
