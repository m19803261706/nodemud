/**
 * 应用主模块
 * 配置和组装所有功能模块
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config/env.validation';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // 配置模块 - 加载和验证环境变量
    ConfigModule.forRoot({
      isGlobal: true, // 全局可用
      validate, // 环境变量验证
      envFilePath: '.env',
    }),

    // TODO: 启用数据库连接 - 参见 config/database.config.ts

    // 功能模块
    HealthModule,
  ],
})
export class AppModule {}
