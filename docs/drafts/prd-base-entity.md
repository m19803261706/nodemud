# PRD: BaseEntity 基类

## 基本信息

- **创建时间**: 2026-02-02
- **优先级**: P0（核心引擎基础，阻塞后续所有功能）
- **技术栈**: TypeScript + NestJS
- **代码位置**: `server/src/engine/`
- **关联文档**: Scope #1 评论区（地图系统探讨定稿 + Layer 0 设计定稿）

## 功能概述

BaseEntity 是游戏引擎的核心基类，所有游戏运行时对象（Room、NPC、Player、Item、Exit）均继承自它。它提供三大核心能力：

1. **Dbase 动态属性系统** — 运行时 key-value 属性存储，支持路径式嵌套访问和蓝图原型链回退
2. **Environment 环境/容器系统** — 对象间的树形包含关系（房间包含NPC/玩家，玩家包含物品）
3. **Events 事件系统** — 基于 EventEmitter 的对象间通信，包含心跳注册和延迟调用

设计参考：炎黄 MUD `dbase.c`、Evennia `DefaultObject`、RanvierMUD `GameEntity`。

## 用户场景

BaseEntity 不直接面向终端用户，而是为后续所有游戏系统提供底层能力：

| 场景 | 依赖 BaseEntity 的能力 | 示例 |
|------|----------------------|------|
| 玩家在房间间移动 | Environment 系统的 `moveTo()` | `player.moveTo(room)` |
| 查看房间描述 | Dbase 的 `get("long")` + 蓝图原型链 | 100 个房间实例共享蓝图描述 |
| NPC 定时巡逻 | 心跳系统 `enableHeartbeat()` | NPC 每 3 秒检查是否移动 |
| 玩家进入房间触发剧情 | Events 的 `pre:receive` 事件 | 蓝图代码中 if/else 判断 |
| 拾取物品到背包 | Environment 的 `moveTo()` | `item.moveTo(player)` |
| Boss 存盘 | Dbase 的 `getDbase()` 序列化 | 特殊实例持久化到 MySQL |
| 副本销毁 | `destroy()` 方法 | 玩家移走，NPC/Item 销毁 |
| 传送/GM操作 | 静默移动 `moveTo(dest, { quiet: true })` | 不触发事件链 |
| 技能冷却 | 延迟调用 `callOut()` | 3 秒后恢复可用 |

## 详细需求

### 需求 1: Dbase 动态属性系统

**描述**: 每个 BaseEntity 实例维护两套 key-value 存储（持久化 dbase + 临时 tmpDbase），支持路径式嵌套访问和蓝图原型链回退。

**API:**

| 方法 | 签名 | 说明 |
|------|------|------|
| `set` | `set(path: string, value: any): void` | 设置属性，支持 `/` 路径嵌套 |
| `get` | `get<T>(path: string): T \| undefined` | 获取属性，本地无则回退蓝图 |
| `add` | `add(path: string, delta: number): void` | 累加数值属性 |
| `del` | `del(path: string): boolean` | 删除属性 |
| `setTemp` | `setTemp(path: string, value: any): void` | 设置临时属性 |
| `getTemp` | `getTemp<T>(path: string): T \| undefined` | 获取临时属性 |
| `addTemp` | `addTemp(path: string, delta: number): void` | 累加临时属性 |
| `delTemp` | `delTemp(path: string): boolean` | 删除临时属性 |
| `getDbase` | `getDbase(): Record<string, any>` | 返回整个 dbase（序列化用） |
| `setDbase` | `setDbase(data: Record<string, any>): void` | 批量加载 dbase（反序列化用） |

**路径式嵌套规则:**
- `set("combat/attack", 100)` → `{ combat: { attack: 100 } }`
- `get("combat/attack")` → `100`
- `add("combat/attack", 20)` → `120`
- 中间层自动创建

**蓝图原型链规则:**
- `get()` 先查自身 dbase，未找到则查 `this.blueprint` 的 dbase
- `set()` / `add()` / `del()` 只操作自身 dbase，不修改蓝图
- 临时属性（`setTemp/getTemp`）不走原型链

### 需求 2: Environment 环境/容器系统

**描述**: 对象间的树形包含关系。每个对象有且仅有一个 environment（容器），可包含多个 inventory（子对象）。

**API:**

