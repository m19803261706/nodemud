# 功能探讨: Layer 1 — HeartbeatManager + ObjectManager

## 基本信息

- **创建时间**: 2026-02-02
- **关联项目蓝图**: #1（NodeMUD 项目蓝图）
- **前置依赖**: Layer 0 BaseEntity (Epic #38, closed)

## 功能目标

实现游戏引擎的 Layer 1 管理层，包含两个核心服务：

1. **HeartbeatManager** — 全局心跳统一调度器，替代 BaseEntity 各自独立的 setInterval
2. **ObjectManager** — 全局对象注册表，管理所有游戏运行时对象的生命周期

这两个服务是 NestJS 管理的 `@Injectable()` 服务，通过 ServiceLocator 暴露给 BaseEntity 实例使用。

## 架构定位

```
┌─────────────────────────────────────────────────────┐
│  Layer 0: BaseEntity ✅ 已完成                       │
│  动态属性（dbase）/ 环境系统 / 事件系统              │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────┴─────────────────────────────┐
│  Layer 1: HeartbeatManager + ObjectManager ← 本次   │
│  全局心跳调度（单定时器，累积器精确调度）             │
│  对象注册/查询/生命周期管理/GC                       │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────┴─────────────────────────────┐
│  Layer 2: BlueprintLoader（后续）                    │
└─────────────────────────────────────────────────────┘
```

## 方案探讨

### 方案概要

#### HeartbeatManager

| 设计点      | 决定                                                | 说明                                               |
| ----------- | --------------------------------------------------- | -------------------------------------------------- |
| 调度模型    | 单 `setInterval` 主循环                             | 对标 FluffOS 单定时器架构，避免数百个独立定时器    |
| Tick 粒度   | 可配置，默认 1000ms                                 | 通过 EngineModule 配置或环境变量 `ENGINE_TICK_MS`  |
| 心跳参数    | 毫秒 + 累积器                                       | `enableHeartbeat(1500)` 传毫秒，内部累积器精确调度 |
| 累积器逻辑  | 每 tick 累加 tickIntervalMs，达到阈值触发并保留余数 | 长期平均频率精确，单次有 ±1 tick 偏差              |
| 错误隔离    | try-catch 包裹每个对象的 onHeartbeat()              | 单个对象异常不影响其他对象                         |
| NestJS 集成 | `@Injectable()` + `OnModuleInit/OnModuleDestroy`    | 模块启动时开始 tick，关闭时停止                    |

**累积器调度示例（tick=1000ms, 心跳=1500ms）：**

```
Tick 1: accumulated = 1000 < 1500 → 不触发
Tick 2: accumulated = 2000 >= 1500 → 触发！accumulated = 2000 - 1500 = 500
Tick 3: accumulated = 1500 >= 1500 → 触发！accumulated = 0
Tick 4: accumulated = 1000 < 1500 → 不触发
...（循环，平均 1.5 秒/次）
```

**API 设计：**

```typescript
@Injectable()
class HeartbeatManager implements OnModuleInit, OnModuleDestroy {
  // 注册心跳（毫秒间隔）
  register(entity: BaseEntity, intervalMs: number): void;
  // 注销心跳
  unregister(entity: BaseEntity): void;
  // 修改心跳间隔
  updateInterval(entity: BaseEntity, intervalMs: number): void;
  // 查询
  isRegistered(entity: BaseEntity): boolean;
  getRegisteredCount(): number;
  getInterval(entity: BaseEntity): number | undefined;
}
```

#### ObjectManager

| 设计点   | 决定                                         | 说明                                                            |
| -------- | -------------------------------------------- | --------------------------------------------------------------- |
| 管理模式 | 统一管理                                     | 单一 ObjectManager 管所有类型，通过 findAll(predicate) 按需过滤 |
| 数据结构 | `Map<string, BaseEntity>`                    | 按 ID 索引，O(1) 查找                                           |
| ID 分配  | 蓝图路径 + `#序号`                           | 蓝图: `yangzhou/inn`，克隆: `npc/dianxiaoer#1`                  |
| 生命周期 | 创建注册 + 销毁注销                          | destroy() 时自动从注册表移除                                    |
| GC 机制  | 完整 GC：clean_up + reset + removeDestructed | 对标 FluffOS 三级清理                                           |

**API 设计：**

```typescript
@Injectable()
class ObjectManager implements OnModuleDestroy {
  // 注册/注销
  register(entity: BaseEntity): void;
  unregister(entity: BaseEntity): void;

  // 查询
  findById(id: string): BaseEntity | undefined;
  findAll(predicate?: (e: BaseEntity) => boolean): BaseEntity[];
  has(id: string): boolean;
  getCount(): number;

  // ID 序号分配（克隆对象）
  nextInstanceId(blueprintId: string): string;
}
```

#### GC 三级清理机制

| 机制                 | 默认间隔 | 作用                               | 对标 FluffOS                  |
| -------------------- | -------- | ---------------------------------- | ----------------------------- |
| `reset()`            | 2 小时   | 刷新房间内容（NPC 重生、物品刷新） | `reset()` apply               |
| `clean_up()`         | 5 分钟   | 清理无环境、无活跃引用的非玩家对象 | `clean_up()` apply            |
| `removeDestructed()` | 5 分钟   | 清除注册表中已标记销毁的对象引用   | `remove_destructed_objects()` |

**clean_up 规则（参考 FluffOS/炎黄 MUD）：**

- `no_clean_up` 标记为 true 的非克隆对象 → 跳过
- 在线玩家 → 跳过
- 有环境的对象（在某个容器中） → 跳过
- 包含玩家或不可清除对象的容器 → 跳过
- 其他 → 调用 `destroy()`

**reset 机制：**

- BaseEntity 新增 `protected onReset(): void {}` 钩子
- 子类覆写实现具体逻辑（Room 刷新 NPC/物品，NPC 恢复 HP 等）
- ObjectManager 定时遍历所有对象调用

### BaseEntity 变更点

1. **移除** `_heartbeatTimer`、`_heartbeatInterval` 私有属性
2. **改写** `enableHeartbeat(intervalMs)` → 调用 `ServiceLocator.heartbeatManager.register(this, intervalMs)`
3. **改写** `disableHeartbeat()` → 调用 `ServiceLocator.heartbeatManager.unregister(this)`
4. **改写** `getHeartbeatInterval()` → 从 HeartbeatManager 查询
5. **新增** `protected onReset(): void {}` 钩子
6. **改写** `destroy()` → 增加 `ServiceLocator.objectManager.unregister(this)` 调用
7. **保留** `callOut/removeCallOut/clearCallOuts` 不变（仍用 setTimeout，精确时间控制）
8. **保留** `onHeartbeat()` 钩子不变，由 HeartbeatManager 调用

### ServiceLocator 变更

```typescript
export class ServiceLocator {
  static heartbeatManager: HeartbeatManager; // 取消注释
  static objectManager: ObjectManager; // 取消注释

  static initialize(providers: {
    heartbeatManager: HeartbeatManager;
    objectManager: ObjectManager;
  }): void;
}
```

### EngineModule 变更

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

### 考虑过的替代方案

| 方案                                                | 优点                | 缺点                             | 结论 |
| --------------------------------------------------- | ------------------- | -------------------------------- | ---- |
| 保留各对象独立 setInterval                          | 无需改造 BaseEntity | 数百个定时器性能差，无法统一管理 | 放弃 |
| 纯 tick 整数心跳                                    | 简单，对标 FluffOS  | 无法表达 1.5 秒等非整数间隔      | 放弃 |
| 细粒度 tick（500ms）                                | 支持更多间隔组合    | CPU 遍历频率翻倍                 | 放弃 |
| 分类 Manager（Room/Npc/Item 各自独立）              | 类型明确            | 增加复杂度，Layer 3 才知道类型   | 放弃 |
| 延迟调用纳入 tick                                   | 减少定时器数量      | 牺牲精度，callOut 需要精确时间   | 放弃 |
| 双模式心跳（有 Manager 走统一，没有走 setInterval） | 测试兼容            | 增加复杂度和分支逻辑             | 放弃 |

## 与现有功能的关系

- **依赖**: Layer 0 BaseEntity（已完成），需要改写心跳和销毁逻辑
- **影响**: 修改 BaseEntity、ServiceLocator、EngineModule
- **复用**: HeartbeatManager 的 tick 主循环可复用于后续的战斗时间轴系统
- **测试影响**: 现有 27 个心跳测试需要适配（注入 HeartbeatManager 实例）

## 边界和约束

- **tick 精度**: 累积器保证长期平均频率准确，单次触发有 ±1 tick 偏差
- **性能边界**: 单 tick 内遍历所有心跳对象，1000 个对象 × 简单回调 ≈ <1ms（可接受）
- **GC 安全**: clean_up 不会清理有环境的对象、在线玩家、标记 no_clean_up 的对象
- **错误隔离**: HeartbeatManager try-catch 包裹每个对象回调，单个异常不阻塞全局

## 开放问题

- GC 间隔的精确值需要在运行时调优（clean_up 5分钟、reset 2小时只是初始值）
- clean_up 的"不活跃"判断标准，可能需要在 Layer 3 实现具体子类时细化
- reset 的具体逻辑（NPC 重生位置、物品刷新数量等）留给 Layer 3

## 探讨记录

### 关键决策过程

1. **Tick 粒度**: 考虑了固定 1 秒、500ms、2 秒三种方案，最终选择可配置（默认 1 秒），平衡性能和灵活性。

2. **心跳参数精度**: 最初倾向纯 tick 整数（对标 FluffOS），但讨论中提出 1.5 秒心跳的需求，最终采用毫秒 + 累积器方案，兼顾精度和简单性。

3. **BaseEntity 迁移策略**: 考虑了双模式（有 Manager 走统一，没有退回 setInterval）和新增方法两种兼容方案，最终选择完全替换，保持代码简洁。

4. **ObjectManager 分类**: 参考了 RanvierMUD 的分类 Manager 模式（ItemManager/MobManager），但考虑到 Layer 1 不知道具体类型（Layer 3 才定义），选择统一管理。

5. **GC 完整性**: 讨论了暂不实现、基础 GC、完整 GC 三个级别，选择完整 GC，包含 clean_up + reset + removeDestructed，对标 FluffOS 的成熟机制。

6. **延迟调用归属**: callOut 保留 setTimeout，因为延迟调用需要精确时间控制（技能冷却 1.5 秒必须是 1.5 秒），与心跳的"周期性近似"职责不同。

### 参考资料

- [FluffOS heartbeat.cc 源码](https://github.com/fluffos/fluffos/blob/master/src/packages/core/heartbeat.cc) — 双缓冲 deque + 倒计时调度
- [FluffOS backend.cc 源码](https://github.com/fluffos/fluffos/blob/master/src/backend.cc) — 主循环 + gametick 事件队列
- [炎黄 MUD user.c](https://github.com/oiuv/mudcore/blob/master/system/object/user.c) — 心跳驱动 condition/buff 系统
- [炎黄 MUD clean_up.c](https://github.com/oiuv/mudcore/blob/master/inherit/clean_up.c) — 对象清理机制
- [RanvierMUD EntityFactory](https://github.com/RanvierMUD/core) — Manager 分层参考
- [Evennia TypeclassManager](https://www.evennia.com/docs/latest/api/evennia.typeclasses.managers.html) — 对象查询参考

---

> CX 工作流 | 功能探讨
