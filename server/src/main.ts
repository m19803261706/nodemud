/**
 * 应用入口文件
 * 启动 NestJS 应用服务器
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // 自动转换类型
      whitelist: true, // 过滤未定义的属性
    }),
  );

  // 启用 CORS（允许前端跨域访问）
  app.enableCors();

  // 获取端口配置
  const port = process.env.PORT || 4000;

  await app.listen(port);

  logger.log(`🚀 应用启动成功`);
  logger.log(`📡 服务器运行在: http://localhost:${port}`);
  logger.log(`🏥 健康检查: http://localhost:${port}/health`);
  logger.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap();
