/**
 * 服务定位器
 * BaseEntity 通过此类访问 NestJS 管理的引擎服务
 * 在 EngineModule 启动时初始化
 */
import type { HeartbeatManager } from './heartbeat-manager';
import type { ObjectManager } from './object-manager';
import type { BlueprintRegistry } from './blueprint-registry';
import type { BlueprintLoader } from './blueprint-loader';
import type { BlueprintFactory } from './blueprint-factory';
import type { CommandManager } from './command-manager';
import type { CommandLoader } from './command-loader';
import type { SpawnManager } from './spawn-manager';
import type { CombatManager } from './combat/combat-manager';
import type { ExpManager } from './quest/exp-manager';
import type { QuestManager } from './quest/quest-manager';
import type { SkillService } from '../skill/skill.service';
import type { SkillRegistry } from './skills/skill-registry';
import type { PracticeManager } from './skills/practice-manager';
import type { SectManager } from './sect/sect-manager';

export class ServiceLocator {
  // Layer 1 服务
  static heartbeatManager: HeartbeatManager;
  static objectManager: ObjectManager;

  // Layer 2 服务
  static blueprintRegistry: BlueprintRegistry;
  static blueprintLoader: BlueprintLoader;
  static blueprintFactory: BlueprintFactory;

  // Layer 4 服务
  static commandManager: CommandManager;
  static commandLoader: CommandLoader;

  // Layer 4.5 刷新服务
  static spawnManager: SpawnManager;

  // Layer 5 战斗服务
  static combatManager: CombatManager;

  // Layer 6 经验与任务服务
  static expManager: ExpManager;
  static questManager: QuestManager;

  // Layer 7 技能服务
  static skillService: SkillService;
  static skillRegistry: SkillRegistry;
  static practiceManager: PracticeManager;

  // Layer 8 门派服务
  static sectManager: SectManager;

  private static _initialized = false;

  /** 初始化服务定位器（由 EngineModule 调用） */
  static initialize(providers: {
    heartbeatManager: HeartbeatManager;
    objectManager: ObjectManager;
    blueprintRegistry?: BlueprintRegistry;
    blueprintLoader?: BlueprintLoader;
    blueprintFactory?: BlueprintFactory;
    commandManager?: CommandManager;
    commandLoader?: CommandLoader;
    spawnManager?: SpawnManager;
    combatManager?: CombatManager;
    expManager?: ExpManager;
    questManager?: QuestManager;
    skillService?: SkillService;
    skillRegistry?: SkillRegistry;
    practiceManager?: PracticeManager;
    sectManager?: SectManager;
  }): void {
    this.heartbeatManager = providers.heartbeatManager;
    this.objectManager = providers.objectManager;
    if (providers.blueprintRegistry) this.blueprintRegistry = providers.blueprintRegistry;
    if (providers.blueprintLoader) this.blueprintLoader = providers.blueprintLoader;
    if (providers.blueprintFactory) this.blueprintFactory = providers.blueprintFactory;
    if (providers.commandManager) this.commandManager = providers.commandManager;
    if (providers.commandLoader) this.commandLoader = providers.commandLoader;
    if (providers.spawnManager) this.spawnManager = providers.spawnManager;
    if (providers.combatManager) this.combatManager = providers.combatManager;
    if (providers.expManager) this.expManager = providers.expManager;
    if (providers.questManager) this.questManager = providers.questManager;
    if (providers.skillService) this.skillService = providers.skillService;
    if (providers.skillRegistry) this.skillRegistry = providers.skillRegistry;
    if (providers.practiceManager) this.practiceManager = providers.practiceManager;
    if (providers.sectManager) this.sectManager = providers.sectManager;
    this._initialized = true;
  }

  /** 检查是否已初始化 */
  static get initialized(): boolean {
    return this._initialized;
  }

  /** 重置（测试用） */
  static reset(): void {
    this._initialized = false;
    this.heartbeatManager = undefined as any;
    this.objectManager = undefined as any;
    this.blueprintRegistry = undefined as any;
    this.blueprintLoader = undefined as any;
    this.blueprintFactory = undefined as any;
    this.commandManager = undefined as any;
    this.commandLoader = undefined as any;
    this.spawnManager = undefined as any;
    this.combatManager = undefined as any;
    this.expManager = undefined as any;
    this.questManager = undefined as any;
    this.skillService = undefined as any;
    this.skillRegistry = undefined as any;
    this.practiceManager = undefined as any;
    this.sectManager = undefined as any;
  }
}