| 方法 | 签名 | 说明 |
|------|------|------|
| `moveTo` | `moveTo(dest: BaseEntity, opts?: MoveOptions): Promise<boolean>` | 移动到目标容器 |
| `getEnvironment` | `getEnvironment(): BaseEntity \| null` | 获取所在容器 |
| `getInventory` | `getInventory(): BaseEntity[]` | 获取直接子对象 |
| `getDeepInventory` | `getDeepInventory(): BaseEntity[]` | 递归获取所有子对象 |
| `findInInventory` | `findInInventory(predicate: (e: BaseEntity) => boolean): BaseEntity \| undefined` | 按条件搜索子对象 |
| `destroy` | `destroy(): void` | 销毁对象，清理引用 |

**MoveOptions:**

```typescript
interface MoveOptions {
  quiet?: boolean;  // true=静默移动，不触发事件链
}
```

**移动事件链（quiet=false）:**

1. `this` emit `pre:move` → 可取消
2. `source` emit `pre:leave` → 可取消
3. `dest` emit `pre:receive` → 可取消（蓝图在此写准入判断）
4. 执行移动（修改引用）
5. `source` emit `post:leave`
6. `dest` emit `post:receive`
7. `this` emit `post:move`

**pre: 事件取消机制:**

```typescript
// 事件参数包含 cancel() 方法
room.on('pre:receive', (event) => {
  const { who, cancel } = event;
  if (who.get<number>('level') < 10) {
    who.emit('message', '等级不够，无法进入。');
    cancel();
  }
});
```

**销毁规则:**
- 注销心跳、清除延迟调用、移除事件监听
- 房间销毁时：Player 移到安全点（quiet），NPC/Item 销毁
- 非房间容器销毁时：内容物移到上层环境

### 需求 3: Events 事件系统

**描述**: 继承 Node.js EventEmitter，定义标准事件名约定，提供心跳注册和延迟调用能力。

**标准事件名:**

| 事件 | 触发时机 | 可取消 |
|------|---------|--------|
| `pre:move` | 对象即将移动 | 是 |
| `post:move` | 对象移动完成 | 否 |
| `pre:receive` | 容器即将接收对象 | 是 |
| `post:receive` | 容器已接收对象 | 否 |
| `pre:leave` | 对象即将离开容器 | 是 |
| `post:leave` | 对象已离开容器 | 否 |
| `encounter` | 遭遇新对象 | 否 |
| `created` | 对象创建完成 | 否 |
| `destroyed` | 对象销毁 | 否 |
| `heartbeat` | 心跳 tick | 否 |
| `reset` | 重置/刷新 | 否 |
| `look` | 被查看 | 否 |
| `get` | 被拾取 | 否 |
| `drop` | 被丢弃 | 否 |
| `use` | 被使用 | 否 |
| `message` | 收到消息 | 否 |
| `say` | 房间内发言 | 否 |

**心跳 API:**

| 方法 | 签名 | 说明 |
|------|------|------|
| `enableHeartbeat` | `enableHeartbeat(intervalMs: number): void` | 注册心跳 |
| `disableHeartbeat` | `disableHeartbeat(): void` | 注销心跳 |
| `onHeartbeat` | `protected onHeartbeat(): void` | 子类覆写的心跳回调 |

**延迟调用 API:**

| 方法 | 签名 | 说明 |
|------|------|------|
| `callOut` | `callOut(fn: () => void, delayMs: number): string` | 延迟调用，返回 ID |
| `removeCallOut` | `removeCallOut(id: string): void` | 取消延迟调用 |
| `clearCallOuts` | `clearCallOuts(): void` | 清除所有延迟调用 |

### 需求 4: ID 和基础属性

**ID 策略**: 路径式 ID

| 属性 | 类型 | 说明 |
|------|------|------|
| `id` | `string` | 唯一标识，路径式（如 `yangzhou/inn`，实例 `npc/dianxiaoer#1`） |
| `blueprint` | `Blueprint \| null` | 蓝图引用（原型链回退用） |

### 需求 5: ServiceLocator 服务定位器

**描述**: 全局静态类，在 NestJS 启动时注入服务引用，供 BaseEntity 访问引擎服务。

```typescript
class ServiceLocator {
  static objectManager: ObjectManager;
  static heartbeatManager: HeartbeatManager;
  static blueprintLoader: BlueprintLoader;
  static initialize(providers: {...}): void;
}
```

