/**
 * WebSocket Gateway
 * 处理 WebSocket 连接、断开、消息路由
 */

import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server } from 'ws';
import { MessageFactory } from '@packages/core';
import type { ClientMessage } from '@packages/core';
import type { Session } from './types/session';

@WebSocketGateway(4001, { transports: ['websocket'] })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Session 存储（内存 Map）
  private sessions = new Map<string, Session>();

  /** 客户端连接 */
  handleConnection(client: any) {
    const socketId = this.getSocketId(client);
    console.log('客户端连接:', socketId);

    this.sessions.set(socketId, {
      socketId,
      authenticated: false,
    });
  }

  /** 客户端断开 */
  handleDisconnect(client: any) {
    const socketId = this.getSocketId(client);
    console.log('客户端断开:', socketId);
    this.sessions.delete(socketId);
  }

  /** 监听客户端消息 */
  @SubscribeMessage('message')
  handleMessage(@ConnectedSocket() client: any, @MessageBody() data: string) {
    const socketId = this.getSocketId(client);
    const session = this.sessions.get(socketId);

    if (!session) {
      console.error('Session 不存在:', socketId);
      return;
    }

    // 反序列化消息
    const message = MessageFactory.deserialize<ClientMessage>(data);
    if (!message) {
      console.error('无效消息:', data);
      return;
    }

    console.log('收到消息:', message.type, 'from', socketId);

    // TODO: 消息路由（任务 #21 实现）
    // 暂时只记录日志
  }

  /** 获取 Socket ID */
  private getSocketId(client: any): string {
    return client._socket?.remoteAddress + ':' + client._socket?.remotePort || 'unknown';
  }

  /** 获取 Session */
  getSession(socketId: string): Session | undefined {
    return this.sessions.get(socketId);
  }
}
