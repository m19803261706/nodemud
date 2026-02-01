[根目录](../../CLAUDE.md) > [packages](../) > **core**

# Core 模块 - 共享类型与消息工厂

## 模块职责

前后端共享的 TypeScript 包，包含消息类型定义和 MessageFactory（创建、验证、序列化/反序列化）。

## 入口与启动

- **入口文件**: `src/index.ts`
- **构建命令**: `pnpm build`（`tsc` 编译到 `dist/`）
- **产出**: `dist/index.js` + `dist/index.d.ts`
- **包名**: `@packages/core`（workspace 引用）

**重要**: 修改本包后必须执行 `pnpm build`，否则 server/client 引用的是旧编译产物。

## 对外接口

### 导出

```typescript
// 类型
export { BaseMessage, ClientMessage, ServerMessage } from './types/base';
export { LoginMessage, LoginSuccessMessage, ... } from './types/messages/auth';

// 工厂
export { MessageFactory } from './factory/MessageFactory';
export { MessageHandler, IMessageHandler } from './factory/MessageFactory';
```

### MessageFactory API

| 方法 | 说明 |
|------|------|
| `MessageFactory.create(type, ...args)` | 创建消息对象 |
| `MessageFactory.validate(message)` | 验证消息格式 |
| `MessageFactory.serialize(message)` | 序列化为 JSON 字符串 |
| `MessageFactory.deserialize(json)` | 反序列化 JSON 为消息对象 |

### 消息格式

```typescript
{ type: string, data: T, timestamp: number }
```

### 已注册消息类型

| 类型 | 方向 | 说明 |
|------|------|------|
| `login` | Client -> Server | 登录请求 |
| `loginSuccess` | Server -> Client | 登录成功 |
| `loginFailed` | Server -> Client | 登录失败 |
| `register` | Client -> Server | 注册请求 |
| `registerSuccess` | Server -> Client | 注册成功 |
| `registerFailed` | Server -> Client | 注册失败 |
| `ping` | Client -> Server | 心跳 |
| `toast` | Server -> Client | Toast 提示 |
| `alert` | Server -> Client | 弹窗提示 |

## 如何添加新消息类型

1. 在 `src/types/messages/` 添加类型定义（interface）
2. 在 `src/types/messages/index.ts` 导出
3. 在 `src/factory/handlers/` 创建处理器文件，使用 `@MessageHandler(type)` 装饰器
4. 在 `src/factory/index.ts` 导入处理器（确保装饰器执行）
5. 执行 `pnpm build`

## 关键依赖与配置

- **typescript**: 编译工具
- 无运行时依赖（纯类型 + 轻量工厂）

## 测试与质量

```bash
pnpm type-check    # TypeScript 类型检查（不生成文件）
```

## 变更记录 (Changelog)

- **2026-02-02**: 初始化模块文档
