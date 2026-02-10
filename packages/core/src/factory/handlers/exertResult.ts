/**
 * 运功结果消息处理器
 * 服务端推送运功效果的执行结果
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { ExertResultMessage } from '../../types/messages/exert';

@MessageHandler('exertResult')
export class ExertResultHandler implements IMessageHandler {
  create(data: ExertResultMessage['data']): ExertResultMessage {
    return {
      type: 'exertResult',
      data,
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return (
      typeof data.effectName === 'string' &&
      typeof data.displayName === 'string' &&
      typeof data.success === 'boolean' &&
      typeof data.message === 'string' &&
      typeof data.resourceChanged === 'boolean'
    );
  }
}
