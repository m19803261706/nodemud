/**
 * 游戏引擎模块
 * 负责初始化 ServiceLocator，管理引擎服务的生命周期
 * 注册 Layer 1（HeartbeatManager/ObjectManager）、Layer 2（Blueprint 体系）、Layer 4（Command 体系）服务
 */
import { Module, OnModuleInit, Logger } from '@nestjs/common';
import * as path from 'path';
import { ServiceLocator } from './service-locator';
import { HeartbeatManager } from './heartbeat-manager';
import { ObjectManager } from './object-manager';
import { BlueprintRegistry } from './blueprint-registry';
import { BlueprintLoader } from './blueprint-loader';
import { BlueprintFactory } from './blueprint-factory';
import { CommandManager } from './command-manager';
import { CommandLoader } from './command-loader';

@Module({
  providers: [
    HeartbeatManager,
    ObjectManager,
    BlueprintRegistry,
    BlueprintLoader,
    BlueprintFactory,
    CommandManager,
    CommandLoader,
  ],
  exports: [
    HeartbeatManager,
    ObjectManager,
    BlueprintRegistry,
    BlueprintLoader,
    BlueprintFactory,
    CommandManager,
    CommandLoader,
  ],
})
export class EngineModule implements OnModuleInit {
  private readonly logger = new Logger(EngineModule.name);

  constructor(
    private readonly heartbeatManager: HeartbeatManager,
    private readonly objectManager: ObjectManager,
    private readonly blueprintRegistry: BlueprintRegistry,
    private readonly blueprintLoader: BlueprintLoader,
    private readonly blueprintFactory: BlueprintFactory,
    private readonly commandManager: CommandManager,
    private readonly commandLoader: CommandLoader,
  ) {}

  async onModuleInit() {
    ServiceLocator.initialize({
      heartbeatManager: this.heartbeatManager,
      objectManager: this.objectManager,
      blueprintRegistry: this.blueprintRegistry,
      blueprintLoader: this.blueprintLoader,
      blueprintFactory: this.blueprintFactory,
      commandManager: this.commandManager,
      commandLoader: this.commandLoader,
    });
    this.objectManager.startGC();

    // 扫描加载蓝图（world/ 目录在编译后的 dist/ 下）
    const worldDir = path.join(__dirname, '..', 'world');
    await this.blueprintLoader.scanAndLoad(worldDir);

    // 扫描加载指令（commands/ 目录在编译后的 dist/ 下）
    const commandsDir = path.join(__dirname, 'commands');
    this.commandLoader.scanAndLoad(commandsDir);

    this.logger.log(
      `游戏引擎初始化完成（Layer 0-4: BaseEntity + HB/OM + Blueprint + Command, 蓝图: ${this.blueprintRegistry.getCount()} 个, 指令: ${this.commandManager.getCount()} 个）`,
    );
  }
}
