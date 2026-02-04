# Design Doc: 玩家上线初始地图系统

## 关联

- PRD: #113
- Scope: #112
- 关联已完成 Epic: #96 (裂隙镇地图), #75 (指令系统), #30 (创建角色), #100 (游戏首页组件化)
- 关联 Design Doc: #74 (指令系统), #95 (裂隙镇地图), #65 (游戏对象子类)

## 基于现有代码

| 模块 | 现状 | 本次扩展 |
|------|------|---------|
| `PlayerBase` | 已有 `bindConnection` / `sendToClient` / `moveTo` | 无需修改 |
| `LivingBase.go()` | 已有完整移动逻辑（事件链 pre:move → post:move → encounter） | 无需修改 |
| `RoomBase` | 已有 `broadcast()` / `getShort()` / `getLong()` / `getExits()` / `getCoordinates()` | 无需修改 |
| `GoCommand` | 已有方向解析 + 出口查询，返回 `{ direction, targetId }` | 无需修改 |
| `ObjectManager` | 已有 `register()` / `findById()` / `unregister()` | 无需修改 |
| `BlueprintFactory` | 已有 `getVirtual()` / `clone()` | 无需修改 |
| `CommandHandler` | 已有 `handleCommand()`，执行命令并返回结果 | 扩展：go 成功后推送 roomInfo + 广播 |
| `AuthHandler` | 已有登录/注册处理 | 扩展：登录已有角色后加载进场 |
| `CharacterHandler` | 已有创建角色 4 步流程 | 扩展：创建成功后加载进场 |
| `GameGateway` | 已有连接/断开/消息路由 | 扩展：断开时保存位置 |
| `Character 实体` | 已有完整属性字段 | 新增 `lastRoom` 字段 |
| `MessageFactory` | 已有装饰器注册机制 | 新增 roomInfo handler |
| `WebSocketService` | 已有消息监听 `addListener` / `send` | 新增 roomInfo 监听 |
| `useGameStore` | 已有 `setLocation` / `setDirections` / `appendLog` | 新增 `sendCommand` action |

## 架构概览

```
┌─ 前端 ─────────────────────────────────────────────────────────┐
│ DirectionCell.onPress                                          │
│   → store.sendCommand('go north')                              │
│     → WebSocketService.send({ type:'command', data:{input} })  │
└────────────────────────────────┬───────────────────────────────┘
                                 │ WebSocket
┌─ 后端 ─────────────────────────┴───────────────────────────────┐
│ GameGateway.handleMessage()                                     │
│   → CommandHandler.handleCommand()                              │
│     → player.executeCommand('go north')                         │
│       → GoCommand: 查出口 → LivingBase.go(direction)           │
│         → 旧房间 broadcast("离去") → moveTo → 新房间 broadcast │
│     → 构建 roomInfo → player.sendToClient(roomInfo)            │
└─────────────────────────────────────────────────────────────────┘
                                 │ WebSocket
┌─ 前端 ─────────────────────────┴───────────────────────────────┐
│ WebSocketService.onMessage('roomInfo')                          │
│   → store.setLocation({ name, description })                   │
│   → store.setDirections(根据 exits 计算九宫格)                  │
│   → store.clearLog() + store.appendLog(look 输出)               │
│   → LocationHeader / GameLog / MapNavigation 自动更新           │
└─────────────────────────────────────────────────────────────────┘
```

### 玩家生命周期

```
登录成功(有角色) ──┐
                    ├─→ 创建 PlayerBase → bindConnection → moveTo(room)
创建角色成功 ──────┘    → 推送 roomInfo → 房间 broadcast("来到/上线")
                                                    │
                        移动(go 命令) ←─── 九宫格点击
                          │
                          ├─ 旧房间 broadcast("离去")
                          ├─ moveTo(新房间)
                          ├─ 新房间 broadcast("来到")
                          └─ 推送 roomInfo
                                                    │
                        WebSocket 断开 ──→ 保存 lastRoom → broadcast("下线")
                                        → unbindConnection → 销毁 PlayerBase
```

## 数据库设计

### Character 表新增字段

```sql
ALTER TABLE `character` ADD COLUMN `last_room` VARCHAR(255)
  DEFAULT 'area/rift-town/square'
  COMMENT '最后所在房间ID';
```

TypeORM 实体修改（开发环境 `synchronize: true` 自动同步）：

```typescript
@Column({
  name: 'last_room',
  type: 'varchar',
  length: 255,
  default: 'area/rift-town/square',
  comment: '最后所在房间ID',
})
lastRoom: string;
```

### 字段说明

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `last_room` | VARCHAR(255) | `'area/rift-town/square'` | 存储蓝图 ID 格式（如 `area/rift-town/square`） |

