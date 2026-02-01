[根目录](../CLAUDE.md) > **server**

# Server 模块 - NestJS 后端服务

## 模块职责

基于 NestJS 的游戏后端服务，提供 WebSocket Gateway、账号管理（注册/登录）、数据库访问。

## 入口与启动

- **入口文件**: `src/main.ts`
- **启动命令**: `pnpm start:dev`（热重载）/ `pnpm start:prod`（生产）
- **默认端口**: 4000（HTTP + WebSocket 共用）
- **WebSocket 适配器**: `@nestjs/platform-ws`（WsAdapter）

## 模块组织

| 模块 | 路径 | 职责 |
|------|------|------|
| AppModule | `src/app.module.ts` | 根模块，组装所有子模块 |
| HealthModule | `src/health/` | 健康检查 `GET /health` |
| AccountModule | `src/account/` | 账号注册/登录，TypeORM 实体 |
| WebSocketModule | `src/websocket/` | WebSocket Gateway，消息路由，Session 管理 |

## 对外接口

### HTTP

- `GET /health` - 健康检查

### WebSocket

所有 WebSocket 消息通过 `@SubscribeMessage('message')` 统一接收，消息格式:

```json
{ "event": "message", "data": "{\"type\":\"login\",\"data\":{...},\"timestamp\":...}" }
```

已实现的消息类型:
- `login` -> `loginSuccess` / `loginFailed`
- `register` -> `registerSuccess` / `registerFailed`
- `ping` (心跳)

## 关键依赖与配置

- **NestJS** v11: 核心框架
- **TypeORM** + **mysql2**: 数据库 ORM
- **bcrypt**: 密码加密
- **uuid**: 账号 ID 生成
- **class-validator** + **class-transformer**: 环境变量验证、DTO 验证
- **@packages/core**: 消息类型和 MessageFactory

### 环境变量 (`.env`)

```
NODE_ENV, PORT, DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE
```

## 数据模型

### Account 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID v4 | 主键 |
| username | VARCHAR(50) | 唯一，6-20字符 |
| password | VARCHAR(255) | bcrypt 加密 |
| phone | VARCHAR(20) | 唯一，11位 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |
| last_login_at | TIMESTAMP | 最后登录时间（nullable） |

## 测试与质量

```bash
pnpm test          # 单元测试 (Jest)
pnpm test:watch    # 监听模式
pnpm test:cov      # 覆盖率报告
pnpm test:e2e      # 端到端测试
pnpm lint          # ESLint
```

## 常见问题 (FAQ)

**Q: 修改代码后需要重启吗？**
A: 不需要。`nest start --watch` 自动热重载。仅在安装新依赖、修改配置文件或进程崩溃时才需重启。

**Q: 数据库表结构如何同步？**
A: 开发环境 `synchronize: true`，TypeORM 自动同步实体变更到数据库。

**Q: 如何添加新的 WebSocket 消息处理？**
A: 1) 在 `packages/core` 添加消息类型和 Handler -> 2) 在 `websocket.gateway.ts` switch 中添加路由 -> 3) 创建对应的 handler 文件。

## 变更记录 (Changelog)

- **2026-02-02**: 初始化模块文档
