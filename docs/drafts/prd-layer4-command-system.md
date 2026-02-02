# PRD: Layer 4 — 指令系统 + 生物/玩家基类

## 基本信息

- **创建时间**: 2026-02-02
- **优先级**: P0（阻塞示例蓝图和游戏可玩性）
- **技术栈**: TypeScript + NestJS
- **代码位置**: `server/src/engine/`（指令框架 + 基类）、`packages/core/`（消息类型）
- **关联文档**: Scope #72（方案探讨定稿）、Epic #66 Layer 3（前置依赖，已完成）

## 功能概述

Layer 4 是引擎架构中实现"可交互游戏世界"的关键层。在 Layer 0-3 构建了基础实体、对象管理、蓝图加载和游戏对象子类之后，Layer 4 添加：

1. **LivingBase 生物基类** — NPC 和 Player 的共同父类，对标 LPC LIVING
2. **PlayerBase 玩家基类** — 绑定 WebSocket Session，玩家在游戏世界中的代理
3. **CommandManager 指令框架** — 对标炎黄 MUD 指令系统，多层目录 + 权限 + 装饰器
4. **基础指令** — look/go/say，验证指令系统端到端工作

完成 Layer 4 后，游戏引擎将具备"玩家登录 → 进入房间 → 查看/移动/说话"的核心交互能力。

## 用户场景

| 场景             | 依赖的能力                      | 示例                                    |
| ---------------- | ------------------------------- | --------------------------------------- |
| 玩家查看当前房间 | look 指令 + RoomBase            | `look` → 显示房间描述、出口、房间内对象 |
| 玩家移动         | go 指令 + LivingBase.go()       | `go north` → 移动到北面房间             |
| 玩家说话         | say 指令 + RoomBase.broadcast() | `say 你好` → 房间内所有人看到消息       |
| NPC 使用指令     | CommandManager + LivingBase     | NPC 通过 onAI() 调用 executeCommand()   |
| 巫师开发调试     | wiz/ 目录指令（后续）           | `clone npc/bandit` → 创建 NPC 实例      |
| 新增指令         | @Command 装饰器 + 目录扫描      | 开发者创建 .ts 文件放入对应目录即可     |

## 详细需求

### 1. LivingBase — 生物基类

继承 BaseEntity。NPC 和 Player 的共同父类。

**便捷方法（从 NpcBase 提升）：**

- `getName(): string` — 获取名字，fallback `'无名'`
- `getShort(): string` — 获取简短描述，fallback getName()
- `getLong(): string` — 获取详细描述，fallback `'你看到了${getName()}。'`

**新增能力：**

- `go(direction: string): Promise<boolean>` — 查询当前房间出口，找到目标房间蓝图，执行 moveTo
- `executeCommand(input: string): CommandResult` — 委托 CommandManager 执行指令
- `receiveMessage(msg: string): void` — 接收消息（子类覆写处理）

**NpcBase 重构：** 改为继承 LivingBase，移除已提升的方法，保留 NPC 特有的 onAI/onChat/onHeartbeat。

### 2. PlayerBase — 玩家基类

继承 LivingBase，`static virtual = false`（每个在线玩家一个实例）。

**功能点：**

- `bindConnection(sendCallback)` — 绑定 WebSocket 发送能力
- `unbindConnection()` — 解绑连接（断线时调用）
- `sendToClient(data)` — 发送消息到客户端
- `receiveMessage(msg)` — 覆写，将消息转发到客户端
- `getPermission(): Permission` — 获取权限等级（dbase 'permission'，默认 PLAYER）

### 3. 权限体系

对标炎黄 MUD `command.h`：

```typescript
enum Permission {
  NPC = -1, // NPC（std/ + skill/）
  GUEST = 0, // 未登录
  PLAYER = 1, // 普通玩家（std/ + usr/ + skill/）
  IMMORTAL = 2, // 荣誉玩家（+ imm/）
  WIZARD = 3, // 巫师（+ wiz/）
  ARCH = 4, // 大巫师（+ arch/）
  ADMIN = 5, // 天神（+ adm/）
}
```

