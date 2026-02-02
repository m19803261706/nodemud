# Design Doc: Layer 1 — HeartbeatManager + ObjectManager

## 关联

- PRD: #47
- Scope: #46（Layer 1 功能探讨定稿）
- 关联 Design: #37（BaseEntity 基类，ServiceLocator 预留接口、EngineModule 模式）
- 关联 Epic: #38（Layer 0 已完成）

## 基于现有代码

| 模块                                                     | 复用点                                           |
| -------------------------------------------------------- | ------------------------------------------------ |
| `server/src/engine/base-entity.ts`                       | 改造心跳/销毁逻辑，新增 onReset/onCleanUp 钩子   |
| `server/src/engine/service-locator.ts`                   | 取消注释 Layer 1 服务，注入真实实例              |
| `server/src/engine/engine.module.ts`                     | 注册 HeartbeatManager/ObjectManager 为 providers |
| `server/src/engine/types/events.ts`                      | 已有 HEARTBEAT、RESET、DESTROYED 事件常量        |
| `server/src/app.module.ts`                               | EngineModule 已注册，无需修改                    |
| `server/src/engine/__tests__/base-entity-events.spec.ts` | 心跳测试适配                                     |

## 架构概览

```
┌─────────────────────────────────────────────────────────────────┐
│                      NestJS Application                         │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ EngineModule                                              │  │
│  │  ├── HeartbeatManager (@Injectable)                       │  │
│  │  │     └── 单 setInterval 主循环 → 累积器调度            │  │
│  │  ├── ObjectManager (@Injectable)                          │  │
│  │  │     ├── Map<id, BaseEntity> 注册表                    │  │
│  │  │     └── GC: clean_up / reset / removeDestructed       │  │
│  │  └── ServiceLocator (静态类，模块启动时注入)              │  │
│  └───────────────────────────────────────────────────────────┘  │
│          │                                                      │
│  ┌───────┴───────────────────────────────────────────────────┐  │
│  │ BaseEntity (不归 NestJS DI 管理)                          │  │
│  │  ├── enableHeartbeat(ms) → ServiceLocator.heartbeatMgr   │  │
│  │  ├── destroy() → ServiceLocator.objectMgr.unregister()   │  │
│  │  ├── onHeartbeat()  — 由 HeartbeatManager 调用           │  │
│  │  ├── onReset()      — 由 ObjectManager GC 调用           │  │
│  │  └── onCleanUp()    — 由 ObjectManager GC 调用           │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**数据流:**

```
启动时:
  NestJS → EngineModule.onModuleInit()
    → ServiceLocator.initialize({ heartbeatManager, objectManager })

运行时 — 心跳:
  HeartbeatManager.tick() [每 tickIntervalMs 毫秒]
    → 遍历 entries
    → entry.accumulated += tickIntervalMs
    → if accumulated >= intervalMs: entity.onHeartbeat() + emit HEARTBEAT

运行时 — 对象管理:
  对象创建: objectManager.register(entity)
  对象销毁: entity.destroy() → objectManager.unregister(entity)

运行时 — GC:
  每 5 分钟: objectManager.cleanUp() → 检查 + entity.destroy()
  每 2 小时: objectManager.resetAll() → entity.onReset()
  每 5 分钟: objectManager.removeDestructed() → 清除注册表残留
```

## 后端设计

### 代码路径

```
server/src/engine/
├── base-entity.ts              # 改造
├── heartbeat-manager.ts        # 新增
├── object-manager.ts           # 新增
├── service-locator.ts          # 改造
├── engine.module.ts            # 改造
├── types/
│   ├── dbase.ts                # 不变
│   ├── events.ts               # 不变
│   └── move-options.ts         # 不变
├── utils/
│   └── nested-value.ts         # 不变
└── __tests__/
    ├── heartbeat-manager.spec.ts      # 新增
    ├── object-manager.spec.ts         # 新增
    ├── base-entity-dbase.spec.ts      # 不变
    ├── base-entity-environment.spec.ts # 不变
    ├── base-entity-events.spec.ts     # 改造
    └── nested-value.spec.ts           # 不变
