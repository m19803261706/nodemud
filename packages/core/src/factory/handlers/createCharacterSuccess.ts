/**
 * 角色创建成功消息处理器
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { CreateCharacterSuccessMessage } from '../../types/messages/character';

@MessageHandler('createCharacterSuccess')
export class CreateCharacterSuccessHandler implements IMessageHandler {
  create(
    characterId: string,
    characterName: string,
    message: string,
  ): CreateCharacterSuccessMessage {
    return {
      type: 'createCharacterSuccess',
      data: { characterId, characterName, message },
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return (
      typeof data.characterId === 'string' &&
      !!data.characterId &&
      typeof data.characterName === 'string' &&
      !!data.characterName &&
      typeof data.message === 'string' &&
      !!data.message
    );
  }
}
