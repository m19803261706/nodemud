/**
 * 门派传送请求消息处理器
 * 客户端请求传送到门派关键 NPC 所在房间
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { SectTeleportMessage } from '../../types/messages/sect';

const VALID_ROLES = new Set(['master', 'deacon', 'sparring']);

@MessageHandler('sectTeleport')
export class SectTeleportHandler implements IMessageHandler {
  create(data: SectTeleportMessage['data']): SectTeleportMessage {
    return {
      type: 'sectTeleport',
      data,
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return (
      data !== null &&
      typeof data === 'object' &&
      typeof data.targetRole === 'string' &&
      VALID_ROLES.has(data.targetRole)
    );
  }
}
