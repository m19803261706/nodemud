/**
 * Account Module
 * 账号管理模块
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './account.entity';
import { Character } from '../character/character.entity';
import { AccountService } from './account.service';

@Module({
  imports: [TypeOrmModule.forFeature([Account, Character])],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
