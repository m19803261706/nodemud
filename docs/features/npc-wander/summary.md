# NPC 漫游系统

NPC 按概率在白名单房间间自动移动，附带方向感知的富文本广播文案，为游戏世界增添生气。

## 功能概述

漫游系统让 NPC 在心跳周期中以可配置的概率从当前房间移动到白名单内的其他房间。移动时自动生成带方向信息的离开/到达广播文案，通知在场玩家 NPC 的动向。漫游与闲聊互斥：漫游成功则跳过本次闲聊，避免 NPC 刚到新房间就说话。

## 核心能力

- **概率驱动移动**: 每次心跳按 `chance` 百分比概率判定是否漫游
- **白名单房间**: 只在预定义的 `rooms` 列表中移动，不会跑到不该去的地方
- **方向感知广播**: 直连房间使用带方向的文案（如"向北走去"/"从南方走来"），不直连房间使用通用文案
- **文案可覆盖**: 蓝图通过 dbase 字段自定义离开/到达文案，支持 `{name}` 和 `{dir}` 占位符
- **前端增量通知**: 移动后自动调用 `notifyRoomObjectAdded/Removed` 更新在场玩家的 NPC 列表
- **行为互斥**: 漫游成功返回 `true`，`onAI()` 跳过 `doChat()`，避免不自然的行为叠加
- **状态守卫**: 死亡状态和战斗中均不触发漫游

## 关键文件

| 路径 | 职责 |
|------|------|
| `server/src/engine/game-objects/npc-base.ts` | `WanderConfig` 接口定义 + `doWander()` 核心方法 + 4 组默认文案池 |
| `server/src/engine/__tests__/npc-wander.spec.ts` | 14 项单元测试，覆盖全部边界场景 |
| `server/src/world/npc/rift-town/old-beggar.ts` | 老乞丐漫游配置（5%/5 房间） |
| `server/src/world/npc/rift-town/waiter.ts` | 店小二漫游配置（8%/2 房间） |
| `server/src/world/npc/songyang/patrol-disciple.ts` | 巡山弟子漫游配置（3%/4 房间） |

## 数据结构

### WanderConfig 接口

```typescript
/** NPC 漫游配置 */
export interface WanderConfig {
  /** 每次心跳漫游概率（百分比，如 5 = 5%） */
  chance: number;
  /** 允许漫游的房间 ID 白名单 */
  rooms: string[];
}
```

在 NPC 蓝图的 `create()` 中通过 `this.set('wander', { ... })` 设置。

### dbase 可选字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `wander` | `WanderConfig` | 漫游配置（必须） |
| `wander_leave_msg` | `string[]` | 自定义离开文案池，覆盖默认文案。支持 `{name}` (NPC 名字) 和 `{dir}` (方向中文) 占位符 |
| `wander_arrive_msg` | `string[]` | 自定义到达文案池，覆盖默认文案。占位符同上 |

### 默认文案池

**直连房间（带方向）:**

离开文案：
- `[emote][npc]{name}[/npc]向{dir}走去。[/emote]`
- `[emote][npc]{name}[/npc]的身影渐渐消失在{dir}。[/emote]`
- `[emote][npc]{name}[/npc]缓步向{dir}走去。[/emote]`

到达文案：
- `[emote][npc]{name}[/npc]从{dir}走来。[/emote]`
- `[emote][npc]{name}[/npc]从{dir}缓步走来。[/emote]`
- `[emote][npc]{name}[/npc]的身影从{dir}出现。[/emote]`

**不直连房间（通用）:**

- 离开：`[emote][npc]{name}[/npc]转身离开了。[/emote]`
- 到达：`[emote][npc]{name}[/npc]来到此处。[/emote]`

## 行为流程

```
onHeartbeat()
  └─ onAI()
       ├─ 死亡状态 → 直接返回
       ├─ 战斗中 → doCombatAI() → 返回
       ├─ doWander()
       │    ├─ 无配置 / chance=0 / rooms 为空 → return false
       │    ├─ 概率未命中 → return false
       │    ├─ 当前房间非 RoomBase → return false
       │    ├─ 白名单排除当前房间后无候选 → return false
       │    ├─ 目标房间不存在 → return false
       │    ├─ 查找方向（遍历当前房间 exits 匹配目标 ID）
       │    ├─ 构建文案（直连 → 带方向 / 不直连 → 通用）
       │    ├─ moveTo(targetRoom, { quiet: true })
       │    ├─ 旧房间: broadcast(离开文案) + notifyRoomObjectRemoved
       │    ├─ 新房间: broadcast(到达文案) + notifyRoomObjectAdded
       │    └─ return true
       └─ doWander() 返回 false → doChat()（闲聊逻辑）
```

关键细节：
- 使用 `moveTo(quiet: true)` 静默移动，不触发默认的移动事件链
- 移动后手动 broadcast 和 notify，完全控制文案内容
- 方向翻译依赖 `getDirectionCN()` / `getOppositeDirectionCN()`（来自 `room-utils`）

