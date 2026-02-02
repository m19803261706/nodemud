# Design Doc: Layer 4 — 指令系统 + 生物/玩家基类

## 关联

- PRD: #73
- Scope: #72
- 关联 Epic: #66（Layer 3 游戏对象子类，已完成）

## 基于现有代码

| 模块                  | 路径                               | 复用/修改方式                          |
| --------------------- | ---------------------------------- | -------------------------------------- |
| BaseEntity            | `engine/base-entity.ts`            | LivingBase 继承（不修改）              |
| NpcBase               | `engine/game-objects/npc-base.ts`  | 修改: 改继承 LivingBase                |
| RoomBase              | `engine/game-objects/room-base.ts` | 复用: look/go 指令依赖（不修改）       |
| BlueprintFactory      | `engine/blueprint-factory.ts`      | 复用: go 指令 getVirtual（不修改）     |
| BlueprintLoader       | `engine/blueprint-loader.ts`       | 参考: CommandLoader 扫描模式（不修改） |
| ServiceLocator        | `engine/service-locator.ts`        | 修改: 新增 Layer 4 服务                |
| EngineModule          | `engine/engine.module.ts`          | 修改: 注册 Layer 4 providers           |
| Gateway               | `websocket/websocket.gateway.ts`   | 修改: 新增 command 路由                |
| game-objects/index.ts | `engine/game-objects/index.ts`     | 修改: 新增导出                         |

## 架构概览

```
玩家输入 "look north"
  ↓
Client WebSocket → { type: 'command', data: { input: 'look north' } }
  ↓
Gateway.handleMessage() → case 'command'
  ↓
CommandHandler.handleCommand(client, session, data)
  ↓ 查找 session.playerId → ObjectManager.findById()
PlayerBase.executeCommand('look north')
  ↓
CommandManager.execute(player, 'look north')
  ↓ parse → findCommand(权限搜索) → 执行
LookCommand.execute(player, ['north'])
  ↓ 结果
player.sendToClient({ type: 'commandResult', data: {...} })
  ↓
Client WebSocket ← 渲染结果
```

## 后端设计

### 代码路径

```
server/src/engine/
├── game-objects/
│   ├── living-base.ts           # 新增
│   ├── player-base.ts           # 新增
│   ├── npc-base.ts              # 修改（继承 LivingBase）
│   ├── room-base.ts             # 不变
│   ├── area.ts                  # 不变
│   ├── item-base.ts             # 不变
│   └── index.ts                 # 修改（新增导出）
├── command-manager.ts           # 新增
├── command-loader.ts            # 新增
├── types/
│   ├── command.ts               # 新增
│   └── ...已有类型
├── commands/
│   ├── std/
│   │   ├── look.ts              # 新增
│   │   ├── go.ts                # 新增
│   │   └── say.ts               # 新增
│   ├── usr/                     # 新增空目录
│   ├── wiz/                     # 新增空目录
│   └── adm/                     # 新增空目录
├── service-locator.ts           # 修改
├── engine.module.ts             # 修改
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

### types/command.ts — 类型定义

```typescript
// server/src/engine/types/command.ts

import type { LivingBase } from '../game-objects/living-base';

/** 权限等级（对标炎黄 MUD command.h） */
export enum Permission {
  NPC = -1,
  GUEST = 0,
  PLAYER = 1,
  IMMORTAL = 2,
  WIZARD = 3,
  ARCH = 4,
  ADMIN = 5,
}

/** 各权限可搜索的目录列表（高权限包含低权限目录） */
export const PERMISSION_PATHS: Record<number, string[]> = {
  [Permission.NPC]: ['std'],
  [Permission.GUEST]: ['std'],
  [Permission.PLAYER]: ['usr', 'std'],
  [Permission.IMMORTAL]: ['imm', 'usr', 'std'],
  [Permission.WIZARD]: ['wiz', 'imm', 'usr', 'std'],
  [Permission.ARCH]: ['arch', 'wiz', 'imm', 'usr', 'std'],
  [Permission.ADMIN]: ['adm', 'arch', 'wiz', 'imm', 'usr', 'std'],
};

/** 指令元数据（@Command 装饰器参数） */
export interface CommandMeta {
  name: string;
  aliases?: string[];
  description?: string;
}

