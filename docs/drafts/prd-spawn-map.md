# PRD: 出生地图 — 裂隙镇

## 基本信息

- **创建时间**: 2026-02-02
- **优先级**: P1 高
- **技术栈**: TypeScript (NestJS + React Native), pnpm monorepo

## 功能概述

实现天衍世界的玩家出生点地图——裂隙镇。包含 15 个房间的蓝图文件和 1 个 Area 区域定义，使用引擎现有的 RoomBase + Area + BlueprintLoader 体系。地图采用十字形布局，坐标规则化，支持八方向移动。

**本次仅实现地图（房间蓝图 + 区域定义），不实现 NPC 和物品。** NPC 是后续独立的史诗级任务。

## 用户场景

### 场景 1: 系统处理 — 蓝图加载

服务器启动时，BlueprintLoader 扫描 `server/src/world/area/rift-town/` 目录，自动注册所有房间蓝图和 Area。虚拟蓝图（`static virtual = true`）自动创建单例实例。

### 场景 2: 用户交互 — 探索地图

玩家使用 `look` 指令查看房间描述（含富文本标记），使用 `go` 指令在房间间移动。八方向（north/south/east/west/northeast/northwest/southeast/southwest）+ 上下（up/down）均已在 go 指令中支持。

### 场景 3: 用户交互 — 出生点放置

角色创建完成后，PlayerBase 实例被放入出生点房间（镇中广场 `area/rift-town/square`）。

## 关联文档

- **Scope #85**: [Scope] 出生点地图 — 裂隙镇（坐标系统 + 房间布局 + NPC）— 完整的地图设计
- **Scope #86**: [Scope] 富文本标记协议 — 房间描述使用富文本标记
- **Epic #89**: 富文本协议实现 — 已完成，look/say/go 已支持富文本输出
- **Epic #75**: Layer 4 指令系统 — 已完成，go/look/say 指令就绪
- **Epic #66**: Layer 3 游戏对象 — 已完成，RoomBase/Area/NpcBase/ItemBase 就绪

## 现有代码基础

### 引擎体系（全部就绪）

| 组件 | 路径 | 状态 |
|------|------|------|
| RoomBase | `server/src/engine/game-objects/room-base.ts` | 就绪 — getShort/getLong/getExits/getExit/getCoordinates/broadcast |
| Area | `server/src/engine/game-objects/area.ts` | 就绪 — getName/getLevelRange/getRoomIds/getSpawnRules |
| BlueprintLoader | `server/src/engine/blueprint-loader.ts` | 就绪 — scanAndLoad 扫描 world/ 目录 |
| BlueprintFactory | `server/src/engine/blueprint-factory.ts` | 就绪 — createVirtual/getVirtual |
| EngineModule | `server/src/engine/engine.module.ts` | 就绪 — worldDir = `path.join(__dirname, '..', 'world')` |
| look 指令 | `server/src/engine/commands/std/look.ts` | 就绪 — 富文本输出房间描述 |
| go 指令 | `server/src/engine/commands/std/go.ts` | 就绪 — 八方向 + up/down 移动 |

### World 目录（已创建，内容为空）

```
server/src/world/
├── area/    (.gitkeep)
├── item/    (.gitkeep)
└── npc/     (.gitkeep)
```

### 蓝图 ID 推断规则

BlueprintLoader.inferBlueprintId: 取相对于 worldDir 的路径，去掉后缀。
- `server/src/world/area/rift-town/square.ts` → `area/rift-town/square`

## 详细需求

### 1. 裂隙镇 Area 定义

创建 `server/src/world/area/rift-town/area.ts`，继承 Area 基类:
- name: "裂隙镇"
- level_range: { min: 1, max: 5 }
- rooms: 15 个房间的蓝图 ID 列表
- region: "中原·裂谷地带"
- description: 区域描述

### 2. 15 个房间蓝图

每个房间继承 RoomBase，在 `create()` 中设置:
- `short`: 房间简短名称（带富文本标记由 look 指令处理，蓝图中存纯文本）
- `long`: 房间详细描述（纯文本，look 指令会包裹 `[rd]` 标记）
- `exits`: 出口映射 `Record<string, string>`，value 为目标房间蓝图 ID
- `coordinates`: `{ x, y, z }` 坐标

房间列表（按 Scope #85）:

