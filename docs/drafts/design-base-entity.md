# Design Doc: BaseEntity 基类

## 关联

- PRD: #36
- Scope: #1（评论区 Layer 0 设计定稿）
- 关联 Design: #29（创建角色系统，Character Entity 模式参考）

## 基于现有代码

| 模块                                          | 复用点                                     |
| --------------------------------------------- | ------------------------------------------ |
| `server/src/character/character.entity.ts`    | TypeORM Entity 模式（JSON 字段、命名规范） |
| `packages/core/src/factory/MessageFactory.ts` | 装饰器自注册模式                           |
| `server/src/websocket/types/session.ts`       | 运行时状态管理                             |
| `server/src/app.module.ts`                    | NestJS 模块注册模式                        |
| `server/tsconfig.json`                        | ES2021 目标，experimentalDecorators 已启用 |

## 架构概览

```
┌─────────────────────────────────────────────────────────┐
│                    NestJS Application                    │
│                                                         │
│  ┌───────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ AppModule     │  │ WebSocket    │  │ Account      │ │
│  │               │  │ Module       │  │ Module       │ │
│  └───────┬───────┘  └──────────────┘  └──────────────┘ │
│          │                                              │
│  ┌───────┴───────────────────────────────────────────┐  │
│  │ EngineModule                                      │  │
│  │  ├── ServiceLocator (全局静态，启动时初始化)       │  │
│  │  └── (后续: ObjectManager, HeartbeatManager)      │  │
│  └───────────────────────────────────────────────────┘  │
│          │                                              │
│  ┌───────┴───────────────────────────────────────────┐  │
│  │ BaseEntity (不归 NestJS DI 管理)                  │  │
│  │  ├── Dbase 子系统                                 │  │
│  │  ├── Environment 子系统                           │  │
│  │  └── Events 子系统                                │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**关键设计决策**: BaseEntity 实例不归 NestJS 容器管理（因为游戏对象可能有数千个，动态创建/销毁），通过 ServiceLocator 模式访问 NestJS 管理的服务。

## 后端设计

### 代码路径

```
server/src/engine/
├── base-entity.ts          # BaseEntity 基类（核心）
├── service-locator.ts      # 服务定位器
├── types/
│   ├── dbase.ts            # Blueprint 接口、DbasePath 类型
│   ├── events.ts           # 事件名常量、事件参数接口
│   └── move-options.ts     # MoveOptions 接口
├── utils/
│   └── nested-value.ts     # 路径式嵌套值工具函数
└── engine.module.ts        # NestJS EngineModule
```

### 类型定义

#### `types/dbase.ts`

```typescript
/**
 * 蓝图接口
 * 蓝图是对象的模板定义，实例从蓝图创建
 */
export interface Blueprint {
  /** 蓝图 ID（路径式，如 "npc/yangzhou/dianxiaoer"） */
  id: string;
  /** 蓝图默认属性 */
  dbase: Record<string, any>;
  /** 获取蓝图属性值（支持路径访问） */
  getDbaseValue<T = any>(path: string): T | undefined;
}
```

#### `types/events.ts`

```typescript
/**
 * 标准事件名常量
 */
export const GameEvents = {
  // 环境事件
  PRE_MOVE: 'pre:move',
  POST_MOVE: 'post:move',
  PRE_RECEIVE: 'pre:receive',
  POST_RECEIVE: 'post:receive',
  PRE_LEAVE: 'pre:leave',
  POST_LEAVE: 'post:leave',
  ENCOUNTER: 'encounter',

  // 生命周期
  CREATED: 'created',
  DESTROYED: 'destroyed',
  HEARTBEAT: 'heartbeat',
  RESET: 'reset',

  // 交互
  LOOK: 'look',
  GET: 'get',
  DROP: 'drop',
  USE: 'use',

  // 通信
  MESSAGE: 'message',
  SAY: 'say',
} as const;

/**
 * 可取消事件的参数接口
 */
export interface CancellableEvent {
  /** 调用此方法阻止行为 */
  cancel(): void;
  /** 是否已被取消 */
  cancelled: boolean;
}

