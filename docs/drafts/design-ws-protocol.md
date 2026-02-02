# Design Doc: WebSocket 通信协议与消息工厂

## 关联

- **PRD**: #11 - [PRD] WebSocket 通信协议与消息工厂
- **Scope**: #10 - [Scope] WebSocket 通信协议与消息工厂（第一阶段）
- **关联 Design Doc**: #3 - [Design] 基础目录与项目初始化（继承项目结构）

## 基于现有代码

### 可复用模块

#### 后端（server/src/）

**已有模块结构**：

- ✅ `config/database.config.ts` - 数据库配置函数
- ✅ `health/` - 健康检查模块（可作为模块结构参考）
  - `health.controller.ts` - 控制器层
  - `health.service.ts` - 服务层
  - `health.module.ts` - 模块定义

**可复用代码**：

```typescript
// 数据库配置 - 已启用 autoLoadEntities
getDatabaseConfig(configService: ConfigService): TypeOrmModuleOptions
```

**现有目录结构**：

```
server/src/
├─ config/        # 配置（数据库、环境变量）
├─ health/        # 健康检查模块
├─ command/       # 指令系统（未来扩展）
├─ player/        # 玩家模块（未来扩展）
└─ main.ts        # 应用入口
```

#### 前端（client/）

**已有模块结构**：

- ✅ `App.tsx` - 应用根组件（SafeAreaProvider）
- ✅ `screens/` - 页面目录
- ✅ `services/` - 服务层目录
- ✅ `components/` - 组件目录
- ✅ `types/` - 类型定义目录

**可复用组件**：

- SafeAreaProvider - 安全区域适配
- StatusBar - 状态栏配置

### 需要创建的模块

#### 共享包（packages/core）

完全新建，无现有代码。

#### 后端新增模块

```
server/src/
├─ account/              # 新建：账号管理模块
│  ├─ account.module.ts
│  ├─ account.service.ts
│  ├─ account.entity.ts
│  └─ dto/
│     ├─ login.dto.ts
│     └─ register.dto.ts
└─ websocket/            # 新建：WebSocket 模块
   ├─ websocket.module.ts
   ├─ websocket.gateway.ts
   └─ handlers/
      ├─ auth.handler.ts
      └─ ping.handler.ts
```

#### 前端新增模块

```
client/
├─ services/
│  └─ WebSocketService.ts  # 新建：WebSocket 服务
└─ screens/
   ├─ LoginScreen.tsx       # 新建：登录页面
   ├─ RegisterScreen.tsx    # 新建：注册页面
   ├─ CreateCharacterScreen.tsx  # 新建：创建角色占位符
   └─ GameHomeScreen.tsx    # 新建：游戏主页占位符
```

---

## 架构概览

