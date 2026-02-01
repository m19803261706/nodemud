/**
 * 注册消息处理器
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { RegisterMessage } from '../../types/messages/auth';

@MessageHandler('register')
export class RegisterHandler implements IMessageHandler {
  create(username: string, password: string, phone: string): RegisterMessage {
    return {
      type: 'register',
      data: { username, password, phone },
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return (
      !!data.username &&
      typeof data.username === 'string' &&
      !!data.password &&
      typeof data.password === 'string' &&
      !!data.phone &&
      typeof data.phone === 'string'
    );
  }
}
