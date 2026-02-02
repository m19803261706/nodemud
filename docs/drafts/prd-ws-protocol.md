# PRD: WebSocket 通信协议与消息工厂

## 基本信息

- **创建时间**: 2026-02-02 02:20
- **优先级**: P0 紧急
- **技术栈**: Node.js + TypeScript + NestJS + React Native + MySQL
- **关联文档**:
  - Scope #10 - [WebSocket 通信协议与消息工厂（第一阶段）](https://github.com/m19803261706/nodemud/issues/10)
  - Scope #1 - [NodeMUD 项目蓝图](https://github.com/m19803261706/nodemud/issues/1)

## 功能概述

建立 NodeMUD 项目的前后端通信基础设施，实现基于 WebSocket 的实时双向通信协议和类型安全的消息工厂系统。本功能是整个游戏的核心基础，所有后续功能都将基于此通信层开发。

## 用户场景

### 场景 1：用户注册

**角色**：新用户
**目标**：创建游戏账号
**流程**：

1. 打开 App，自动建立 WebSocket 连接
2. 进入注册页面，填写用户名、密码、手机号
3. 点击注册按钮
4. 前端发送 `register` 消息到服务器
5. 服务器验证数据并创建账号
6. 服务器返回 `registerSuccess` 或 `registerFailed` 消息
7. 前端显示 Toast 提示注册结果
8. 如果成功，引导用户进入创建角色页面（占位符）

**异常处理**：

- 用户名已存在 → 显示错误提示
- 手机号已被注册 → 显示错误提示
- 密码格式不符合要求 → 前端验证拦截
- 网络连接断开 → 显示连接错误提示

### 场景 2：用户登录

**角色**：已注册用户
**目标**：登录游戏
**流程**：

1. 打开 App，自动建立 WebSocket 连接
2. 进入登录页面，填写用户名和密码
3. 点击登录按钮
4. 前端发送 `login` 消息到服务器
5. 服务器验证账号密码
6. 服务器返回 `loginSuccess` 或 `loginFailed` 消息
7. 如果成功：
   - 判断 `hasCharacter` 字段
   - `true` → 进入游戏主页（占位符）
   - `false` → 进入创建角色页面（占位符）
8. 如果失败：显示 Alert 错误提示

**异常处理**：

- 账号不存在 → 显示错误提示
- 密码错误 → 显示错误提示
- 账号被封禁 → 显示错误提示（后期功能）
- 网络连接断开 → 显示连接错误提示

### 场景 3：保持连接（心跳检测）

**角色**：已登录用户
**目标**：保持 WebSocket 连接活跃
**流程**：

1. 用户登录成功后
2. 前端每 30 秒发送 `ping` 消息
3. 服务器收到后立即返回 `pong` 消息
4. 前端收到 `pong` 后更新最后心跳时间
5. 如果 60 秒内未收到 `pong`，前端判定连接断开，尝试重连

**异常处理**：

- 连接断开 → 显示断线提示，尝试重连
- 重连失败 → 提示用户手动刷新

### 场景 4：系统提示

**角色**：所有用户
**目标**：接收系统通知
**流程**：

1. 服务器发送 `alert` 或 `toast` 消息
2. 前端根据消息类型显示对应 UI 组件
3. Toast 自动消失，Alert 需要用户手动关闭

**使用场景**：

- 登录成功/失败提示
- 注册成功/失败提示
- 后续游戏指令反馈（如：你查看了周围的环境）
- 系统维护通知

## 详细需求

### 1. Monorepo 共享包（packages/core）

**目录结构**：

```
packages/core/
├─ package.json
├─ tsconfig.json
└─ src/
   ├─ types/              # 类型定义
   │  ├─ base.ts          # 基础消息接口
   │  └─ messages/        # 具体消息定义（按模块拆分）
   │     ├─ auth.ts       # 认证相关消息
   │     ├─ ping.ts       # 心跳消息
   │     ├─ ui.ts         # UI 提示消息
   │     └─ index.ts      # 导出入口
   ├─ factory/            # 消息工厂
   │  ├─ MessageFactory.ts  # 工厂类
   │  ├─ handlers/          # 消息处理器
   │  │  ├─ login.ts
   │  │  ├─ register.ts
   │  │  └─ ping.ts
   │  └─ index.ts
   └─ index.ts            # 总导出入口
```

