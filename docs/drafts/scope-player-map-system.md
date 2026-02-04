# 功能探讨: 玩家上线初始地图系统

## 基本信息

- **创建时间**: 2026-02-04
- **关联项目蓝图**: #1
- **关联已完成功能**: #85 (裂隙镇地图), #72 (指令系统/PlayerBase), #27 (创建角色)

## 功能目标

实现玩家与地图系统的完整交互闭环：新角色创建后进入初始地图、已有角色登录恢复到上次下线位置、前后端地图信息协议、九宫格方向移动、房间进出广播通知。

## 6 个子功能

| # | 子功能 | 后端 | 前端 | Core |
|---|--------|------|------|------|
| 1 | 新角色进入初始地图 | 创建成功后 moveTo 广场 + 推送 roomInfo | 收到 roomInfo 更新 store | roomInfo 消息类型 |
| 2 | 登录已有角色进入地图 | 登录成功后加载角色 + moveTo lastRoom + 推送 roomInfo | 同上 | 同上 |
| 3 | 下线记录位置 | 断开连接时保存 lastRoom 到 Character 表 | 无 | 无 |
| 4 | roomInfo 消息协议 | 服务端构建并发送 | 前端解析并更新 UI | 类型定义 + MessageHandler |
| 5 | 九宫格移动 | go 命令执行移动 + 推送新房间 roomInfo | 点击方向格 → sendCommand → 更新 UI | command 消息已有 |
| 6 | 进出房间广播 | broadcast 富文本日志给房间内其他玩家 | appendLog 显示 | 复用 gameLog 机制 |

## 用户流程

### 新角色

```
创建角色成功 → 服务端将角色移动到裂隙镇广场
→ 推送 roomInfo 给客户端 → 广场广播"XXX来到此处"
→ 前端跳转 GameHome，显示真实房间数据
```

### 已有角色登录

```
登录成功 → 查询 Character.last_room → 创建/恢复 PlayerBase
→ 移动到 lastRoom 房间 → 推送 roomInfo → 房间广播"XXX上线了"
→ 前端跳转 GameHome，显示真实房间数据
```

### 移动

```
玩家点击九宫格方向（或输入 go north）
→ 发送 command 消息 → 服务端执行 go 命令
→ 旧房间广播"XXX向{方向}离去"
→ player.moveTo(目标房间)
→ 新房间广播"XXX从{方向}来到此处"
→ 推送 roomInfo 给移动的玩家
→ 前端更新标题、描述、九宫格
```

### 下线

```
WebSocket 断开 → 保存当前房间 ID 到 Character.last_room
→ 房间广播"XXX下线了" → ObjectManager 销毁 PlayerBase
```

## 方案探讨

### 消息协议

```typescript
// 新增消息类型 roomInfo（服务端 → 客户端）
type: 'roomInfo'
data: {
  short: string;              // 房间标题（如"镇中广场"）
  long: string;               // 房间描述
  exits: string[];            // 可走方向 ['north', 'south', 'east', 'west', 'down']
  coordinates: { x: number; y: number; z: number }
}
```

**设计决策**：
- `exits` 传 `string[]` 而非 `Record<string, string>`，前端不需要知道目标房间 ID，只需知道哪些方向可走
- `coordinates` 预留给后续小地图功能
- 本次不包含 NPC/物品列表，后续可扩展

### 数据库变更

Character 表新增字段：
```sql
last_room VARCHAR(255) DEFAULT 'area/rift-town/square' COMMENT '最后所在房间ID'
```

### 前端数据流

```
收到 roomInfo → store.setLocation({ name: short, description: long, actions })
             → store.setDirections(根据 exits 计算九宫格可走状态)
             → LocationHeader 更新标题
             → GameLog MapDescription 更新描述（如已开启）
             → MapNavigation 更新可走方向高亮
```

### 九宫格交互