### 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    React Native Client                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────┐      ┌──────────────────┐          │
│  │  LoginScreen   │      │ WebSocketService │          │
│  │ RegisterScreen │  ←→  │   (Singleton)    │          │
│  │   GameHome     │      │                  │          │
│  └────────────────┘      └──────────────────┘          │
│         ↑                         ↓                     │
│         │                    @packages/core             │
│         │                  (MessageFactory)             │
│         └─────────────────────────┘                     │
└─────────────────────────────────────────────────────────┘
                            │
                    WebSocket (ws://)
                            │
                            ↓
┌─────────────────────────────────────────────────────────┐
│                     NestJS Server                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐    ┌──────────────────┐          │
│  │ WebSocket Gateway│ ←→ │ AccountService   │          │
│  │   (Port 4000)    │    │  (bcrypt验证)    │          │
│  └──────────────────┘    └──────────────────┘          │
│         ↓                         ↓                     │
│  ┌──────────────────┐    ┌──────────────────┐          │
│  │  Session (Map)   │    │  MySQL Database  │          │
│  │  内存存储         │    │  (Account表)      │          │
│  └──────────────────┘    └──────────────────┘          │
│                                                          │
│         @packages/core (MessageFactory)                 │
└─────────────────────────────────────────────────────────┘
```

### 数据流

#### 注册流程

```
用户输入(username/password/phone)
  ↓
前端验证(长度/格式)
  ↓
MessageFactory.create('register', ...)
  ↓
WebSocket.send(message)
  ↓
[WebSocket 传输]
  ↓
Gateway.handleMessage()
  ↓
AuthHandler.handleRegister()
  ↓
AccountService.register()
  ├─ 检查用户名是否存在
  ├─ 检查手机号是否存在
  ├─ bcrypt 加密密码
  └─ 插入数据库
  ↓
返回 registerSuccess / registerFailed
  ↓
[WebSocket 传输]
  ↓
前端监听器接收消息
  ↓
显示 Toast 提示
  ↓
跳转创建角色页面(占位符)
```

#### 登录流程

```
用户输入(username/password)
  ↓
MessageFactory.create('login', ...)
  ↓
WebSocket.send(message)
  ↓
[WebSocket 传输]
  ↓
Gateway.handleMessage()
  ↓
AuthHandler.handleLogin()
  ↓
AccountService.login()
  ├─ 查询账号
  ├─ bcrypt 验证密码
  ├─ 检查是否有角色
  └─ 更新 last_login_at
  ↓
更新 Session (authenticated=true)
  ↓
返回 loginSuccess (hasCharacter字段)
  ↓
[WebSocket 传输]
  ↓
前端监听器接收消息
  ├─ hasCharacter = true → GameHomeScreen
  └─ hasCharacter = false → CreateCharacterScreen
```

---

## 数据库设计

### Account 表

```sql
CREATE TABLE `account` (
  `id` VARCHAR(36) PRIMARY KEY COMMENT '账号ID (UUID v4)',
  `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名（唯一，3-20字符）',
  `password` VARCHAR(255) NOT NULL COMMENT '密码（bcrypt加密，$2b$10$...）',
  `phone` VARCHAR(20) NOT NULL UNIQUE COMMENT '手机号（唯一，11位中国手机号）',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `last_login_at` TIMESTAMP NULL COMMENT '最后登录时间',
  INDEX `idx_username` (`username`),
  INDEX `idx_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='账号表';
```

### 字段说明

| 字段          | 类型         | 说明            | 前端对应    | 验证规则                   |
| ------------- | ------------ | --------------- | ----------- | -------------------------- |
| id            | VARCHAR(36)  | UUID 唯一标识   | accountId   | 自动生成                   |
| username      | VARCHAR(50)  | 用户名          | username    | 3-20字符，字母/数字/下划线 |
| password      | VARCHAR(255) | bcrypt 加密密码 | password    | 最小6字符，包含数字+字母   |
| phone         | VARCHAR(20)  | 手机号          | phone       | 11位数字                   |
| created_at    | TIMESTAMP    | 创建时间        | createdAt   | 自动生成                   |
| updated_at    | TIMESTAMP    | 更新时间        | updatedAt   | 自动更新                   |
| last_login_at | TIMESTAMP    | 最后登录时间    | lastLoginAt | 登录时更新                 |

### Entity 定义

```typescript
// server/src/account/account.entity.ts

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('account')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true, comment: '用户名' })
  username: string;

  @Column({ type: 'varchar', length: 255, comment: '密码（bcrypt加密）' })
  password: string;

  @Column({ type: 'varchar', length: 20, unique: true, comment: '手机号' })
  phone: string;

  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true, comment: '最后登录时间' })
  lastLoginAt: Date | null;
}
```

---

## WebSocket 消息协议设计

### 消息类型定义

#### 基础消息接口

```typescript
// packages/core/src/types/base.ts