目录搜索策略：根据执行者权限确定可搜索的目录列表，按优先级搜索匹配的指令。

### 4. CommandManager — 指令管理器

NestJS Injectable 服务。

**功能点：**

- `register(command, directory)` — 注册指令到指定目录
- `unregister(name)` — 注销指令
- `parse(input)` — 解析输入为 `{ name, args }`
- `execute(executor, input)` — 解析 → 搜索 → 权限检查 → 执行
- `findCommand(name, permission)` — 在权限范围内搜索指令
- `getAll()` / `getCount()` — 查询

### 5. CommandLoader — 指令扫描加载器

NestJS Injectable 服务。

**功能点：**

- `scanAndLoad(commandsDir)` — 扫描多层子目录，自动加载注册指令
- `loadCommand(filePath, directory)` — 加载单个指令文件
- `update(commandName)` — 热更新指令

**加载流程：**

1. 遍历 `commands/` 下的子目录（std/, usr/, wiz/, ...）
2. 子目录名决定指令的 directory 属性
3. 每个文件 `require()` → 读取 `@Command` 元数据 → 实例化 → 注册到 CommandManager

### 6. @Command 装饰器

标注指令类的元数据：

```typescript
@Command({ name: 'look', aliases: ['l', '看'], description: '查看当前位置' })
export default class LookCommand implements ICommand { ... }
```

### 7. 基础指令

#### look（查看）

- `look` — 查看当前房间（描述 + 出口 + 房间内对象列表）
- `look <target>` — 查看指定对象（在房间 inventory 中搜索）

#### go（移动）

- `go <direction>` — 向指定方向移动
- 支持方向别名：north/south/east/west/up/down + 北/南/东/西/上/下

#### say（说话）

- `say <message>` — 在房间内说话，广播给房间内所有对象

### 8. WebSocket 集成

- 新增消息类型：`command`（Client → Server）
- Gateway 新增 case 分支：`case 'command'` → CommandHandler
- CommandHandler 通过 Session 找到 PlayerBase 实例 → executeCommand
- 结果通过 player.sendToClient() 返回

### 9. ServiceLocator 变更

新增：

- `commandManager: CommandManager`
- `commandLoader: CommandLoader`

### 10. EngineModule 变更

- 注册 CommandManager、CommandLoader 为 providers 和 exports
- `onModuleInit()` 中调用 `commandLoader.scanAndLoad(commandsDir)`

## 关联文档

| 文档          | Issue | 状态   | 关键继承点                       |
| ------------- | ----- | ------ | -------------------------------- |
| Scope Layer 4 | #72   | open   | 全部方案决策来源                 |
| Epic Layer 3  | #66   | closed | RoomBase/NpcBase/ItemBase        |
| Epic Layer 2  | #57   | closed | BlueprintLoader 蓝图加载         |
| Epic Layer 1  | #49   | closed | HeartbeatManager + ObjectManager |
| Epic Layer 0  | #38   | closed | BaseEntity 基类                  |
| 项目蓝图      | #1    | open   | Layer 架构 + Command Pattern     |

## 现有代码基础

### 可复用

| 模块              | 路径                               | 复用方式                   |
| ----------------- | ---------------------------------- | -------------------------- |
| BaseEntity        | `engine/base-entity.ts`            | LivingBase 继承            |
| RoomBase          | `engine/game-objects/room-base.ts` | look/go 指令依赖           |
| NpcBase           | `engine/game-objects/npc-base.ts`  | 重构继承 LivingBase        |
| BlueprintFactory  | `engine/blueprint-factory.ts`      | go 指令获取目标房间        |
| BlueprintLoader   | `engine/blueprint-loader.ts`       | CommandLoader 参考扫描模式 |
| ServiceLocator    | `engine/service-locator.ts`        | 新增 Layer 4 服务          |
| EngineModule      | `engine/engine.module.ts`          | 注册 Layer 4 providers     |
| WebSocket Gateway | `websocket/websocket.gateway.ts`   | 新增 command 消息路由      |

