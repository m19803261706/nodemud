/**
 * ObjectManager — 全局对象注册表 + 垃圾回收
 *
 * 管理所有运行时 BaseEntity 实例的注册、查询、ID 分配和 GC 清理。
 * 作为 NestJS Injectable 服务，在 EngineModule 中提供单例。
 *
 * GC 三级清理：
 * 1. cleanUp   — 清理无环境、无子对象、允许清理的孤立对象
 * 2. resetAll  — 调用所有对象的 onReset 重置周期性状态
 * 3. removeDestructed — 从注册表中移除已销毁的对象条目
 */
import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import type { BaseEntity } from './base-entity';

/** GC 配置 */
export interface GCConfig {
  /** cleanUp 间隔（毫秒），默认 300000 (5分钟) */
  cleanUpIntervalMs?: number;
  /** resetAll 间隔（毫秒），默认 7200000 (2小时) */
  resetIntervalMs?: number;
  /** removeDestructed 间隔（毫秒），默认 300000 (5分钟) */
  removeDestructedIntervalMs?: number;
}

/** 默认 GC 配置 */
const DEFAULT_GC_CONFIG: Required<GCConfig> = {
  cleanUpIntervalMs: 300_000,
  resetIntervalMs: 7_200_000,
  removeDestructedIntervalMs: 300_000,
};

@Injectable()
export class ObjectManager implements OnModuleDestroy {
  private readonly logger = new Logger(ObjectManager.name);

  /** 对象注册表：id → BaseEntity */
  private readonly objects: Map<string, BaseEntity> = new Map();

  /** 蓝图ID → 当前最大实例序号 */
  private readonly instanceCounters: Map<string, number> = new Map();

  /** GC 配置 */
  private readonly gcConfig: Required<GCConfig>;

  /** GC 定时器引用 */
  private cleanUpTimer: ReturnType<typeof setInterval> | null = null;
  private resetTimer: ReturnType<typeof setInterval> | null = null;
  private removeDestructedTimer: ReturnType<typeof setInterval> | null = null;

  constructor(gcConfig?: GCConfig) {
    this.gcConfig = { ...DEFAULT_GC_CONFIG, ...gcConfig };
  }

  // ================================================================
  //  注册 / 注销
  // ================================================================

  /** 注册对象，ID 已存在时抛出错误 */
  register(entity: BaseEntity): void {
    if (this.objects.has(entity.id)) {
      throw new Error(`ObjectManager: 对象 ID "${entity.id}" 已存在，不允许重复注册`);
    }
    this.objects.set(entity.id, entity);
  }

  /** 注销对象，不存在时静默忽略 */
  unregister(entity: BaseEntity): void {
    this.objects.delete(entity.id);
  }

  // ================================================================
  //  查询
  // ================================================================

  /** 按 ID 精确查找 */
  findById(id: string): BaseEntity | undefined {
    return this.objects.get(id);
  }

  /** 查找所有（可选过滤） */
  findAll(predicate?: (e: BaseEntity) => boolean): BaseEntity[] {
    const all = [...this.objects.values()];
    if (!predicate) return all;
    return all.filter(predicate);
  }

  /** 判断 ID 是否已注册 */
  has(id: string): boolean {
    return this.objects.has(id);
  }

  /** 获取已注册对象数量 */
  getCount(): number {
    return this.objects.size;
  }

  // ================================================================
  //  ID 分配
  // ================================================================

  /** 分配下一个实例 ID，格式: "blueprintId#N"，N 从 1 开始单调递增 */
  nextInstanceId(blueprintId: string): string {
    const current = this.instanceCounters.get(blueprintId) ?? 0;
    const next = current + 1;
    this.instanceCounters.set(blueprintId, next);
    return `${blueprintId}#${next}`;
  }

  // ================================================================
  //  GC 垃圾回收
  // ================================================================

  /** 显式启动三个 GC 定时器 */
  startGC(): void {
    this.cleanUpTimer = setInterval(
      () => this.cleanUp(),
      this.gcConfig.cleanUpIntervalMs,
    );
    this.resetTimer = setInterval(
      () => this.resetAll(),
      this.gcConfig.resetIntervalMs,
    );
    this.removeDestructedTimer = setInterval(
      () => this.removeDestructed(),
      this.gcConfig.removeDestructedIntervalMs,
    );
  }

  /**
   * cleanUp — 清理孤立对象
   *
   * 遍历所有对象，按顺序检查：
   * 1. 已销毁 → 跳过
   * 2. 有环境 → 不清理
   * 3. 标记 no_clean_up=true → 不清理
   * 4. 有子对象 → 不清理
   * 5. onCleanUp() 返回 false → 不清理
   * 6. 以上全通过 → destroy
   */
  private cleanUp(): void {
    let count = 0;

    for (const entity of this.objects.values()) {
      if (entity.destroyed) continue;
      if (entity.getEnvironment()) continue;
      if (entity.get<boolean>('no_clean_up') === true) continue;
      if (entity.getInventory().length > 0) continue;

      // 检查 onCleanUp 钩子
      try {
        if (typeof (entity as any).onCleanUp === 'function') {
          const result = (entity as any).onCleanUp();
          if (result === false) continue;
        }
      } catch {
        // onCleanUp 抛异常 → 保护性不清理
        continue;
      }

      // 执行销毁
      try {
        entity.destroy();
        count++;
      } catch (err) {
        this.logger.warn(`cleanUp: 销毁对象 "${entity.id}" 时出错: ${err}`);
      }
    }

    if (count > 0) {
      this.logger.log(`cleanUp: 清理了 ${count} 个孤立对象`);
    }
  }

  /**
   * resetAll — 重置所有对象的周期性状态
   *
   * 遍历所有对象，跳过已销毁，调用 onReset()
   */
  private resetAll(): void {
    for (const entity of this.objects.values()) {
      if (entity.destroyed) continue;
      try {
        if (typeof (entity as any).onReset === 'function') {
          (entity as any).onReset();
        }
      } catch (err) {
        this.logger.warn(`resetAll: 对象 "${entity.id}" 的 onReset 出错: ${err}`);
      }
    }
  }

  /**
   * removeDestructed — 从注册表中移除已销毁的对象条目
   */
  private removeDestructed(): void {
    const toRemove: string[] = [];
    for (const [id, entity] of this.objects.entries()) {
      if (entity.destroyed) {
        toRemove.push(id);
      }
    }
    for (const id of toRemove) {
      this.objects.delete(id);
    }
  }

  // ================================================================
  //  生命周期
  // ================================================================

  /** NestJS 模块销毁时清理资源 */
  onModuleDestroy(): void {
    if (this.cleanUpTimer) clearInterval(this.cleanUpTimer);
    if (this.resetTimer) clearInterval(this.resetTimer);
    if (this.removeDestructedTimer) clearInterval(this.removeDestructedTimer);
    this.cleanUpTimer = null;
    this.resetTimer = null;
    this.removeDestructedTimer = null;
    this.objects.clear();
    this.instanceCounters.clear();
  }
}
