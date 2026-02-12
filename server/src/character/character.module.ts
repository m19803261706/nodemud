/**
 * Character Module
 * 角色管理模块
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Character } from './character.entity';
import { CharacterService } from './character.service';
import { PlayerExploration } from './player-exploration.entity';
import { ExplorationService } from './exploration.service';

@Module({
  imports: [TypeOrmModule.forFeature([Character, PlayerExploration])],
  providers: [CharacterService, ExplorationService],
  exports: [CharacterService, ExplorationService],
})
export class CharacterModule {}
