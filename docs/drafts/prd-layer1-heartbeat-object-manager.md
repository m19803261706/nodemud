# PRD: Layer 1 — HeartbeatManager + ObjectManager

## 基本信息

- **创建时间**: 2026-02-02
- **优先级**: P0（核心引擎基础，阻塞后续 Layer 2/3/4）
- **技术栈**: TypeScript + NestJS
- **代码位置**: `server/src/engine/`
- **关联文档**: Scope #46（Layer 1 功能探讨定稿）、Scope #1 评论区（分层架构定义）、PRD #36 / Design #37（Layer 0 BaseEntity）

## 功能概述

Layer 1 是游戏引擎的管理层，提供两个 NestJS 服务：

1. **HeartbeatManager** — 全局心跳统一调度器。用单个 `setInterval` 主循环替代 BaseEntity 各自独立的 setInterval，通过累积器实现毫秒级精度调度。对标 FluffOS `heartbeat.cc` 的单定时器架构。

2. **ObjectManager** — 全局对象注册表。管理所有游戏运行时对象（Room、NPC、Player、Item、Exit）的注册、查询、ID 分配和生命周期。实现 GC 三级清理机制（clean_up / reset / removeDestructed），对标 FluffOS 的对象管理和炎黄 MUD 的 clean_up.c。

两个服务通过 ServiceLocator 暴露给 BaseEntity 实例使用，同时需要改造 BaseEntity 的心跳和销毁逻辑。

## 用户场景

Layer 1 不直接面向终端用户，而是为后续所有游戏系统提供引擎管理能力：

| 场景                        | 依赖 Layer 1 的能力            | 示例                                      |
| --------------------------- | ------------------------------ | ----------------------------------------- |
| 500 个 NPC 同时有心跳       | HeartbeatManager 统一调度      | 单定时器遍历，避免 500 个独立 setInterval |
| NPC 心跳间隔各不相同        | 累积器精确调度                 | NPC-A 每 1.5 秒，NPC-B 每 3 秒            |
| 按 ID 查找游戏对象          | ObjectManager.findById()       | 玩家输入 "look dianxiaoer" → 查找 NPC     |
| 蓝图创建克隆对象            | ObjectManager.nextInstanceId() | "npc/dianxiaoer" → "npc/dianxiaoer#1"     |
| 长时间无人的房间自动回收    | GC clean_up 机制               | 5 分钟扫描，无环境无引用的对象销毁        |
| 房间 NPC/物品定期刷新       | GC reset 机制                  | 2 小时调用 onReset()，NPC 重生            |
| 对象销毁后清理注册表        | ObjectManager.unregister()     | destroy() 时自动从注册表移除              |
| 某个对象 onHeartbeat 抛异常 | 错误隔离                       | try-catch 包裹，不影响其他对象            |

## 详细需求

### 需求 1: HeartbeatManager — 全局心跳调度

**描述**: NestJS `@Injectable()` 服务，用单个 `setInterval` 主循环实现全局心跳调度。每个 tick 遍历所有注册对象，通过累积器判断是否触发心跳。

**配置:**

| 配置项           | 默认值 | 说明                                                   |
| ---------------- | ------ | ------------------------------------------------------ |
| `tickIntervalMs` | 1000   | 主循环 tick 间隔（毫秒），可通过构造函数或环境变量配置 |

**API:**

| 方法                 | 签名                                                           | 说明                            |
| -------------------- | -------------------------------------------------------------- | ------------------------------- |
| `register`           | `register(entity: BaseEntity, intervalMs: number): void`       | 注册心跳，intervalMs 为毫秒间隔 |
| `unregister`         | `unregister(entity: BaseEntity): void`                         | 注销心跳                        |
| `updateInterval`     | `updateInterval(entity: BaseEntity, intervalMs: number): void` | 修改心跳间隔                    |
| `isRegistered`       | `isRegistered(entity: BaseEntity): boolean`                    | 查询是否已注册                  |
| `getRegisteredCount` | `getRegisteredCount(): number`                                 | 获取注册对象总数                |
| `getInterval`        | `getInterval(entity: BaseEntity): number \| undefined`         | 获取对象的心跳间隔              |

**内部数据结构:**

