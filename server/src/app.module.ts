/**
 * 应用主模块
 * 配置和组装所有功能模块
 */

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { validate } from './config/env.validation';
import { getDatabaseConfig } from './config/database.config';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // 配置模块 - 加载和验证环境变量
    ConfigModule.forRoot({
      isGlobal: true, // 全局可用
      validate, // 环境变量验证
      envFilePath: '.env',
    }),

    // 数据库模块 - TypeORM MySQL 连接
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),

    // 功能模块
    HealthModule,
  ],
})
export class AppModule {}