/** 指令执行结果 */
export interface CommandResult {
  success: boolean;
  message?: string;
  data?: any;
}

/** 指令接口 */
export interface ICommand {
  name: string;
  aliases: string[];
  description: string;
  directory: string;
  execute(executor: LivingBase, args: string[]): CommandResult;
}

/** @Command 装饰器元数据 key */
export const COMMAND_META_KEY = 'command:meta';

/** @Command 装饰器 */
export function Command(meta: CommandMeta): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata(COMMAND_META_KEY, meta, target);
  };
}
```

**注意**: skill/ 目录在 Layer 4 不实现（留给后续技能系统），PERMISSION_PATHS 中暂不包含 skill。

### LivingBase 详细设计

```typescript
// server/src/engine/game-objects/living-base.ts

import { BaseEntity } from '../base-entity';
import { ServiceLocator } from '../service-locator';
import type { CommandResult } from '../types/command';
import { Permission } from '../types/command';

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
   * 查询当前房间出口 → 获取目标房间实例 → moveTo
   */
  async go(direction: string): Promise<boolean> {
    const env = this.getEnvironment();
    // 动态导入避免循环引用
    const { RoomBase } = require('./room-base');
    if (!(env instanceof RoomBase)) return false;

    const targetId = env.getExit(direction);
    if (!targetId) return false;

    if (!ServiceLocator.initialized) return false;
    const targetRoom = ServiceLocator.blueprintFactory.getVirtual(targetId);
    if (!targetRoom) return false;

    return this.moveTo(targetRoom);
  }

  /**
   * 执行指令（委托 CommandManager）
   */
  executeCommand(input: string): CommandResult {
    if (!ServiceLocator.initialized || !ServiceLocator.commandManager) {
      return { success: false, message: '指令系统未初始化' };
    }
    return ServiceLocator.commandManager.execute(this, input);
  }

  /**
   * 获取权限等级（默认 NPC）
   */
  getPermission(): Permission {
    return this.get<number>('permission') ?? Permission.NPC;
  }

  /**
   * 接收消息（子类覆写）
   */
  receiveMessage(msg: string): void {}
}
```

### NpcBase 重构

```typescript
// server/src/engine/game-objects/npc-base.ts（修改后）

import { LivingBase } from './living-base';
import type { BaseEntity } from '../base-entity';

export class NpcBase extends LivingBase {
  /** NPC 可克隆 */
  static virtual = false;

  /** 心跳回调，默认触发 onAI */
  public onHeartbeat(): void {
    this.onAI();
  }

  /** AI 行为钩子（蓝图覆写） */
  protected onAI(): void {}

  /** 对话接口（蓝图覆写） */
  onChat(speaker: BaseEntity, message: string): void {}
}
```

**关键变更**：

- `extends BaseEntity` → `extends LivingBase`
- 移除 getName/getShort/getLong（已在 LivingBase 中）
- 保留 NPC 特有的 onHeartbeat/onAI/onChat
- 已有 15 个 NpcBase 测试应全部通过（API 不变）

### PlayerBase 详细设计

```typescript
// server/src/engine/game-objects/player-base.ts

import { LivingBase } from './living-base';
import { Permission } from '../types/command';

export class PlayerBase extends LivingBase {
  /** 玩家可克隆（每个在线玩家一个实例） */
  static virtual = false;

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

  /** 是否已连接 */
  isConnected(): boolean {
    return this._sendCallback !== null;
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

  /** 覆写权限，默认普通玩家 */
  getPermission(): Permission {
    return this.get<number>('permission') ?? Permission.PLAYER;
  }
}
```

### CommandManager 详细设计

```typescript
// server/src/engine/command-manager.ts

import { Injectable, Logger } from '@nestjs/common';
import type { ICommand, CommandResult } from './types/command';
import { Permission, PERMISSION_PATHS } from './types/command';
import type { LivingBase } from './game-objects/living-base';

@Injectable()
export class CommandManager {
  private readonly logger = new Logger(CommandManager.name);

  /** 按目录分类的指令: directory → (name → ICommand) */
  private dirCommands: Map<string, Map<string, ICommand>> = new Map();

