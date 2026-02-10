/**
 * SkillModule
 * 技能模块 - 注册 PlayerSkill 实体和 SkillService
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerSkill } from '../entities/player-skill.entity';
import { SkillService } from './skill.service';

@Module({
  imports: [TypeOrmModule.forFeature([PlayerSkill])],
  providers: [SkillService],
  exports: [SkillService],
})
export class SkillModule {}
