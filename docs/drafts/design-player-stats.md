# Design Doc: 页面顶部状态栏真实数据实时更新

## 关联

- PRD: #125
- Scope: #124
- 关联已完成 Epic: #30 (创建角色系统), #115 (玩家上线初始地图系统), #100 (游戏首页组件化)
- 关联 Design Doc: #114 (玩家上线系统), #29 (创建角色系统), #12 (WebSocket 通信协议)

## 基于现有代码

| 模块               | 现状                                                                              | 本次扩展                                       |
| ------------------ | --------------------------------------------------------------------------------- | ---------------------------------------------- |
| `Character 实体`   | 已有六维属性字段 (wisdom/perception/spirit/meridian/strength/vitality) + 上限字段 | 无需修改                                       |
| `CharacterService` | 已有 `findByAccountId` 查询                                                       | 无需修改                                       |
| `AuthHandler`      | 登录后已查询 character 并自动进场                                                 | 扩展：进场后推送 playerStats                   |
| `CharacterHandler` | 角色创建后已自动进场                                                              | 扩展：进场后推送 playerStats                   |
| `PingHandler`      | 收到 ping 后回复 pong                                                             | 扩展：同时推送 playerStats（或新建独立定时器） |
| `GameGateway`      | 已有连接管理和消息路由                                                            | 新增 1s 定时推送机制                           |
| `PlayerBase`       | 已有 `sendToClient` / `bindConnection`                                            | 无需修改                                       |
| `MessageFactory`   | 已有装饰器注册机制                                                                | 新增 playerStats handler                       |
| `useGameStore`     | 已有 `player` 状态和 `updatePlayer`                                               | 重构 player 类型                               |
| `PlayerStats 组件` | 已有两行 StatBar 渲染 Mock 数据                                                   | 重构：第一行进度条 + 第二行纯数值              |
| `StatBar 组件`     | 已有 label/value/pct/color Props                                                  | 第一行继续使用                                 |

## 架构概览

```
┌─ 后端 ─────────────────────────────────────────────────────────┐
│                                                                 │
│  登录进场 / 角色创建进场                                         │
│    → 查 Character 表获取六维属性                                 │
│    → derivePlayerStats(character) 推导运行时属性                  │
│    → player.sendToClient(playerStats)                           │
│                                                                 │
│  1 秒定时器（基于 Session 遍历）                                 │
│    → 遍历所有已登录 Session                                      │
│    → 查 Character 属性 → derivePlayerStats → sendToClient        │
│                                                                 │
└────────────────────────────────┬───────────────────────────────┘
                                 │ WebSocket: playerStats
┌─ 前端 ─────────────────────────┴───────────────────────────────┐
│                                                                 │
│  App.tsx 全局监听 'playerStats'                                  │
│    → useGameStore.updatePlayer(data)                            │
│                                                                 │
│  PlayerStats 组件                                               │
│    ├─ PlayerNameBadge: name + level                             │
│    ├─ 第一行: 3x StatBar (气血/内力/精力 进度条)                 │
│    └─ 第二行: 6x AttrValue (慧根/心眼/气海/脉络/筋骨/血气 数值)  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 数据流

```
Character DB → derivePlayerStats() → playerStats 消息 → WebSocket → 前端 store → UI 组件

推导公式：
  hp.max  = vitality * 100       (血气 → 气血上限)
  mp.max  = spirit * 80          (气海 → 内力上限)
  energy.max = (wisdom + perception) * 50  (慧根+心眼 → 精力上限)
  hp/mp/energy.current = max     (当前值 = 满值，无战斗消耗)
