# 功能探讨: WebSocket 通信协议与消息工厂（第一阶段）

## 基本信息

- **创建时间**: 2026-02-02 01:50
- **关联项目蓝图**: #1 (Scope - NodeMUD 项目整体规划)
- **阶段定位**: Phase 1 基础设施 - WebSocket 通信层

## 功能目标

建立前后端 WebSocket 通信基础设施，实现：

1. **WebSocket 连接管理**：连接建立、心跳检测、断线重连
2. **消息工厂系统**：类型安全的消息创建、验证、序列化、路由
3. **登录注册流程**：完全基于 WebSocket，不使用 HTTP API

## 设计背景

### 传统 MUD 登录流程

根据网络搜索和传统 MUD 设计：

- **先连接 Telnet**，再进行身份验证
- **全程通过 Socket 交互**，不使用单独的 HTTP 登录 API
- 流程：连接 → 欢迎信息 → 输入账号 → 输入密码 → 进入游戏

参考资料：

- [Standards:GMCP Authentication - Mudlet](https://wiki.mudlet.org/w/Standards:GMCP_Authentication)
- [Telnet | MUD Wiki | Fandom](https://mud.fandom.com/wiki/Telnet)
- [Multi-user dungeon - Wikipedia](https://en.wikipedia.org/wiki/Multi-user_dungeon)

### 现代化改进

- 使用 **WebSocket** 替代 Telnet
- 使用 **类型化 JSON** 消息替代简陋的状态码
- 保留 MUD 精髓：**先连接后认证**的设计

## 用户流程

### 1. 前端流程（React Native）

```
App 启动
  ↓
建立 WebSocket 连接 (ws://localhost:4000)
  ↓
显示登录/注册页面
  ├─ 用户选择"注册"
  │   ├─ 填写账号、密码
  │   ├─ 发送 register 消息
  │   ├─ 收到 registerSuccess → 进入创建角色页面
  │   └─ 收到 registerFailed → 显示错误
  │
  └─ 用户选择"登录"
      ├─ 填写账号、密码
      ├─ 发送 login 消息
      ├─ 收到 loginSuccess
      │   ├─ 判断：hasCharacter = true → 进入游戏主页（占位符）
      │   └─ 判断：hasCharacter = false → 进入创建角色页面（占位符）
      └─ 收到 loginFailed → 显示错误
  ↓
进入对应页面
  ├─ 游戏主页（占位符）- 已有角色
  │   └─ 显示 "欢迎回来，{角色名}" + 临时占位内容
  │
  └─ 创建角色页面（占位符）- 新账号
      └─ 显示 "请先创建角色" + 临时占位内容
```

### 2. 后端流程（NestJS）

```
WebSocket 连接建立
  ↓
创建 Session（存储连接状态）
  ↓
监听客户端消息
  ├─ 收到 register 消息
  │   ├─ 验证账号是否已存在
  │   ├─ 创建账号（数据库）
  │   └─ 发送 registerSuccess / registerFailed
  │
  ├─ 收到 login 消息
  │   ├─ 验证账号密码
  │   ├─ 更新 Session 状态（已认证）
  │   └─ 发送 loginSuccess / loginFailed
  │
  └─ 收到 ping 消息
      └─ 发送 pong 消息
```

## 方案设计

### 1. Monorepo 目录结构

```
renzaiGame/
├─ packages/
│  └─ core/              # 共享包
│     ├─ package.json
│     ├─ tsconfig.json
│     └─ src/
│        ├─ types/       # 类型定义
│        │  ├─ messages.ts        # 消息类型
│        │  └─ entities.ts        # 实体类型
│        ├─ factory/     # 消息工厂
│        │  ├─ MessageFactory.ts  # 工厂类
│        │  └─ validators.ts      # 验证器
│        └─ index.ts     # 导出入口
│
├─ server/               # 后端（NestJS）
│  ├─ package.json
│  └─ src/
│     └─ websocket/      # WebSocket 模块
│        ├─ websocket.module.ts
│        ├─ websocket.gateway.ts  # 网关
│        └─ handlers/              # 消息处理器
│           ├─ auth.handler.ts    # 登录注册
│           └─ ping.handler.ts    # 心跳
│
└─ client/               # 前端（React Native）
   ├─ package.json
   └─ src/
      ├─ services/
      │  └─ WebSocketService.ts   # WebSocket 服务
      └─ screens/
         └─ LoginScreen.tsx        # 登录页面
```

### 2. 消息类型定义（模块化设计）

#### 目录结构

```
packages/core/src/
├─ types/
│  ├─ base.ts              # 基础消息接口
│  ├─ client.ts            # 客户端消息类型枚举
│  ├─ server.ts            # 服务器消息类型枚举
│  └─ messages/            # 具体消息定义（按模块拆分）
│     ├─ auth.ts           # 认证相关消息
│     ├─ ping.ts           # 心跳消息
│     └─ index.ts          # 导出入口
├─ factory/
│  ├─ MessageFactory.ts    # 消息工厂（自动扫描注册）
│  └─ registry.ts          # 消息注册表
└─ index.ts
```

#### 基础类型（packages/core/src/types/base.ts）

```typescript
/** 基础消息结构 */
export interface BaseMessage<T = any> {
  type: string; // 消息类型
  data: T; // 消息数据
  timestamp: number; // 时间戳（服务器生成）
}

/** 客户端请求消息 */
export interface ClientMessage<T = any> extends BaseMessage<T> {
  type: string;
}

/** 服务器响应消息 */
export interface ServerMessage<T = any> extends BaseMessage<T> {
  type: string;
}
```

#### 认证消息（packages/core/src/types/messages/auth.ts）

```typescript
import type { ClientMessage, ServerMessage } from '../base';

// ========== 登录 ==========

/** 登录请求 */
export interface LoginMessage extends ClientMessage {
  type: 'login';
  data: {
    username: string;
    password: string;
  };
}

/** 登录成功响应 */
export interface LoginSuccessMessage extends ServerMessage {
  type: 'loginSuccess';
  data: {
    accountId: string; // 账号 ID
    username: string; // 用户名
    hasCharacter: boolean; // 是否已创建角色
    characterId?: string; // 角色 ID（如果有）
    characterName?: string; // 角色名（如果有）
    message: string; // 提示信息
  };
}

/** 登录失败响应 */
export interface LoginFailedMessage extends ServerMessage {
  type: 'loginFailed';
  data: {
    reason: string;
    message: string;
  };
}

/** 注册请求 */
export interface RegisterMessage extends ClientMessage {
  type: 'register';
  data: {
    username: string;
    password: string;
    email?: string;
  };
}

/** 注册成功响应 */
export interface RegisterSuccessMessage extends ServerMessage {
  type: 'registerSuccess';
  data: {
    accountId: string;
    username: string;
    message: string;
  };
}

/** 注册失败响应 */
export interface RegisterFailedMessage extends ServerMessage {
  type: 'registerFailed';
  data: {
    reason: 'username_exists' | 'invalid_password' | 'invalid_email' | 'server_error';
    message: string;
  };
}

/** 心跳请求 */
export interface PingMessage extends ClientMessage {
  type: 'ping';
  data: {};
}

/** 心跳响应 */
export interface PongMessage extends ServerMessage {
  type: 'pong';
  data: {
    serverTime: number;
  };
}
```

### 3. 消息工厂（自动扫包注册）

#### 核心思想

不再手动注册每个消息类型，而是通过装饰器和自动扫包实现：

```typescript
// 使用示例
@MessageHandler('login')
class LoginHandler {
  create(username: string, password: string): LoginMessage {
    return {
      type: 'login',
      data: { username, password },
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return !!data.username && !!data.password;
  }
}
```

#### MessageFactory.ts

```typescript
import type { ClientMessage, ServerMessage } from '../types/base';

/** 消息处理器接口 */
export interface IMessageHandler {
  create(...args: any[]): ClientMessage | ServerMessage;
  validate(data: any): boolean;
}

/** 消息注册表 */
const messageHandlers = new Map<string, IMessageHandler>();

/** 装饰器：注册消息处理器 */
export function MessageHandler(type: string) {
  return function <T extends { new (...args: any[]): IMessageHandler }>(constructor: T) {
    messageHandlers.set(type, new constructor());
    return constructor;
  };
}

/**
 * 消息工厂
 * 职责：
 * 1. 自动扫包注册消息处理器
 * 2. 创建标准化消息对象
 * 3. 验证消息格式
 * 4. 序列化/反序列化
 */
export class MessageFactory {
  /** 创建消息 */
  static create<T extends ClientMessage | ServerMessage>(type: string, ...args: any[]): T | null {
    const handler = messageHandlers.get(type);
    if (!handler) {
      console.error(`未注册的消息类型: ${type}`);
      return null;
    }
    return handler.create(...args) as T;
  }

  /** 验证消息格式 */
  static validate(message: any): boolean {
    if (!message || typeof message !== 'object') return false;
    if (!message.type || typeof message.type !== 'string') return false;
    if (!message.data || typeof message.data !== 'object') return false;
    if (!message.timestamp || typeof message.timestamp !== 'number') return false;

    // 调用对应类型的验证器
    const handler = messageHandlers.get(message.type);
    if (!handler) return false;
    return handler.validate(message.data);
  }

  /** 序列化消息为 JSON 字符串 */
  static serialize(message: ClientMessage | ServerMessage): string {
    return JSON.stringify(message);
  }

  /** 反序列化 JSON 字符串为消息对象 */
  static deserialize<T = any>(json: string): T | null {
    try {
      const message = JSON.parse(json);
      return this.validate(message) ? message : null;
    } catch {
      return null;
    }
  }
}
```

#### 消息处理器示例（packages/core/src/factory/handlers/login.ts）

```typescript
import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { LoginMessage } from '../../types/messages/auth';

@MessageHandler('login')
export class LoginHandler implements IMessageHandler {
  create(username: string, password: string): LoginMessage {
    return {
      type: 'login',
      data: { username, password },
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return (
      !!data.username &&
      typeof data.username === 'string' &&
      !!data.password &&
      typeof data.password === 'string'
    );
  }
}
```

#### 自动加载所有处理器（packages/core/src/factory/index.ts）

```typescript
// 自动导入所有处理器
import './handlers/login';
import './handlers/register';
import './handlers/ping';

export { MessageFactory } from './MessageFactory';
```

### 4. WebSocket 连接管理

#### 前端（client/src/services/WebSocketService.ts）

```typescript
import { MessageFactory } from '@packages/core';
import type { ServerMessage } from '@packages/core';

class WebSocketService {
  private ws: WebSocket | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private listeners = new Map<string, Set<(data: any) => void>>();

  /** 连接到服务器 */
  connect(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('WebSocket 连接成功');
        this.startPing(); // 启动心跳
        resolve();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket 错误:', error);
        reject(error);
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.ws.onclose = () => {
        console.log('WebSocket 连接关闭');
        this.stopPing();
      };
    });
  }

  /** 发送消息 */
  send(message: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket 未连接');
      return;
    }
    this.ws.send(MessageFactory.serialize(message));
  }

  /** 监听消息类型 */
  on(type: string, callback: (data: any) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);
  }

  /** 处理接收到的消息 */
  private handleMessage(data: string) {
    const message = MessageFactory.deserialize<ServerMessage>(data);
    if (!message) {
      console.error('无效消息:', data);
      return;
    }

    // 分发消息到监听器
    const listeners = this.listeners.get(message.type);
    if (listeners) {
      listeners.forEach((callback) => callback(message.data));
    }
  }

  /** 启动心跳 */
  private startPing() {
    this.pingInterval = setInterval(() => {
      this.send(MessageFactory.createPing());
    }, 30000); // 30 秒一次
  }

  /** 停止心跳 */
  private stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}

export const wsService = new WebSocketService();
```

#### 后端（server/src/websocket/websocket.gateway.ts）

```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageFactory } from '@packages/core';
import type { ClientMessage } from '@packages/core';

@WebSocketGateway(4000, { cors: true })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // 存储连接的 Session
  private sessions = new Map<
    string,
    { socketId: string; authenticated: boolean; playerId?: string }
  >();

  /** 客户端连接 */
  handleConnection(client: Socket) {
    console.log('客户端连接:', client.id);
    this.sessions.set(client.id, {
      socketId: client.id,
      authenticated: false,
    });
  }

  /** 客户端断开 */
  handleDisconnect(client: Socket) {
    console.log('客户端断开:', client.id);
    this.sessions.delete(client.id);
  }

  /** 监听客户端消息 */
  @SubscribeMessage('message')
  handleMessage(@ConnectedSocket() client: Socket, @MessageBody() data: string): void {
    const message = MessageFactory.deserialize<ClientMessage>(data);
    if (!message) {
      console.error('无效消息:', data);
      return;
    }

    // 路由消息到对应处理器
    switch (message.type) {
      case 'login':
        this.handleLogin(client, message.data);
        break;
      case 'register':
        this.handleRegister(client, message.data);
        break;
      case 'ping':
        this.handlePing(client);
        break;
      default:
        console.error('未知消息类型:', message.type);
    }
  }

  /** 处理登录 */
  private handleLogin(client: Socket, data: { username: string; password: string }) {
    // TODO: 数据库验证
    const success = data.username === 'test' && data.password === '123456';

    if (success) {
      // 更新 Session
      const session = this.sessions.get(client.id);
      if (session) {
        session.authenticated = true;
        session.playerId = 'player_12345';
      }

      // 发送成功消息
      client.send(
        MessageFactory.serialize({
          type: 'loginSuccess',
          data: {
            playerId: 'player_12345',
            playerName: data.username,
            message: '登录成功',
          },
          timestamp: Date.now(),
        }),
      );
    } else {
      // 发送失败消息
      client.send(
        MessageFactory.serialize({
          type: 'loginFailed',
          data: {
            reason: 'invalid_credentials',
            message: '账号或密码错误',
          },
          timestamp: Date.now(),
        }),
      );
    }
  }

  /** 处理注册 */
  private handleRegister(
    client: Socket,
    data: { username: string; password: string; email?: string },
  ) {
    // TODO: 数据库创建账号
    const success = true;

    if (success) {
      client.send(
        MessageFactory.serialize({
          type: 'registerSuccess',
          data: {
            accountId: 'acc_67890',
            username: data.username,
            message: '注册成功',
          },
          timestamp: Date.now(),
        }),
      );
    } else {
      client.send(
        MessageFactory.serialize({
          type: 'registerFailed',
          data: {
            reason: 'username_exists',
            message: '用户名已存在',
          },
          timestamp: Date.now(),
        }),
      );
    }
  }

  /** 处理心跳 */
  private handlePing(client: Socket) {
    client.send(
      MessageFactory.serialize({
        type: 'pong',
        data: {
          serverTime: Date.now(),
        },
        timestamp: Date.now(),
      }),
    );
  }
}
```

## 与现有功能的关系

### 依赖

- ✅ **数据库连接**（已完成，Issue #4）
- ✅ **NestJS 基础框架**（已完成）
- ✅ **React Native 基础框架**（已完成）

### 影响

- 🔧 **需要创建 packages/core 共享包**
- 🔧 **需要创建 Account 数据表**（用于存储账号）
- 🔧 **需要创建 WebSocket Gateway**（server 端）
- 🔧 **需要创建 WebSocketService**（client 端）

### 复用

- ✅ **数据库配置**（server/src/config/database.config.ts）
- ✅ **TypeORM 连接**（server/src/app.module.ts）

## 边界和约束

### 技术约束

- WebSocket 使用 Socket.IO 库（前后端都支持）
- 消息必须严格遵循 TypeScript 类型定义
- 心跳间隔：30 秒
- 连接超时：无活动 5 分钟自动断开

### 业务规则

- 未认证状态只能发送：login、register、ping
- 认证后才能发送游戏指令
- 用户名唯一，长度 3-20 字符
- 密码长度最小 6 字符

## 第一阶段范围（MVP）

### 包含功能

- ✅ WebSocket 连接建立
- ✅ 登录流程（login → loginSuccess/loginFailed）
- ✅ 注册流程（register → registerSuccess/registerFailed）
- ✅ 心跳检测（ping → pong）
- ✅ 消息工厂（创建、验证、序列化）
- ✅ 前端登录页面（React Native）

### 不包含功能

- ❌ 创建角色（留待 Phase 2，需要更多游戏背景设计）
- ❌ 断线重连（留待后期优化）
- ❌ Token 验证（暂时使用 Session）
- ❌ WSS 加密（本地开发先用 ws://）

## 验收标准

- [ ] packages/core 共享包成功创建并被前后端引用
- [ ] 消息工厂所有方法通过单元测试
- [ ] WebSocket 连接成功建立并打印日志
- [ ] 前端可以成功注册账号（数据写入数据库）
- [ ] 前端可以成功登录（验证账号密码）
- [ ] 心跳检测正常工作（30 秒一次）
- [ ] 登录失败显示正确的错误提示
- [ ] 注册时用户名重复显示错误提示

## 开放问题

### 待后续探讨

1. **创建角色流程**：角色属性、职业、背景故事等需要单独设计
2. **断线重连机制**：如何恢复 Session、消息队列如何处理
3. **Token vs Session**：是否需要引入 JWT Token
4. **加密通信**：何时升级到 wss:// + TLS

## 探讨记录

### 关键决策

1. **使用 WebSocket 而非 HTTP API 进行登录**
   - 理由：保留传统 MUD "先连接后认证"的设计精髓
   - 参考：传统 MUD 通过 Telnet 连接后再进行身份验证

2. **消息不使用 UUID**
   - 理由：WebSocket 连接本身就是一个 Session，不需要额外的消息 ID
   - Session 足以追踪请求-响应关系

3. **消息命名使用直接动词风格**
   - 理由：简洁直观，易于扩展
   - 示例：login/register/ping，而非 auth.login/auth.register

4. **Monorepo 使用 packages/core 共享包**
   - 理由：TypeScript 类型前后端共享，保证类型安全
   - 避免前后端类型定义不一致导致的通信错误

5. **第一阶段不包含创建角色**
   - 理由：创建角色涉及游戏背景、职业、属性等设计，需要单独探讨
   - 先完成基础通信层，后续再扩展角色系统

---

> CX 工作流 | 功能探讨
> 下一步：/cx:prd WebSocket 通信协议（第一阶段）