```

### HeartbeatManager

#### `heartbeat-manager.ts`

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import type { BaseEntity } from './base-entity';
import { GameEvents } from './types/events';

/** 心跳注册条目 */
interface HeartbeatEntry {
  entity: BaseEntity;
  /** 心跳间隔（毫秒） */
  intervalMs: number;
  /** 累积时间（毫秒） */
  accumulated: number;
}

/**
 * 全局心跳调度器
 * 单 setInterval 主循环 + 累积器精确调度
 * 对标 FluffOS heartbeat.cc 的单定时器架构
 */
@Injectable()
export class HeartbeatManager implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(HeartbeatManager.name);

  /** 心跳注册表：entityId → entry */
  private entries = new Map<string, HeartbeatEntry>();

  /** 主循环定时器 */
  private tickTimer: ReturnType<typeof setInterval> | null = null;

  /** tick 间隔（毫秒），默认 1000 */
  private readonly tickIntervalMs: number;

  constructor(tickIntervalMs?: number) {
    this.tickIntervalMs = tickIntervalMs ?? 1000;
  }

  // ========== 生命周期 ==========

  onModuleInit(): void {
    this.startTick();
    this.logger.log(`心跳调度器启动 (tick=${this.tickIntervalMs}ms)`);
  }

  onModuleDestroy(): void {
    this.stopTick();
    this.entries.clear();
    this.logger.log('心跳调度器停止');
  }

  // ========== 公开 API ==========

  /**
   * 注册心跳
   * @param entity 游戏对象
   * @param intervalMs 心跳间隔（毫秒），必须 > 0
   * @throws 如果 intervalMs <= 0
   */
  register(entity: BaseEntity, intervalMs: number): void {
    if (intervalMs <= 0) {
      throw new Error(`心跳间隔必须大于 0，收到: ${intervalMs}`);
    }

    // 重复注册 = 更新间隔
    const existing = this.entries.get(entity.id);
    if (existing) {
      existing.intervalMs = intervalMs;
      existing.accumulated = 0; // 重置累积器
      return;
    }

    this.entries.set(entity.id, {
      entity,
      intervalMs,
      accumulated: 0,
    });
  }

  /** 注销心跳 */
  unregister(entity: BaseEntity): void {
    this.entries.delete(entity.id);
  }

  /** 修改心跳间隔 */
  updateInterval(entity: BaseEntity, intervalMs: number): void {
    if (intervalMs <= 0) {
      throw new Error(`心跳间隔必须大于 0，收到: ${intervalMs}`);
    }
    const entry = this.entries.get(entity.id);
    if (entry) {
      entry.intervalMs = intervalMs;
      // 不重置累积器，保持连续性
    }
  }

  /** 查询是否已注册 */
  isRegistered(entity: BaseEntity): boolean {
    return this.entries.has(entity.id);
  }

  /** 获取注册对象总数 */
  getRegisteredCount(): number {
    return this.entries.size;
  }

  /** 获取对象的心跳间隔 */
  getInterval(entity: BaseEntity): number | undefined {
    return this.entries.get(entity.id)?.intervalMs;
  }

  /** 获取 tick 间隔配置 */
  getTickInterval(): number {
    return this.tickIntervalMs;
  }

  // ========== 内部调度 ==========

  /** 启动主循环 */
  private startTick(): void {
    if (this.tickTimer) return;
    this.tickTimer = setInterval(() => this.tick(), this.tickIntervalMs);
  }

  /** 停止主循环 */
  private stopTick(): void {
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
  }

  /**
   * 单次 tick 处理
   * 遍历所有注册对象，累积器调度，错误隔离
   */
  private tick(): void {
    for (const [id, entry] of this.entries) {
      // 跳过已销毁对象
      if (entry.entity.destroyed) {
        this.entries.delete(id);
        continue;
      }

      entry.accumulated += this.tickIntervalMs;

      if (entry.accumulated >= entry.intervalMs) {
        // 保留余数，确保长期平均频率精确
        entry.accumulated -= entry.intervalMs;

        try {
          entry.entity.onHeartbeat();
          entry.entity.emit(GameEvents.HEARTBEAT);
        } catch (error) {
          this.logger.error(
            `对象 ${id} 心跳执行出错: ${error instanceof Error ? error.message : error}`,
          );
        }
      }
    }
  }
}
```

