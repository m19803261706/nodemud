/**
 * 健康检查服务
 * 提供系统健康状态检查逻辑
 */

import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@Injectable()
export class HealthService {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  /**
   * 检查系统健康状态
   * @returns 健康状态对象
   */
  async check() {
    const dbStatus = this.connection.isInitialized ? 'connected' : 'disconnected';

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbStatus,
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
