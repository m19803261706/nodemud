/**
 * WebSocket Module
 * WebSocket 功能模块
 */

import { Module } from '@nestjs/common';
import { AccountModule } from '../account/account.module';
import { CharacterModule } from '../character/character.module';
import { FateModule } from '../fate/fate.module';
import { GameGateway } from './websocket.gateway';
import { AuthHandler } from './handlers/auth.handler';
import { CharacterHandler } from './handlers/character.handler';

@Module({
  imports: [AccountModule, CharacterModule, FateModule],
  providers: [GameGateway, AuthHandler, CharacterHandler],
  exports: [GameGateway],
})
export class WebSocketModule {}
