/**
 * 角色创建失败消息处理器
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { CreateCharacterFailedMessage } from '../../types/messages/character';

const VALID_REASONS = [
  'name_exists',
  'name_invalid',
  'already_has_character',
  'invalid_attributes',
  'invalid_origin',
  'session_expired',
  'fate_not_generated',
  'server_error',
] as const;

@MessageHandler('createCharacterFailed')
export class CreateCharacterFailedHandler implements IMessageHandler {
  create(
    reason: CreateCharacterFailedMessage['data']['reason'],
    message: string,
  ): CreateCharacterFailedMessage {
    return {
      type: 'createCharacterFailed',
      data: { reason, message },
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return (
      typeof data.reason === 'string' &&
      (VALID_REASONS as readonly string[]).includes(data.reason) &&
      typeof data.message === 'string' &&
      !!data.message
    );
  }
}
