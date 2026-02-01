/**
 * 健康检查服务
 * 提供系统健康状态检查逻辑
 */

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/** 健康状态响应结构 */
export interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: number;
  database: string;
  environment: string;
  message: string;
}

@Injectable()
export class HealthService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /** 检查系统健康状态 */
  async check(): Promise<HealthStatus> {
    const isConnected = this.dataSource?.isInitialized || false;
    const dbStatus = isConnected ? 'connected' : 'disconnected';

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbStatus,
      environment: process.env.NODE_ENV || 'development',
      message: isConnected ? '系统运行正常' : '系统运行正常（数据库连接失败）',
    };
  }
}