/** 基础消息结构 */
export interface BaseMessage<T = any> {
  type: string; // 消息类型
  data: T; // 消息数据
  timestamp: number; // 时间戳（毫秒）
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

#### 认证消息

```typescript
// packages/core/src/types/messages/auth.ts

import type { ClientMessage, ServerMessage } from '../base';

// ========== 登录 ==========

export interface LoginMessage extends ClientMessage {
  type: 'login';
  data: {
    username: string;
    password: string;
  };
}

export interface LoginSuccessMessage extends ServerMessage {
  type: 'loginSuccess';
  data: {
    accountId: string; // 账号 ID
    username: string; // 用户名
    hasCharacter: boolean; // 是否已创建角色
    characterId?: string; // 角色 ID（如果有）
    characterName?: string; // 角色名（如果有）
    message: string; // "登录成功"
  };
}

export interface LoginFailedMessage extends ServerMessage {
  type: 'loginFailed';
  data: {
    reason: 'account_not_found' | 'invalid_password' | 'account_banned' | 'server_error';
    message: string; // 中文错误提示
  };
}

// ========== 注册 ==========

export interface RegisterMessage extends ClientMessage {
  type: 'register';
  data: {
    username: string; // 3-20字符
    password: string; // 6+字符，包含数字+字母
    phone: string; // 11位手机号
  };
}

export interface RegisterSuccessMessage extends ServerMessage {
  type: 'registerSuccess';
  data: {
    accountId: string;
    username: string;
    message: string; // "注册成功"
  };
}

export interface RegisterFailedMessage extends ServerMessage {
  type: 'registerFailed';
  data: {
    reason:
      | 'username_exists'
      | 'phone_exists'
      | 'invalid_password'
      | 'invalid_phone'
      | 'server_error';
    message: string; // 中文错误提示
  };
}
```

#### 心跳消息

```typescript
// packages/core/src/types/messages/ping.ts

import type { ClientMessage, ServerMessage } from '../base';

export interface PingMessage extends ClientMessage {
  type: 'ping';
  data: {};
}

export interface PongMessage extends ServerMessage {
  type: 'pong';
  data: {
    serverTime: number; // 服务器时间戳
  };
}
```

#### UI 提示消息

```typescript
// packages/core/src/types/messages/ui.ts

import type { ServerMessage } from '../base';

export interface AlertMessage extends ServerMessage {
  type: 'alert';
  data: {
    title: string; // 标题
    message: string; // 内容
    level: 'info' | 'success' | 'warning' | 'error';
    duration?: number; // 显示时长（毫秒），undefined=手动关闭
  };
}

export interface ToastMessage extends ServerMessage {
  type: 'toast';
  data: {
    message: string; // 提示内容
    level: 'info' | 'success' | 'warning' | 'error';
    duration?: number; // 显示时长（毫秒），默认3000
  };
}
```

---

## 消息工厂设计

### 核心工厂类

```typescript
// packages/core/src/factory/MessageFactory.ts

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

### 消息处理器示例

```typescript
// packages/core/src/factory/handlers/login.ts

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

---

## 后端设计

### 目录结构

```
server/src/
├─ account/                    # 账号管理模块
│  ├─ account.module.ts        # 模块定义
│  ├─ account.service.ts       # 业务逻辑
│  ├─ account.entity.ts        # TypeORM 实体
│  └─ dto/                     # 数据传输对象
│     ├─ login.dto.ts          # 登录 DTO
│     └─ register.dto.ts       # 注册 DTO
│
├─ websocket/                  # WebSocket 模块
│  ├─ websocket.module.ts      # 模块定义
│  ├─ websocket.gateway.ts     # WebSocket 网关
│  ├─ types/                   # 类型定义
│  │  └─ session.ts            # Session 接口
│  └─ handlers/                # 消息处理器
│     ├─ auth.handler.ts       # 认证处理器
│     └─ ping.handler.ts       # 心跳处理器
│
└─ app.module.ts               # 导入 AccountModule, WebSocketModule
```

### 核心类设计

#### WebSocket Gateway

```typescript
// server/src/websocket/websocket.gateway.ts

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
import type { Session } from './types/session';

@WebSocketGateway(4000, { cors: true })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Session 存储（内存 Map）
  private sessions = new Map<string, Session>();

  constructor(
    private readonly authHandler: AuthHandler,
    private readonly pingHandler: PingHandler,
  ) {}

  handleConnection(client: Socket) {
    console.log('客户端连接:', client.id);
    this.sessions.set(client.id, {
      socketId: client.id,
      authenticated: false,
    });
  }

  handleDisconnect(client: Socket) {
    console.log('客户端断开:', client.id);
    this.sessions.delete(client.id);
  }

  @SubscribeMessage('message')
  handleMessage(@ConnectedSocket() client: Socket, @MessageBody() data: string) {
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

    // 消息路由
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

#### Account Service

```typescript
// server/src/account/account.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Account } from './account.entity';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  /** 注册账号 */
  async register(username: string, password: string, phone: string) {
    // 检查用户名是否存在
    const existingUser = await this.accountRepository.findOne({ where: { username } });
    if (existingUser) {
      return {
        success: false,
        reason: 'username_exists',
        message: '用户名已存在',
      };
    }

    // 检查手机号是否存在
    const existingPhone = await this.accountRepository.findOne({ where: { phone } });
    if (existingPhone) {
      return {
        success: false,
        reason: 'phone_exists',
        message: '手机号已被注册',
      };
    }

    // bcrypt 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建账号
    const account = this.accountRepository.create({
      id: uuidv4(),
      username,
      password: hashedPassword,
      phone,
    });

    await this.accountRepository.save(account);

    return {
      success: true,
      accountId: account.id,
    };
  }

