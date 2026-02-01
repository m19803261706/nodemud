/**
 * 创建角色第一步消息处理器（选择出身）
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type {
  CreateCharacterStep1Message,
  CharacterOrigin,
} from '../../types/messages/character';

const VALID_ORIGINS: CharacterOrigin[] = [
  'noble',
  'wanderer',
  'scholar',
  'soldier',
  'herbalist',
  'beggar',
];

@MessageHandler('createCharacterStep1')
export class CreateCharacterStep1Handler implements IMessageHandler {
  create(
    origin: CharacterOrigin,
    gender: 'male' | 'female',
  ): CreateCharacterStep1Message {
    return {
      type: 'createCharacterStep1',
      data: { origin, gender },
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return (
      !!data.origin &&
      VALID_ORIGINS.includes(data.origin) &&
      !!data.gender &&
      (data.gender === 'male' || data.gender === 'female')
    );
  }
}
