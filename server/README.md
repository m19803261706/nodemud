# RenZai Game - 后端服务

基于 NestJS + TypeORM + MySQL 的 MUD 游戏后端服务。

## 技术栈

- **框架**: NestJS 11.x
- **语言**: TypeScript 5.x
- **数据库**: MySQL 8.x (TypeORM)
- **包管理**: pnpm
- **环境变量**: @nestjs/config + class-validator

## 项目结构

```
server/
├── src/
│   ├── config/              # 配置文件
│   │   ├── env.validation.ts    # 环境变量验证
│   │   └── database.config.ts   # 数据库配置
│   ├── health/              # 健康检查模块
│   ├── core/                # MUD 核心模块（预留）
│   │   ├── entity/          # 实体系统
│   │   ├── manager/         # 管理器
│   │   └── heartbeat/       # 心跳系统
│   ├── command/             # 命令系统（预留）
│   ├── world/               # 游戏世界（预留）
│   │   ├── areas/           # 区域配置
│   │   ├── npcs/            # NPC 配置
│   │   └── items/           # 物品配置
│   ├── player/              # 玩家模块（预留）
│   ├── room/                # 房间模块（预留）
│   ├── npc/                 # NPC 模块（预留）
│   ├── item/                # 物品模块（预留）
│   ├── common/              # 公共模块
│   │   ├── interfaces/      # 接口定义
│   │   ├── types/           # 类型定义
│   │   ├── utils/           # 工具函数
│   │   ├── filters/         # 异常过滤器
│   │   ├── interceptors/    # 拦截器
│   │   ├── guards/          # 守卫
│   │   └── decorators/      # 装饰器
│   ├── app.module.ts        # 主模块
│   └── main.ts              # 入口文件
├── .env.example             # 环境变量示例
├── .env                     # 环境变量配置
└── package.json
```

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并配置数据库信息：

```env
PORT=4000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=renzai_game
```

### 3. 创建数据库

```sql
CREATE DATABASE renzai_game CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. 启动服务

```bash
# 开发模式（热重载）
pnpm run start:dev

# 生产模式
pnpm run build
pnpm run start:prod
```

### 5. 验证服务

访问健康检查接口：

```bash
curl http://localhost:4000/health
```

预期返回：

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 10.5,
  "database": "connected",
  "environment": "development"
}
```

## 可用命令

```bash
# 开发
pnpm run start:dev          # 启动开发服务器（热重载）
pnpm run start:debug        # 启动调试模式

# 构建
pnpm run build              # 构建生产版本

# 测试
pnpm run test               # 运行单元测试
pnpm run test:watch         # 监听模式测试
pnpm run test:cov           # 测试覆盖率

# 代码质量
pnpm run lint               # ESLint 检查
pnpm run format             # Prettier 格式化
```

## 环境变量

| 变量名        | 说明         | 必需 | 默认值      |
| ------------- | ------------ | ---- | ----------- |
| `PORT`        | 服务器端口   | 是   | 4000        |
| `NODE_ENV`    | 运行环境     | 是   | development |
| `DB_HOST`     | 数据库主机   | 是   | localhost   |
| `DB_PORT`     | 数据库端口   | 是   | 3306        |
| `DB_USERNAME` | 数据库用户名 | 是   | root        |
| `DB_PASSWORD` | 数据库密码   | 是   | -           |
| `DB_DATABASE` | 数据库名称   | 是   | renzai_game |

## 下一步开发

根据 Epic #4 的规划，后续将实现：

1. **数据库设计** (#6) - 定义核心实体表结构
2. **玩家系统** (#7) - 注册、登录、角色管理
3. **房间系统** (#8) - 房间 CRUD、移动逻辑
4. **命令系统** (#9) - 命令解析、注册、执行
5. **WebSocket** (#10) - 实时通信、心跳机制

## 相关文档

- PRD: `.claude/tc/prds/后端架构与核心功能.md`
- Epic: GitHub Issue #4
- Task: GitHub Issue #5
