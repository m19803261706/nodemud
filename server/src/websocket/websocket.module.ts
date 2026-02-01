/**
 * WebSocket Module
 * WebSocket 功能模块
 */

import { Module } from '@nestjs/common';
import { GameGateway } from './websocket.gateway';
import { AuthHandler } from './handlers/auth.handler';
import { PingHandler } from './handlers/ping.handler';
import { AccountModule } from '../account/account.module';

@Module({
  imports: [AccountModule],
  providers: [GameGateway, AuthHandler, PingHandler],
  exports: [GameGateway],
})
export class WebSocketModule {}