```typescript
interface HeartbeatEntry {
  entity: BaseEntity;
  intervalMs: number; // 心跳间隔（毫秒）
  accumulated: number; // 累积时间（毫秒）
}
```

**累积器调度逻辑:**

```
每 tick:
  对每个注册对象:
    entry.accumulated += tickIntervalMs
    if (entry.accumulated >= entry.intervalMs):
      entry.accumulated -= entry.intervalMs  // 保留余数，确保长期频率精确
      try:
        entity.onHeartbeat()
        entity.emit(GameEvents.HEARTBEAT)
      catch (error):
        logger.error(...)  // 错误隔离，不影响其他对象
```

**生命周期:**

- `OnModuleInit`: 启动主循环 setInterval
- `OnModuleDestroy`: 停止主循环，清空注册表

**边界规则:**

- 重复注册同一对象：更新间隔而非报错
- 注销未注册的对象：静默忽略
- intervalMs <= 0：抛出参数错误
- 已销毁的对象：跳过（检查 entity.destroyed）

### 需求 2: ObjectManager — 全局对象注册表

**描述**: NestJS `@Injectable()` 服务，统一管理所有游戏运行时对象的注册、查询和生命周期。

**API:**

| 方法             | 签名                                                            | 说明                   |
| ---------------- | --------------------------------------------------------------- | ---------------------- |
| `register`       | `register(entity: BaseEntity): void`                            | 注册对象到全局表       |
| `unregister`     | `unregister(entity: BaseEntity): void`                          | 从全局表移除           |
| `findById`       | `findById(id: string): BaseEntity \| undefined`                 | 按 ID 查找             |
| `findAll`        | `findAll(predicate?: (e: BaseEntity) => boolean): BaseEntity[]` | 按条件查找所有匹配对象 |
| `has`            | `has(id: string): boolean`                                      | 判断 ID 是否存在       |
| `getCount`       | `getCount(): number`                                            | 获取注册对象总数       |
| `nextInstanceId` | `nextInstanceId(blueprintId: string): string`                   | 分配克隆实例 ID        |

**ID 分配规则:**

| 类型      | 格式      | 示例                                   |
| --------- | --------- | -------------------------------------- |
| 蓝图/单例 | 路径      | `yangzhou/inn`                         |
| 克隆实例  | 路径#序号 | `npc/dianxiaoer#1`, `npc/dianxiaoer#2` |

- `nextInstanceId("npc/dianxiaoer")` → 内部维护 `Map<string, number>` 计数器，返回 `"npc/dianxiaoer#1"`，下次返回 `#2`
- 序号单调递增，不复用

**边界规则:**

- 重复注册相同 ID：抛出错误（ID 必须唯一）
- 注销不存在的 ID：静默忽略
- findById 查不到：返回 undefined

### 需求 3: GC 三级清理机制

**描述**: ObjectManager 内置三级定时清理任务，对标 FluffOS 的对象生命周期管理。

#### 3.1 clean_up — 清理不活跃对象

| 配置项              | 默认值         | 说明         |
| ------------------- | -------------- | ------------ |
| `cleanUpIntervalMs` | 300000 (5分钟) | 清理扫描间隔 |

**清理规则（参考炎黄 MUD clean_up.c）:**

- 标记 `no_clean_up=true` 的非克隆对象 → 跳过
- 有环境的对象（在某个容器中） → 跳过
- inventory 中包含不可清理对象 → 跳过
- 其他无环境、无引用的对象 → 调用 `entity.destroy()`

**对象自定义清理:** BaseEntity 新增 `protected onCleanUp(): boolean` 钩子

- 返回 `true` = 执行清理（销毁）
- 返回 `false` = 保留（子类可覆写阻止清理）
- 默认实现：无环境则返回 true

#### 3.2 reset — 周期重置

| 配置项            | 默认值          | 说明         |
| ----------------- | --------------- | ------------ |
| `resetIntervalMs` | 7200000 (2小时) | 重置扫描间隔 |

**重置逻辑:**

- 遍历所有注册对象，调用 `entity.onReset()`
- BaseEntity 新增 `protected onReset(): void {}` 钩子（子类覆写）
- Room 子类在 onReset() 中刷新 NPC/物品
- NPC 子类在 onReset() 中恢复 HP、回到出生点

#### 3.3 removeDestructed — 清除已销毁引用

