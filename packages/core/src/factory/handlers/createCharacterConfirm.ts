/**
 * 创建角色确认消息处理器（提交属性分配和角色名）
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type {
  CreateCharacterConfirmMessage,
  CharacterOrigin,
  CharacterAttributes,
} from '../../types/messages/character';

/** 中文字符正则：2-6个中文字符 */
const NAME_REGEX = /^[\u4e00-\u9fa5]{2,6}$/;

const VALID_ORIGINS: CharacterOrigin[] = [
  'noble',
  'wanderer',
  'scholar',
  'soldier',
  'herbalist',
  'beggar',
];

/** 属性键列表 */
const ATTR_KEYS: (keyof CharacterAttributes)[] = [
  'wisdom',
  'perception',
  'spirit',
  'meridian',
  'strength',
  'vitality',
];

@MessageHandler('createCharacterConfirm')
export class CreateCharacterConfirmHandler implements IMessageHandler {
  create(
    name: string,
    origin: CharacterOrigin,
    attributes: CharacterAttributes,
  ): CreateCharacterConfirmMessage {
    return {
      type: 'createCharacterConfirm',
      data: { name, origin, attributes },
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    // 验证角色名
    if (!data.name || typeof data.name !== 'string' || !NAME_REGEX.test(data.name)) {
      return false;
    }

    // 验证出身
    if (!data.origin || !VALID_ORIGINS.includes(data.origin)) {
      return false;
    }

    // 验证属性结构
    if (!data.attributes || typeof data.attributes !== 'object') {
      return false;
    }

    // 验证每个属性值是正整数
    for (const key of ATTR_KEYS) {
      const val = data.attributes[key];
      if (typeof val !== 'number' || val < 1 || !Number.isInteger(val)) {
        return false;
      }
    }

    // 验证根基点总和 = 18
    const sum = ATTR_KEYS.reduce((acc, key) => acc + data.attributes[key], 0);
    if (sum !== 18) {
      return false;
    }

    return true;
  }
}
