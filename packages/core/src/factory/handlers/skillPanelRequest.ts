/**
 * 技能面板请求消息处理器
 * 客户端请求打开技能面板或查看技能详情
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { SkillPanelRequestMessage } from '../../types/messages/skill';

@MessageHandler('skillPanelRequest')
export class SkillPanelRequestHandler implements IMessageHandler {
  create(data: SkillPanelRequestMessage['data']): SkillPanelRequestMessage {
    return {
      type: 'skillPanelRequest',
      data,
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    // detailSkillId 是可选字段
    return (
      data !== null &&
      typeof data === 'object' &&
      (data.detailSkillId === undefined || typeof data.detailSkillId === 'string')
    );
  }
}