## 已启用 NPC

| NPC | chance | 房间数 | 平均移动间隔 | 特点 |
|-----|--------|--------|-------------|------|
| 老乞丐 | 5% | 5 | ~40s | 裂隙镇公共区域闲逛（南街/广场/北街/酒馆/南门） |
| 巡山弟子 | 3% | 4 | ~67s | 嵩阳宗山道区域巡视（古松亭/山道上中下段） |
| 店小二 | 8% | 2 | ~25s | 客栈楼上楼下穿梭，体现忙碌 |

> 平均移动间隔 = 心跳间隔(2s) / chance% = 2 / (chance/100)。实际因概率波动会有偏差。

## 测试覆盖

14 项单元测试（`server/src/engine/__tests__/npc-wander.spec.ts`）：

1. 无 `wander` 配置时不漫游
2. `chance=0` 时不漫游
3. `rooms` 为空数组时不漫游
4. 白名单只有当前房间时不移动
5. `chance=100` 时必定漫游到其他房间
6. 漫游后旧房间收到离去广播和 `notifyRoomObjectRemoved`
7. 漫游后新房间收到到达广播和 `notifyRoomObjectAdded`
8. 直连房间的广播文案包含方向信息
9. 不直连房间时使用通用文案（无方向）
10. 目标房间不存在时静默跳过
11. 漫游成功后跳过闲聊（互斥验证）
12. 战斗中不漫游（`onAI` 守卫）
13. 死亡状态不漫游（`onAI` 守卫）
14. 蓝图可通过 dbase 覆盖漫游文案

## 扩展指南

### 为新 NPC 添加漫游

在 NPC 蓝图的 `create()` 方法中添加 `wander` 配置即可：

```typescript
// 在 create() 中设置
this.set('wander', {
  chance: 5,   // 每心跳 5% 概率
  rooms: [
    'area/zone/room-a',
    'area/zone/room-b',
    'area/zone/room-c',
  ],
});
```

**注意事项:**
- `rooms` 必须包含 NPC 出生房间的 ID，否则 NPC 移动后可能回不来
- 房间 ID 必须是 `ObjectManager` 中已注册的有效房间
- `chance` 是百分比整数，建议 3-10 之间：3% 约 67s 移动一次，10% 约 20s 移动一次

### 自定义文案

通过 dbase 的 `wander_leave_msg` 和 `wander_arrive_msg` 字段覆盖默认文案：

```typescript
this.set('wander_leave_msg', [
  '[emote][npc]{name}[/npc]踉踉跄跄地向{dir}走去。[/emote]',
  '[emote][npc]{name}[/npc]晃晃悠悠地向{dir}移去。[/emote]',
]);
this.set('wander_arrive_msg', [
  '[emote][npc]{name}[/npc]踉踉跄跄地从{dir}走来。[/emote]',
  '[emote][npc]{name}[/npc]跌跌撞撞地从{dir}出现。[/emote]',
]);
```

**占位符:**
- `{name}` — 替换为 NPC 的 `getName()` 返回值
- `{dir}` — 离开文案中替换为目标方向中文（如"北"），到达文案中替换为来源方向中文（如"南方"）

**富文本标签:** 文案应使用 `[emote]...[/emote]` 包裹，NPC 名字用 `[npc]...[/npc]` 标记，遵循项目富文本协议。

### 调整概率参数

| chance 值 | 平均移动间隔（心跳 2s） | 适用场景 |
|-----------|------------------------|---------|
| 1-2% | 100-200s | 极少移动的 NPC（如冥想的僧人） |
| 3-5% | 40-67s | 缓缓走动的 NPC（巡逻、闲逛） |
| 8-10% | 20-25s | 忙碌穿梭的 NPC（店小二、信使） |
| 15-20% | 10-13s | 频繁移动（慎用，可能让玩家难以交互） |

> 概率过高会导致 NPC 频繁移动，玩家难以找到并交互。建议不超过 10%。

### 房间白名单设计建议

- **区域一致性**: 漫游房间应在同一区域内，NPC 不应跨区域移动（如裂隙镇 NPC 不该跑到嵩阳宗）
- **路径合理性**: 尽量让白名单房间彼此直连或近邻，避免 NPC "瞬移"到远处触发通用文案
- **包含出生点**: 白名单必须包含 NPC 的出生房间，确保 NPC 有机会回到初始位置
- **避免特殊房间**: 不要把副本内部、私人空间等特殊房间加入白名单

### 与其他系统的交互

- **闲聊系统**: 漫游成功会跳过本次闲聊，两个系统自动互斥
- **战斗系统**: 战斗中 `onAI()` 不会调用 `doWander()`，NPC 不会在打架时跑掉
- **死亡系统**: 死亡状态下 `onAI()` 直接返回，不会触发漫游
- **前端通知**: 漫游自动触发 `notifyRoomObjectAdded/Removed`，前端 NPC 列表实时更新

---

> Commit: `9e66af8` | 日期: 2026-02-19 | 变更: 5 文件, +385/-2 行