### 需求 6: 工具函数

**嵌套值操作工具:**

| 函数 | 签名 | 说明 |
|------|------|------|
| `getNestedValue` | `getNestedValue(map: Map, parts: string[]): any` | 按路径获取嵌套值 |
| `setNestedValue` | `setNestedValue(map: Map, parts: string[], value: any): void` | 按路径设置嵌套值 |
| `deleteNestedValue` | `deleteNestedValue(map: Map, parts: string[]): boolean` | 按路径删除嵌套值 |

## 关联文档

- **Scope #1** — NodeMUD 项目蓝图，评论区包含地图系统探讨定稿和 Layer 0 设计定稿
- **Design #29** — 创建角色系统 Design Doc，TypeORM 实体模式参考
- **已有代码参考**:
  - `server/src/character/character.entity.ts` — TypeORM Entity 模式
  - `packages/core/src/factory/MessageFactory.ts` — 装饰器注册模式

## 现有代码基础

| 模块 | 路径 | 可复用点 |
|------|------|---------|
| Character Entity | `server/src/character/` | TypeORM Entity 定义模式、JSON 字段 |
| MessageFactory | `packages/core/src/factory/` | 装饰器自注册模式 |
| Session | `server/src/websocket/types/session.ts` | 运行时状态管理模式 |

## 代码影响范围

| 层级 | 影响 |
|------|------|
| 后端服务 | 新建 `server/src/engine/` 模块 |
| NestJS 模块 | 新建 `EngineModule`，注册到 `AppModule` |
| 数据层 | 后续需要给 Character 表添加 `dbase_json` 列（本 PRD 不涉及，留给 Layer 3） |

## 文件结构

```
server/src/engine/
├── base-entity.ts          # BaseEntity 基类
├── service-locator.ts      # 服务定位器
├── types/
│   ├── dbase.ts            # Dbase 相关类型（Blueprint 接口等）
│   ├── events.ts           # 标准事件名常量和事件参数类型
│   └── move-options.ts     # MoveOptions 接口
├── utils/
│   └── nested-value.ts     # 路径式嵌套值工具函数
└── engine.module.ts        # NestJS EngineModule
```

## 任务拆分（初步）

- [ ] 实现嵌套值工具函数 `nested-value.ts`
- [ ] 定义类型文件（`dbase.ts`, `events.ts`, `move-options.ts`）
- [ ] 实现 BaseEntity Dbase 子系统（set/get/add/del + 路径嵌套 + 蓝图原型链）
- [ ] 实现 BaseEntity Environment 子系统（moveTo + 事件链 + destroy）
- [ ] 实现 BaseEntity Events 子系统（心跳注册 + 延迟调用）
- [ ] 实现 ServiceLocator
- [ ] 创建 EngineModule 并注册到 AppModule
- [ ] 单元测试（Dbase 操作、环境移动、事件触发、心跳、销毁）

## 验收标准

- [ ] `set/get/add/del` 支持路径式嵌套访问，中间层自动创建
- [ ] 蓝图原型链：实例查不到属性时回退到蓝图定义
- [ ] `moveTo()` 正确触发 7 步事件链，`pre:` 事件可通过 `cancel()` 取消
- [ ] `moveTo(dest, { quiet: true })` 静默移动，不触发任何事件
- [ ] `enableHeartbeat(intervalMs)` 按指定间隔触发 `onHeartbeat()`
- [ ] `callOut(fn, delay)` 延迟执行，`removeCallOut` 可取消
- [ ] `destroy()` 正确清理心跳、延迟调用、事件监听，处理 inventory 子对象
- [ ] 所有工具函数和核心方法有单元测试覆盖
- [ ] EngineModule 正确注册到 AppModule，ServiceLocator 在启动时初始化

## 不包含（留给后续 Layer）

- HeartbeatManager 全局调度器（Layer 1）
- ObjectManager 对象注册表（Layer 1）
- BlueprintLoader 蓝图加载（Layer 2）
- Room / NPC / Item / Exit 具体子类（Layer 3）
- CommandRegistry 指令系统（Layer 4）
- 数据库持久化（Character 表的 dbase_json 列，Layer 3）

---

> CX 工作流 | PRD
