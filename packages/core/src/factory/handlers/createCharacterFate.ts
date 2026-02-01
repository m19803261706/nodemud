/**
 * 创建角色命格消息处理器（服务端返回命格结果）
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type {
  CreateCharacterFateMessage,
  CharacterAttributes,
} from '../../types/messages/character';

@MessageHandler('createCharacterFate')
export class CreateCharacterFateHandler implements IMessageHandler {
  create(
    fateName: string,
    fatePoem: string,
    fateType: string,
    destiny: number,
    benefactor: number,
    calamity: number,
    fortune: number,
    attributeCaps: CharacterAttributes,
    wuxingju: string,
    mingzhuStar: string,
    shenzhuStar: string,
  ): CreateCharacterFateMessage {
    return {
      type: 'createCharacterFate',
      data: {
        fateName,
        fatePoem,
        fateType,
        destiny,
        benefactor,
        calamity,
        fortune,
        attributeCaps,
        wuxingju,
        mingzhuStar,
        shenzhuStar,
      },
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return (
      typeof data.fateName === 'string' &&
      !!data.fateName &&
      typeof data.fatePoem === 'string' &&
      !!data.fatePoem &&
      typeof data.fateType === 'string' &&
      !!data.fateType &&
      typeof data.destiny === 'number' &&
      data.destiny >= 1 &&
      data.destiny <= 5 &&
      typeof data.benefactor === 'number' &&
      data.benefactor >= 1 &&
      data.benefactor <= 5 &&
      typeof data.calamity === 'number' &&
      data.calamity >= 1 &&
      data.calamity <= 5 &&
      typeof data.fortune === 'number' &&
      data.fortune >= 1 &&
      data.fortune <= 5 &&
      !!data.attributeCaps &&
      typeof data.attributeCaps === 'object' &&
      typeof data.wuxingju === 'string' &&
      typeof data.mingzhuStar === 'string' &&
      typeof data.shenzhuStar === 'string'
    );
  }
}
