# PRD: NPC 基础系统 — Phase 0（活过来 + 会说话）

## 基本信息

- **创建时间**: 2026-02-04
- **优先级**: P1（高）
- **技术栈**: TypeScript (NestJS + React Native + pnpm monorepo)
- **关联 Scope**: #134（NPC 系统细化设计）
- **关联世界观**: #84（天衍世界观设定）
- **关联地图**: #85（出生点地图 — 裂隙镇）

## 功能概述

实现 NPC 基础系统，让裂隙镇的 8-10 个 NPC 在游戏世界中"活过来"——出现在房间里、能被玩家看到和查看、能被玩家对话询问、会自己随机闲聊。替换前端的 mock NPC 数据为服务端实时推送的真实数据。

**一句话目标**：玩家走进裂隙镇的酒馆，能看到酒保在擦杯子，能 `look 酒保` 查看他的描述，能 `ask 酒保 about 消息` 打听情报，酒保还会时不时自言自语。

## 用户场景

### 场景 1：玩家进入房间，看到 NPC

玩家从北街走到酒馆，前端 NPC 列表自动更新，显示"酒保"和"神秘旅人"两个 NPC 卡片（名字、性别、势力标签、等级、血条）。

### 场景 2：查看 NPC

玩家输入 `look 酒保`，GameLog 显示酒保的详细描述：

```
断崖酒馆·酒保
「裂隙镇」酒保 [男]
柜台后的酒保四十来岁，一张不苟言笑的国字脸。他擦杯子的动作不紧不慢，
但每个进门的人都逃不过他那双精明的眼睛。据说他在裂隙镇开了二十年酒馆，
什么人没见过，什么事没听过。
```

### 场景 3：向 NPC 提问

玩家输入 `ask 酒保 about 消息`，GameLog 显示：

```
你向酒保打听消息。
酒保放下手里的杯子，压低声音说：「最近裂谷深处不太平，有人说看到
奇怪的光芒。北门的卫兵加了岗，你要是想往北走，最好小心点。」
```

玩家输入 `ask 酒保 about 天裂`，酒保匹配不到关键词，返回默认回答：

```
酒保不置可否地摇了摇头：「这种事我可不清楚，你去问问广场上的老镇长。」
```

### 场景 4：NPC 随机闲聊

玩家站在酒馆里，每隔一段时间，GameLog 中出现 NPC 的随机行为：

```
酒保擦了擦柜台上的酒渍。
神秘旅人低头喝了一口酒，若有所思。
```

## 详细需求

### 1. NPC 属性扩展

NpcBase 需要支持以下 Dbase 属性（蓝图中通过 `set()` 设置）：

| 属性        | 类型                   | 说明             | 示例                                    |
| ----------- | ---------------------- | ---------------- | --------------------------------------- |
| name        | string                 | 名字（已有）     | "酒保"                                  |
| short       | string                 | 简短描述（已有） | "一个不苟言笑的中年男子"                |
| long        | string                 | 详细描述（已有） | 长文本                                  |
| title       | string                 | 头衔/归属        | "裂隙镇"                                |
| gender      | string                 | 性别             | "male" / "female"                       |
| faction     | string                 | 势力归属         | Factions.NONE                           |
| attitude    | string                 | 态度             | "friendly" / "neutral"                  |
| level       | number                 | 等级             | 15                                      |
| chat_chance | number                 | 闲聊概率(%)      | 15                                      |
| chat_msg    | string[]               | 闲聊内容数组     | ["酒保擦了擦杯子。", ...]               |
| inquiry     | Record<string, string> | 问答映射         | { "消息": "最近...", "default": "..." } |

需要在 `packages/core` 中新增 Factions 常量文件。

### 2. 裂隙镇 NPC 蓝图

在 `server/src/world/` 下创建 NPC 蓝图文件：

