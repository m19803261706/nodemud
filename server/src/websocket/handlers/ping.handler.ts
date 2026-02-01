/**
 * 心跳处理器
 * 处理 ping/pong 消息
 */

import { Injectable } from '@nestjs/common';
import { MessageFactory } from '@packages/core';
import type { Session } from '../types/session';

@Injectable()
export class PingHandler {
  /**
   * 处理心跳
   */
  handlePing(client: any, session: Session) {
    // 更新最后心跳时间
    session.lastPing = Date.now();

    // 发送 pong 消息
    client.send(
      MessageFactory.serialize({
        type: 'pong',
        data: {
          serverTime: Date.now(),
        },
        timestamp: Date.now(),
      }),
    );
  }
}
