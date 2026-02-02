# 功能探讨: Layer 4 — 指令系统 + 生物/玩家基类

## 基本信息

- **创建时间**: 2026-02-02
- **关联项目蓝图**: #1（NodeMUD 项目蓝图）
- **前置依赖**: Layer 0 BaseEntity (Epic #38, closed), Layer 1 HB/OM (Epic #49, closed), Layer 2 BlueprintLoader (Epic #57, closed), Layer 3 游戏对象子类 (Epic #66, closed)

## 功能目标

实现游戏引擎的 Layer 4，包含四个子系统：

1. **LivingBase 生物基类** — NPC 和 Player 的共同父类，提供名字/描述/移动/指令执行能力
2. **PlayerBase 玩家基类** — 绑定 WebSocket Session，提供消息发送能力
3. **CommandManager 指令框架** — 指令注册/解析/搜索/执行/权限控制
4. **基础指令** — look/go/say 三个标准指令

## 架构定位

```
┌─────────────────────────────────────────────────────┐
│  Layer 0: BaseEntity ✅                              │
│  Dbase / Environment / Events / 心跳 / 延迟调用      │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────┴─────────────────────────────┐
│  Layer 1: HeartbeatManager + ObjectManager ✅         │
│  全局调度 / 对象注册 / GC                             │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────┴─────────────────────────────┐
│  Layer 2: BlueprintLoader ✅                          │
│  蓝图注册表 / 扫描加载 / 工厂 / 热更新               │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────┴─────────────────────────────┐
│  Layer 3: 游戏对象子类 ✅                             │
│  RoomBase / Area / NpcBase / ItemBase                │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────┴─────────────────────────────┐
│  Layer 4: 指令系统 + 生物/玩家 ← 本次                 │
│  4a. LivingBase 生物基类                              │
│  4b. PlayerBase 玩家基类                              │
│  4c. CommandManager 指令框架                          │
│  4d. 基础指令 (look/go/say)                           │
└─────────────────────────────────────────────────────┘
```

## 方案探讨

### 继承体系变更

对标 LPC 的 LIVING 概念，引入 LivingBase 作为 NPC 和 Player 的共同父类：

```
BaseEntity
  ├── RoomBase (不变)
  ├── Area (不变)
  ├── ItemBase (不变)
  └── LivingBase (新增)
        ├── getName()/getShort()/getLong()  ← 从 NpcBase 提升
        ├── go(direction)                  ← 移动能力
        ├── executeCommand(input)          ← 委托 CommandManager
        ├── receiveMessage(msg)            ← 消息接收
        ├── NpcBase (重构: 改为继承 LivingBase)
        │     └── onAI(), onChat(), onHeartbeat()
        └── PlayerBase (新增)
              └── session 绑定, sendToClient()
```

**NpcBase 重构影响**：NpcBase 已有的 getName/getShort/getLong 方法提升到 LivingBase，NpcBase 改为继承 LivingBase。已有的 NpcBase 测试需要验证不受影响。

### LivingBase — 生物基类

```typescript
// server/src/engine/game-objects/living-base.ts

export class LivingBase extends BaseEntity {
  /** 获取名字 */
  getName(): string {
    return this.get<string>('name') ?? '无名';
  }

  /** 获取简短描述 */
  getShort(): string {
    return this.get<string>('short') ?? this.getName();
  }

  /** 获取详细描述 */
  getLong(): string {
    return this.get<string>('long') ?? `你看到了${this.getName()}。`;
  }

  /**
   * 移动到指定方向
   * 查询当前房间出口，找到目标房间蓝图，执行 moveTo
   */
  async go(direction: string): Promise<boolean> {
    const room = this.getEnvironment();
    if (!(room instanceof RoomBase)) return false;
    const targetId = room.getExit(direction);
    if (!targetId) return false;
    const targetRoom = ServiceLocator.blueprintFactory.getVirtual(targetId);
    if (!targetRoom) return false;
    return this.moveTo(targetRoom);
  }

  /**
   * 执行指令（委托 CommandManager）
   */
  executeCommand(input: string): CommandResult {
    return ServiceLocator.commandManager.execute(this, input);
  }

  /**
   * 接收消息（子类覆写处理）
   */
  receiveMessage(msg: string): void {}
}
```

**注意**：战斗属性（hp/attack/defense）不在 Layer 4 定义，完全延后到 Phase 2 战斗系统。

### PlayerBase — 玩家基类

```typescript
// server/src/engine/game-objects/player-base.ts

export class PlayerBase extends LivingBase {
  static virtual = false; // 玩家可克隆（每个在线玩家一个实例）

  /** WebSocket 发送回调 */
  private _sendCallback: ((data: any) => void) | null = null;

  /** 绑定 WebSocket 发送能力 */
  bindConnection(sendCallback: (data: any) => void): void {
    this._sendCallback = sendCallback;
  }

  /** 解绑连接 */
  unbindConnection(): void {
    this._sendCallback = null;
  }

  /** 发送消息到客户端 */
  sendToClient(data: any): void {
    if (this._sendCallback) {
      this._sendCallback(data);
    }
  }

  /** 覆写 receiveMessage，转发到客户端 */
  receiveMessage(msg: string): void {
    this.sendToClient({ type: 'message', data: { content: msg } });
  }

  /** 权限等级（默认普通玩家） */
  getPermission(): number {
    return this.get<number>('permission') ?? Permission.PLAYER;
  }
}
```

### 权限体系（对标炎黄 MUD command.h）

```typescript
// server/src/engine/types/command.ts

/** 权限等级枚举（对标炎黄 MUD 权限体系） */
export enum Permission {
  NPC = -1, // NPC（std/ + skill/）
  GUEST = 0, // 未登录/观察者
  PLAYER = 1, // 普通玩家（std/ + usr/ + skill/）
  IMMORTAL = 2, // 荣誉玩家（+ imm/）
  WIZARD = 3, // 巫师/开发者（+ wiz/）
  ARCH = 4, // 大巫师/高级管理（+ arch/）
  ADMIN = 5, // 天神/超管（+ adm/）
}

/** 目录 → 最低权限映射 */
export const COMMAND_DIR_PERMISSIONS: Record<string, Permission> = {
  std: Permission.NPC,
  usr: Permission.PLAYER,
  skill: Permission.NPC,
  imm: Permission.IMMORTAL,
  wiz: Permission.WIZARD,
  arch: Permission.ARCH,
  adm: Permission.ADMIN,
  chat: Permission.PLAYER,
};

/** 各权限可访问的目录列表（高权限包含低权限） */
export const PERMISSION_PATHS: Record<Permission, string[]> = {
  [Permission.NPC]: ['std', 'skill'],
  [Permission.GUEST]: ['std'],
  [Permission.PLAYER]: ['usr', 'std', 'skill'],
  [Permission.IMMORTAL]: ['imm', 'usr', 'std', 'skill'],
  [Permission.WIZARD]: ['wiz', 'imm', 'usr', 'std', 'skill'],
  [Permission.ARCH]: ['arch', 'wiz', 'imm', 'usr', 'std', 'skill'],
  [Permission.ADMIN]: ['adm', 'arch', 'wiz', 'imm', 'usr', 'std', 'skill'],
};
```

### CommandManager — 指令管理器

```typescript
// server/src/engine/command-manager.ts

export class CommandManager {
  /** 已注册的指令 Map: name/alias → ICommand */
  private commands: Map<string, ICommand> = new Map();

  /** 按目录分类的指令 */
  private dirCommands: Map<string, Map<string, ICommand>> = new Map();

  /** 注册指令 */
  register(command: ICommand, directory: string): void;

  /** 注销指令 */
  unregister(name: string): void;

  /**
   * 解析输入
   * "look north" → { name: 'look', args: ['north'] }
   * 支持中文指令名和别名
   */
  parse(input: string): { name: string; args: string[] };

  /**
   * 执行指令
   * 1. 解析输入
   * 2. 根据执行者权限确定可搜索目录
   * 3. 按目录优先级搜索指令
   * 4. 权限检查
   * 5. 执行
   */
  execute(executor: LivingBase, input: string): CommandResult;

  /** 按名字/别名查找指令（在权限范围内） */
  findCommand(name: string, permission: Permission): ICommand | undefined;

  /** 获取所有指令 */
  getAll(): ICommand[];

  /** 获取指令数量 */
  getCount(): number;
}
```

### ICommand 接口 + @Command 装饰器

```typescript
// server/src/engine/types/command.ts

export interface ICommand {
  name: string;
  aliases: string[];
  description: string;
  permission: Permission;
  directory: string; // 所在目录 (std/usr/wiz/...)
  execute(executor: LivingBase, args: string[]): CommandResult;
}

export interface CommandMeta {
  name: string;
  aliases?: string[];
  description?: string;
}

export interface CommandResult {
  success: boolean;
  message?: string;
  data?: any;
}

// @Command 装饰器 — 标注指令元数据
export function Command(meta: CommandMeta): ClassDecorator;
```

### CommandLoader — 指令扫描加载器

```typescript
// server/src/engine/command-loader.ts

export class CommandLoader {
  /**
   * 扫描 commands/ 多层目录，自动发现并注册指令
   *
   * 扫描流程:
   * 1. 遍历 commands/ 下的子目录 (std/, usr/, wiz/, ...)
   * 2. 子目录名决定指令的 directory 和默认权限
   * 3. 每个 .js 文件 require → 读取 @Command 元数据 → 注册到 CommandManager
   */
  scanAndLoad(commandsDir: string): void;

  /** 加载单个指令文件 */
  loadCommand(filePath: string, directory: string): ICommand | null;

  /** 热更新指令 */
  update(commandName: string): void;
}
```

### 基础指令设计

#### look — 查看环境

```typescript
// server/src/engine/commands/std/look.ts

@Command({ name: 'look', aliases: ['l', '看'], description: '查看当前位置或对象' })
export default class LookCommand implements ICommand {
  execute(executor: LivingBase, args: string[]): CommandResult {
    if (args.length === 0) {
      // look — 查看当前房间
      const room = executor.getEnvironment();
      // 返回房间描述 + 出口 + 房间内对象列表
    } else {
      // look <target> — 查看指定对象
      // 在房间 inventory 中搜索匹配的对象
    }
  }
}
```

#### go — 移动

```typescript
// server/src/engine/commands/std/go.ts

@Command({ name: 'go', aliases: ['走', '移动'], description: '向指定方向移动' })
export default class GoCommand implements ICommand {
  execute(executor: LivingBase, args: string[]): CommandResult {
    const direction = args[0];
    if (!direction) return { success: false, message: '去哪里？' };
    // 委托 LivingBase.go(direction)
  }
}
```

**方向别名**：north/south/east/west/up/down 以及中文"北/南/东/西/上/下"

#### say — 说话

```typescript
// server/src/engine/commands/std/say.ts

@Command({ name: 'say', aliases: ['说', '聊'], description: '在房间内说话' })
export default class SayCommand implements ICommand {
  execute(executor: LivingBase, args: string[]): CommandResult {
    const message = args.join(' ');
    if (!message) return { success: false, message: '说什么？' };
    const room = executor.getEnvironment();
    // room.broadcast() 广播给房间内所有对象
  }
}
```

### WebSocket 集成

```
客户端:
  { type: 'command', data: { input: 'look north' } }

Gateway (websocket.gateway.ts):
  case 'command':
    await this.commandHandler.handleCommand(client, session, message.data);

CommandHandler:
  1. 通过 session.characterId 查找 PlayerBase 实例
  2. player.executeCommand(input)
  3. CommandManager.execute(player, input)
  4. 结果通过 player.sendToClient() 返回客户端
```

### 目录结构

```
server/src/engine/
├── game-objects/
│   ├── living-base.ts           # 新增: 生物基类
│   ├── player-base.ts           # 新增: 玩家基类
│   ├── npc-base.ts              # 修改: 改为继承 LivingBase
│   ├── room-base.ts             # 不变
│   ├── area.ts                  # 不变
│   ├── item-base.ts             # 不变
│   └── index.ts                 # 修改: 新增导出
├── command-manager.ts           # 新增: 指令管理器
├── command-loader.ts            # 新增: 指令扫描加载器
├── types/
│   └── command.ts               # 新增: ICommand/Permission/CommandMeta
├── commands/                    # 新增: 指令目录
│   ├── std/                     # 标准游戏指令
│   │   ├── look.ts
│   │   ├── go.ts
│   │   └── say.ts
│   ├── usr/                     # 玩家功能指令（后续）
│   ├── wiz/                     # 巫师开发指令（后续）
│   └── adm/                     # 管理员指令（后续）
└── __tests__/
    ├── living-base.spec.ts      # 新增
    ├── player-base.spec.ts      # 新增
    ├── command-manager.spec.ts  # 新增
    ├── command-loader.spec.ts   # 新增
    └── commands/
        ├── look.spec.ts         # 新增
        ├── go.spec.ts           # 新增
        └── say.spec.ts          # 新增
```

### 考虑过的替代方案

| 方案                   | 优点             | 缺点                 | 结论                      |
| ---------------------- | ---------------- | -------------------- | ------------------------- |
| 不引入 LivingBase      | 不需重构 NpcBase | NPC/Player 重复代码  | 放弃                      |
| 战斗属性放 LivingBase  | 一步到位         | 战斗系统还未设计     | 延后到 Phase 2            |
| 指令放 world/commands/ | 与蓝图一致       | 指令和蓝图混合不清晰 | 放弃，放 engine/commands/ |
| 手动注册指令           | 简单             | 每次新增要改代码     | 放弃，用目录扫描          |
| 单层指令目录           | 简单             | 无法按权限分组       | 放弃，采用多层目录        |
| NpcBase 不改继承       | 不破坏已有       | Living 属性要重复    | 放弃，重构继承链          |

## 与现有功能的关系

- **依赖**: Layer 0-3 全部能力
- **修改**: NpcBase（改继承 LivingBase）、game-objects/index.ts（新增导出）、ServiceLocator（新增 commandManager）、EngineModule（注册 CommandManager/CommandLoader）、WebSocket Gateway（新增 command 消息路由）
- **复用**: BaseEntity 的 dbase/environment/events、BlueprintFactory（go 指令需要 getVirtual）、RoomBase 的 getExits/broadcast
- **后续依赖者**: 示例蓝图、聊天系统、战斗系统

## 边界和约束

- LivingBase 只提供名字/描述/移动/指令执行，不含战斗属性
- Layer 4 只做 std/ 下的 look/go/say 三个指令
- 其他目录（usr/wiz/adm）创建但不放指令，留给后续
- PlayerBase 与 character 数据库的对接方式留给 PRD/Design 阶段确认
- 指令输出格式细节留给各指令的 Design 阶段

## 开放问题

- PlayerBase 实例的生命周期管理（创建/销毁与登录/登出的关系）
- look 指令的输出格式（纯文本 vs 结构化 JSON 消息）
- 是否需要示例蓝图（两房间世界）做端到端验证
- 已有 `server/src/command/` 目录下的占位文件如何处理（删除 or 迁移）

## 探讨记录

### 关键决策过程

1. **LivingBase 引入**: 对标 LPC 的 LIVING 概念，NPC 和 Player 需要共同的移动/指令执行能力。选择引入 LivingBase 而非让两者各自实现，避免重复代码。

2. **权限体系**: 研究了炎黄 MUD 的 `command.h`，采纳其多层目录 + 权限等级 + 目录搜索策略的设计。Permission 枚举从 NPC(-1) 到 ADMIN(5)，每个权限等级对应可搜索的目录列表。

3. **指令注册机制**: 选择装饰器标注 + 目录扫描自动发现。@Command 装饰器提供类型安全的元数据，CommandLoader 扫描多层目录自动加载注册。

4. **指令目录位置**: 选择 `engine/commands/` 而非 `world/commands/` 或 `server/src/commands/`，因为指令是引擎核心能力，与 Layer 0-3 保持在同一目录下。

5. **战斗属性延后**: 确认 LivingBase 不包含战斗属性，完全留给 Phase 2 战斗系统。

6. **Layer 4 范围**: 确认包含 LivingBase + PlayerBase + CommandManager + CommandLoader + 三个基础指令（look/go/say），每个后续指令需要单独探讨。

### 参考资料

- 炎黄 MUD 开源代码: https://github.com/oiuv/mud
- 炎黄 MUD command.h 权限定义
- FluffOS LPC 指令系统设计

---

> CX 工作流 | 功能探讨
