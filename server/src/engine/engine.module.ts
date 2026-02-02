/**
 * 游戏引擎模块
 * 负责初始化 ServiceLocator，管理引擎服务的生命周期
 */
import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ServiceLocator } from './service-locator';

@Module({
  providers: [],
  exports: [],
})
export class EngineModule implements OnModuleInit {
  private readonly logger = new Logger(EngineModule.name);

  onModuleInit() {
    ServiceLocator.initialize({});
    this.logger.log('游戏引擎初始化完成');
  }
}
