/**
 * 技能面板数据消息处理器
 * 服务端返回技能面板完整数据（技能列表、装配、加成汇总、详情）
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { SkillPanelDataMessage } from '../../types/messages/skill';

@MessageHandler('skillPanelData')
export class SkillPanelDataHandler implements IMessageHandler {
  create(data: SkillPanelDataMessage['data']): SkillPanelDataMessage {
    return {
      type: 'skillPanelData',
      data,
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return (
      Array.isArray(data.skills) &&
      typeof data.skillMap === 'object' &&
      data.skillMap !== null &&
      (data.activeForce === null || typeof data.activeForce === 'string') &&
      typeof data.bonusSummary === 'object' &&
      data.bonusSummary !== null
    );
  }
}