| # | 蓝图 ID | short | 坐标 |
|---|---------|-------|------|
| 1 | area/rift-town/square | 裂隙镇·镇中广场 | (0,0,0) |
| 2 | area/rift-town/north-street | 裂隙镇·北街 | (0,-1,0) |
| 3 | area/rift-town/south-street | 裂隙镇·南街 | (0,1,0) |
| 4 | area/rift-town/tavern | 裂隙镇·断崖酒馆 | (-1,0,0) |
| 5 | area/rift-town/inn | 裂隙镇·安歇客栈 | (1,0,0) |
| 6 | area/rift-town/herb-shop | 裂隙镇·济世堂 | (-1,-1,0) |
| 7 | area/rift-town/smithy | 裂隙镇·老周铁匠铺 | (1,-1,0) |
| 8 | area/rift-town/notice-board | 裂隙镇·告示牌旁 | (-1,1,0) |
| 9 | area/rift-town/general-store | 裂隙镇·万宝杂货 | (1,1,0) |
| 10 | area/rift-town/north-road | 裂谷北道 | (0,-2,0) |
| 11 | area/rift-town/south-road | 裂谷南道 | (0,2,0) |
| 12 | area/rift-town/north-gate | 裂隙镇·北门 | (0,-3,0) |
| 13 | area/rift-town/south-gate | 裂隙镇·南门 | (0,3,0) |
| 14 | area/rift-town/underground | 裂隙镇·地下暗道入口 | (0,0,-1) |

### 3. 出口连接

严格按照 Scope #85 出口连接总表，确保:
- 规则移动方向与坐标偏移一致（north = y-1, south = y+1, east = x+1, west = x-1）
- 特殊移动: 镇中广场 down → 地下暗道入口，地下暗道 up → 镇中广场
- 北门/南门的北/南出口暂不设置（留给后续区域扩展）

### 4. 不实现的内容（明确排除）

- **NPC 蓝图**: 不创建任何 NPC（老镇长、酒保、铁匠等留给后续 Epic）
- **物品蓝图**: 不创建任何物品
- **Area.spawn_rules**: 不设置 NPC 刷新规则
- **玩家出生点放置逻辑**: 不修改 PlayerBase / 角色创建流程（后续单独处理）
- **前端地图 UI / 九宫格**: 不在本次实现
- **寻路算法**: 不在本次实现

## 代码影响范围

### 新增文件 (16 个)

```
server/src/world/area/rift-town/
├── area.ts              # Area 区域定义
├── square.ts            # 镇中广场
├── north-street.ts      # 北街
├── south-street.ts      # 南街
├── tavern.ts            # 酒馆
├── inn.ts               # 客栈
├── herb-shop.ts         # 药铺
├── smithy.ts            # 铁匠铺
├── notice-board.ts      # 告示牌
├── general-store.ts     # 杂货铺
├── north-road.ts        # 裂谷北道
├── south-road.ts        # 裂谷南道
├── north-gate.ts        # 北门
├── south-gate.ts        # 南门
└── underground.ts       # 地下暗道入口
```

### 修改文件 (0 个)

无需修改任何现有文件。引擎体系已就绪，BlueprintLoader 自动扫描 world/ 目录。

### 测试文件 (1 个)

新增集成测试验证:
- 所有蓝图能正确加载
- 出口连接双向一致性
- 坐标与方向偏移一致性
- Area 包含所有 15 个房间 ID

## 任务拆分（初步）

- [ ] Phase 1: 创建 Area 定义 + 15 个房间蓝图文件
- [ ] Phase 2: 集成测试 — 蓝图加载 + 出口一致性 + 坐标验证

## 验收标准

- [ ] `server/src/world/area/rift-town/` 下包含 area.ts + 14 个房间蓝图文件
- [ ] 服务器启动后 BlueprintLoader 成功加载 15 个蓝图（1 Area + 14 Room）
- [ ] 所有房间的 short/long/exits/coordinates 与 Scope #85 一致
- [ ] 出口连接双向一致（A→B 则 B→A，方向互为反向）
- [ ] 坐标与方向偏移严格对应（north 移动 y-1，east 移动 x+1 等）
- [ ] 集成测试全部通过
- [ ] 现有引擎代码零修改（纯新增蓝图文件）

---
> CX 工作流 | PRD