  /** 登录验证 */
  async login(username: string, password: string) {
    // 查询账号
    const account = await this.accountRepository.findOne({ where: { username } });
    if (!account) {
      return {
        success: false,
        reason: 'account_not_found',
        message: '账号不存在',
      };
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, account.password);
    if (!isPasswordValid) {
      return {
        success: false,
        reason: 'invalid_password',
        message: '密码错误',
      };
    }

    // 更新最后登录时间
    account.lastLoginAt = new Date();
    await this.accountRepository.save(account);

    // TODO: 检查是否有角色（后期实现）
    const hasCharacter = false;

    return {
      success: true,
      account: {
        id: account.id,
        username: account.username,
      },
      hasCharacter,
      characterId: undefined,
      characterName: undefined,
    };
  }
}
```

---

## 前端设计

### 目录结构

```
client/
├─ services/
│  └─ WebSocketService.ts      # WebSocket 服务（单例）
│
├─ screens/
│  ├─ LoginScreen.tsx           # 登录页面
│  ├─ RegisterScreen.tsx        # 注册页面
│  ├─ CreateCharacterScreen.tsx # 创建角色占位符
│  └─ GameHomeScreen.tsx        # 游戏主页占位符
│
└─ App.tsx                      # 修改：添加路由导航
```

### WebSocket Service

```typescript
// client/src/services/WebSocketService.ts

import { MessageFactory } from '@packages/core';
import type { ServerMessage } from '@packages/core';

class WebSocketService {
  private ws: WebSocket | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private listeners = new Map<string, Set<(data: any) => void>>();

  connect(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('WebSocket 连接成功');
        this.startPing();
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

  send(message: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket 未连接');
      return;
    }
    this.ws.send(MessageFactory.serialize(message));
  }

  on(type: string, callback: (data: any) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);
  }

  private handleMessage(data: string) {
    const message = MessageFactory.deserialize<ServerMessage>(data);
    if (!message) {
      console.error('无效消息:', data);
      return;
    }

    const listeners = this.listeners.get(message.type);
    if (listeners) {
      listeners.forEach((callback) => callback(message.data));
    }
  }

  private startPing() {
    this.pingInterval = setInterval(() => {
      this.send(MessageFactory.create('ping'));
    }, 30000);
  }

  private stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}

export const wsService = new WebSocketService();
```

### 登录页面

```typescript
// client/src/screens/LoginScreen.tsx

import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { MessageFactory } from '@packages/core';
import { wsService } from '../services/WebSocketService';

export const LoginScreen = ({ navigation }: any) => {
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
        navigation.navigate('GameHome', { characterId: data.characterId });
      } else {
        navigation.navigate('CreateCharacter');
      }
    });

    wsService.on('loginFailed', (data) => {
      Alert.alert('登录失败', data.message);
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="用户名"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="密码"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="登录" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});
```

---

## 前后端字段映射

| 功能         | 数据库字段    | API 字段      | 前端字段      | 说明                      |
| ------------ | ------------- | ------------- | ------------- | ------------------------- |
| 账号 ID      | id            | accountId     | accountId     | UUID 格式                 |
| 用户名       | username      | username      | username      | 3-20 字符                 |
| 密码         | password      | password      | password      | bcrypt 加密，前端发送明文 |
| 手机号       | phone         | phone         | phone         | 11 位数字                 |
| 创建时间     | created_at    | -             | createdAt     | ISO 8601 格式             |
| 更新时间     | updated_at    | -             | updatedAt     | ISO 8601 格式             |
| 最后登录时间 | last_login_at | -             | lastLoginAt   | ISO 8601 格式             |
| 是否有角色   | -             | hasCharacter  | hasCharacter  | 布尔值                    |
| 角色 ID      | -             | characterId   | characterId   | UUID 格式（可选）         |
| 角色名       | -             | characterName | characterName | 字符串（可选）            |

---

## 影响范围

### 新增文件

#### 共享包（packages/core）

```
packages/core/
├─ package.json
├─ tsconfig.json
└─ src/
   ├─ types/
   │  ├─ base.ts
   │  └─ messages/
   │     ├─ auth.ts
   │     ├─ ping.ts
   │     ├─ ui.ts
   │     └─ index.ts
   ├─ factory/
   │  ├─ MessageFactory.ts
   │  ├─ handlers/
   │  │  ├─ login.ts
   │  │  ├─ register.ts
   │  │  └─ ping.ts
   │  └─ index.ts
   └─ index.ts