```

## ⚡ WebSocket 消息契约（强制章节）

> **此章节是前后端的对齐合同。exec 阶段必须严格遵守此处定义的消息格式。**

### 消息总览

| #   | 方向            | type          | 说明             | 推送时机                      |
| --- | --------------- | ------------- | ---------------- | ----------------------------- |
| 1   | Server → Client | `playerStats` | 玩家属性实时数据 | 登录进场 / 角色创建 / 1s 心跳 |

### 消息详情

#### 1. playerStats（服务端 → 客户端）

```typescript
// 消息完整结构
{
  type: 'playerStats',
  data: {
    name: string;           // 角色名（Character.name）
    level: string;          // 中文等级（"初入江湖"）
    hp: {
      current: number;      // 当前气血（初始 = max）
      max: number;          // 气血上限 = vitality * 100
    };
    mp: {
      current: number;      // 当前内力（初始 = max）
      max: number;          // 内力上限 = spirit * 80
    };
    energy: {
      current: number;      // 当前精力（初始 = max）
      max: number;          // 精力上限 = (wisdom + perception) * 50
    };
    attrs: {
      wisdom: number;       // 慧根
      perception: number;   // 心眼
      spirit: number;       // 气海
      meridian: number;     // 脉络
      strength: number;     // 筋骨
      vitality: number;     // 血气
    };
  },
  timestamp: number;
}
```

**示例数据**（慧根5/心眼5/气海8/脉络4/筋骨3/血气6 的角色）：

```json
{
  "type": "playerStats",
  "data": {
    "name": "剑心侠客",
    "level": "初入江湖",
    "hp": { "current": 600, "max": 600 },
    "mp": { "current": 640, "max": 640 },
    "energy": { "current": 500, "max": 500 },
    "attrs": {
      "wisdom": 5,
      "perception": 5,
      "spirit": 8,
      "meridian": 4,
      "strength": 3,
      "vitality": 6
    }
  },
  "timestamp": 1738666800000
}
```

## ⚡ 字段映射表（强制章节）

> **从数据库到前端的完整字段映射链。**

### Character → playerStats → 前端 store → UI 组件

| #   | DB 字段 (Character)     | playerStats 字段             | 前端 store 字段           | UI 组件         | 说明       |
| --- | ----------------------- | ---------------------------- | ------------------------- | --------------- | ---------- |
| 1   | `name`                  | `data.name`                  | `player.name`             | PlayerNameBadge | 角色名     |
| 2   | — (固定值)              | `data.level`                 | `player.level`            | PlayerNameBadge | "初入江湖" |
| 3   | `vitality`              | `data.hp.max` = vitality×100 | `player.hp.max`           | StatBar[0]      | 气血上限   |
| 4   | — (运行时)              | `data.hp.current`            | `player.hp.current`       | StatBar[0]      | 当前气血   |
| 5   | `spirit`                | `data.mp.max` = spirit×80    | `player.mp.max`           | StatBar[1]      | 内力上限   |
| 6   | — (运行时)              | `data.mp.current`            | `player.mp.current`       | StatBar[1]      | 当前内力   |
| 7   | `wisdom` + `perception` | `data.energy.max` = (w+p)×50 | `player.energy.max`       | StatBar[2]      | 精力上限   |
| 8   | — (运行时)              | `data.energy.current`        | `player.energy.current`   | StatBar[2]      | 当前精力   |
| 9   | `wisdom`                | `data.attrs.wisdom`          | `player.attrs.wisdom`     | AttrValue       | 慧根       |
| 10  | `perception`            | `data.attrs.perception`      | `player.attrs.perception` | AttrValue       | 心眼       |
| 11  | `spirit`                | `data.attrs.spirit`          | `player.attrs.spirit`     | AttrValue       | 气海       |
| 12  | `meridian`              | `data.attrs.meridian`        | `player.attrs.meridian`   | AttrValue       | 脉络       |
| 13  | `strength`              | `data.attrs.strength`        | `player.attrs.strength`   | AttrValue       | 筋骨       |
| 14  | `vitality`              | `data.attrs.vitality`        | `player.attrs.vitality`   | AttrValue       | 血气       |

### 命名规范确认

- **数据库 (Character)**: camelCase（TypeORM 实体，如 `wisdom`）
- **WebSocket 消息**: camelCase（如 `playerStats.data.attrs.wisdom`）
- **前端 store**: camelCase（如 `player.attrs.wisdom`）
- **无需转换**: 全链路 camelCase，前后端字段名完全一致

### TypeScript 类型定义

**Core 包（共享）**：

```typescript
// packages/core/src/types/messages/playerStats.ts

import { ServerMessage } from '../base';

/** 运行时资源值（进度条用） */
export interface ResourceValue {
  current: number;
  max: number;
}

/** 六维属性 */
export interface CharacterAttrs {
  wisdom: number; // 慧根
  perception: number; // 心眼
  spirit: number; // 气海
  meridian: number; // 脉络
  strength: number; // 筋骨
  vitality: number; // 血气
}

/** playerStats 消息 */
export interface PlayerStatsMessage extends ServerMessage {
  type: 'playerStats';
  data: {
    name: string;
    level: string;
    hp: ResourceValue;
    mp: ResourceValue;
    energy: ResourceValue;
    attrs: CharacterAttrs;
  };
}
```

**前端 store**：

```typescript
// player 类型重构（替换旧的 StatData[][] 结构）
export interface PlayerData {
  name: string;
  level: string;
  hp: { current: number; max: number };
  mp: { current: number; max: number };
  energy: { current: number; max: number };
  attrs: {
    wisdom: number;
    perception: number;
    spirit: number;
    meridian: number;
    strength: number;
    vitality: number;
  };
}
```

## 前端设计

### 组件结构

```
client/src/components/game/PlayerStats/
├── index.tsx              # 区域容器（从 store 取 player 数据）
├── PlayerNameBadge.tsx    # 名称徽章（已有，无需修改）
└── AttrValue.tsx          # 新增：单个属性数值组件