| 配置项                       | 默认值         | 说明         |
| ---------------------------- | -------------- | ------------ |
| `removeDestructedIntervalMs` | 300000 (5分钟) | 清除扫描间隔 |

**清除逻辑:**

- 遍历注册表，移除 `entity.destroyed === true` 的条目
- 这是安全网，正常情况 destroy() 已经调用了 unregister()

### 需求 4: BaseEntity 改造

**描述**: 改写 BaseEntity 的心跳和销毁逻辑，委托给 Layer 1 服务。

**变更清单:**

| 变更                                       | 类型 | 说明                                                              |
| ------------------------------------------ | ---- | ----------------------------------------------------------------- |
| 移除 `_heartbeatTimer` 属性                | 删除 | 不再使用独立 setInterval                                          |
| 移除 `_heartbeatInterval` 属性             | 删除 | 间隔信息由 HeartbeatManager 持有                                  |
| 改写 `enableHeartbeat(intervalMs)`         | 修改 | 调用 `ServiceLocator.heartbeatManager.register(this, intervalMs)` |
| 改写 `disableHeartbeat()`                  | 修改 | 调用 `ServiceLocator.heartbeatManager.unregister(this)`           |
| 改写 `getHeartbeatInterval()`              | 修改 | 调用 `ServiceLocator.heartbeatManager.getInterval(this)`          |
| 改写 `destroy()`                           | 修改 | 增加 `ServiceLocator.objectManager.unregister(this)`              |
| 新增 `onReset()`                           | 新增 | `protected onReset(): void {}` 钩子                               |
| 新增 `onCleanUp()`                         | 新增 | `protected onCleanUp(): boolean` 钩子                             |
| 保留 `onHeartbeat()`                       | 不变 | 由 HeartbeatManager 外部调用                                      |
| 保留 `callOut/removeCallOut/clearCallOuts` | 不变 | 仍用 setTimeout                                                   |

**注意**: `onHeartbeat()` 当前是 `protected`，HeartbeatManager 从外部调用需要将其改为 `public`，或者通过 HeartbeatManager 直接 emit HEARTBEAT 事件，让对象自己监听处理。

### 需求 5: ServiceLocator 改造

**描述**: 取消注释 Layer 1 服务引用，实现真正的服务注入。

```typescript
export class ServiceLocator {
  static heartbeatManager: HeartbeatManager;
  static objectManager: ObjectManager;
  // Layer 2 服务（后续添加）
  // static blueprintLoader: BlueprintLoader;

  static initialize(providers: {
    heartbeatManager: HeartbeatManager;
    objectManager: ObjectManager;
  }): void;
}
```

### 需求 6: EngineModule 改造

**描述**: 注册 HeartbeatManager 和 ObjectManager 为 NestJS providers，启动时注入到 ServiceLocator。

```typescript
@Module({
  providers: [HeartbeatManager, ObjectManager],
  exports: [HeartbeatManager, ObjectManager],
})
export class EngineModule implements OnModuleInit {
  constructor(
    private heartbeatManager: HeartbeatManager,
    private objectManager: ObjectManager,
  ) {}

  onModuleInit() {
    ServiceLocator.initialize({
      heartbeatManager: this.heartbeatManager,
      objectManager: this.objectManager,
    });
  }
}
```

## 关联文档

| 文档              | 编号 | 关系                                           |
| ----------------- | ---- | ---------------------------------------------- |
| 项目蓝图          | #1   | 评论区定义了 Layer 0-4 分层架构                |
| Layer 1 Scope     | #46  | 功能探讨定稿，包含完整方案和决策记录           |
| BaseEntity PRD    | #36  | Layer 0 需求定义，本次需要改造其心跳和销毁逻辑 |
| BaseEntity Design | #37  | Layer 0 技术设计，包含 ServiceLocator 预留接口 |
| BaseEntity Epic   | #38  | Layer 0 已完成，139 个测试                     |

## 现有代码基础