**依赖关系**：

- `server` 和 `client` 都需要引用 `@packages/core`
- 使用 pnpm workspace 管理

**package.json**：

```json
{
  "name": "@packages/core",
  "version": "1.0.0",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {
    "build": "tsc"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

### 2. 消息类型定义

#### 基础消息接口（packages/core/src/types/base.ts）

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
    username: string; // 用户名
    password: string; // 密码（前端发送明文，后端验证加密）
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
    reason: 'account_not_found' | 'invalid_password' | 'account_banned' | 'server_error';
    message: string; // 错误提示
  };
}

// ========== 注册 ==========

/** 注册请求 */
export interface RegisterMessage extends ClientMessage {
  type: 'register';
  data: {
    username: string; // 用户名（3-20 字符）
    password: string; // 密码（6+ 字符，包含数字+字母）
    phone: string; // 手机号（11 位）
  };
}

/** 注册成功响应 */
export interface RegisterSuccessMessage extends ServerMessage {
  type: 'registerSuccess';
  data: {
    accountId: string; // 账号 ID
    username: string; // 用户名
    message: string; // 提示信息
  };
}

/** 注册失败响应 */
export interface RegisterFailedMessage extends ServerMessage {
  type: 'registerFailed';
  data: {
    reason:
      | 'username_exists'
      | 'phone_exists'
      | 'invalid_password'
      | 'invalid_phone'
      | 'server_error';
    message: string; // 错误提示
  };
}
```

#### 心跳消息（packages/core/src/types/messages/ping.ts）

```typescript
import type { ClientMessage, ServerMessage } from '../base';

/** 心跳请求 */
export interface PingMessage extends ClientMessage {
  type: 'ping';
  data: {};
}

/** 心跳响应 */
export interface PongMessage extends ServerMessage {
  type: 'pong';
  data: {
    serverTime: number; // 服务器时间戳
  };
}
```

#### UI 提示消息（packages/core/src/types/messages/ui.ts）

```typescript
import type { ServerMessage } from '../base';

/** Alert 提示消息 */
export interface AlertMessage extends ServerMessage {
  type: 'alert';
  data: {
    title: string; // 标题
    message: string; // 内容
    level: 'info' | 'success' | 'warning' | 'error'; // 级别
    duration?: number; // 显示时长（毫秒），undefined 表示需要手动关闭
  };
}

/** Toast 提示消息 */
export interface ToastMessage extends ServerMessage {
  type: 'toast';
  data: {
    message: string; // 提示内容
    level: 'info' | 'success' | 'warning' | 'error'; // 级别
    duration?: number; // 显示时长（毫秒），默认 3000
  };
}
```

### 3. 消息工厂（自动扫包注册）

#### 核心工厂类（packages/core/src/factory/MessageFactory.ts）

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

### 4. 数据库设计

#### Account 表

```sql
CREATE TABLE `account` (
  `id` VARCHAR(36) PRIMARY KEY COMMENT '账号ID (UUID)',
  `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名（唯一，3-20字符）',
  `password` VARCHAR(255) NOT NULL COMMENT '密码（bcrypt加密）',
  `phone` VARCHAR(20) NOT NULL UNIQUE COMMENT '手机号（唯一，11位）',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `last_login_at` TIMESTAMP NULL COMMENT '最后登录时间',
  INDEX `idx_username` (`username`),
  INDEX `idx_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='账号表';
```

**字段说明**：

- `id`: UUID 格式，唯一标识
- `username`: 用户名，3-20 字符，唯一索引
- `password`: bcrypt 加密后的密码，长度 255
- `phone`: 手机号，11 位，唯一索引
- `created_at`: 创建时间，自动生成
- `updated_at`: 更新时间，自动更新
- `last_login_at`: 最后登录时间，登录时更新

**验证规则**：

- 用户名：3-20 字符，字母/数字/下划线
- 密码：最小 6 字符，必须包含数字+字母
- 手机号：11 位数字

### 5. 后端实现（NestJS）