  /** 全局别名索引: alias → { command, directory } */
  private aliasIndex: Map<string, { command: ICommand; directory: string }> = new Map();

  /** 注册指令 */
  register(command: ICommand, directory: string): void {
    if (!this.dirCommands.has(directory)) {
      this.dirCommands.set(directory, new Map());
    }
    const dirMap = this.dirCommands.get(directory)!;
    dirMap.set(command.name, command);

    // 注册名字和别名到索引
    this.aliasIndex.set(command.name, { command, directory });
    for (const alias of command.aliases) {
      this.aliasIndex.set(alias, { command, directory });
    }

    command.directory = directory;
    this.logger.log(`指令已注册: ${directory}/${command.name}`);
  }

  /** 注销指令 */
  unregister(name: string): void {
    const entry = this.aliasIndex.get(name);
    if (!entry) return;
    const { command, directory } = entry;

    // 从目录 Map 移除
    const dirMap = this.dirCommands.get(directory);
    if (dirMap) dirMap.delete(command.name);

    // 从别名索引移除
    this.aliasIndex.delete(command.name);
    for (const alias of command.aliases) {
      this.aliasIndex.delete(alias);
    }
  }

  /** 解析输入 */
  parse(input: string): { name: string; args: string[] } {
    const trimmed = input.trim();
    const parts = trimmed.split(/\s+/);
    return { name: parts[0] ?? '', args: parts.slice(1) };
  }

  /** 执行指令 */
  execute(executor: LivingBase, input: string): CommandResult {
    const { name, args } = this.parse(input);
    if (!name) return { success: false, message: '请输入指令。' };

    const permission = executor.getPermission();
    const command = this.findCommand(name, permission);

    if (!command) {
      return { success: false, message: `未知指令: ${name}` };
    }

    return command.execute(executor, args);
  }

  /** 按权限搜索指令（按目录优先级） */
  findCommand(name: string, permission: Permission): ICommand | undefined {
    const paths = PERMISSION_PATHS[permission];
    if (!paths) return undefined;

    for (const dir of paths) {
      const dirMap = this.dirCommands.get(dir);
      if (!dirMap) continue;

      // 先按名字查
      if (dirMap.has(name)) return dirMap.get(name);

      // 再按别名查
      for (const cmd of dirMap.values()) {
        if (cmd.aliases.includes(name)) return cmd;
      }
    }

    return undefined;
  }

  /** 获取所有指令 */
  getAll(): ICommand[] {
    const all: ICommand[] = [];
    for (const dirMap of this.dirCommands.values()) {
      for (const cmd of dirMap.values()) {
        all.push(cmd);
      }
    }
    return all;
  }

  /** 获取指令数量 */
  getCount(): number {
    let count = 0;
    for (const dirMap of this.dirCommands.values()) {
      count += dirMap.size;
    }
    return count;
  }

  /** 清空（测试用） */
  clear(): void {
    this.dirCommands.clear();
    this.aliasIndex.clear();
  }
}
```

### CommandLoader 详细设计

```typescript
// server/src/engine/command-loader.ts

import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { CommandManager } from './command-manager';
import { COMMAND_META_KEY } from './types/command';
import type { ICommand, CommandMeta } from './types/command';

@Injectable()
export class CommandLoader {
  private readonly logger = new Logger(CommandLoader.name);

  constructor(private readonly commandManager: CommandManager) {}

  /** 扫描 commands/ 多层目录 */
  scanAndLoad(commandsDir: string): void {
    if (!fs.existsSync(commandsDir)) {
      this.logger.warn(`指令目录不存在: ${commandsDir}`);
      return;
    }

    const subDirs = fs
      .readdirSync(commandsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    let total = 0;
    for (const dir of subDirs) {
      const dirPath = path.join(commandsDir, dir);
      const files = fs
        .readdirSync(dirPath)
        .filter((f) => f.endsWith('.js') || (process.env.NODE_ENV === 'test' && f.endsWith('.ts')));

      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const command = this.loadCommand(filePath, dir);
        if (command) total++;
      }
    }

    this.logger.log(`指令加载完成: ${total} 个指令`);
  }