client/src/components/game/shared/
└── StatBar.tsx            # 已有，第一行继续使用
```

### PlayerStats 容器 (index.tsx) — 重构

```
PlayerStats
  ├─ PlayerNameBadge (name, level)        ← 已有
  ├─ Row 1: 3x StatBar                   ← 改数据源
  │   ├─ StatBar (气血, hp)
  │   ├─ StatBar (内力, mp)
  │   └─ StatBar (精力, energy)
  ├─ Row 2: 6x AttrValue                 ← 新增
  │   ├─ AttrValue (慧根, wisdom)
  │   ├─ AttrValue (心眼, perception)
  │   ├─ AttrValue (气海, spirit)
  │   ├─ AttrValue (脉络, meridian)
  │   ├─ AttrValue (筋骨, strength)
  │   └─ AttrValue (血气, vitality)
  └─ GradientDivider                     ← 已有
```

### AttrValue 新组件 Props

```typescript
interface AttrValueProps {
  label: string; // 中文标签（如 "慧根"）
  value: number; // 属性值（如 5）
}
```

### StatBar 数据映射

| StatBar | label    | value                               | pct                             | color     |
| ------- | -------- | ----------------------------------- | ------------------------------- | --------- |
| 气血    | `"气血"` | `"${hp.current}/${hp.max}"`         | `hp.current/hp.max*100`         | `#A65D5D` |
| 内力    | `"内力"` | `"${mp.current}/${mp.max}"`         | `mp.current/mp.max*100`         | `#4A6B6B` |
| 精力    | `"精力"` | `"${energy.current}/${energy.max}"` | `energy.current/energy.max*100` | `#8B7355` |

### 状态管理变更

**useGameStore 重构**：

```typescript
// 旧类型（删除）
player: { name: string; level: string; stats: StatData[][] }

// 新类型
player: PlayerData  // 直接匹配 playerStats.data 结构

// updatePlayer action 保持不变（Partial 合并）
```

**App.tsx 新增监听**：

```typescript
// 在 useEffect 中新增
const handlePlayerStats = (data: any) => {
  useGameStore.getState().updatePlayer(data);
};
wsService.on('playerStats', handlePlayerStats);
```

### 删除的代码

- `INITIAL_STATS` 常量（Mock 数据）
- `StatData` 接口（不再需要二维数组结构）
- 旧 `player.stats` 二维数组渲染逻辑

## 后端设计

### 代码路径

```
packages/core/src/
├── types/messages/
│   ├── playerStats.ts       # 新增：PlayerStatsMessage 类型
│   └── index.ts             # 新增 export
└── factory/
    ├── handlers/
    │   └── playerStats.ts   # 新增：@MessageHandler('playerStats')
    └── index.ts             # 新增 import

server/src/websocket/
├── handlers/
│   ├── auth.handler.ts      # 修改：登录进场后推送 playerStats
│   ├── character.handler.ts # 修改：角色创建后推送 playerStats
│   └── stats.utils.ts       # 新增：derivePlayerStats + sendPlayerStats
└── websocket.gateway.ts     # 修改：新增 1s 定时推送
```

### derivePlayerStats 工具函数

```typescript
// server/src/websocket/handlers/stats.utils.ts

import { Character } from '../../character/character.entity';
import { PlayerBase } from '../../engine/game-objects/player-base';
import { MessageFactory } from '@packages/core';

/** 等级映射（当前只有一级） */
function getLevelText(): string {
  return '初入江湖';
}

/** 从 Character 实体推导 playerStats 消息数据 */
export function derivePlayerStats(character: Character) {
  const hpMax = character.vitality * 100;
  const mpMax = character.spirit * 80;
  const energyMax = (character.wisdom + character.perception) * 50;

  return {
    name: character.name,
    level: getLevelText(),
    hp: { current: hpMax, max: hpMax }, // 当前 = 满值
    mp: { current: mpMax, max: mpMax },
    energy: { current: energyMax, max: energyMax },
    attrs: {
      wisdom: character.wisdom,
      perception: character.perception,
      spirit: character.spirit,
      meridian: character.meridian,
      strength: character.strength,
      vitality: character.vitality,
    },
  };
}

/** 推送 playerStats 到客户端 */
export function sendPlayerStats(player: PlayerBase, character: Character): void {
  const data = derivePlayerStats(character);
  const msg = MessageFactory.create('playerStats', data);
  if (msg) {
    player.sendToClient(MessageFactory.serialize(msg));
  }
}
```

