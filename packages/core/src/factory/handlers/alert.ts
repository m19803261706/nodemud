/**
 * Alert 弹窗消息处理器
 * 后端发送模态提示，前端直接展示
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { AlertMessage } from '../../types/messages/ui';

@MessageHandler('alert')
export class AlertHandler implements IMessageHandler {
  create(level: string, title: string, message: string, duration?: number): AlertMessage {
    return {
      type: 'alert',
      data: { level: level as any, title, message, duration },
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return (
      !!data.level &&
      typeof data.level === 'string' &&
      !!data.title &&
      typeof data.title === 'string' &&
      !!data.message &&
      typeof data.message === 'string'
    );
  }
}
