/**
 * NPC 学艺请求消息处理器
 * 客户端发送向 NPC 学习技能的请求
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { SkillLearnRequestMessage } from '../../types/messages/skill';

@MessageHandler('skillLearnRequest')
export class SkillLearnRequestHandler implements IMessageHandler {
  create(data: SkillLearnRequestMessage['data']): SkillLearnRequestMessage {
    return {
      type: 'skillLearnRequest',
      data,
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return (
      typeof data.npcId === 'string' &&
      typeof data.skillId === 'string' &&
      typeof data.times === 'number' &&
      data.times > 0
    );
  }
}