  /** 加载单个指令文件 */
  loadCommand(filePath: string, directory: string): ICommand | null {
    try {
      const module = require(filePath);
      const CommandClass = module.default || module;

      if (typeof CommandClass !== 'function') {
        this.logger.warn(`跳过非类导出: ${filePath}`);
        return null;
      }

      // 读取 @Command 装饰器元数据
      const meta: CommandMeta | undefined = Reflect.getMetadata(COMMAND_META_KEY, CommandClass);
      if (!meta) {
        this.logger.warn(`跳过无 @Command 装饰器: ${filePath}`);
        return null;
      }

      // 实例化指令
      const instance = new CommandClass();
      instance.name = meta.name;
      instance.aliases = meta.aliases ?? [];
      instance.description = meta.description ?? '';
      instance.directory = directory;

      this.commandManager.register(instance, directory);
      return instance;
    } catch (err) {
      this.logger.warn(`加载指令失败 ${filePath}: ${(err as Error).message}`);
      return null;
    }
  }

  /** 热更新指令 */
  update(commandName: string): void {
    // 清除 require 缓存 + 重新加载
    // 类似 BlueprintLoader.update() 的机制
  }
}
```

### look 指令详细设计

```typescript
// server/src/engine/commands/std/look.ts

import { Command } from '../../types/command';
import type { ICommand, CommandResult } from '../../types/command';
import type { LivingBase } from '../../game-objects/living-base';
import { RoomBase } from '../../game-objects/room-base';

@Command({
  name: 'look',
  aliases: ['l', '看'],
  description: '查看当前位置或指定对象',
})
export default class LookCommand implements ICommand {
  name = 'look';
  aliases = ['l', '看'];
  description = '查看当前位置或指定对象';
  directory = 'std';

  execute(executor: LivingBase, args: string[]): CommandResult {
    const env = executor.getEnvironment();
    if (!env) {
      return { success: false, message: '你不在任何地方。' };
    }

    if (args.length === 0) {
      // look — 查看当前房间
      return this.lookRoom(executor, env);
    } else {
      // look <target> — 查看指定对象
      return this.lookTarget(executor, env, args.join(' '));
    }
  }

  private lookRoom(executor: LivingBase, env: any): CommandResult {
    if (env instanceof RoomBase) {
      const short = env.getShort();
      const long = env.getLong();
      const exits = env.getExits();
      const exitDirs = Object.keys(exits);

      // 列出房间内的对象（排除自己）
      const objects = env
        .getInventory()
        .filter((e) => e !== executor)
        .map((e) => {
          if ('getShort' in e && typeof (e as any).getShort === 'function') {
            return (e as any).getShort();
          }
          return e.id;
        });

      return {
        success: true,
        message: `【${short}】\n${long}`,
        data: {
          short,
          long,
          exits: exitDirs,
          objects,
        },
      };
    }

    return {
      success: true,
      message: `你在 ${env.id} 中。`,
    };
  }

  private lookTarget(executor: LivingBase, env: any, target: string): CommandResult {
    // 在环境 inventory 中搜索目标
    const found = env.findInInventory((e: any) => {
      if ('getName' in e && typeof e.getName === 'function') {
        return e.getName() === target || e.getShort?.() === target;
      }
      return e.id === target;
    });

    if (!found) {
      return { success: false, message: `这里没有 ${target}。` };
    }

    const long =
      'getLong' in found && typeof (found as any).getLong === 'function'
        ? (found as any).getLong()
        : `你看到了 ${found.id}。`;

    return { success: true, message: long };
  }
}
```

### go 指令详细设计

```typescript
// server/src/engine/commands/std/go.ts

import { Command } from '../../types/command';
import type { ICommand, CommandResult } from '../../types/command';
import type { LivingBase } from '../../game-objects/living-base';

/** 方向别名映射 */
const DIRECTION_ALIASES: Record<string, string> = {
  n: 'north',
  s: 'south',
  e: 'east',
  w: 'west',
  u: 'up',
  d: 'down',
  北: 'north',
  南: 'south',
  东: 'east',
  西: 'west',
  上: 'up',
  下: 'down',
  north: 'north',
  south: 'south',
  east: 'east',
  west: 'west',
  up: 'up',
  down: 'down',
  northeast: 'northeast',
  northwest: 'northwest',
  southeast: 'southeast',
  southwest: 'southwest',
  ne: 'northeast',
  nw: 'northwest',
  se: 'southeast',
  sw: 'southwest',
  东北: 'northeast',
  西北: 'northwest',
  东南: 'southeast',
  西南: 'southwest',
};

@Command({
  name: 'go',
  aliases: ['走', '移动'],
  description: '向指定方向移动',
})
export default class GoCommand implements ICommand {
  name = 'go';
  aliases = ['走', '移动'];
  description = '向指定方向移动';
  directory = 'std';