**关键设计说明:**

1. **累积器精度**: `accumulated -= intervalMs` 而非 `= 0`，保留余数确保长期频率精确。例如 tick=1000ms + interval=1500ms，第 2 tick 触发后 accumulated=500，第 3 tick 累积到 1500 再触发，长期平均 1.5 秒/次。

2. **重复注册语义**: 重复调用 `register()` 等价于 `updateInterval()`，但会重置累积器（因为是重新启用心跳的意图）。而 `updateInterval()` 不重置累积器（仅修改频率）。

3. **错误隔离**: try-catch 包裹每个对象的 `onHeartbeat()` 和 `emit()`。单个对象异常只记录日志，不影响其他对象。

4. **已销毁检查**: 在 tick 遍历中检查 `entity.destroyed`，延迟清理。这是安全网，正常流程 `destroy()` 会调用 `unregister()`。

5. **onHeartbeat 可见性**: BaseEntity 的 `onHeartbeat()` 需要从 `protected` 改为 `public`，因为 HeartbeatManager 从外部调用。

### ObjectManager

#### `object-manager.ts`

```typescript
import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import type { BaseEntity } from './base-entity';

/** GC 配置 */
interface GCConfig {
  /** clean_up 间隔（毫秒），默认 5 分钟 */
  cleanUpIntervalMs?: number;
  /** reset 间隔（毫秒），默认 2 小时 */
  resetIntervalMs?: number;
  /** removeDestructed 间隔（毫秒），默认 5 分钟 */
  removeDestructedIntervalMs?: number;
}

/**
 * 全局对象注册表
 * 管理所有游戏运行时对象的注册、查询、ID 分配和生命周期
 * 对标 FluffOS 的 find_object / clone_object / destruct 机制
 */
@Injectable()
export class ObjectManager implements OnModuleDestroy {
  private readonly logger = new Logger(ObjectManager.name);

  /** 对象注册表：id → entity */
  private objects = new Map<string, BaseEntity>();

  /** 克隆实例序号计数器：blueprintId → 当前最大序号 */
  private instanceCounters = new Map<string, number>();

  /** GC 定时器 */
  private cleanUpTimer: ReturnType<typeof setInterval> | null = null;
  private resetTimer: ReturnType<typeof setInterval> | null = null;
  private removeDestructedTimer: ReturnType<typeof setInterval> | null = null;

  /** GC 配置 */
  private readonly gcConfig: Required<GCConfig>;

  constructor(gcConfig?: GCConfig) {
    this.gcConfig = {
      cleanUpIntervalMs: gcConfig?.cleanUpIntervalMs ?? 300_000, // 5 分钟
      resetIntervalMs: gcConfig?.resetIntervalMs ?? 7_200_000, // 2 小时
      removeDestructedIntervalMs: gcConfig?.removeDestructedIntervalMs ?? 300_000, // 5 分钟
    };
  }

  // ========== 生命周期 ==========

  /** 启动 GC 定时器（由 EngineModule 在 ServiceLocator 初始化后调用） */
  startGC(): void {
    this.cleanUpTimer = setInterval(() => this.cleanUp(), this.gcConfig.cleanUpIntervalMs);
    this.resetTimer = setInterval(() => this.resetAll(), this.gcConfig.resetIntervalMs);
    this.removeDestructedTimer = setInterval(
      () => this.removeDestructed(),
      this.gcConfig.removeDestructedIntervalMs,
    );
    this.logger.log(
      `GC 启动 (cleanUp=${this.gcConfig.cleanUpIntervalMs}ms, ` +
        `reset=${this.gcConfig.resetIntervalMs}ms, ` +
        `removeDestructed=${this.gcConfig.removeDestructedIntervalMs}ms)`,
    );
  }

  onModuleDestroy(): void {
    if (this.cleanUpTimer) clearInterval(this.cleanUpTimer);
    if (this.resetTimer) clearInterval(this.resetTimer);
    if (this.removeDestructedTimer) clearInterval(this.removeDestructedTimer);
    this.objects.clear();
    this.instanceCounters.clear();
    this.logger.log('对象管理器停止');
  }

  // ========== 注册/注销 API ==========

  /**
   * 注册对象到全局表
   * @throws 如果 ID 已被占用
   */
  register(entity: BaseEntity): void {
    if (this.objects.has(entity.id)) {
      throw new Error(`对象 ID 已存在: ${entity.id}`);
    }
    this.objects.set(entity.id, entity);
  }

  /** 从全局表移除 */
  unregister(entity: BaseEntity): void {
    this.objects.delete(entity.id);
  }

  // ========== 查询 API ==========

  /** 按 ID 查找 */
  findById(id: string): BaseEntity | undefined {
    return this.objects.get(id);
  }

  /** 按条件查找所有匹配对象 */
  findAll(predicate?: (e: BaseEntity) => boolean): BaseEntity[] {
    if (!predicate) return [...this.objects.values()];
    const result: BaseEntity[] = [];
    for (const entity of this.objects.values()) {
      if (predicate(entity)) result.push(entity);
    }
    return result;
  }

  /** 判断 ID 是否存在 */
  has(id: string): boolean {
    return this.objects.has(id);
  }

  /** 获取注册对象总数 */
  getCount(): number {
    return this.objects.size;
  }

  // ========== ID 分配 API ==========

  /**
   * 分配克隆实例 ID
   * @param blueprintId 蓝图 ID（如 "npc/dianxiaoer"）
   * @returns 实例 ID（如 "npc/dianxiaoer#1"）
   */
  nextInstanceId(blueprintId: string): string {
    const current = this.instanceCounters.get(blueprintId) ?? 0;
    const next = current + 1;
    this.instanceCounters.set(blueprintId, next);
    return `${blueprintId}#${next}`;
  }

  // ========== GC 三级清理 ==========

  /**
   * clean_up: 清理不活跃对象
   * 对标 FluffOS clean_up() apply + 炎黄 MUD clean_up.c
   */
  private cleanUp(): void {
    let cleaned = 0;
    for (const [id, entity] of this.objects) {
      // 已销毁的跳过（由 removeDestructed 处理）
      if (entity.destroyed) continue;

      // 有环境的对象不清理（在某个容器中 = 还在使用）
      if (entity.getEnvironment()) continue;

      // 标记 no_clean_up 的不清理
      if (entity.get<boolean>('no_clean_up') === true) continue;

      // 有子对象的容器不清理（里面可能有玩家/重要对象）
      if (entity.getInventory().length > 0) continue;

      // 调用对象自定义清理判断
      try {
        if (!entity.onCleanUp()) continue;
      } catch (error) {
        this.logger.error(`对象 ${id} onCleanUp 出错: ${error}`);
        continue;
      }

      // 执行销毁
      try {
        entity.destroy();
        cleaned++;
      } catch (error) {
        this.logger.error(`对象 ${id} clean_up 销毁出错: ${error}`);
      }
    }

    if (cleaned > 0) {
      this.logger.log(`clean_up: 清理了 ${cleaned} 个不活跃对象`);
    }
  }

  /**
   * resetAll: 周期重置所有对象
   * 对标 FluffOS reset() apply
   */
  private resetAll(): void {
    let resetCount = 0;
    for (const [id, entity] of this.objects) {
      if (entity.destroyed) continue;

      try {
        entity.onReset();
        resetCount++;
      } catch (error) {
        this.logger.error(`对象 ${id} onReset 出错: ${error}`);
      }
    }

    this.logger.log(`reset: 重置了 ${resetCount} 个对象`);
  }

  /**
   * removeDestructed: 清除注册表中已销毁的对象引用
   * 安全网，正常流程 destroy() 已调用 unregister()
   */
  private removeDestructed(): void {
    let removed = 0;
    for (const [id, entity] of this.objects) {
      if (entity.destroyed) {
        this.objects.delete(id);
        removed++;
      }
    }

    if (removed > 0) {
      this.logger.log(`removeDestructed: 清除了 ${removed} 个已销毁对象引用`);
    }
  }
}
```

**关键设计说明:**

1. **GC 启动时机**: GC 定时器通过 `startGC()` 显式启动，而非在构造函数中。这是因为测试中可能不需要 GC 自动运行。EngineModule 在 `onModuleInit()` 中调用。

2. **clean_up 防误杀规则**: 层层判断 — 有环境、有子对象、标记 no_clean_up、onCleanUp 返回 false → 都不清理。宁可不清理也不误杀。

3. **ID 序号策略**: 单调递增不复用。`npc/dianxiaoer#1` 销毁后，下次创建是 `#2` 而非复用 `#1`。避免 ID 混淆。