---

## ⚡ WebSocket 消息契约（强制章节）

> **此章节是前后端的对齐合同。exec 阶段必须严格遵守此处定义的消息类型、字段名、数据结构。**

### 消息总览

| # | 方向 | type | 说明 | 触发时机 |
|---|------|------|------|---------|
| 1 | S→C | `roomInfo` | 房间信息推送 | 进场/移动后 |
| 2 | S→C | `gameLog` | 游戏日志推送 | 广播消息（进出/上下线） |

**设计决策**：
- **不新增 enterGame 请求消息** — 登录成功/创建成功时服务端自动进场，无需客户端额外发送
- **不新增 playerEntered/playerLeft 消息** — 复用 `gameLog` 富文本广播，与 look/say 保持一致
- **roomInfo 的 exits 传 string[]** — 前端只需知道可走方向，不暴露目标房间 ID

### 消息详情

#### 1. roomInfo（服务端 → 客户端）

**触发时机**：玩家进场 / 移动到新房间后，服务端主动推送。

```json
{
  "type": "roomInfo",
  "data": {
    "short": "镇中广场",
    "long": "裂隙镇的中心广场，四通八达。广场中央矗立着一块巨大的告示碑...",
    "exits": ["north", "south", "east", "west", "down"],
    "coordinates": { "x": 0, "y": 0, "z": 0 }
  },
  "timestamp": 1738700000000
}
```

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `short` | string | ✅ | 房间标题，来自 `room.getShort()` |
| `long` | string | ✅ | 房间描述，来自 `room.getLong()` |
| `exits` | string[] | ✅ | 可走方向列表，来自 `Object.keys(room.getExits())` |
| `coordinates` | `{x,y,z}` | ✅ | 地图坐标，来自 `room.getCoordinates()` |

#### 2. gameLog（服务端 → 客户端）

**触发时机**：房间广播消息（玩家进出、上下线等）。

复用现有 `RoomBase.broadcast()` 机制。broadcast 内部调用每个 PlayerBase 的 `receiveMessage()`，PlayerBase 重写为 `sendToClient()`。

广播消息格式（富文本）：

```
进入房间: "{玩家名}从{反方向}来到此处。"
离开房间: "{玩家名}向{方向}离去。"
上线:     "{玩家名}上线了。"
下线:     "{玩家名}下线了。"
```

**反方向映射**：

| 移动方向 | 反方向（广播用） |
|---------|----------------|
| north | 南方 |
| south | 北方 |
| east | 西方 |
| west | 东方 |
| up | 下方 |
| down | 上方 |
| northeast | 西南方 |
| northwest | 东南方 |
| southeast | 西北方 |
| southwest | 东北方 |

---

## ⚡ 字段映射表（强制章节）

### roomInfo 字段映射

| # | 来源 | 服务端取值 | 消息字段 | 前端 store 字段 | 前端 UI 组件 |
|---|------|-----------|---------|----------------|-------------|
| 1 | RoomBase | `room.getShort()` | `data.short` | `location.name` | LocationHeader → LocationTitle |
| 2 | RoomBase | `room.getLong()` | `data.long` | `location.description` | GameLog → MapDescription |
| 3 | RoomBase | `Object.keys(room.getExits())` | `data.exits` | `directions[][]` (计算) | MapNavigation → DirectionCell |
| 4 | RoomBase | `room.getCoordinates()` | `data.coordinates` | （预留） | （预留） |

### exits → directions 计算逻辑

前端收到 `exits: string[]` 后，转换为 3x3 九宫格 `Direction[][]`：

```typescript
const ALL_DIRS = [
  ['northwest', 'north', 'northeast'],
  ['west',      'center', 'east'],
  ['southwest', 'south', 'southeast'],
];

const DIR_LABELS: Record<string, string> = {
  northwest: '西北', north: '北', northeast: '东北',
  west: '西', center: '中', east: '东',
  southwest: '西南', south: '南', southeast: '东南',
};

function exitsToDirections(exits: string[]): Direction[][] {
  return ALL_DIRS.map(row =>
    row.map(dir => ({
      text: DIR_LABELS[dir],
      bold: dir === 'center' || exits.includes(dir),
      center: dir === 'center',
    }))
  );
}
```

**关键**：`bold: true` 表示可走方向（或中心格），`bold: false` 表示不可走方向。DirectionCell 根据 `bold` + `center` 判断：
- `center=true` → 不可点击，深色背景
- `bold=true, center=false` → 可点击，正常样式
- `bold=false` → 不可点击，置灰样式（disabled）

### Character 表字段映射

