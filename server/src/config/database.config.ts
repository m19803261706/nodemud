/**
 * 数据库配置
 * TypeORM MySQL 连接配置
 */

import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * 获取数据库配置
 * @param configService - ConfigService 实例
 * @returns TypeORM 配置对象
 */
export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_DATABASE'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: configService.get<string>('NODE_ENV') === 'development', // 仅在开发环境自动同步
  logging: configService.get<string>('NODE_ENV') === 'development',
  charset: 'utf8mb4',
  timezone: '+08:00',
  retryAttempts: 3, // 重试次数
  retryDelay: 3000, // 重试延迟（毫秒）
  autoLoadEntities: true, // 自动加载实体
});