/** 移动事件参数 */
export interface MoveEvent extends CancellableEvent {
  who: BaseEntity; // 移动的对象
  source: BaseEntity | null; // 来源
  dest: BaseEntity; // 目标
}

/** 容器事件参数 */
export interface ContainerEvent extends CancellableEvent {
  who: BaseEntity; // 进入/离开的对象
  source: BaseEntity | null;
  dest: BaseEntity;
}
```

#### `types/move-options.ts`

```typescript
export interface MoveOptions {
  /** 静默移动，不触发事件链（传送/GM 操作） */
  quiet?: boolean;
}
```

### 工具函数

#### `utils/nested-value.ts`

```typescript
/**
 * 路径式嵌套值操作工具
 * 对标炎黄 MUD dbase.c 的 _set/_query/_delete
 */

/**
 * 按路径获取嵌套值
 * getNestedValue(map, ["combat", "attack"]) → map.combat.attack
 */
export function getNestedValue(data: Map<string, any>, parts: string[]): any | undefined {
  let current: any = data;
  for (const part of parts) {
    if (current instanceof Map) {
      current = current.get(part);
    } else if (current && typeof current === 'object') {
      current = current[part];
    } else {
      return undefined;
    }
    if (current === undefined) return undefined;
  }
  return current;
}

/**
 * 按路径设置嵌套值，自动创建中间层
 * setNestedValue(map, ["combat", "attack"], 100)
 * → map.set("combat", { attack: 100 })
 */
