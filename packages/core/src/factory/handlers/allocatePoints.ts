/**
 * 属性点分配消息处理器
 * 客户端请求将自由属性点分配到指定属性
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { AllocatePointsMessage } from '../../types/messages/quest';

@MessageHandler('allocatePoints')
export class AllocatePointsHandler implements IMessageHandler {
  create(data: AllocatePointsMessage['data']): AllocatePointsMessage {
    return {
      type: 'allocatePoints',
      data,
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    if (!data.allocations || typeof data.allocations !== 'object') return false;
    // 验证所有分配值都是数字（如果存在）
    const validKeys = ['wisdom', 'perception', 'spirit', 'meridian', 'strength', 'vitality'];
    for (const key of validKeys) {
      if (key in data.allocations && typeof data.allocations[key] !== 'number') {
        return false;
      }
    }
    return true;
  }
}