| NPC      | 蓝图路径                               | 房间     | 势力             |
| -------- | -------------------------------------- | -------- | ---------------- |
| 老镇长   | `npc/rift-town/town-elder.ts`          | 镇中广场 | NONE             |
| 酒保     | `npc/rift-town/bartender.ts`           | 酒馆     | NONE             |
| 神秘旅人 | `npc/rift-town/mysterious-traveler.ts` | 酒馆     | AN_HE(隐藏)      |
| 客栈老板 | `npc/rift-town/innkeeper.ts`           | 客栈     | NONE             |
| 白发药师 | `npc/rift-town/herbalist.ts`           | 药铺     | BAI_MAN(退隐)    |
| 老周铁匠 | `npc/rift-town/blacksmith.ts`          | 铁匠铺   | CHENG_TIAN(退役) |
| 杂货商   | `npc/rift-town/merchant.ts`            | 杂货铺   | SAN_MENG         |
| 老乞丐   | `npc/rift-town/old-beggar.ts`          | 南街     | NONE             |
| 北门卫兵 | `npc/rift-town/north-guard.ts`         | 北门     | CHENG_TIAN       |
| 南门卫兵 | `npc/rift-town/south-guard.ts`         | 南门     | CHENG_TIAN       |

每个蓝图需要定义：name、short、long、title、gender、faction、attitude、level、chat_chance、chat_msg、inquiry。

同时更新 Area `area/rift-town/area.ts` 的 spawn_rules，指定每个 NPC 刷新到哪个房间。

### 3. SpawnManager 刷新管理器

新增 `server/src/engine/spawn-manager.ts`：

- 服务启动时读取所有 Area 的 spawn_rules
- 对每条规则：clone NPC 蓝图实例 → moveTo 指定房间
- 周期检查：NPC 死亡或消失后按 interval 补刷
- 注入 NestJS 模块，随引擎启动

### 4. NPC 列表推送

玩家进入房间时（roomInfo 推送时），附带当前房间内的 NPC 列表：

```typescript
// roomInfo 消息扩展
{
  type: 'roomInfo',
  data: {
    short: '裂隙镇·断崖酒馆',
    long: '酒馆依着西侧断崖而建...',
    exits: ['east'],
    exitNames: { east: '镇中广场' },
    npcs: [                          // ← 新增
      {
        id: 'npc/rift-town/bartender#1',
        name: '酒保',
        title: '裂隙镇',
        gender: 'male',
        faction: '',
        level: 15,
        hpPct: 100,
      },
      {
        id: 'npc/rift-town/mysterious-traveler#1',
        name: '神秘旅人',
        title: '',
        gender: 'male',
        faction: '',           // 暗河身份对玩家隐藏
        level: 30,
        hpPct: 100,
      }
    ]
  }
}
```

### 5. 前端 NPC 真实数据

- 接收 roomInfo 中的 npcs 数据，写入 Zustand store
- 删除 INITIAL_NPCS mock 数据
- NpcCard 组件适配新字段：显示 title（如有）、势力标签颜色
- NPC 卡片颜色规则：根据 attitude 或 faction 决定边框/名字颜色

### 6. look NPC 指令

扩展现有 `look` 命令：

- `look` 不带参数 → 查看房间（现有行为不变）
- `look <npc名>` → 查看 NPC 详情
- 匹配规则：在当前房间 inventory 中查找 name 匹配的 NPC
- 返回格式：long 描述 + title/faction/level 信息

### 7. ask 对话指令

新增 `ask` 命令（`server/src/engine/commands/std/ask.ts`）：

- 格式：`ask <npc名> about <关键词>`
- 简写支持：`ask <npc名> <关键词>`
- 在当前房间查找目标 NPC
- 匹配 NPC 的 inquiry mapping
- 匹配到 → 返回对应回答
- 匹配不到 → 返回 inquiry.default（如无 default 则返回通用提示）
- 触发 NPC 的 onChat 钩子

### 8. chat 闲聊系统

在 NpcBase 的 `onAI()` 中实现：

