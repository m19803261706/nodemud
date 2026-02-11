/**
 * NPC 学艺结果消息处理器
 * 服务端返回 NPC 学艺的执行结果
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { SkillLearnResultMessage } from '../../types/messages/skill';

const VALID_REASON_SET = new Set([
  'unlock_rank_required',
  'unlock_attr_required',
  'unlock_preq_skill_required',
  'unlock_puzzle_canju_required',
  'unlock_puzzle_duanju_required',
  'unlock_puzzle_shiyan_required',
  'unlock_challenge_required',
  'canon_crippled',
  'insufficient_silver',
  'insufficient_energy',
  'insufficient_potential',
  'teacher_cap_reached',
  'cannot_improve',
]);

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
    const reasonValid =
      data.reason === undefined ||
      (typeof data.reason === 'string' && VALID_REASON_SET.has(data.reason));

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
      typeof data.message === 'string' &&
      reasonValid
    );
  }
}
