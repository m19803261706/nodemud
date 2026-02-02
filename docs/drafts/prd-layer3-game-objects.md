# PRD: Layer 3 — 游戏对象子类

## 基本信息

- **创建时间**: 2026-02-02
- **优先级**: P0（阻塞 Layer 4 指令系统和示例蓝图）
- **技术栈**: TypeScript + NestJS
- **代码位置**: `server/src/engine/game-objects/`
- **关联文档**: Scope #63（方案探讨定稿）、Epic #57 Layer 2（前置依赖，已完成）、Epic #49 Layer 1（前置依赖，已完成）、Epic #38 Layer 0（前置依赖，已完成）

## 功能概述

Layer 3 游戏对象子类是引擎架构中直接面向游戏世界建模的层。在 Layer 0（BaseEntity 基类）、Layer 1（HeartbeatManager + ObjectManager）、Layer 2（BlueprintLoader 蓝图加载系统）的基础上，定义四个继承 BaseEntity 的具体子类：

- **RoomBase** — 房间基类：游戏世界的基本空间单元
- **Area** — 区域管理器：房间的逻辑分组和 NPC 刷新管理
- **NpcBase** — NPC 基类：非玩家角色的行为框架
- **ItemBase** — 物品基类：游戏物品的属性框架

**核心理念**：子类只提供**行为框架和便捷方法**，具体属性值由蓝图在 `create()` 中通过 dbase `set()` 设置。对标 LPC 的 `ROOM`、`NPC`、`OB` 基类。

## 用户场景

Layer 3 不直接面向终端用户，而是为后续的蓝图开发和指令系统提供基础类型：

| 场景              | 依赖的能力                                      | 示例                                                                           |
| ----------------- | ----------------------------------------------- | ------------------------------------------------------------------------------ |
| 蓝图定义房间      | 继承 RoomBase，在 create() 中设置出口/描述      | `class YangzhouInn extends RoomBase { create() { this.set('exits', {...}) } }` |
| 蓝图定义 NPC      | 继承 NpcBase，覆写 onAI()/onChat()              | `class DianXiaoEr extends NpcBase { onAI() { ... } }`                          |
| 蓝图定义物品      | 继承 ItemBase，在 create() 中设置名字/重量/价值 | `class Sword extends ItemBase { create() { this.set('name', '青铜剑') } }`     |
| 蓝图定义区域      | 继承 Area，设置房间列表和 NPC 刷新规则          | `class Yangzhou extends Area { create() { this.set('rooms', [...]) } }`        |
| look 指令查看房间 | RoomBase.getShort()/getLong()/getExits()        | Layer 4 指令系统调用                                                           |
| go 指令移动       | RoomBase.getExit(direction)                     | Layer 4 指令系统调用                                                           |
| 房间内广播消息    | RoomBase.broadcast(message, exclude)            | 玩家说话/移动时通知房间内其他对象                                              |
| NPC 心跳驱动行为  | NpcBase.onHeartbeat() → onAI()                  | HeartbeatManager 驱动 NPC 自主行动                                             |

## 详细需求

### 1. RoomBase — 房间基类

继承 BaseEntity，`static virtual = true`（单例房间）。

**便捷方法：**

- `getShort(): string` — 获取房间简短描述，fallback `'未知地点'`
- `getLong(): string` — 获取房间详细描述，fallback `'这里什么也没有。'`
- `getExits(): Record<string, string>` — 获取出口列表，格式 `{ direction: blueprintId }`
- `getExit(direction): string | undefined` — 查询某方向出口的目标蓝图 ID
- `getCoordinates(): { x: number; y: number; z?: number } | undefined` — 获取地图坐标
- `broadcast(message, exclude?)` — 广播消息给房间内所有对象（遍历 inventory，排除指定对象）

**出口设计：** exits 作为 dbase 属性，简单的 `{ direction: blueprintId }` 映射。复杂出口（锁门、隐藏、条件通行）可在值中扩展为对象（后续按需）。

### 2. Area — 区域管理器

继承 BaseEntity，`static virtual = true`（单例区域）。

**便捷方法：**

- `getName(): string` — 获取区域名称，fallback `'未知区域'`
- `getLevelRange(): { min: number; max: number } | undefined` — 获取等级范围
- `getRoomIds(): string[]` — 获取包含的房间蓝图 ID 列表
- `getSpawnRules(): Array<SpawnRule>` — 获取 NPC 刷新规则

**SpawnRule 格式：** `{ blueprintId: string; roomId: string; count: number; interval: number }`

### 3. NpcBase — NPC 基类

继承 BaseEntity，`static virtual = false`（可克隆）。

**便捷方法：**

- `getName(): string` — 获取 NPC 名字，fallback `'无名'`
- `getShort(): string` — 获取简短描述（房间内显示），fallback 为 getName()
- `getLong(): string` — 获取详细描述（look 查看），fallback `'你看到了${getName()}。'`
- `onHeartbeat()` — 心跳回调，默认调用 onAI()
- `onAI(): void` — AI 行为钩子（蓝图覆写）
- `onChat(speaker, message): void` — 对话接口（蓝图覆写）

**注意：** 战斗属性（hp/attack/defense 等）不在 Layer 3 定义，留给 Phase 2 战斗系统。

