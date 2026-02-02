# Design Doc: 出生地图 — 裂隙镇

## 关联

- PRD: #94
- Scope: #85（裂隙镇完整设计）
- 关联 Epic: #66（Layer 3 游戏对象）、#75（Layer 4 指令系统）、#89（富文本协议）
- 关联 Design: #65（Layer 3 Design — RoomBase/Area 接口定义）

## 基于现有代码

| 模块 | 路径 | 复用方式 |
|------|------|---------|
| RoomBase | `game-objects/room-base.ts` | 房间蓝图继承，使用 `set()` 设置 short/long/exits/coordinates |
| Area | `game-objects/area.ts` | 区域蓝图继承，使用 `set()` 设置 name/level_range/rooms |
| BlueprintLoader | `blueprint-loader.ts` | 自动扫描 `server/src/world/` 加载蓝图 |
| BlueprintFactory | `blueprint-factory.ts` | `createVirtual()` 为 virtual=true 蓝图创建单例 |
| EngineModule | `engine.module.ts` | `worldDir = path.join(__dirname, '..', 'world')` 已配置 |
| look 指令 | `commands/std/look.ts` | 已用 `rt()/bold()` 富文本渲染房间信息 |
| go 指令 | `commands/std/go.ts` | 已支持八方向 + up/down 移动 |

**零修改**：不改任何现有文件，纯新增蓝图文件。

## 架构概览

```
BlueprintLoader.scanAndLoad(worldDir)
  ↓ 递归扫描 server/src/world/
  ↓ 发现 area/rift-town/*.ts
  ↓ require() + inferBlueprintId()
  ↓
BlueprintRegistry.register()
  ↓ id: "area/rift-town/square", virtual: true
  ↓
BlueprintFactory.createVirtual("area/rift-town/square")
  ↓ new RiftTownSquare("area/rift-town/square")
  ↓ ObjectManager.register(instance)
  ↓ instance.create()  → set('short', '裂隙镇·镇中广场') ...
  ↓
ObjectManager 保存实例
  ↓
玩家执行 look → RoomBase.getShort()/getLong()/getExits()
玩家执行 go north → RoomBase.getExit('north') → "area/rift-town/north-street"
                   → BlueprintFactory.getVirtual() → 目标房间实例
                   → LivingBase.moveTo(targetRoom)
```

## 后端设计

### 代码路径

```
server/src/world/area/rift-town/
├── area.ts              # RiftTownArea — 区域定义
├── square.ts            # 镇中广场 (0,0,0) — 出生点
├── north-street.ts      # 北街 (0,-1,0)
├── south-street.ts      # 南街 (0,1,0)
├── tavern.ts            # 酒馆 (-1,0,0)
├── inn.ts               # 客栈 (1,0,0)
├── herb-shop.ts         # 药铺 (-1,-1,0)
├── smithy.ts            # 铁匠铺 (1,-1,0)
├── notice-board.ts      # 告示牌 (-1,1,0)
├── general-store.ts     # 杂货铺 (1,1,0)
├── north-road.ts        # 裂谷北道 (0,-2,0)
├── south-road.ts        # 裂谷南道 (0,2,0)
├── north-gate.ts        # 北门 (0,-3,0)
├── south-gate.ts        # 南门 (0,3,0)
└── underground.ts       # 地下暗道入口 (0,0,-1)
```

### 蓝图 ID 映射

BlueprintLoader.inferBlueprintId 规则: 相对路径去后缀。

| 文件 | 蓝图 ID |
|------|---------|
| `area/rift-town/area.ts` | `area/rift-town/area` |
| `area/rift-town/square.ts` | `area/rift-town/square` |
| `area/rift-town/north-street.ts` | `area/rift-town/north-street` |
| ... | ... |

### 房间蓝图模板

每个房间蓝图遵循统一模式：

```typescript
/**
 * {房间名称}
 * 坐标: ({x}, {y}, {z})
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RiftTownSquare extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '裂隙镇·镇中广场');
    this.set('long', '裂隙镇的中心是一片不大的青石广场...');
    this.set('coordinates', { x: 0, y: 0, z: 0 });
    this.set('exits', {
      north: 'area/rift-town/north-street',
      south: 'area/rift-town/south-street',
      east: 'area/rift-town/inn',
      west: 'area/rift-town/tavern',
      down: 'area/rift-town/underground',
    });
  }
}
```

### Area 蓝图