  execute(executor: LivingBase, args: string[]): CommandResult {
    const rawDir = args[0];
    if (!rawDir) {
      return { success: false, message: '去哪里？请指定方向。' };
    }

    const direction = DIRECTION_ALIASES[rawDir.toLowerCase()] ?? rawDir;

    // go 是异步操作，但指令框架是同步的
    // 使用 callOut 延迟执行实际移动，立即返回结果
    // 或者让 go 指令直接调用 LivingBase.go() 的同步版本
    // 此处简化：直接在 execute 中同步处理，返回 promise 结果由上层 await
    // 实际实现时 execute 可以是 async
    const env = executor.getEnvironment();
    if (!env) return { success: false, message: '你不在任何地方。' };

    const { RoomBase } = require('../../game-objects/room-base');
    if (!(env instanceof RoomBase)) {
      return { success: false, message: '你无法移动。' };
    }

    const targetId = env.getExit(direction);
    if (!targetId) {
      return { success: false, message: `这个方向没有出口。` };
    }

    // 标记方向供移动后使用
    return {
      success: true,
      message: `你向${rawDir}走去。`,
      data: { direction, targetId },
    };
  }
}
```

**注意**: go 指令的完整实现涉及 async moveTo，execute 方法签名可能需要改为 `async execute()` 返回 `Promise<CommandResult>`。这是 Design 阶段的一个决策点 — ICommand.execute 是否为 async。建议改为 async 以支持移动等异步操作。

### say 指令详细设计

```typescript
// server/src/engine/commands/std/say.ts

import { Command } from '../../types/command';
import type { ICommand, CommandResult } from '../../types/command';
import type { LivingBase } from '../../game-objects/living-base';
import { RoomBase } from '../../game-objects/room-base';

@Command({
  name: 'say',
  aliases: ['说', '聊'],
  description: '在房间内说话',
})
export default class SayCommand implements ICommand {
  name = 'say';
  aliases = ['说', '聊'];
  description = '在房间内说话';
  directory = 'std';

  execute(executor: LivingBase, args: string[]): CommandResult {
    const message = args.join(' ');
    if (!message) {
      return { success: false, message: '说什么？' };
    }

    const env = executor.getEnvironment();
    if (!env || !(env instanceof RoomBase)) {
      return { success: false, message: '你不在任何房间中。' };
    }

    const name = executor.getName();
    env.broadcast(`${name}说道: 「${message}」`, executor);

    return {
      success: true,
      message: `你说道: 「${message}」`,
    };
  }
}
```

### ServiceLocator 变更

```typescript
// 新增 Layer 4 服务
static commandManager: CommandManager;
static commandLoader: CommandLoader;

// initialize() 参数新增（可选）
commandManager?: CommandManager;
commandLoader?: CommandLoader;

// reset() 新增清理
this.commandManager = undefined as any;
this.commandLoader = undefined as any;
```

### EngineModule 变更

```typescript
// providers 和 exports 新增
CommandManager,
CommandLoader,

// constructor 新增
private readonly commandManager: CommandManager,
private readonly commandLoader: CommandLoader,

// onModuleInit() 中 ServiceLocator.initialize 新增参数
commandManager: this.commandManager,
commandLoader: this.commandLoader,

// onModuleInit() 中新增扫描
const commandsDir = path.join(__dirname, 'commands');
this.commandLoader.scanAndLoad(commandsDir);

// 日志更新
this.logger.log(`游戏引擎初始化完成（Layer 0-4: ...指令: ${this.commandManager.getCount()} 个）`);
```

### Gateway 变更

```typescript
// 新增 import
import { CommandHandler } from './handlers/command.handler';

// constructor 新增
private readonly commandHandler: CommandHandler,

// switch 新增
case 'command':
  if (!session.authenticated) {
    // 发送错误消息
    break;
  }
  await this.commandHandler.handleCommand(client, session, message.data as any);
  break;
```

### CommandHandler（新增 WebSocket Handler）

```typescript
// server/src/websocket/handlers/command.handler.ts

@Injectable()
export class CommandHandler {
  constructor(
    private readonly objectManager: ObjectManager,
    private readonly commandManager: CommandManager,
  ) {}