4. **register 唯一性**: 重复注册相同 ID 抛异常。这与 HeartbeatManager 的 "重复注册=更新" 语义不同，因为对象 ID 在注册表中必须唯一。

### BaseEntity 改造

#### `base-entity.ts` 变更

```typescript
// ===== 移除的属性 =====
// - private _heartbeatTimer: ReturnType<typeof setInterval> | null = null;
// - private _heartbeatInterval: number = 0;

// ===== 改写的方法 =====

/** 注册心跳（毫秒间隔） */
enableHeartbeat(intervalMs: number): void {
  if (ServiceLocator.initialized && ServiceLocator.heartbeatManager) {
    ServiceLocator.heartbeatManager.register(this, intervalMs);
  }
}

/** 注销心跳 */
disableHeartbeat(): void {
  if (ServiceLocator.initialized && ServiceLocator.heartbeatManager) {
    ServiceLocator.heartbeatManager.unregister(this);
  }
}

/** 获取心跳间隔 */
getHeartbeatInterval(): number {
  if (ServiceLocator.initialized && ServiceLocator.heartbeatManager) {
    return ServiceLocator.heartbeatManager.getInterval(this) ?? 0;
  }
  return 0;
}

/**
 * 心跳回调（子类覆写）
 * 注意: 由 HeartbeatManager 外部调用，所以改为 public
 */
public onHeartbeat(): void {}

// ===== 新增的方法 =====

/**
 * 周期重置回调（子类覆写）
 * 由 ObjectManager GC reset 调用
 * Room: 刷新 NPC/物品
 * NPC: 恢复 HP，回到出生点
 */
public onReset(): void {}

/**
 * 清理判断回调（子类覆写）
 * 由 ObjectManager GC clean_up 调用
 * @returns true = 允许清理（销毁），false = 保留
 * 默认: 无环境则允许清理
 */
public onCleanUp(): boolean {
  return !this.getEnvironment();
}

// ===== 改写 destroy() =====

destroy(): void {
  if (this._destroyed) return;
  this._destroyed = true;

  // 1. 注销心跳
  this.disableHeartbeat();
  // 2. 清除延迟调用
  this.clearCallOuts();
  // 3. 处理 inventory
  this.handleInventoryOnDestroy();
  // 4. 从环境中移除
  if (this._environment) {
    this._environment._inventory.delete(this);
    this._environment = null;
  }
  // 5. 从对象管理器注销
  if (ServiceLocator.initialized && ServiceLocator.objectManager) {
    ServiceLocator.objectManager.unregister(this);
  }
  // 6. 触发销毁事件
  this.emit(GameEvents.DESTROYED);
  // 7. 清除所有监听器
  this.removeAllListeners();
}
```

