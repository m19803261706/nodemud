/**
 * Fate Module
 * 命格生成模块（紫微排盘引擎）
 */

import { Module } from '@nestjs/common';
import { FateService } from './fate.service';

@Module({
  providers: [FateService],
  exports: [FateService],
})
export class FateModule {}
