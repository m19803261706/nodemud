/**
 * WebSocket Module
 * WebSocket 功能模块
 */

import { Module } from '@nestjs/common';
import { AccountModule } from '../account/account.module';
import { GameGateway } from './websocket.gateway';
import { AuthHandler } from './handlers/auth.handler';

@Module({
  imports: [AccountModule],
  providers: [GameGateway, AuthHandler],
  exports: [GameGateway],
})
export class WebSocketModule {}