  async handleCommand(client: any, session: Session, data: { input: string }): Promise<void> {
    // 1. 查找玩家对象
    const playerId = session.playerId; // Session 需要新增 playerId 字段
    if (!playerId) {
      // 发送错误: 未选择角色
      return;
    }

    const player = this.objectManager.findById(playerId);
    if (!player) {
      // 发送错误: 玩家对象不存在
      return;
    }

    // 2. 执行指令
    const result = (player as any).executeCommand(data.input);

    // 3. 返回结果
    const response = MessageFactory.create('commandResult', result);
    client.send(MessageFactory.serialize(response));
  }
}
```

## 测试策略

### LivingBase 测试用例

| 测试                               | 描述                      |
| ---------------------------------- | ------------------------- |
| getName/getShort/getLong 有值/无值 | 验证从 dbase 读取和默认值 |
| getShort fallback getName          | 验证链式回退              |
| go() 成功移动                      | 验证出口查询 + moveTo     |
| go() 无出口                        | 验证返回 false            |
| go() 不在房间中                    | 验证返回 false            |
| executeCommand()                   | 验证委托 CommandManager   |
| getPermission() 有值/默认          | 验证权限读取              |
| receiveMessage()                   | 验证空实现不报错          |

### NpcBase 重构验证

- 已有 15 个测试全部通过（API 不变，只改继承链）
- 新增：验证 NpcBase instanceof LivingBase

### PlayerBase 测试用例

| 测试                            | 描述                 |
| ------------------------------- | -------------------- |
| static virtual = false          | 验证可克隆           |
| bindConnection/unbindConnection | 验证连接管理         |
| isConnected()                   | 验证连接状态         |
| sendToClient()                  | 验证消息发送         |
| receiveMessage() 转发           | 验证消息转发到客户端 |
| getPermission() 默认 PLAYER     | 验证权限默认值       |

### CommandManager 测试用例

| 测试                     | 描述                   |
| ------------------------ | ---------------------- |
| register/unregister      | 注册和注销指令         |
| parse()                  | 解析输入为 name + args |
| execute() 成功           | 解析 → 搜索 → 执行     |
| execute() 未知指令       | 返回错误               |
| findCommand() 按权限搜索 | 验证目录搜索优先级     |
| findCommand() 别名匹配   | 验证别名搜索           |
| findCommand() 权限不足   | 验证无法访问高权限指令 |
| getAll/getCount          | 查询功能               |

### CommandLoader 测试用例

| 测试                   | 描述                 |
| ---------------------- | -------------------- |
| scanAndLoad()          | 扫描多层目录加载指令 |
| loadCommand() 有装饰器 | 正常加载             |
| loadCommand() 无装饰器 | 跳过                 |
| 目录不存在             | 警告但不报错         |

### 指令测试用例

每个指令（look/go/say）各 3-5 个测试，覆盖正常和异常场景。

## 影响范围

- **修改的已有文件**: npc-base.ts, game-objects/index.ts, service-locator.ts, engine.module.ts, websocket.gateway.ts
- **新增的文件**: ~15 个（5 源文件 + 3 指令 + 7 测试）
- **潜在冲突**: NpcBase 继承链变更需要验证已有测试

## 风险点

- **风险 1**: NpcBase 重构破坏已有测试 → 应对：API 不变，只改继承链，逐步验证
- **风险 2**: @Command 装饰器依赖 reflect-metadata → 应对：NestJS 已内置此依赖
- **风险 3**: go 指令的 async 问题 → 应对：ICommand.execute 改为 async
- **风险 4**: 循环引用（LivingBase → RoomBase → BaseEntity → LivingBase）→ 应对：使用 require() 动态导入

---

> CX 工作流 | Design Doc | PRD #73