### ServiceLocator 改造

#### `service-locator.ts`

```typescript
import type { HeartbeatManager } from './heartbeat-manager';
import type { ObjectManager } from './object-manager';

/**
 * 服务定位器
 * BaseEntity 通过此类访问 NestJS 管理的引擎服务
 * 在 EngineModule 启动时初始化
 */
export class ServiceLocator {
  // Layer 1 服务
  static heartbeatManager: HeartbeatManager;
  static objectManager: ObjectManager;

  // Layer 2 服务（后续添加）
  // static blueprintLoader: BlueprintLoader;

  private static _initialized = false;

  /** 初始化服务定位器（由 EngineModule 调用） */
  static initialize(providers: {
    heartbeatManager: HeartbeatManager;
    objectManager: ObjectManager;
  }): void {
    this.heartbeatManager = providers.heartbeatManager;
    this.objectManager = providers.objectManager;
    this._initialized = true;
  }

  /** 检查是否已初始化 */
  static get initialized(): boolean {
    return this._initialized;
  }

  /** 重置（测试用） */
  static reset(): void {
    this._initialized = false;
    // 不置空引用，避免 undefined 报错
  }
}
```

### EngineModule 改造

#### `engine.module.ts`

```typescript
import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ServiceLocator } from './service-locator';
import { HeartbeatManager } from './heartbeat-manager';
import { ObjectManager } from './object-manager';

/**
 * 游戏引擎模块
 * 负责初始化 ServiceLocator，管理引擎服务的生命周期
 */
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

    // 启动 GC（在 ServiceLocator 初始化后）
    this.objectManager.startGC();

    this.logger.log('游戏引擎初始化完成');
  }
}
```

