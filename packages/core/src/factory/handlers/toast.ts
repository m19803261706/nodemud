/**
 * Toast 提示消息处理器
 * 后端发送轻量提示，前端直接展示
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { ToastMessage } from '../../types/messages/ui';

@MessageHandler('toast')
export class ToastHandler implements IMessageHandler {
  create(level: string, message: string, duration?: number): ToastMessage {
    return {
      type: 'toast',
      data: { level: level as any, message, duration },
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return (
      !!data.level &&
      typeof data.level === 'string' &&
      !!data.message &&
      typeof data.message === 'string'
    );
  }
}