| 模块           | 路径                                                     | 复用/改造点                             |
| -------------- | -------------------------------------------------------- | --------------------------------------- |
| BaseEntity     | `server/src/engine/base-entity.ts`                       | 改造心跳、销毁、新增钩子                |
| ServiceLocator | `server/src/engine/service-locator.ts`                   | 取消注释，注入真实服务                  |
| EngineModule   | `server/src/engine/engine.module.ts`                     | 注册 providers                          |
| GameEvents     | `server/src/engine/types/events.ts`                      | 已有 HEARTBEAT、RESET、DESTROYED 事件名 |
| 心跳测试       | `server/src/engine/__tests__/base-entity-events.spec.ts` | 需要适配（注入 HeartbeatManager）       |

## 代码影响范围

| 层级     | 影响                                                                            |
| -------- | ------------------------------------------------------------------------------- |
| 新增文件 | `server/src/engine/heartbeat-manager.ts`、`server/src/engine/object-manager.ts` |
| 修改文件 | `base-entity.ts`、`service-locator.ts`、`engine.module.ts`                      |
| 测试新增 | `__tests__/heartbeat-manager.spec.ts`、`__tests__/object-manager.spec.ts`       |
| 测试修改 | `__tests__/base-entity-events.spec.ts`（心跳测试适配）                          |

## 文件结构（更新后）

```
server/src/engine/
├── base-entity.ts            # 改造: 心跳委托、新增钩子
├── heartbeat-manager.ts      # 新增: 全局心跳调度器
├── object-manager.ts         # 新增: 全局对象注册表 + GC
├── service-locator.ts        # 改造: 注入真实服务
├── engine.module.ts          # 改造: 注册 providers
├── types/
│   ├── dbase.ts              # 不变
│   ├── events.ts             # 不变（已有 HEARTBEAT/RESET/DESTROYED）
│   └── move-options.ts       # 不变
├── utils/
│   └── nested-value.ts       # 不变
└── __tests__/
    ├── heartbeat-manager.spec.ts      # 新增
    ├── object-manager.spec.ts         # 新增
    ├── base-entity-dbase.spec.ts      # 不变
    ├── base-entity-environment.spec.ts # 不变
    ├── base-entity-events.spec.ts     # 改造: 适配 HeartbeatManager
    └── nested-value.spec.ts           # 不变
```

## 任务拆分（初步）

- [ ] 实现 HeartbeatManager（注册/注销/累积器调度/错误隔离）+ 测试
- [ ] 实现 ObjectManager（注册/注销/查询/ID 分配）+ 测试
- [ ] 实现 GC 三级清理（clean_up / reset / removeDestructed）+ 测试
- [ ] 改造 BaseEntity（心跳委托、新增 onReset/onCleanUp 钩子、销毁注销）
- [ ] 改造 ServiceLocator + EngineModule（注入真实服务）
- [ ] 适配现有心跳测试（base-entity-events.spec.ts）

## 验收标准

- [ ] HeartbeatManager 单定时器主循环，累积器调度，支持毫秒级间隔（如 1500ms）
- [ ] 累积器长期平均频率准确（10 次心跳的总时间误差 < 1 tick）
- [ ] 单个对象 onHeartbeat() 抛异常不影响其他对象的心跳
- [ ] HeartbeatManager tick 间隔可配置（默认 1000ms）
- [ ] ObjectManager 按 ID 注册/查询/注销，ID 唯一性检查
- [ ] nextInstanceId 正确分配克隆序号（#1, #2, ...）
- [ ] GC clean_up 不会清理有环境的对象、标记 no_clean_up 的对象
- [ ] GC reset 定时调用所有对象的 onReset()
- [ ] GC removeDestructed 清除注册表中已销毁的对象引用
- [ ] BaseEntity.enableHeartbeat() 改为委托 HeartbeatManager
- [ ] BaseEntity.destroy() 自动调用 ObjectManager.unregister()
- [ ] callOut/removeCallOut 仍使用 setTimeout，不受 tick 影响
- [ ] ServiceLocator 正确注入 HeartbeatManager 和 ObjectManager
- [ ] EngineModule 启动时初始化两个服务
- [ ] 现有 139 个测试全部通过（适配后）
- [ ] 新增测试覆盖 HeartbeatManager、ObjectManager、GC 的核心逻辑

## 不包含（留给后续 Layer）

- BlueprintLoader 蓝图加载系统（Layer 2）
- Room / NPC / Item / Exit 具体子类（Layer 3）
- CommandRegistry 指令系统（Layer 4）
- 数据库持久化（Layer 3）

---

> CX 工作流 | PRD | Scope #46
