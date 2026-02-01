/**
 * Character Module
 * 角色管理模块
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Character } from './character.entity';
import { CharacterService } from './character.service';

@Module({
  imports: [TypeOrmModule.forFeature([Character])],
  providers: [CharacterService],
  exports: [CharacterService],
})
export class CharacterModule {}