### 4. ItemBase — 物品基类

继承 BaseEntity，`static virtual = false`（可克隆）。

**便捷方法：**

- `getName(): string` — 获取物品名字，fallback `'未知物品'`
- `getShort(): string` — 获取简短描述，fallback 为 getName()
- `getLong(): string` — 获取详细描述，fallback `'这是一个${getName()}。'`
- `getType(): string` — 获取物品类型，fallback `'misc'`
- `getWeight(): number` — 获取重量，fallback `0`
- `getValue(): number` — 获取价值，fallback `0`
- `isStackable(): boolean` — 是否可堆叠，fallback `false`

**子类体系：** Layer 3 只做基础 ItemBase，通过 dbase `type` 字段区分类型。多子类继承（WeaponBase/ArmorBase/PotionBase 等）留给后续单独探讨。

## 关联文档

| 文档          | Issue | 状态   | 关键继承点                       |
| ------------- | ----- | ------ | -------------------------------- |
| Scope Layer 3 | #63   | open   | 全部方案决策来源                 |
| Epic Layer 2  | #57   | closed | BlueprintLoader 蓝图加载机制     |
| Epic Layer 1  | #49   | closed | HeartbeatManager + ObjectManager |
| Epic Layer 0  | #38   | closed | BaseEntity 基类                  |
| 项目蓝图      | #1    | open   | Layer 架构规划                   |

## 现有代码基础

### 可复用

| 模块             | 路径                                     | 复用方式                                                          |
| ---------------- | ---------------------------------------- | ----------------------------------------------------------------- |
| BaseEntity       | `server/src/engine/base-entity.ts`       | 子类继承，使用 dbase/environment/events 全部能力                  |
| BlueprintLoader  | `server/src/engine/blueprint-loader.ts`  | 蓝图加载机制（子类通过 `export default` + `static virtual` 注册） |
| BlueprintFactory | `server/src/engine/blueprint-factory.ts` | 创建/克隆实例（子类实例化）                                       |
| ObjectManager    | `server/src/engine/object-manager.ts`    | 对象注册、GC（子类实例管理）                                      |
| HeartbeatManager | `server/src/engine/heartbeat-manager.ts` | NPC 心跳驱动（NpcBase.enableHeartbeat()）                         |
| ServiceLocator   | `server/src/engine/service-locator.ts`   | 子类访问全局服务                                                  |

### 需修改

- 无需修改任何已有文件（纯新增）

### 需新建

- `server/src/engine/game-objects/room-base.ts` — 房间基类
- `server/src/engine/game-objects/area.ts` — 区域管理器
- `server/src/engine/game-objects/npc-base.ts` — NPC 基类
- `server/src/engine/game-objects/item-base.ts` — 物品基类
- `server/src/engine/game-objects/index.ts` — 统一导出
- `server/src/engine/__tests__/room-base.spec.ts` — 房间基类测试
- `server/src/engine/__tests__/area.spec.ts` — 区域管理器测试
- `server/src/engine/__tests__/npc-base.spec.ts` — NPC 基类测试
- `server/src/engine/__tests__/item-base.spec.ts` — 物品基类测试

## 代码影响范围

- **后端服务**: `server/src/engine/game-objects/` — 新增 5 个文件（4 子类 + 1 导出）
- **测试**: `server/src/engine/__tests__/` — 新增 4 个测试文件
- **前端界面**: 无影响
- **数据层**: 无影响
- **已有代码**: 无修改

## 任务拆分（初步）

- [ ] 实现 RoomBase 房间基类 + 测试
- [ ] 实现 Area 区域管理器 + 测试
- [ ] 实现 NpcBase NPC 基类 + 测试
- [ ] 实现 ItemBase 物品基类 + 测试
- [ ] 创建 game-objects/index.ts 统一导出

## 验收标准

- [ ] RoomBase 继承 BaseEntity，`static virtual = true`
- [ ] RoomBase.broadcast() 能遍历 inventory 发送消息，排除指定对象
- [ ] RoomBase.getExits()/getExit() 能正确读取 dbase 中的出口数据
- [ ] Area 继承 BaseEntity，`static virtual = true`
- [ ] Area.getSpawnRules() 能正确返回 NPC 刷新规则
- [ ] NpcBase 继承 BaseEntity，`static virtual = false`
- [ ] NpcBase.onHeartbeat() 调用 onAI()
- [ ] NpcBase.onChat() 接收 speaker 和 message 参数
- [ ] ItemBase 继承 BaseEntity，`static virtual = false`
- [ ] ItemBase 提供 getName/getShort/getLong/getType/getWeight/getValue/isStackable 便捷方法
- [ ] 所有子类的便捷方法在 dbase 无值时返回合理默认值
- [ ] 所有新代码有完整单元测试，现有 195 个测试不受影响
- [ ] game-objects/index.ts 统一导出所有子类

## 边界和约束

- 子类只提供**行为框架和便捷方法**，不硬编码属性值
- 蓝图在 `create()` 中通过 `set()` 设置具体属性
- 战斗相关属性不在本层定义
- ItemBase 子类体系（WeaponBase 等）不在本层定义
- 不包含示例蓝图文件
- 不修改任何已有文件（纯新增）

---

> CX 工作流 | PRD | Scope #63