- 每次心跳检查 `chat_chance`（百分比概率）
- 命中 → 从 `chat_msg` 数组随机选一条
- 通过房间 `broadcast()` 广播给房间内所有玩家
- 前端在 GameLog 中显示（NPC 名字 + 内容，区分颜色）

## 关联文档

- Scope: #134（NPC 系统细化设计）
- 世界观: #84（天衍世界观设定 — 八方势力）
- 裂隙镇地图: #85（出生点地图 — 15 个房间 + NPC 规划）

## 现有代码基础

### 可直接使用

- `NpcBase`（server/src/engine/game-objects/npc-base.ts）— 有 onAI/onChat 钩子
- `LivingBase`（living-base.ts）— 有 getName/getShort/getLong/go
- `BaseEntity`（base-entity.ts）— 有 Dbase set/get、Environment、Events
- `BlueprintFactory.clone()`（blueprint-factory.ts）— 克隆创建 NPC 实例
- `Area.getSpawnRules()`（area.ts）— SpawnRule 接口已定义
- `RoomBase.broadcast()`（room-base.ts）— 房间广播
- `HeartbeatManager`（heartbeat-manager.ts）— 心跳驱动
- `look` 命令（commands/std/look.ts）— 需扩展支持 look NPC
- 前端 NpcList/NpcCard — 已有组件，需适配真实数据
- Zustand store nearbyNpcs/setNpcs — 已有数据和 action

### 需要新建

- `packages/core/src/constants/factions.ts` — Factions 常量
- `server/src/engine/spawn-manager.ts` — SpawnManager
- `server/src/world/npc/rift-town/*.ts` — 10 个 NPC 蓝图
- `server/src/engine/commands/std/ask.ts` — ask 指令
- `packages/core/src/factory/handlers/nearbyNpcs.ts` — NPC 列表消息（或扩展 roomInfo）

### 需要修改

- `server/src/engine/game-objects/npc-base.ts` — 扩展 onAI 闲聊逻辑
- `server/src/engine/commands/std/look.ts` — 扩展支持 look NPC
- `server/src/world/area/rift-town/area.ts` — 添加 spawn_rules
- `server/src/websocket/handlers/room-utils.ts` — sendRoomInfo 附带 NPC 列表
- `server/src/engine/engine.module.ts` — 注册 SpawnManager
- `client/src/stores/useGameStore.ts` — 删除 INITIAL_NPCS，适配新字段
- `client/src/components/game/NpcList/NpcCard.tsx` — 适配新字段
- `client/App.tsx` — 处理 roomInfo 中的 npcs 数据

## 代码影响范围

- 前端 + 后端 + 共享包（core）
- 新增 API/消息：roomInfo 扩展 npcs 字段、commandResult 扩展 ask 结果
- 新增文件：~15 个（SpawnManager + Factions 常量 + 10 NPC 蓝图 + ask 命令）
- 修改文件：~8 个

## 任务拆分（初步）

- [ ] NPC 属性扩展 + Factions 常量
- [ ] 裂隙镇 NPC 蓝图（10 个）
- [ ] SpawnManager 刷新管理器
- [ ] NPC 列表推送协议（roomInfo 扩展）
- [ ] 前端 NPC 真实数据适配
- [ ] look NPC 指令扩展
- [ ] ask 对话指令
- [ ] chat 闲聊系统

## 验收标准

- [ ] 玩家登录后进入裂隙镇，每个房间能看到对应的 NPC（前端 NpcList 显示真实数据）
- [ ] `look 酒保` 返回酒保的详细描述、头衔、势力、等级
- [ ] `ask 老镇长 about 裂隙镇` 返回老镇长关于裂隙镇的介绍
- [ ] `ask 老镇长 about 随便什么` 返回 default 回答
- [ ] 站在房间中，NPC 会随机说话，内容显示在 GameLog
- [ ] 走到不同房间，NPC 列表随 roomInfo 自动更新
- [ ] 前端 NpcCard 不再使用 mock 数据
- [ ] Factions 常量在 packages/core 中定义，前后端共享

---

> CX 工作流 | PRD | Scope #134
