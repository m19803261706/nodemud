/**
 * BlueprintFactory -- 对象创建工厂
 *
 * 从蓝图创建运行时对象实例：虚拟对象（单例）和克隆对象（多实例）。
 * 作为 NestJS Injectable 服务，在 EngineModule 中提供单例。
 */
import { Injectable, Logger } from '@nestjs/common';
import { BlueprintRegistry } from './blueprint-registry';
import { ObjectManager } from './object-manager';
import { ServiceLocator } from './service-locator';
import type { BaseEntity } from './base-entity';
import type { QuestDefinition } from './quest/quest-definition';

@Injectable()
export class BlueprintFactory {
  private readonly logger = new Logger(BlueprintFactory.name);

  constructor(
    private readonly registry: BlueprintRegistry,
    private readonly objectManager: ObjectManager,
  ) {}

  /**
   * 创建虚拟对象（单例）
   * 由 BlueprintLoader.scanAndLoad 在启动时调用
   * @throws 蓝图不存在或非虚拟蓝图时抛错
   */
  createVirtual(blueprintId: string): BaseEntity {
    const meta = this.registry.get(blueprintId);
    if (!meta) {
      throw new Error(`BlueprintFactory: 蓝图 "${blueprintId}" 不存在`);
    }
    if (!meta.virtual) {
      throw new Error(`BlueprintFactory: 蓝图 "${blueprintId}" 非虚拟蓝图，不能创建虚拟对象`);
    }
    const instance = new meta.blueprintClass(blueprintId);
    this.objectManager.register(instance);
    instance.create();
    this.logger.log(`虚拟对象已创建: ${blueprintId}`);
    return instance;
  }

  /**
   * 克隆对象（多实例）
   * @throws 蓝图不存在或为虚拟蓝图时抛错
   */
  clone(blueprintId: string): BaseEntity {
    const meta = this.registry.get(blueprintId);
    if (!meta) {
      throw new Error(`BlueprintFactory: 蓝图 "${blueprintId}" 不存在`);
    }
    if (meta.virtual) {
      throw new Error(`BlueprintFactory: 虚拟蓝图 "${blueprintId}" 不可克隆`);
    }
    const instanceId = this.objectManager.nextInstanceId(blueprintId);
    const instance = new meta.blueprintClass(instanceId);
    this.objectManager.register(instance);
    instance.create();

    // NPC 蓝图加载后自动注册 quests 到 QuestManager
    this.registerQuestsIfPresent(instance);

    this.logger.log(`克隆对象已创建: ${instanceId}`);
    return instance;
  }

  /**
   * 获取虚拟对象实例
   * 虚拟对象的 ID 就是 blueprintId，直接从 ObjectManager 查找
   */
  getVirtual(blueprintId: string): BaseEntity | undefined {
    const meta = this.registry.get(blueprintId);
    if (!meta) return undefined;
    return this.objectManager.findById(blueprintId);
  }

  /**
   * 检查实体是否携带任务定义，若有则注册到 QuestManager
   * 由 clone() 在 create() 之后调用，利用 QuestManager 的重复检测
   */
  private registerQuestsIfPresent(entity: BaseEntity): void {
    const quests = entity.get<QuestDefinition[]>('quests');
    if (!quests || quests.length === 0) return;

    const questManager = ServiceLocator.questManager;
    if (!questManager) return;

    for (const def of quests) {
      questManager.registerQuest(def);
    }
  }
}