**NestJS DI 说明**: HeartbeatManager 和 ObjectManager 的构造函数参数（tickIntervalMs、gcConfig）是可选的，NestJS DI 会以 `undefined` 注入，使用默认值。如果需要自定义配置，可以使用 `useFactory` provider：

```typescript
// 可选：自定义配置
{
  provide: HeartbeatManager,
  useFactory: (configService: ConfigService) => {
    const tickMs = configService.get<number>('ENGINE_TICK_MS', 1000);
    return new HeartbeatManager(tickMs);
  },
  inject: [ConfigService],
}
```

## 前端设计

Layer 1 是纯后端模块，不涉及前端代码。前端在 Layer 3（Room/NPC）和 Layer 4（指令系统）中才需要改动。

## 前后端字段映射

本模块无前后端字段映射需求。

## 测试设计

### HeartbeatManager 测试

#### `__tests__/heartbeat-manager.spec.ts`

```typescript
// 测试分组和关键用例:

describe('HeartbeatManager', () => {
  // 使用 jest.useFakeTimers() 控制时间

  describe('注册/注销', () => {
    // - 注册后 isRegistered 返回 true
    // - 注销后 isRegistered 返回 false
    // - 重复注册更新间隔并重置累积器
    // - 注销未注册对象静默忽略
    // - intervalMs <= 0 抛出错误
    // - getRegisteredCount 正确计数
    // - getInterval 返回注册间隔 / 未注册返回 undefined
  });

  describe('累积器调度', () => {
    // - tick=1000ms, interval=1000ms: 每 tick 触发一次
    // - tick=1000ms, interval=2000ms: 每 2 tick 触发一次
    // - tick=1000ms, interval=1500ms: 累积器精确调度
    //   Tick1: acc=1000 < 1500 → 不触发
    //   Tick2: acc=2000 >= 1500 → 触发, acc=500
    //   Tick3: acc=1500 >= 1500 → 触发, acc=0
    //   验证 2 tick 内触发 2 次（长期平均 1.5s/次）
    // - tick=1000ms, interval=500ms: 每 tick 触发一次
    //   （因为 1000 >= 500，触发后 acc=500，但不会连续触发两次）
    //   注意: 实际上 acc-=500 后 acc=500 >= 500，应该再次触发
    //   需要确认实现是 while 还是 if
  });

  describe('错误隔离', () => {
    // - 对象A的 onHeartbeat 抛异常，对象B 仍然正常触发
    // - 异常被 logger.error 记录
  });

  describe('已销毁对象处理', () => {
    // - 已销毁对象在 tick 中被自动清除
    // - 销毁对象的 onHeartbeat 不被调用
  });

  describe('updateInterval', () => {
    // - 修改间隔后按新间隔调度
    // - 修改间隔不重置累积器
  });

  describe('生命周期', () => {
    // - onModuleDestroy 停止 tick 并清空注册表
  });
});
```

### ObjectManager 测试

#### `__tests__/object-manager.spec.ts`

