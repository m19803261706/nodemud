/**
 * 应用入口文件
 * 启动 NestJS 应用服务器
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new WsAdapter(app));
  const logger = new Logger('Bootstrap');

  // 全局验证管道 - 自动转换类型并过滤未定义属性
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.enableCors();

  const port = process.env.PORT || 4000;
  await app.listen(port);

  logger.log(`应用启动成功 | 端口: ${port} | 环境: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`健康检查: http://localhost:${port}/health`);
}

bootstrap();
