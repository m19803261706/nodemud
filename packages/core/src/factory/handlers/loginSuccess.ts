/**
 * 登录成功消息处理器
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { LoginSuccessMessage } from '../../types/messages/auth';

@MessageHandler('loginSuccess')
export class LoginSuccessHandler implements IMessageHandler {
  create(
    accountId: string,
    username: string,
    hasCharacter: boolean,
    message: string,
    characterId?: string,
    characterName?: string,
  ): LoginSuccessMessage {
    return {
      type: 'loginSuccess',
      data: { accountId, username, hasCharacter, characterId, characterName, message },
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return (
      !!data.accountId &&
      typeof data.accountId === 'string' &&
      !!data.username &&
      typeof data.username === 'string' &&
      typeof data.hasCharacter === 'boolean' &&
      !!data.message &&
      typeof data.message === 'string'
    );
  }
}