- 可走方向：正常样式，点击发送 `go {direction}` 命令
- 不可走方向：置灰 + 禁止点击（disabled）
- 中心格：不可点击（保持现有逻辑）
- 需要 store 新增 `sendCommand(input)` action，组件通过 store 发送命令（不直接调用 WebSocketService）

### 进出广播

复用现有 `room.broadcast()` + 富文本日志机制（方案 A），不定义专门的 playerEnter/playerLeave 消息类型。服务端通过 broadcast 发送富文本到房间内其他玩家，客户端收到后 appendLog。

### 考虑过的替代方案

| 方案 | 优点 | 缺点 | 结论 |
|------|------|------|------|
| exits 传完整 Record | 前端可预加载相邻房间 | 泄露服务端内部ID，过度设计 | 放弃 |
| 不可走方向允许点击 | MUD 传统体验 | 增加无效网络请求 | 放弃，选择置灰禁止 |
| 专门的 enter/leave 消息 | 类型安全，前端可差异处理 | 过度设计，目前只需日志文本 | 放弃，复用 broadcast |
| Session 内存存 lastRoom | 无数据库写入 | 服务崩溃丢失位置 | 放弃，写 DB 更可靠 |

## 与现有功能的关系

### 依赖

- **裂隙镇地图** (#85/#96): 房间定义、RoomBase、exits 出口系统
- **指令系统** (#72/#75): go 命令、CommandManager、PlayerBase.go()
- **创建角色** (#27/#30): CharacterHandler、Character 实体
- **WebSocket 协议** (#10/#14): MessageFactory、GameGateway 消息路由
- **游戏首页组件** (#100): LocationHeader、GameLog、MapNavigation、useGameStore

### 影响（需修改的模块）

| 模块 | 修改内容 |
|------|----------|
| `packages/core` | 新增 roomInfo 消息类型 + MessageHandler |
| `server/character` | Character 实体新增 last_room 字段 |
| `server/websocket/handlers/auth` | 登录成功后加载角色进入房间 |
| `server/websocket/handlers/character` | 创建成功后角色进入初始房间 |
| `server/websocket/handlers/command` | go 命令成功后推送 roomInfo + 广播 |
| `server/websocket/gateway` | 断开连接时保存 last_room |
| `client/stores/useGameStore` | 新增 sendCommand action、roomInfo 处理 |
| `client/components/game/MapNavigation` | 方向格点击事件、可走/不可走样式 |

### 复用

- `RoomBase.broadcast()` — 广播进出通知
- `RoomBase.getShort()/getLong()/getExits()` — 构建 roomInfo 数据
- `PlayerBase.moveTo()` — 移动玩家到房间
- `MessageFactory` — 序列化/反序列化 roomInfo
- 前端 `useGameStore.setLocation/setDirections` — 已有 setter

## 边界和约束

- 本次只传房间标题 + 描述 + 出口 + 坐标，不含 NPC/物品列表
- 不做移动冷却或移动速度限制
- 不做玩家列表推送（谁在同一房间）
- 下线保存位置写数据库，非内存缓存
- 开发环境 TypeORM synchronize=true 自动同步新字段

## 开放问题（留给 PRD 阶段）

- roomInfo 未来扩展 NPC/物品列表的具体数据结构
- 移动动画或过渡效果
- 同房间玩家列表的推送时机和消息格式
- 小地图功能对 coordinates 的使用方式

## 探讨记录

1. **消息协议**: exits 传 string[] 而非完整映射，前端只需知道可走方向
2. **不可走方向**: 选择置灰+禁止点击（方案 A），优先直观体验
3. **进出广播**: 复用 broadcast + 富文本日志，不定义专门消息类型
4. **登录流程**: 确认包含在本次范围内，登录已有角色需恢复到 lastRoom
5. **store 发送命令**: 通过 store action 发送，遵循项目规范"组件不直接调用 WebSocketService"

---
> CX 工作流 | 功能探讨
