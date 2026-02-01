/**
 * 健康检查控制器
 * 提供服务健康状态查询接口
 */

import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * 健康检查接口
   * @returns 健康状态信息
   */
  @Get()
  check() {
    return this.healthService.check();
  }
}
