/**
 * 指令处理器
 * 接收客户端 command 消息，查找玩家对象，执行指令并返回结果
 */

import { Injectable, Logger } from '@nestjs/common';
import { MessageFactory } from '@packages/core';
import { ObjectManager } from '../../engine/object-manager';
import type { PlayerBase } from '../../engine/game-objects/player-base';
import type { Session } from '../types/session';

@Injectable()
export class CommandHandler {
  private readonly logger = new Logger(CommandHandler.name);

  constructor(private readonly objectManager: ObjectManager) {}

  /**
   * 处理指令消息
   * @param client WebSocket 客户端
   * @param session 当前会话
   * @param data 指令数据 { input: string }
   */
  async handleCommand(client: any, session: Session, data: { input: string }) {
    // 认证检查
    if (!session.authenticated) {
      const resp = MessageFactory.create('toast', { message: '请先登录', type: 'error' });
      client.send(MessageFactory.serialize(resp));
      return;
    }

    // 查找玩家对象
    if (!session.playerId) {
      const resp = MessageFactory.create('toast', { message: '请先创建角色', type: 'error' });
      client.send(MessageFactory.serialize(resp));
      return;
    }

    const player = this.objectManager.get(session.playerId) as PlayerBase | undefined;
    if (!player) {
      this.logger.warn(`玩家对象不存在: ${session.playerId}`);
      const resp = MessageFactory.create('toast', { message: '角色数据异常', type: 'error' });
      client.send(MessageFactory.serialize(resp));
      return;
    }

    // 执行指令
    const input = data.input?.trim();
    if (!input) return;

    const result = player.executeCommand(input);

    // 返回指令结果
    const resp = {
      type: 'commandResult',
      data: result,
      timestamp: Date.now(),
    };
    client.send(JSON.stringify(resp));
  }
}