#### WebSocket Gateway（server/src/websocket/websocket.gateway.ts）

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
import { AuthHandler } from './handlers/auth.handler';
import { PingHandler } from './handlers/ping.handler';

/** Session 数据结构 */
interface Session {
  socketId: string;
  authenticated: boolean;
  accountId?: string;
  username?: string;
  lastPing?: number;
}

@WebSocketGateway(4000, { cors: true })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Session 存储（内存）
  private sessions = new Map<string, Session>();

  constructor(
    private readonly authHandler: AuthHandler,
    private readonly pingHandler: PingHandler,
  ) {}

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

    const session = this.sessions.get(client.id);
    if (!session) {
      console.error('Session 不存在:', client.id);
      return;
    }

    // 路由消息到对应处理器
    switch (message.type) {
      case 'login':
        this.authHandler.handleLogin(client, session, message.data);
        break;
      case 'register':
        this.authHandler.handleRegister(client, message.data);
        break;
      case 'ping':
        this.pingHandler.handlePing(client, session);
        break;
      default:
        console.error('未知消息类型:', message.type);
    }
  }
}
```

#### 认证处理器（server/src/websocket/handlers/auth.handler.ts）

```typescript
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { MessageFactory } from '@packages/core';
import { AccountService } from '../../account/account.service';
import type { Session } from '../websocket.gateway';

@Injectable()
export class AuthHandler {
  constructor(private readonly accountService: AccountService) {}

  /** 处理登录 */
  async handleLogin(
    client: Socket,
    session: Session,
    data: { username: string; password: string },
  ) {
    const result = await this.accountService.login(data.username, data.password);

    if (result.success) {
      // 更新 Session
      session.authenticated = true;
      session.accountId = result.account.id;
      session.username = result.account.username;

      // 发送成功消息
      client.send(
        MessageFactory.serialize({
          type: 'loginSuccess',
          data: {
            accountId: result.account.id,
            username: result.account.username,
            hasCharacter: result.hasCharacter,
            characterId: result.characterId,
            characterName: result.characterName,
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
            reason: result.reason,
            message: result.message,
          },
          timestamp: Date.now(),
        }),
      );
    }
  }

  /** 处理注册 */
  async handleRegister(
    client: Socket,
    data: { username: string; password: string; phone: string },
  ) {
    const result = await this.accountService.register(data.username, data.password, data.phone);

    if (result.success) {
      client.send(
        MessageFactory.serialize({
          type: 'registerSuccess',
          data: {
            accountId: result.accountId,
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
            reason: result.reason,
            message: result.message,
          },
          timestamp: Date.now(),
        }),
      );
    }
  }
}
```

### 6. 前端实现（React Native）

#### WebSocket 服务（client/src/services/WebSocketService.ts）

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
      this.send(MessageFactory.create('ping'));
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

#### 登录页面（client/src/screens/LoginScreen.tsx）

```typescript
import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { MessageFactory } from '@packages/core';
import { wsService } from '../services/WebSocketService';

export const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // 前端验证
    if (!username || !password) {
      Alert.alert('错误', '请填写用户名和密码');
      return;
    }

    // 发送登录消息
    wsService.send(MessageFactory.create('login', username, password));

    // 监听响应
    wsService.on('loginSuccess', (data) => {
      if (data.hasCharacter) {
        // 进入游戏主页
        navigation.navigate('GameHome', { characterId: data.characterId });
      } else {
        // 进入创建角色页面
        navigation.navigate('CreateCharacter');
      }
    });

    wsService.on('loginFailed', (data) => {
      Alert.alert('登录失败', data.message);
    });
  };

  return (
    <View>
      <TextInput
        placeholder="用户名"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        placeholder="密码"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="登录" onPress={handleLogin} />
    </View>
  );
};
```

## 关联文档

- **Scope #10** - [WebSocket 通信协议与消息工厂（第一阶段）](https://github.com/m19803261706/nodemud/issues/10)
  - 包含完整的技术方案探讨
  - 定义了消息协议、Monorepo 结构、登录流程

- **Scope #1** - [NodeMUD 项目蓝图](https://github.com/m19803261706/nodemud/issues/1)
  - Phase 1 基础设施定位
  - 整体技术架构

## 现有代码基础

### 可复用模块

- ✅ **数据库配置**（server/src/config/database.config.ts）
  - getDatabaseConfig() 函数
  - TypeORM 配置

- ✅ **环境变量验证**（server/src/config/env.validation.ts）
  - 数据库连接信息验证
  - 可扩展添加 WebSocket 端口配置

- ✅ **健康检查**（server/src/health/）
  - 可参考的 NestJS 模块结构
  - 可参考的依赖注入模式

### 需要创建的模块

- 🔧 **packages/core** - Monorepo 共享包
- 🔧 **server/src/websocket/** - WebSocket 模块
- 🔧 **server/src/account/** - 账号管理模块
- 🔧 **client/src/services/WebSocketService.ts** - 前端 WebSocket 服务
- 🔧 **client/src/screens/LoginScreen.tsx** - 登录页面
- 🔧 **client/src/screens/RegisterScreen.tsx** - 注册页面

## 代码影响范围

### 新增文件

```
packages/core/                    # 新建共享包
├─ src/types/                     # 类型定义
├─ src/factory/                   # 消息工厂
└─ package.json

