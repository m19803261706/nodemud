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
import { SpawnManager } from './spawn-manager';
import { CombatManager } from './combat/combat-manager';
import { ExpManager } from './quest/exp-manager';
import { QuestManager } from './quest/quest-manager';

@Module({
  providers: [
    HeartbeatManager,
    ObjectManager,
    BlueprintRegistry,
    BlueprintLoader,
    BlueprintFactory,
    CommandManager,
    CommandLoader,
    SpawnManager,
    CombatManager,
    ExpManager,
    QuestManager,
  ],
  exports: [
    HeartbeatManager,
    ObjectManager,
    BlueprintRegistry,
    BlueprintLoader,
    BlueprintFactory,
    CommandManager,
    CommandLoader,
    SpawnManager,
    CombatManager,
    ExpManager,
    QuestManager,
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
    private readonly spawnManager: SpawnManager,
    private readonly combatManager: CombatManager,
    private readonly expManager: ExpManager,
    private readonly questManager: QuestManager,
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
      spawnManager: this.spawnManager,
      combatManager: this.combatManager,
      expManager: this.expManager,
      questManager: this.questManager,
    });
    this.objectManager.startGC();

    // 扫描加载蓝图（world/ 目录在编译后的 dist/ 下）
    const worldDir = path.join(__dirname, '..', 'world');
    await this.blueprintLoader.scanAndLoad(worldDir);

    // 扫描加载指令（commands/ 目录在编译后的 dist/ 下）
    const commandsDir = path.join(__dirname, 'commands');
    this.commandLoader.scanAndLoad(commandsDir);

    // 刷新 NPC（必须在蓝图和房间加载完毕后执行）
    this.spawnManager.spawnAll();

    this.logger.log(
      `游戏引擎初始化完成（Layer 0-4: BaseEntity + HB/OM + Blueprint + Command, 蓝图: ${this.blueprintRegistry.getCount()} 个, 指令: ${this.commandManager.getCount()} 个）`,
    );
  }
}