export function setNestedValue(data: Map<string, any>, parts: string[], value: any): void {
  if (parts.length === 1) {
    data.set(parts[0], value);
    return;
  }
  let current = data.get(parts[0]);
  if (!current || typeof current !== 'object' || current instanceof Map) {
    current = {};
    data.set(parts[0], current);
  }
  // 逐层深入普通对象
  for (let i = 1; i < parts.length - 1; i++) {
    if (!current[parts[i]] || typeof current[parts[i]] !== 'object') {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
}

/**
 * 按路径删除嵌套值
 * deleteNestedValue(map, ["combat", "attack"])
 */
export function deleteNestedValue(data: Map<string, any>, parts: string[]): boolean {
  if (parts.length === 1) {
    return data.delete(parts[0]);
  }
  let current: any = data.get(parts[0]);
  for (let i = 1; i < parts.length - 1; i++) {
    if (!current || typeof current !== 'object') return false;
    current = current[parts[i]];
  }
  if (!current || typeof current !== 'object') return false;
  const lastKey = parts[parts.length - 1];
  if (lastKey in current) {
    delete current[lastKey];
    return true;
  }
  return false;
}
```

### BaseEntity 核心类

#### `base-entity.ts`

```typescript
import { EventEmitter } from 'events';
import { getNestedValue, setNestedValue, deleteNestedValue } from './utils/nested-value';
import type { Blueprint } from './types/dbase';
import type { MoveOptions } from './types/move-options';
import type { CancellableEvent, MoveEvent, ContainerEvent } from './types/events';
import { GameEvents } from './types/events';

/**
 * BaseEntity — 游戏引擎核心基类
 *
 * 所有游戏运行时对象（Room、NPC、Player、Item、Exit）的基类。
 * 提供三大核心能力：
 * 1. Dbase 动态属性系统（持久化 + 临时）
 * 2. Environment 环境/容器系统（树形包含关系）
 * 3. Events 事件系统（EventEmitter + 心跳 + 延迟调用）
 *
 * 对标: 炎黄 MUD dbase.c + LPC environment/inventory + RanvierMUD GameEntity
 */
export abstract class BaseEntity extends EventEmitter {
  /** 唯一标识，路径式（如 "yangzhou/inn", "npc/dianxiaoer#1"） */
  readonly id: string;

  // ========== Dbase 动态属性系统 ==========

  /** 持久化属性（对应 LPC dbase mapping） */
  private dbase: Map<string, any> = new Map();

  /** 临时属性（对应 LPC tmp_dbase，重启丢失） */
  private tmpDbase: Map<string, any> = new Map();

  /** 蓝图引用（原型链回退） */
  protected blueprint: Blueprint | null = null;

  // ========== Environment 环境/容器系统 ==========

  /** 所在容器（对应 LPC environment()） */
  private _environment: BaseEntity | null = null;

  /** 包含的对象（对应 LPC all_inventory()） */
  private _inventory: Set<BaseEntity> = new Set();

  // ========== Events 心跳 + 延迟调用 ==========

  /** 心跳定时器 */
  private _heartbeatTimer: ReturnType<typeof setInterval> | null = null;

  /** 心跳间隔（毫秒） */
  private _heartbeatInterval: number = 0;

  /** 延迟调用注册表 */
  private _callOuts: Map<string, ReturnType<typeof setTimeout>> = new Map();

  /** 延迟调用 ID 计数器 */
  private _callOutCounter: number = 0;

  // ========== 构造函数 ==========

  constructor(id: string, blueprint?: Blueprint) {
    super();
    this.id = id;
    this.blueprint = blueprint ?? null;
  }

  // ================================================================
  //  Dbase 动态属性 API
  // ================================================================

  /** 设置属性（支持 "/" 路径嵌套） */
  set(path: string, value: any): void {
    const parts = path.split('/');
    setNestedValue(this.dbase, parts, value);
  }

  /** 获取属性（本地无则回退蓝图） */
  get<T = any>(path: string): T | undefined {
    const parts = path.split('/');
    const local = getNestedValue(this.dbase, parts);
    if (local !== undefined) return local as T;
    // 蓝图原型链回退
    return this.blueprint?.getDbaseValue<T>(path);
  }

  /** 累加数值属性 */
  add(path: string, delta: number): void {
    const old = this.get<number>(path) ?? 0;
    this.set(path, old + delta);
  }

  /** 删除属性 */
  del(path: string): boolean {
    const parts = path.split('/');
    return deleteNestedValue(this.dbase, parts);
  }

  /** 设置临时属性 */
  setTemp(path: string, value: any): void {
    const parts = path.split('/');
    setNestedValue(this.tmpDbase, parts, value);
  }

  /** 获取临时属性（不走蓝图原型链） */
  getTemp<T = any>(path: string): T | undefined {
    const parts = path.split('/');
    return getNestedValue(this.tmpDbase, parts) as T | undefined;
  }

  /** 累加临时属性 */
  addTemp(path: string, delta: number): void {
    const old = this.getTemp<number>(path) ?? 0;
    this.setTemp(path, old + delta);
  }

  /** 删除临时属性 */
  delTemp(path: string): boolean {
    const parts = path.split('/');
    return deleteNestedValue(this.tmpDbase, parts);
  }

  /** 获取整个 dbase（序列化用） */
  getDbase(): Record<string, any> {
    const result: Record<string, any> = {};
    this.dbase.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  /** 批量加载 dbase（反序列化用） */
  setDbase(data: Record<string, any>): void {
    this.dbase.clear();
    for (const [key, value] of Object.entries(data)) {
      this.dbase.set(key, value);
    }
  }

  // ================================================================
  //  Environment 环境/容器 API
  // ================================================================

  /** 获取所在容器 */
  getEnvironment(): BaseEntity | null {
    return this._environment;
  }

  /** 获取直接子对象列表 */
  getInventory(): BaseEntity[] {
    return [...this._inventory];
  }

  /** 递归获取所有子对象 */
  getDeepInventory(): BaseEntity[] {
    const result: BaseEntity[] = [];
    for (const child of this._inventory) {
      result.push(child);
      result.push(...child.getDeepInventory());
    }
    return result;
  }

  /** 按条件搜索子对象 */
  findInInventory(predicate: (entity: BaseEntity) => boolean): BaseEntity | undefined {
    for (const child of this._inventory) {
      if (predicate(child)) return child;
    }
    return undefined;
  }

  /**
   * 移动到目标容器
   * @param dest 目标容器
   * @param opts quiet=true 静默移动，不触发事件链
   * @returns 是否移动成功
   */
  async moveTo(dest: BaseEntity, opts?: MoveOptions): Promise<boolean> {
    const quiet = opts?.quiet ?? false;
    const source = this._environment;

    if (!quiet) {
      // Step 1: pre:move — 自身确认
      const moveEvent = this.createCancellableEvent({ who: this, source, dest });
      this.emit(GameEvents.PRE_MOVE, moveEvent);
      if (moveEvent.cancelled) return false;

      // Step 2: pre:leave — 旧环境确认放行
      if (source) {
        const leaveEvent = this.createCancellableEvent({ who: this, source, dest });
        source.emit(GameEvents.PRE_LEAVE, leaveEvent);
        if (leaveEvent.cancelled) return false;
      }

      // Step 3: pre:receive — 新环境确认接收
      const receiveEvent = this.createCancellableEvent({ who: this, source, dest });
      dest.emit(GameEvents.PRE_RECEIVE, receiveEvent);
      if (receiveEvent.cancelled) return false;
    }

    // Step 4: 执行移动
    if (source) {
      source._inventory.delete(this);
    }
    this._environment = dest;
    dest._inventory.add(this);

    if (!quiet) {
      // Step 5: post:leave
      if (source) {
        source.emit(GameEvents.POST_LEAVE, { who: this, dest });
      }
      // Step 6: post:receive
      dest.emit(GameEvents.POST_RECEIVE, { who: this, source });
      // Step 7: post:move
      this.emit(GameEvents.POST_MOVE, { source, dest });
      // 触发 encounter（通知房间内其他对象）
      for (const obj of dest._inventory) {
        if (obj !== this) {
          obj.emit(GameEvents.ENCOUNTER, { who: this });
        }
      }
    }

    return true;
  }

  /** 销毁对象 */
  destroy(): void {
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
    // 5. 触发销毁事件
    this.emit(GameEvents.DESTROYED);
    // 6. 清除所有监听器
    this.removeAllListeners();
  }

  /**
   * 销毁时处理 inventory 子对象
   * 子类可覆写（如 Room 需要特殊处理玩家）
   */
  protected handleInventoryOnDestroy(): void {
    // 默认行为：内容物移到上层环境
    for (const child of [...this._inventory]) {
      if (this._environment) {
        child.moveTo(this._environment, { quiet: true });
      }
    }
  }

  // ================================================================
  //  Events 心跳 + 延迟调用 API
  // ================================================================

  /** 注册心跳 */
  enableHeartbeat(intervalMs: number): void {
    this.disableHeartbeat();
    this._heartbeatInterval = intervalMs;
    this._heartbeatTimer = setInterval(() => {
      this.onHeartbeat();
      this.emit(GameEvents.HEARTBEAT);
    }, intervalMs);
  }

  /** 注销心跳 */
  disableHeartbeat(): void {
    if (this._heartbeatTimer) {
      clearInterval(this._heartbeatTimer);
      this._heartbeatTimer = null;
      this._heartbeatInterval = 0;
    }
  }

  /** 心跳回调（子类覆写） */
  protected onHeartbeat(): void {}

  /** 延迟调用 */
  callOut(fn: () => void, delayMs: number): string {
    const id = `co_${++this._callOutCounter}`;
    const timer = setTimeout(() => {
      this._callOuts.delete(id);
      fn();
    }, delayMs);
    this._callOuts.set(id, timer);
    return id;
  }

  /** 取消延迟调用 */
  removeCallOut(id: string): void {
    const timer = this._callOuts.get(id);
    if (timer) {
      clearTimeout(timer);
      this._callOuts.delete(id);
    }
  }

  /** 清除所有延迟调用 */
  clearCallOuts(): void {
    for (const timer of this._callOuts.values()) {
      clearTimeout(timer);
    }
    this._callOuts.clear();
  }

  // ================================================================
  //  内部工具方法
  // ================================================================

  /** 创建可取消事件对象 */
  private createCancellableEvent<T extends Record<string, any>>(data: T): T & CancellableEvent {
    let _cancelled = false;
    return {
      ...data,
      get cancelled() {
        return _cancelled;
      },
      cancel() {
        _cancelled = true;
      },
    };
  }
}
```

### ServiceLocator

#### `service-locator.ts`

```typescript
/**
 * 服务定位器
 * BaseEntity 通过此类访问 NestJS 管理的引擎服务
 * 在 EngineModule 启动时初始化
 */
export class ServiceLocator {
  // Layer 1 服务（后续添加）
  // static objectManager: ObjectManager;
  // static heartbeatManager: HeartbeatManager;

  // Layer 2 服务（后续添加）
  // static blueprintLoader: BlueprintLoader;

  private static _initialized = false;

  /** 初始化服务定位器（由 EngineModule 调用） */
  static initialize(providers: Record<string, any>): void {
    // 后续按需注入
    // this.objectManager = providers.objectManager;
    this._initialized = true;
    console.log('ServiceLocator 初始化完成');
  }

  /** 检查是否已初始化 */
  static get initialized(): boolean {
    return this._initialized;
  }
}
```

### EngineModule

#### `engine.module.ts`

```typescript
import { Module, OnModuleInit } from '@nestjs/common';
import { ServiceLocator } from './service-locator';

/**
 * 游戏引擎模块
 * 负责初始化 ServiceLocator，管理引擎服务的生命周期
 */
@Module({
  providers: [],
  exports: [],
})
export class EngineModule implements OnModuleInit {
  onModuleInit() {
    ServiceLocator.initialize({});
    console.log('EngineModule 已启动');
  }
}
```

## 前端设计

BaseEntity 是纯后端模块，不涉及前端代码。前端在后续 Layer 3（Room/NPC）和 Layer 4（指令系统）中才需要改动。

## 前后端字段映射

本模块无前后端字段映射需求。后续 Layer 3 实现 GameCharacter（Player 子类）时，才涉及 Character Entity ↔ BaseEntity dbase 的映射：

| 功能      | 数据库字段          | BaseEntity dbase path | 说明         |
| --------- | ------------------- | --------------------- | ------------ |
| 角色名    | `name` (varchar)    | `"name"`              | 固定列       |
| 出身      | `origin` (enum)     | `"origin"`            | 固定列       |
| 慧根      | `wisdom` (tinyint)  | `"attrs/wisdom"`      | 固定列       |
| 战斗状态  | `dbase_json` (json) | `"combat/*"`          | 动态 JSON 列 |
| buff 列表 | `dbase_json` (json) | `"buffs"`             | 动态 JSON 列 |

（以上映射仅为预览，具体在 Layer 3 PRD/Design 中定义）

## 影响范围

- **新增文件**:
  - `server/src/engine/base-entity.ts`
  - `server/src/engine/service-locator.ts`
  - `server/src/engine/types/dbase.ts`
  - `server/src/engine/types/events.ts`
  - `server/src/engine/types/move-options.ts`
  - `server/src/engine/utils/nested-value.ts`
  - `server/src/engine/engine.module.ts`
- **修改文件**:
  - `server/src/app.module.ts` — import EngineModule
- **测试文件**:
  - `server/src/engine/__tests__/nested-value.spec.ts`
  - `server/src/engine/__tests__/base-entity-dbase.spec.ts`
  - `server/src/engine/__tests__/base-entity-environment.spec.ts`
  - `server/src/engine/__tests__/base-entity-events.spec.ts`

## 风险点

| 风险                  | 影响                            | 应对方案                                                        |
| --------------------- | ------------------------------- | --------------------------------------------------------------- |
| EventEmitter 内存泄漏 | 大量对象注册监听器不释放        | `destroy()` 中调用 `removeAllListeners()`；设置 `maxListeners`  |
| 心跳性能              | 大量对象各自 setInterval        | Layer 1 的 HeartbeatManager 统一调度替代，BaseEntity 只提供接口 |
| 循环引用              | A 包含 B，B 又包含 A            | `moveTo()` 中检查目标不是自身或自身的子对象                     |
| dbase Map 序列化      | `JSON.stringify(Map)` 返回 `{}` | `getDbase()` 转为 Record 后再序列化                             |

---

> CX 工作流 | Design Doc | PRD #36
