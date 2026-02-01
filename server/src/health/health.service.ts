/**
 * 健康检查服务
 * 提供系统健康状态检查逻辑
 */

import { Injectable } from '@nestjs/common';

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
  /** 检查系统健康状态 */
  async check(): Promise<HealthStatus> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'not configured',
      environment: process.env.NODE_ENV || 'development',
      message: '系统运行正常（数据库未配置，请参考 README.md 配置数据库连接）',
    };
  }
}