```

#### 后端（server/src/）

```
server/src/
├─ account/
│  ├─ account.module.ts
│  ├─ account.service.ts
│  ├─ account.entity.ts
│  └─ dto/
│     ├─ login.dto.ts
│     └─ register.dto.ts
│
└─ websocket/
   ├─ websocket.module.ts
   ├─ websocket.gateway.ts
   ├─ types/
   │  └─ session.ts
   └─ handlers/
      ├─ auth.handler.ts
      └─ ping.handler.ts
```

#### 前端（client/）

```
client/
├─ services/
│  └─ WebSocketService.ts
│
└─ screens/
   ├─ LoginScreen.tsx
   ├─ RegisterScreen.tsx
   ├─ CreateCharacterScreen.tsx
   └─ GameHomeScreen.tsx
```

### 修改文件

| 文件                       | 修改内容                               |
| -------------------------- | -------------------------------------- |
| `server/src/app.module.ts` | 导入 AccountModule, WebSocketModule    |
| `pnpm-workspace.yaml`      | 添加 packages/core 工作区              |
| `server/package.json`      | 添加 @packages/core, bcrypt, uuid 依赖 |
| `client/package.json`      | 添加 @packages/core 依赖               |
| `client/App.tsx`           | 添加路由导航，连接 WebSocket           |

---

## 技术风险与应对

### 风险 1：TypeScript 装饰器兼容性

**风险级别**: 中
**影响**: @MessageHandler 装饰器可能在不同环境不兼容
**应对方案**:

1. 统一 TypeScript 版本 ^5.0.0
2. tsconfig.json 启用 `experimentalDecorators: true`
3. 备选方案：手动注册机制

### 风险 2：WebSocket 端口冲突

**风险级别**: 低
**影响**: 端口 4000 被占用导致启动失败
**应对方案**:

1. 配置化端口号（环境变量 WS_PORT）
2. 启动前检测端口占用
3. 错误提示明确指出端口冲突

### 风险 3：Session 内存泄漏

**风险级别**: 中
**影响**: 大量断线连接未清理，占用内存
**应对方案**:

1. disconnect 事件立即清理 Session
2. 定时任务清理超时 Session（后期）
3. 监控 Session Map 大小

### 风险 4：密码安全

**风险级别**: 高
**影响**: 明文传输密码被截获
**应对方案**:

1. 开发阶段：ws:// 明文传输（可接受）
2. 生产环境：升级到 wss:// + TLS
3. 密码存储：bcrypt 加密（已实现）

---

## 验收标准

### 功能完整性

- [ ] packages/core 成功创建并被前后端引用
- [ ] 消息工厂单元测试通过
- [ ] WebSocket 连接建立成功
- [ ] 注册流程完整（含错误处理）
- [ ] 登录流程完整（含 hasCharacter 判断）
- [ ] 心跳检测正常工作（30 秒间隔）
- [ ] Alert/Toast 提示正常显示

### 类型安全

- [ ] TypeScript 编译无错误
- [ ] 前后端消息类型一致
- [ ] 消息工厂类型推断正确
- [ ] Entity 字段类型与数据库一致

### 错误处理

- [ ] 用户名重复显示错误
- [ ] 手机号重复显示错误
- [ ] 密码错误显示提示
- [ ] 账号不存在显示提示
- [ ] 网络断开显示提示
- [ ] 无效消息被过滤

### 数据验证

- [ ] 用户名长度 3-20 字符
- [ ] 密码最小 6 字符，包含数字+字母
- [ ] 手机号 11 位数字
- [ ] 用户名唯一性检查
- [ ] 手机号唯一性检查
- [ ] 密码 bcrypt 加密存储

### 性能要求

- [ ] WebSocket 连接 < 500ms
- [ ] 登录响应 < 200ms
- [ ] 注册响应 < 500ms
- [ ] 心跳响应 < 100ms

---

## 后续扩展

### 后期优化

- 断线重连机制
- 消息队列（防丢失）
- Token 认证（替代 Session）
- WSS 加密通信
- Session 持久化（Redis）
- 分布式部署支持

### 关联功能

- 创建角色功能（PRD）
- 游戏主页功能（PRD）
- 房间系统（PRD）
- 战斗系统（PRD）

---

> CX 工作流 | Design Doc | PRD #11
> 下一步：/cx:plan WebSocket 通信协议