| # | 数据库字段 | TypeORM 字段 | 类型 | 默认值 | 说明 |
|---|-----------|-------------|------|--------|------|
| 1 | `last_room` | `lastRoom` | VARCHAR(255) | `'area/rift-town/square'` | 蓝图 ID 格式 |

---

## 前端设计

### 修改文件

#### 1. `client/src/stores/useGameStore.ts`

新增 `sendCommand` action：

```typescript
// GameState interface 新增
sendCommand: (input: string) => void;

// Store 实现
sendCommand: (input: string) => {
  // 通过 WebSocketService 发送 command 消息
  const msg = MessageFactory.create('command', { input });
  if (msg) {
    WebSocketService.getInstance().send(MessageFactory.serialize(msg));
  }
},
```

roomInfo 消息处理逻辑（在 WebSocketService 消息监听中）：

```typescript
// 收到 roomInfo 时
case 'roomInfo':
  store.setLocation({
    name: data.short,
    actions: store.getState().location.actions, // 保留操作按钮
    description: data.long,
  });
  store.setDirections(exitsToDirections(data.exits));
  break;
```

#### 2. `client/src/components/game/MapNavigation/DirectionCell.tsx`

新增 `disabled` 和 `onPress` props：

```typescript
interface DirectionCellProps {
  dir: Direction;
  dirKey: string;      // 英文方向键（'north', 'south' 等）
  onPress?: () => void;
}

// 渲染逻辑
<TouchableOpacity
  disabled={dir.center || !dir.bold}
  style={[s.cell, dir.center && s.center, !dir.bold && !dir.center && s.disabled]}
  onPress={onPress}
>
```

disabled 样式：`opacity: 0.3`

#### 3. `client/src/components/game/MapNavigation/index.tsx`

从 store 取 `sendCommand`，传递给 DirectionCell：

```typescript
const sendCommand = useGameStore(state => state.sendCommand);

// 方向键映射
const DIR_KEYS = [
  ['northwest', 'north', 'northeast'],
  ['west', 'center', 'east'],
  ['southwest', 'south', 'southeast'],
];

// 渲染时
<DirectionCell
  dir={dir}
  dirKey={DIR_KEYS[rowIdx][colIdx]}
  onPress={() => sendCommand(`go ${DIR_KEYS[rowIdx][colIdx]}`)}
/>
```

### 不需要修改的前端组件

- **LocationHeader** — 已通过 `useGameStore(s => s.location)` 订阅，store 更新后自动渲染
- **GameLog MapDescription** — 已通过 `useGameStore(s => s.location.description)` 订阅
- **GameLog LogEntry** — 已通过 `useGameStore(s => s.gameLog)` 订阅，appendLog 后自动渲染

## 后端设计

### 新增辅助函数：buildRoomInfo

在 `server/src/websocket/handlers/` 中提供共享的房间信息构建函数：

```typescript
// room-utils.ts（新增）
import { RoomBase } from '../../engine/game-objects/room-base';
import { MessageFactory } from '@renzai/core';

/**
 * 构建 roomInfo 消息并发送给玩家
 */
export function sendRoomInfo(player: PlayerBase, room: RoomBase): void {
  const msg = MessageFactory.create('roomInfo', {
    short: room.getShort(),
    long: room.getLong(),
    exits: Object.keys(room.getExits()),
    coordinates: room.getCoordinates(),
  });
  if (msg) {
    player.sendToClient(msg);
  }
}
```

### 修改文件

#### 1. `server/src/character/character.entity.ts`

新增 `lastRoom` 字段（见数据库设计章节）。

#### 2. `server/src/websocket/handlers/character.handler.ts`

`handleConfirm()` 成功后追加进场逻辑：

```typescript
// 现有：写入数据库 + 发送 createCharacterSuccess
// 新增：
// 1. 创建 PlayerBase 实例
const player = new PlayerBase();
player.set('name', character.name);
this.objectManager.register(player);

// 2. 绑定 WebSocket
player.bindConnection((msg) => client.send(MessageFactory.serialize(msg)));

// 3. 获取初始房间
const room = this.blueprintFactory.getVirtual('area/rift-town/square') as RoomBase;

// 4. 移动到房间
await player.moveTo(room);

// 5. 更新 session
session.playerId = player.id;

// 6. 推送 roomInfo
sendRoomInfo(player, room);

// 7. 广播
room.broadcast(`${character.name}来到此处。`, player);
```

#### 3. `server/src/websocket/handlers/auth.handler.ts`

`handleLogin()` 成功后，若有角色，追加进场逻辑：

