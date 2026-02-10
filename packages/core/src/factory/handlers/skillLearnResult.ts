/**
 * NPC 学艺结果消息处理器
 * 服务端返回 NPC 学艺的执行结果
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { SkillLearnResultMessage } from '../../types/messages/skill';

@MessageHandler('skillLearnResult')
export class SkillLearnResultHandler implements IMessageHandler {
  create(data: SkillLearnResultMessage['data']): SkillLearnResultMessage {
    return {
      type: 'skillLearnResult',
      data,
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return (
      typeof data.success === 'boolean' &&
      typeof data.skillId === 'string' &&
      typeof data.skillName === 'string' &&
      typeof data.timesCompleted === 'number' &&
      typeof data.timesRequested === 'number' &&
      typeof data.currentLevel === 'number' &&
      typeof data.learned === 'number' &&
      typeof data.learnedMax === 'number' &&
      typeof data.levelUp === 'boolean' &&
      typeof data.message === 'string'
    );
  }
}
