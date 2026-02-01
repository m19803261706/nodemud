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
export function getDatabaseConfig(configService: ConfigService): TypeOrmModuleOptions {
  const isDev = configService.get<string>('NODE_ENV') === 'development';

  return {
    type: 'mysql',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_DATABASE'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: isDev,
    logging: isDev,
    charset: 'utf8mb4',
    timezone: '+08:00',
    retryAttempts: 3,
    retryDelay: 3000,
    autoLoadEntities: true,
  };
}
