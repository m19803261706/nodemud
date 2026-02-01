/**
 * WebSocket Module
 * WebSocket 功能模块
 */

import { Module } from '@nestjs/common';
import { GameGateway } from './websocket.gateway';

@Module({
  providers: [GameGateway],
  exports: [GameGateway],
})
export class WebSocketModule {}