### 需修改

- `engine/game-objects/npc-base.ts` — 改为继承 LivingBase
- `engine/game-objects/index.ts` — 新增 LivingBase/PlayerBase 导出
- `engine/service-locator.ts` — 新增 commandManager/commandLoader
- `engine/engine.module.ts` — 注册 Layer 4 providers + scanAndLoad
- `websocket/websocket.gateway.ts` — 新增 command 消息路由
- `packages/core/` — 新增 command 消息类型（可选，取决于消息格式决策）

### 需新建

- `engine/game-objects/living-base.ts` — 生物基类
- `engine/game-objects/player-base.ts` — 玩家基类
- `engine/command-manager.ts` — 指令管理器
- `engine/command-loader.ts` — 指令扫描加载器
- `engine/types/command.ts` — ICommand/Permission/CommandMeta/CommandResult
- `engine/commands/std/look.ts` — look 指令
- `engine/commands/std/go.ts` — go 指令
- `engine/commands/std/say.ts` — say 指令
- 测试文件 x7

## 代码影响范围

- **后端服务 engine/**: 新增 8+ 文件 + 修改 4 个文件
- **后端服务 websocket/**: 修改 gateway + 可能新增 CommandHandler
- **共享包 core/**: 可能新增 command 消息类型
- **前端界面**: 无影响（Layer 4 仅后端）
- **数据层**: 无影响

## 任务拆分（初步）

- [ ] 定义 ICommand/Permission/CommandMeta/CommandResult 类型
- [ ] 实现 LivingBase 生物基类 + 测试
- [ ] 重构 NpcBase 继承 LivingBase + 验证已有测试
- [ ] 实现 PlayerBase 玩家基类 + 测试
- [ ] 实现 CommandManager 指令管理器 + 测试
- [ ] 实现 @Command 装饰器
- [ ] 实现 CommandLoader 指令扫描加载器 + 测试
- [ ] 实现 look 指令 + 测试
- [ ] 实现 go 指令 + 测试
- [ ] 实现 say 指令 + 测试
- [ ] ServiceLocator + EngineModule + Gateway 集成

## 验收标准

- [ ] LivingBase 继承 BaseEntity，提供 getName/getShort/getLong/go/executeCommand
- [ ] NpcBase 改为继承 LivingBase，已有 15 个测试全部通过
- [ ] PlayerBase 继承 LivingBase，支持 bindConnection/sendToClient
- [ ] Permission 枚举定义 7 个等级（NPC 到 ADMIN）
- [ ] CommandManager 能注册/注销/搜索/执行指令
- [ ] CommandManager 按权限搜索对应目录的指令
- [ ] @Command 装饰器能标注指令元数据
- [ ] CommandLoader 能扫描 commands/ 多层目录自动加载注册
- [ ] look 指令能显示房间描述、出口、房间内对象
- [ ] go 指令能根据方向移动（支持中英文方向名）
- [ ] say 指令能广播消息给房间内所有对象
- [ ] WebSocket Gateway 能路由 command 消息
- [ ] 所有新代码有完整单元测试，现有 251 个测试不受影响（NpcBase 测试通过）
- [ ] 后端能正常启动（NestJS DI 无报错）

## 边界和约束

- LivingBase 不含战斗属性，完全延后到 Phase 2
- Layer 4 只做 std/ 下的 look/go/say 三个指令
- 其他目录（usr/wiz/adm）创建但不放指令
- PlayerBase 与 character 数据库的完整对接留给后续
- 指令输出格式在 Design 阶段确定

## 开放问题

- PlayerBase 实例的生命周期（创建/销毁与登录/登出的关系）
- look 指令输出是纯文本还是结构化 JSON
- 是否需要示例蓝图做端到端验证
- `server/src/command/` 下已有的空占位文件如何处理

---

> CX 工作流 | PRD | Scope #72
