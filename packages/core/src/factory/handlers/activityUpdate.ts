/**
 * 活动状态更新消息处理器
 * 服务端推送活动状态变化（开始/完成/停止）
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { ActivityUpdateMessage } from '../../types/messages/activity';

@MessageHandler('activityUpdate')
export class ActivityUpdateHandler implements IMessageHandler {
  create(data: ActivityUpdateMessage['data']): ActivityUpdateMessage {
    return {
      type: 'activityUpdate',
      data,
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return (
      typeof data.status === 'string' &&
      ['started', 'completed', 'stopped'].includes(data.status) &&
      typeof data.activityType === 'string'
    );
  }
}
