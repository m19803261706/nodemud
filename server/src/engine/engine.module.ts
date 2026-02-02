/**
 * 游戏引擎模块
 * 负责初始化 ServiceLocator，管理引擎服务的生命周期
 * 注册 HeartbeatManager 和 ObjectManager 服务
 */
import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ServiceLocator } from './service-locator';
import { HeartbeatManager } from './heartbeat-manager';
import { ObjectManager } from './object-manager';

@Module({
  providers: [HeartbeatManager, ObjectManager],
  exports: [HeartbeatManager, ObjectManager],
})
export class EngineModule implements OnModuleInit {
  private readonly logger = new Logger(EngineModule.name);

  constructor(
    private readonly heartbeatManager: HeartbeatManager,
    private readonly objectManager: ObjectManager,
  ) {}

  onModuleInit() {
    ServiceLocator.initialize({
      heartbeatManager: this.heartbeatManager,
      objectManager: this.objectManager,
    });
    this.objectManager.startGC();
    this.logger.log('游戏引擎初始化完成（HeartbeatManager + ObjectManager + GC）');
  }
}
