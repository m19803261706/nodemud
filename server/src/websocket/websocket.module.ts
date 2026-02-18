/**
 * WebSocket Module
 * WebSocket 功能模块
 */

import { Module } from '@nestjs/common';
import { AccountModule } from '../account/account.module';
import { CharacterModule } from '../character/character.module';
import { FateModule } from '../fate/fate.module';
import { EngineModule } from '../engine/engine.module';
import { GameGateway } from './websocket.gateway';
import { AuthHandler } from './handlers/auth.handler';
import { CharacterHandler } from './handlers/character.handler';
import { CommandHandler } from './handlers/command.handler';
import { SkillHandler } from './handlers/skill.handler';
import { MapHandler } from './handlers/map.handler';
import { SectHandler } from './handlers/sect.handler';
import { SkillModule } from '../skill/skill.module';

@Module({
  imports: [AccountModule, CharacterModule, FateModule, EngineModule, SkillModule],
  providers: [
    GameGateway,
    AuthHandler,
    CharacterHandler,
    CommandHandler,
    SkillHandler,
    MapHandler,
    SectHandler,
  ],
  exports: [GameGateway],
})
export class WebSocketModule {}
