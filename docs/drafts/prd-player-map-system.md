# PRD: 玩家上线初始地图系统

## 基本信息

- **创建时间**: 2026-02-04
- **优先级**: P0（紧急）
- **技术栈**: TypeScript 全栈（React Native + NestJS + WebSocket）
- **关联 Scope**: #112
- **关联已完成功能**: #85 (裂隙镇地图), #72 (指令系统/PlayerBase), #27 (创建角色), #100 (游戏首页组件化)

## 功能概述

实现玩家与地图系统的完整交互闭环。角色创建/登录后进入实际地图房间，通过九宫格方向导航在房间间移动，服务端推送房间信息（标题、描述、出口）给前端渲染，下线时持久化保存位置，进出房间广播通知其他玩家。

## 用户场景

### 场景 1: 新角色首次进入游戏

```
玩家完成角色创建 → 角色自动移入裂隙镇广场
→ 客户端收到 roomInfo 消息 → GameHome 显示真实房间数据
→ 广场内其他玩家看到日志"XXX来到此处"
```

### 场景 2: 已有角色登录

```
玩家输入账号密码登录 → 服务端查询 Character.last_room
→ 创建 PlayerBase 对象 → 移动到上次下线房间
→ 推送 roomInfo → 房间广播"XXX上线了"
→ 前端跳转 GameHome 显示真实房间数据
```

### 场景 3: 地图移动

```
玩家点击九宫格"北"方向 → 发送 command 消息 go north
→ 服务端验证出口存在 → 执行移动
→ 旧房间广播"XXX向北离去"
→ 玩家移入新房间 → 新房间广播"XXX从南方来到此处"
→ 推送新房间 roomInfo → 前端更新标题/描述/九宫格
```

### 场景 4: 不可走方向

```
九宫格中无出口的方向 → 置灰显示 + 禁止点击
→ 每次收到 roomInfo 时根据 exits 重新计算可走状态
```

### 场景 5: 玩家下线

```
WebSocket 断开（关闭 App / 网络中断 / 主动退出）
→ 保存当前房间 ID 到 Character.last_room
→ 当前房间广播"XXX下线了"
→ ObjectManager 销毁 PlayerBase
```

## 详细需求

### R1: roomInfo 消息协议（Core 层）

新增消息类型 `roomInfo`（服务端 → 客户端）：

```typescript
type: 'roomInfo'
data: {
  short: string;                              // 房间标题（如"镇中广场"）
  long: string;                               // 房间描述
  exits: string[];                            // 可走方向列表 ['north', 'south', 'east']
  coordinates: { x: number; y: number; z: number }  // 地图坐标（预留）
}
```

- 在 `packages/core/src/types/messages/` 新增 `room.ts` 类型定义
- 在 `packages/core/src/factory/handlers/` 新增 `roomInfo.ts` MessageHandler
- 导出注册到 MessageFactory

### R2: Character 实体扩展（数据库层）

Character 表新增字段：

```
last_room: VARCHAR(255), DEFAULT 'area/rift-town/square', COMMENT '最后所在房间ID'
```

- 修改 `server/src/character/character.entity.ts` 新增 `lastRoom` 字段
- TypeORM `synchronize: true` 自动同步（开发环境）

### R3: 新角色进入初始地图（后端）

修改 `server/src/websocket/handlers/character.handler.ts`：

- `handleConfirm()` 成功后：
  1. 数据库写入角色（last_room = 'area/rift-town/square'）
  2. 通过 ObjectManager 创建 PlayerBase 实例
  3. 绑定 WebSocket 连接（player.bindConnection）
  4. player.moveTo(广场房间)
  5. 构建 roomInfo 消息发送给客户端
  6. 广场房间 broadcast "XXX来到此处"

### R4: 登录已有角色进入地图（后端）

修改 `server/src/websocket/handlers/auth.handler.ts`：

- `handleLogin()` 成功后，若账号已有角色：
  1. 查询 Character（含 last_room）
  2. 通过 ObjectManager 创建/恢复 PlayerBase 实例
  3. 绑定 WebSocket 连接
  4. player.moveTo(lastRoom 对应的房间)
  5. 构建 roomInfo 消息发送给客户端
  6. 房间 broadcast "XXX上线了"
  7. 前端根据 loginSuccess 中的 hasCharacter 标记决定跳转 GameHome 还是 CreateCharacter

### R5: 移动后推送房间信息（后端）

修改 `server/src/websocket/handlers/command.handler.ts`：

- go 命令执行成功后：
  1. 旧房间 broadcast "XXX向{方向}离去"（排除移动者自身）
  2. 执行 player.moveTo(目标房间)
  3. 新房间 broadcast "XXX从{反方向}来到此处"（排除移动者自身）
  4. 构建新房间 roomInfo 发送给移动的玩家

### R6: 下线保存位置（后端）

修改 `server/src/websocket/websocket.gateway.ts`：

- `handleDisconnect()` 中：
  1. 获取 session 中的 playerId
  2. 通过 ObjectManager 获取 PlayerBase
  3. 获取 player 当前所在房间 ID
  4. 更新 Character.last_room 到数据库
  5. 当前房间 broadcast "XXX下线了"
  6. player.unbindConnection()
  7. ObjectManager 销毁 PlayerBase

### R7: 前端 roomInfo 消息处理（前端）

修改 `client/src/stores/useGameStore.ts`：