```typescript
// 现有：验证账号密码 + 发送 loginSuccess
// 新增：查询角色
const character = await this.characterService.findByAccountId(account.id);
if (character) {
  // 同 character.handler 的进场逻辑
  // 但使用 character.lastRoom 而非默认广场
  const room = this.blueprintFactory.getVirtual(character.lastRoom) as RoomBase;
  // ... 创建 PlayerBase、绑定、moveTo、推送 roomInfo
  room.broadcast(`${character.name}上线了。`, player);
}
```

#### 4. `server/src/websocket/handlers/command.handler.ts`

`handleCommand()` 中 go 命令成功后追加：

```typescript
// 现有：执行命令并返回结果
// go 命令成功时新增：
if (result.success && result.data?.direction && result.data?.targetId) {
  const player = this.objectManager.findById(session.playerId) as PlayerBase;
  const oldRoom = player.getEnvironment() as RoomBase;
  const direction = result.data.direction;

  // 1. 旧房间广播
  oldRoom.broadcast(`${player.getName()}向${dirToChinese(direction)}离去。`, player);

  // 2. 执行移动
  await player.go(direction);

  // 3. 新房间
  const newRoom = player.getEnvironment() as RoomBase;

  // 4. 新房间广播
  const reverseDir = getReverseDirChinese(direction);
  newRoom.broadcast(`${player.getName()}从${reverseDir}来到此处。`, player);

  // 5. 推送 roomInfo
  sendRoomInfo(player, newRoom);
}
```

#### 5. `server/src/websocket/websocket.gateway.ts`

`handleDisconnect()` 中追加：

```typescript
// 现有：销毁 session
// 新增：
if (session.playerId) {
  const player = this.objectManager.findById(session.playerId) as PlayerBase;
  if (player) {
    const room = player.getEnvironment() as RoomBase;

    // 1. 保存位置到数据库
    if (session.characterId) {
      await this.characterService.updateLastRoom(session.characterId, room?.id);
    }

    // 2. 房间广播下线
    if (room) {
      room.broadcast(`${player.getName()}下线了。`, player);
    }

    // 3. 解绑 + 销毁
    player.unbindConnection();
    this.objectManager.unregister(player);
  }
}
```

### 新增文件

| 文件 | 说明 |
|------|------|
| `packages/core/src/types/messages/room.ts` | roomInfo 消息类型定义 |
| `packages/core/src/factory/handlers/roomInfo.ts` | roomInfo MessageHandler |
| `server/src/websocket/handlers/room-utils.ts` | sendRoomInfo 辅助函数 + 方向映射 |

### 代码路径

```
packages/core/src/
├── types/messages/
│   └── room.ts                    # 新增：RoomInfoMessage 类型
├── factory/handlers/
│   └── roomInfo.ts                # 新增：@MessageHandler('roomInfo')

server/src/
├── character/
│   └── character.entity.ts        # 修改：新增 lastRoom 字段
│   └── character.service.ts       # 修改：新增 updateLastRoom 方法
├── websocket/
│   ├── handlers/
│   │   ├── auth.handler.ts        # 修改：登录后进场
│   │   ├── character.handler.ts   # 修改：创建后进场
│   │   ├── command.handler.ts     # 修改：go 成功后广播 + roomInfo
│   │   └── room-utils.ts         # 新增：sendRoomInfo + 方向映射
│   └── websocket.gateway.ts       # 修改：断开时保存位置
│   └── types/session.ts           # 修改：新增 characterId 字段

client/src/
├── stores/
│   └── useGameStore.ts            # 修改：sendCommand action + roomInfo 处理
├── services/
│   └── WebSocketService.ts        # 修改：roomInfo 消息监听
├── components/game/
│   └── MapNavigation/
│       ├── index.tsx              # 修改：传递 onPress + dirKey
│       └── DirectionCell.tsx      # 修改：disabled 样式 + 点击事件
```

## 影响范围

- **修改文件**: 10 个（Core 2 + Server 5 + Client 3）
- **新增文件**: 3 个（Core 1 + Server 1 + 前端 0）
- **潜在冲突**: 无 — 所有修改都是追加逻辑，不改动现有接口签名

## 风险点

| 风险 | 影响 | 应对方案 |
|------|------|---------|
| BlueprintFactory.getVirtual(lastRoom) 返回 null | 玩家进场失败 | fallback 到默认广场 `area/rift-town/square` |
| 多设备同时登录同一账号 | 重复创建 PlayerBase | Session 检查：已有 playerId 时先销毁旧对象 |
| 断开连接时数据库写入失败 | lastRoom 丢失 | try-catch 保护，日志告警，不影响断开流程 |
| go 命令与 roomInfo 推送非原子 | 竞态条件 | go 命令在同一个 await 链中完成，无并发问题 |

---
> CX 工作流 | Design Doc | PRD #113