server/src/websocket/             # 新建 WebSocket 模块
├─ websocket.gateway.ts
├─ websocket.module.ts
└─ handlers/
   ├─ auth.handler.ts
   └─ ping.handler.ts

server/src/account/               # 新建账号模块
├─ account.module.ts
├─ account.service.ts
├─ account.entity.ts
└─ dto/
   ├─ login.dto.ts
   └─ register.dto.ts

client/src/services/              # 新建服务层
└─ WebSocketService.ts

client/src/screens/               # 新建页面
├─ LoginScreen.tsx
├─ RegisterScreen.tsx
├─ CreateCharacterScreen.tsx      # 占位符
└─ GameHomeScreen.tsx             # 占位符
```

### 修改文件

```
server/src/app.module.ts          # 导入 WebSocketModule, AccountModule
pnpm-workspace.yaml               # 添加 packages/core 工作区
server/package.json               # 添加 @packages/core 依赖
client/package.json               # 添加 @packages/core 依赖
```

## 任务拆分（初步）

### Phase 1: 基础设施搭建（2-3 天）

- [ ] 1.1 创建 packages/core 共享包
  - [ ] 初始化 package.json 和 tsconfig.json
  - [ ] 定义基础消息接口（base.ts）
  - [ ] 配置 pnpm workspace

- [ ] 1.2 定义消息类型
  - [ ] auth.ts（登录注册消息）
  - [ ] ping.ts（心跳消息）
  - [ ] ui.ts（UI 提示消息）

- [ ] 1.3 实现消息工厂
  - [ ] MessageFactory 核心类
  - [ ] 装饰器 @MessageHandler
  - [ ] 消息处理器（login/register/ping）

### Phase 2: 后端实现（3-4 天）

- [ ] 2.1 数据库表设计
  - [ ] 创建 Account Entity
  - [ ] 编写数据库迁移脚本
  - [ ] 测试数据库连接

- [ ] 2.2 账号管理模块
  - [ ] AccountService（注册/登录/验证）
  - [ ] bcrypt 密码加密
  - [ ] 输入验证（DTO + class-validator）

- [ ] 2.3 WebSocket Gateway
  - [ ] 连接管理（connect/disconnect）
  - [ ] Session 内存存储
  - [ ] 消息路由（auth/ping）

- [ ] 2.4 消息处理器
  - [ ] AuthHandler（登录注册）
  - [ ] PingHandler（心跳）
  - [ ] 错误处理

### Phase 3: 前端实现（3-4 天）

- [ ] 3.1 WebSocket 服务
  - [ ] 连接管理
  - [ ] 消息发送/接收
  - [ ] 心跳机制
  - [ ] 事件监听

- [ ] 3.2 登录页面
  - [ ] UI 设计
  - [ ] 表单验证
  - [ ] 登录逻辑
  - [ ] 错误提示

- [ ] 3.3 注册页面
  - [ ] UI 设计
  - [ ] 表单验证
  - [ ] 注册逻辑
  - [ ] 错误提示

- [ ] 3.4 占位符页面
  - [ ] CreateCharacterScreen（创建角色占位符）
  - [ ] GameHomeScreen（游戏主页占位符）

### Phase 4: 集成测试（1-2 天）

- [ ] 4.1 端到端测试
  - [ ] 注册流程测试
  - [ ] 登录流程测试
  - [ ] 心跳机制测试
  - [ ] 错误处理测试

- [ ] 4.2 Bug 修复
  - [ ] 修复集成测试中发现的问题
  - [ ] 优化错误提示文案
  - [ ] 优化用户体验

## 验收标准

### 功能完整性

- [ ] ✅ packages/core 共享包成功创建并被前后端引用
- [ ] ✅ 消息工厂所有方法通过单元测试
- [ ] ✅ WebSocket 连接成功建立并打印日志
- [ ] ✅ 前端可以成功注册账号（数据写入数据库）
- [ ] ✅ 前端可以成功登录（验证账号密码）
- [ ] ✅ 登录成功后正确判断 hasCharacter 并跳转
- [ ] ✅ 心跳检测正常工作（30 秒一次）
- [ ] ✅ Alert 和 Toast 提示正常显示

### 类型安全

- [ ] ✅ TypeScript 编译无错误
- [ ] ✅ 前后端消息类型定义一致
- [ ] ✅ 消息工厂类型推断正确
- [ ] ✅ 所有消息都有完整的类型定义

### 错误处理

- [ ] ✅ 登录失败显示正确的错误提示
- [ ] ✅ 注册时用户名重复显示错误提示
- [ ] ✅ 注册时手机号重复显示错误提示
- [ ] ✅ 密码格式错误前端拦截
- [ ] ✅ 网络断开显示连接错误提示
- [ ] ✅ 无效消息被正确过滤并记录日志

### 数据验证

- [ ] ✅ 用户名长度 3-20 字符
- [ ] ✅ 密码最小 6 字符，包含数字+字母
- [ ] ✅ 手机号 11 位数字格式
- [ ] ✅ 用户名唯一性检查
- [ ] ✅ 手机号唯一性检查
- [ ] ✅ 密码 bcrypt 加密存储

### 性能要求

- [ ] ✅ WebSocket 连接建立时间 < 500ms
- [ ] ✅ 登录响应时间 < 200ms
- [ ] ✅ 注册响应时间 < 500ms
- [ ] ✅ 心跳响应时间 < 100ms
- [ ] ✅ 消息序列化/反序列化性能无明显瓶颈

## 技术风险

### 风险 1：TypeScript 装饰器兼容性

**描述**：@MessageHandler 装饰器可能在不同 TypeScript 版本中行为不一致
**影响**：消息工厂无法正常注册处理器
**缓解方案**：

1. 统一前后端 TypeScript 版本（^5.0.0）
2. 在 tsconfig.json 中启用 `experimentalDecorators`
3. 如果装饰器不可用，改用手动注册机制

### 风险 2：WebSocket 连接稳定性

**描述**：移动网络不稳定可能导致频繁断线
**影响**：用户体验差，可能丢失消息
**缓解方案**：

1. 实现断线重连机制（后期优化）
2. 心跳检测及时发现断线
3. 关键消息添加重发机制（后期优化）

### 风险 3：Session 内存管理

**描述**：大量用户在线时 Session 占用内存过大
**影响**：服务器内存不足
**缓解方案**：

1. 设置 Session 超时自动清理
2. 定期清理无效 Session
3. 后期可迁移到 Redis（分布式部署）

## 后续扩展

### 优化项（后期实现）

- [ ] 断线重连机制
- [ ] 消息队列（防止断线丢失消息）
- [ ] Token 认证（替代 Session）
- [ ] WSS 加密通信（生产环境）
- [ ] Session 持久化（Redis）
- [ ] 分布式部署支持
- [ ] 消息压缩（减少带宽）
- [ ] 消息加密（防止中间人攻击）

### 关联功能（后续 PRD）

- [ ] 创建角色功能
- [ ] 游戏主页功能
- [ ] 房间系统
- [ ] 战斗系统
- [ ] 聊天系统

---

> CX 工作流 | PRD
> 下一步：/cx:design WebSocket 通信协议