- 新增 `sendCommand(input: string)` action — 通过 WebSocketService 发送 command 消息
- 修改 `location` 类型：根据 roomInfo 数据更新 name（short）、description（long）
- 修改 `directions` 更新逻辑：根据 exits 数组计算九宫格中每个方向的 bold 状态（可走=bold, 不可走=非bold）

WebSocketService 消息监听中新增 roomInfo 处理：

- 收到 roomInfo → 调用 store.setLocation + store.setDirections

### R8: 九宫格方向交互（前端）

修改 `client/src/components/game/MapNavigation/`：

- `DirectionCell` 新增 `disabled` prop
  - disabled=true：置灰样式（降低 opacity）+ 不响应点击
  - disabled=false：正常样式 + 点击调用 `store.sendCommand('go {direction}')`
- `index.tsx` 从 store 取出 directions 数据，传递 disabled 状态给每个 DirectionCell
- 中心格保持不可点击（现有逻辑不变）

### R9: 进出广播（后端）

复用现有 `RoomBase.broadcast()` + 富文本日志机制：

- 服务端通过 broadcast 发送富文本消息到房间内其他玩家
- 消息内容：
  - 进入："XXX从{反方向}来到此处" / "XXX来到此处" / "XXX上线了"
  - 离开："XXX向{方向}离去" / "XXX下线了"
- 客户端收到后通过现有 gameLog 机制 appendLog 显示

## 现有代码基础

| 模块               | 可复用内容                                                                     |
| ------------------ | ------------------------------------------------------------------------------ |
| `RoomBase`         | `getShort()` / `getLong()` / `getExits()` / `getCoordinates()` / `broadcast()` |
| `PlayerBase`       | `moveTo()` / `bindConnection()` / `unbindConnection()` / `sendToClient()`      |
| `ObjectManager`    | `findById()` — 查找已加载的游戏对象                                            |
| `BlueprintFactory` | `getVirtual()` — 获取房间虚拟单例                                              |
| `MessageFactory`   | `create()` / `serialize()` — 消息构建和序列化                                  |
| `GoCommand`        | 方向解析 + 出口查询逻辑                                                        |
| `LookCommand`      | 房间信息输出格式参考                                                           |
| `useGameStore`     | `setLocation()` / `setDirections()` 已有 setter                                |
| `MapNavigation`    | 3x3 网格渲染已实现                                                             |
| `LocationHeader`   | 标题 + 描述开关已实现                                                          |

## 代码影响范围

| 层级 | 文件                                                         | 变更类型              |
| ---- | ------------------------------------------------------------ | --------------------- |
| Core | `packages/core/src/types/messages/room.ts`                   | 新增                  |
| Core | `packages/core/src/factory/handlers/roomInfo.ts`             | 新增                  |
| Core | `packages/core/src/types/messages/index.ts`                  | 修改（导出）          |
| Core | `packages/core/src/factory/index.ts`                         | 修改（注册）          |
| DB   | `server/src/character/character.entity.ts`                   | 修改（新增字段）      |
| 后端 | `server/src/websocket/handlers/auth.handler.ts`              | 修改                  |
| 后端 | `server/src/websocket/handlers/character.handler.ts`         | 修改                  |
| 后端 | `server/src/websocket/handlers/command.handler.ts`           | 修改                  |
| 后端 | `server/src/websocket/websocket.gateway.ts`                  | 修改                  |
| 前端 | `client/src/stores/useGameStore.ts`                          | 修改                  |
| 前端 | `client/src/services/WebSocketService.ts`                    | 修改（roomInfo 监听） |
| 前端 | `client/src/components/game/MapNavigation/index.tsx`         | 修改                  |
| 前端 | `client/src/components/game/MapNavigation/DirectionCell.tsx` | 修改                  |

## 任务拆分（初步）

- [ ] R1: Core 层新增 roomInfo 消息类型 + MessageHandler
- [ ] R2: Character 实体新增 last_room 字段
- [ ] R3: 角色创建成功后进入初始房间 + 推送 roomInfo
- [ ] R4: 登录已有角色恢复位置 + 推送 roomInfo
- [ ] R5: go 命令成功后推送新房间 roomInfo + 广播
- [ ] R6: 断开连接时保存 last_room + 广播下线
- [ ] R7: 前端 roomInfo 消息处理 + store 更新
- [ ] R8: 九宫格方向交互（disabled 样式 + 点击发送命令）
- [ ] R9: 前端 WebSocketService 新增 roomInfo 监听

## 验收标准

- [ ] 新角色创建成功后自动进入裂隙镇广场，前端 LocationHeader 显示真实房间标题"镇中广场"
- [ ] 前端 GameLog MapDescription 显示广场的房间描述（开启描述开关时）
- [ ] 已有角色登录后恢复到上次下线位置，前端显示对应房间信息
- [ ] 九宫格中可走方向正常显示、可点击；不可走方向置灰、禁止点击
- [ ] 点击可走方向后，LocationHeader 标题更新、MapDescription 描述更新、九宫格可走状态更新
- [ ] 玩家移动时旧房间广播"向{方向}离去"、新房间广播"从{方向}来到此处"
- [ ] 玩家上线时房间广播"上线了"、下线时广播"下线了"
- [ ] WebSocket 断开后 Character.last_room 字段正确保存当前房间 ID
- [ ] 重新登录后进入上次保存的房间，而非默认广场

## 不包含（明确排除）

- 房间内 NPC/物品列表推送（后续扩展 roomInfo）
- 同房间玩家列表
- 移动冷却/速度限制
- 小地图功能
- 移动动画/过渡效果

---

> CX 工作流 | PRD
> 关联 Scope: #112