### 1 秒定时推送机制

在 `websocket.gateway.ts` 中新增定时器：

```typescript
// 服务端启动后创建 1s 间隔定时器
private statsInterval: NodeJS.Timeout;

afterInit() {
  this.statsInterval = setInterval(() => {
    this.broadcastPlayerStats();
  }, 1000);
}

/** 向所有已登录玩家推送 playerStats */
private async broadcastPlayerStats() {
  for (const [socketId, session] of this.sessions) {
    if (!session.playerId || !session.characterId) continue;

    const player = this.objectManager.findById(session.playerId) as PlayerBase;
    if (!player) continue;

    const character = await this.characterService.findById(session.characterId);
    if (!character) continue;

    sendPlayerStats(player, character);
  }
}
```

> **注意**: 每秒查库有性能隐患。当前玩家量极小，可接受。后续优化：在 Session/PlayerBase 上缓存 character 属性，属性变更时才刷新缓存。

### MessageFactory Handler

```typescript
// packages/core/src/factory/handlers/playerStats.ts

import { MessageHandler, IMessageHandler } from '../MessageFactory';
import { PlayerStatsMessage } from '../../types/messages/playerStats';

@MessageHandler('playerStats')
export class PlayerStatsHandler implements IMessageHandler {
  create(data: PlayerStatsMessage['data']): PlayerStatsMessage {
    return {
      type: 'playerStats',
      data,
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return (
      typeof data.name === 'string' &&
      typeof data.level === 'string' &&
      !!data.hp &&
      typeof data.hp.current === 'number' &&
      typeof data.hp.max === 'number' &&
      !!data.mp &&
      typeof data.mp.current === 'number' &&
      typeof data.mp.max === 'number' &&
      !!data.energy &&
      typeof data.energy.current === 'number' &&
      typeof data.energy.max === 'number' &&
      !!data.attrs &&
      typeof data.attrs.wisdom === 'number' &&
      typeof data.attrs.perception === 'number' &&
      typeof data.attrs.spirit === 'number' &&
      typeof data.attrs.meridian === 'number' &&
      typeof data.attrs.strength === 'number' &&
      typeof data.attrs.vitality === 'number'
    );
  }
}
```

## 影响范围

### 修改的已有文件

| 文件                                                 | 改动                                     |
| ---------------------------------------------------- | ---------------------------------------- |
| `packages/core/src/types/messages/index.ts`          | 新增 `export * from './playerStats'`     |
| `packages/core/src/factory/index.ts`                 | 新增 `import './handlers/playerStats'`   |
| `server/src/websocket/handlers/auth.handler.ts`      | 登录进场后调用 `sendPlayerStats`         |
| `server/src/websocket/handlers/character.handler.ts` | 角色创建后调用 `sendPlayerStats`         |
| `server/src/websocket/websocket.gateway.ts`          | 新增 1s 定时推送 + CharacterService 注入 |
| `client/App.tsx`                                     | 新增 playerStats 消息监听                |
| `client/src/stores/useGameStore.ts`                  | player 类型重构，删除 INITIAL_STATS      |
| `client/src/components/game/PlayerStats/index.tsx`   | 重构渲染逻辑                             |

### 新增的文件

| 文件                                                   | 说明                                |
| ------------------------------------------------------ | ----------------------------------- |
| `packages/core/src/types/messages/playerStats.ts`      | PlayerStatsMessage 类型定义         |
| `packages/core/src/factory/handlers/playerStats.ts`    | MessageHandler                      |
| `server/src/websocket/handlers/stats.utils.ts`         | derivePlayerStats + sendPlayerStats |
| `client/src/components/game/PlayerStats/AttrValue.tsx` | 六维属性值组件                      |

### 潜在风险

- **1s 定时查库**: 当前玩家少可接受，后续需缓存优化
- **player 类型变更**: 所有引用 `player.stats` 的地方需要同步修改（仅 PlayerStats 组件）
- **StatData 删除**: 确认无其他组件引用 StatData 接口

## 风险点

- **1 秒定时器性能**: 每秒遍历 Session + 查库。当前开发阶段可接受（< 10 玩家）。后续可在 PlayerBase 上缓存 character 数据，只在属性变化时更新。
- **断线重连**: 重连后需要重新建立 Session + 恢复定时推送。当前 auth.handler 登录流程已覆盖此场景。

---

> CX 工作流 | Design Doc | PRD #125
