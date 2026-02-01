/**
 * 应用主模块
 * 配置和组装所有功能模块
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { ConfigService } from '@nestjs/config';
import { validate } from './config/env.validation';
// import { getDatabaseConfig } from './config/database.config';
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
    // 注意: 启动时需要配置正确的数据库连接信息
    // 取消下方注释以启用数据库连接
    /*
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    */

    // 功能模块
    HealthModule,
  ],
})
export class AppModule {}