```typescript
/**
 * 裂隙镇 — 区域定义
 */
import { Area } from '../../../engine/game-objects/area';

export default class RiftTownArea extends Area {
  static virtual = true;

  create() {
    this.set('name', '裂隙镇');
    this.set('description', '天裂后形成的裂谷中的中立小镇，各方势力的交汇之地');
    this.set('region', '中原·裂谷地带');
    this.set('level_range', { min: 1, max: 5 });
    this.set('rooms', [
      'area/rift-town/square',
      'area/rift-town/north-street',
      'area/rift-town/south-street',
      'area/rift-town/tavern',
      'area/rift-town/inn',
      'area/rift-town/herb-shop',
      'area/rift-town/smithy',
      'area/rift-town/notice-board',
      'area/rift-town/general-store',
      'area/rift-town/north-road',
      'area/rift-town/south-road',
      'area/rift-town/north-gate',
      'area/rift-town/south-gate',
      'area/rift-town/underground',
    ]);
    // spawn_rules 暂不设置（NPC 后续 Epic 实现）
  }
}
```

### 完整出口连接表

确保双向一致性。出口 value 为目标房间的蓝图 ID（前缀 `area/rift-town/`，下表省略）。

| 房间 | 坐标 | north | south | east | west | up | down |
|------|------|-------|-------|------|------|----|------|
| square | (0,0,0) | north-street | south-street | inn | tavern | — | underground |
| north-street | (0,-1,0) | north-road | square | smithy | herb-shop | — | — |
| south-street | (0,1,0) | square | south-road | general-store | notice-board | — | — |
| tavern | (-1,0,0) | — | — | square | — | — | — |
| inn | (1,0,0) | — | — | — | square | — | — |
| herb-shop | (-1,-1,0) | — | — | north-street | — | — | — |
| smithy | (1,-1,0) | — | — | — | north-street | — | — |
| notice-board | (-1,1,0) | — | — | south-street | — | — | — |
| general-store | (1,1,0) | — | — | — | south-street | — | — |
| north-road | (0,-2,0) | north-gate | north-street | — | — | — | — |
| south-road | (0,2,0) | south-street | south-gate | — | — | — | — |
| north-gate | (0,-3,0) | — | north-road | — | — | — | — |
| south-gate | (0,3,0) | south-road | — | — | — | — | — |
| underground | (0,0,-1) | — | — | — | — | square | — |

**验证规则**: 若 A.exits[dir] = B，则 B.exits[反向] = A。反向映射: north↔south, east↔west, up↔down。

**注意**: north-gate 北方出口（通往北境）和 south-gate 南方出口（通往中原）暂不设置，留给后续区域扩展。

### 坐标偏移验证规则

规则移动（八方向 + up/down）的坐标偏移必须严格对应：

| 方向 | dx | dy | dz |
|------|----|----|---- |
| north | 0 | -1 | 0 |
| south | 0 | +1 | 0 |
| east | +1 | 0 | 0 |
| west | -1 | 0 | 0 |
| up | 0 | 0 | +1 |
| down | 0 | 0 | -1 |

特殊移动（enter/exit/climb 等）不受坐标约束。本地图全部使用规则移动。

### 房间描述文本

所有 long 描述从 Scope #85 获取，保持原文不变。蓝图中存储纯文本，富文本标记由 look 指令自动包裹:
- 房间名 → `[rn][b]...[/b][/rn]`
- 描述 → `[rd]...[/rd]`
- 出口 → `[exit]...[/exit]`

## 测试设计

### 集成测试: `server/src/engine/__tests__/rift-town.spec.ts`

```typescript
describe('裂隙镇地图', () => {
  // 使用 BlueprintLoader 加载 world/area/rift-town/ 目录
  // 扩展 extensions: ['.ts'] 以支持测试环境

  it('应加载 15 个蓝图（1 Area + 14 Room）');

  it('Area 应包含全部 14 个房间 ID');

  it('所有房间应有 short/long/coordinates/exits');

  it('出口连接应双向一致');

  it('坐标应与方向偏移一致');

  it('镇中广场应有 5 个出口（含 down）');

  it('北门/南门应各有 1 个出口（不含未开放方向）');

  it('地下暗道应只有 up 出口');
});
```

## 影响范围

- **修改的已有文件**: 0 个
- **新增的文件**: 15 个蓝图 + 1 个测试 = 16 个文件
- **潜在冲突**: 无。`server/src/world/area/` 目录当前只有 `.gitkeep`

## 风险点

- **import 路径**: 蓝图文件到引擎基类的相对路径较深（`../../../engine/game-objects/room-base`）。NestJS 编译后路径结构不变，不影响运行。
- **BlueprintLoader 后缀**: 默认只扫描 `.js`，开发环境编译为 `.js` 后放在 `dist/world/` 中，正常工作。测试环境需配置 `extensions: ['.js', '.ts']`。

---
> CX 工作流 | Design Doc | PRD #94