```typescript
describe('ObjectManager', () => {
  describe('注册/注销', () => {
    // - 注册后 findById 返回对象
    // - 注销后 findById 返回 undefined
    // - 重复注册相同 ID 抛出错误
    // - 注销不存在的对象静默忽略
    // - getCount 正确计数
    // - has 正确判断
  });

  describe('查询', () => {
    // - findById 精确查找
    // - findAll 无参数返回所有
    // - findAll 有 predicate 过滤
    // - findAll 空注册表返回空数组
  });

  describe('ID 分配', () => {
    // - nextInstanceId 首次返回 #1
    // - 连续调用递增 #2, #3
    // - 不同蓝图 ID 独立计数
    // - 序号不复用（即使对象销毁）
  });

  describe('GC - clean_up', () => {
    // - 无环境 + 无子对象 → 被清理
    // - 有环境 → 不清理
    // - 标记 no_clean_up → 不清理
    // - 有子对象 → 不清理
    // - onCleanUp 返回 false → 不清理
    // - onCleanUp 抛异常 → 不清理（安全）
  });

  describe('GC - reset', () => {
    // - 调用所有注册对象的 onReset
    // - 跳过已销毁对象
    // - onReset 抛异常不影响其他对象
  });

  describe('GC - removeDestructed', () => {
    // - 清除注册表中 destroyed=true 的对象
    // - 不影响活跃对象
  });

  describe('生命周期', () => {
    // - onModuleDestroy 清空注册表和计数器
  });
});
```

### BaseEntity 心跳测试适配

#### `__tests__/base-entity-events.spec.ts` 改造

```typescript
// 测试前 setup:
// 1. 创建 HeartbeatManager 实例（tickIntervalMs 使用较小值如 100ms 便于测试）
// 2. 创建 ObjectManager 实例
// 3. ServiceLocator.initialize({ heartbeatManager, objectManager })
// 4. jest.useFakeTimers()

// 测试后 teardown:
// 1. ServiceLocator.reset()
// 2. jest.useRealTimers()

// 心跳测试改造:
// - enableHeartbeat(1000) → 通过 HeartbeatManager 注册
// - jest.advanceTimersByTime(tickIntervalMs) → 触发 tick → 累积器调度
// - 验证 onHeartbeat 被调用

// 注意: 使用 fakeTimers 时，HeartbeatManager 的 setInterval 也受控
// advanceTimersByTime(1000) 会触发一次 tick，然后累积器判断是否触发心跳
```

## 影响范围

- **新增文件**: `heartbeat-manager.ts`, `object-manager.ts`, `__tests__/heartbeat-manager.spec.ts`, `__tests__/object-manager.spec.ts`
- **修改文件**: `base-entity.ts`, `service-locator.ts`, `engine.module.ts`, `__tests__/base-entity-events.spec.ts`
- **不变文件**: `types/*`, `utils/*`, `__tests__/nested-value.spec.ts`, `__tests__/base-entity-dbase.spec.ts`, `__tests__/base-entity-environment.spec.ts`, `app.module.ts`

## 风险点

| 风险                                          | 影响                                             | 应对方案                                                  |
| --------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------- |
| onHeartbeat 改为 public                       | 外部可随意调用                                   | 命名约定 + 文档说明，仅 HeartbeatManager 应调用           |
| 累积器 interval < tick                        | interval=500ms, tick=1000ms 时每 tick 只触发一次 | 用 `while` 循环处理：如果累积超过多个间隔需连续触发多次   |
| ServiceLocator 未初始化时调用 enableHeartbeat | 测试中可能未注入                                 | 加 `ServiceLocator.initialized` 守卫                      |
| GC clean_up 误杀有用对象                      | 游戏逻辑异常                                     | 多重检查（环境/子对象/no_clean_up/onCleanUp），宁可不清理 |
| 大量对象注册心跳                              | 单 tick 遍历时间过长                             | 1000 个简单对象 ~<1ms；后续可优化为分片处理               |
| 现有测试适配                                  | 测试需要注入 HeartbeatManager                    | setup 中创建实例 + ServiceLocator.initialize              |

### 累积器边界情况处理

**interval < tickInterval 的情况:**

当 interval=500ms, tick=1000ms 时，每 tick 累积 1000ms，应该触发 2 次（1000/500=2）。实现中需要用 `while` 而非 `if`：

```typescript
// tick() 中的触发逻辑
while (entry.accumulated >= entry.intervalMs) {
  entry.accumulated -= entry.intervalMs;
  try {
    entry.entity.onHeartbeat();
    entry.entity.emit(GameEvents.HEARTBEAT);
  } catch (error) {
    this.logger.error(...);
    break; // 出错则停止本对象本次 tick 的后续触发
  }
}
```

这是一个重要的边界修正。Design Doc 中的 `tick()` 实现应使用 `while` 循环。

---

> CX 工作流 | Design Doc | PRD #47
