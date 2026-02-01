# NodeMUD

现代化文本 MUD 游戏 - 基于 pnpm Workspace 的 Monorepo 架构

## 📖 项目简介

NodeMUD 是一款现代化的文本 MUD（Multi-User Dungeon）游戏，采用前后端分离架构，提供沉浸式的文字冒险体验。

## 🛠️ 技术栈

### 后端

- **运行时**: Node.js 18+
- **框架**: NestJS (TypeScript)
- **数据库**: MySQL + 内存缓存
- **通信**: WebSocket + JSON 协议

### 前端

- **框架**: React Native CLI
- **语言**: TypeScript
- **状态管理**: React Hooks
- **通信**: WebSocket 客户端

### 工具链

- **包管理**: pnpm 8+
- **代码格式化**: Prettier
- **Git Hooks**: Husky

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- MySQL 8.0+
- React Native 开发环境（iOS 需要 Xcode，Android 需要 Android Studio）

### 安装依赖

```bash
# 安装所有子项目的依赖
pnpm install
```

### 启动开发

#### 后端服务

```bash
# 开发模式（热重载）
pnpm run server:dev

# 生产构建
pnpm run server:build

# 生产启动
pnpm run server:start
```

#### 前端应用

```bash
# 启动 Metro bundler
pnpm run client:start

# 运行 Android 应用
pnpm run client:android

# 运行 iOS 应用
pnpm run client:ios
```

## 📁 项目结构

```
nodemud/
├── server/              # NestJS 后端服务
│   ├── src/            # 源代码
│   ├── test/           # 测试文件
│   └── package.json    # 后端依赖
├── client/             # React Native 客户端
│   ├── src/           # 源代码
│   ├── android/       # Android 原生代码
│   ├── ios/           # iOS 原生代码
│   └── package.json   # 前端依赖
├── pnpm-workspace.yaml # pnpm workspace 配置
├── package.json        # 根项目配置
└── README.md          # 项目文档
```

## 🔧 开发命令

| 命令                      | 说明                   |
| ------------------------- | ---------------------- |
| `pnpm run server:dev`     | 启动后端开发服务器     |
| `pnpm run server:build`   | 构建后端生产代码       |
| `pnpm run server:start`   | 启动后端生产服务       |
| `pnpm run client:start`   | 启动前端 Metro bundler |
| `pnpm run client:android` | 运行 Android 应用      |
| `pnpm run client:ios`     | 运行 iOS 应用          |
| `pnpm run format`         | 格式化所有代码         |
| `pnpm run format:check`   | 检查代码格式           |
| `pnpm run lint`           | 运行所有子项目的 lint  |

## 📝 开发规范

- 所有代码必须添加中文注释
- 使用 Prettier 格式化代码
- 提交前运行 `pnpm run format`
- 遵循 TypeScript 严格模式

## 🗺️ 项目状态

🚧 架构设计阶段

查看 [项目蓝图 Issue](https://github.com/m19803261706/nodemud/issues) 了解详细设计和开发进度。

## 📄 许可证

MIT

## 👥 贡献

欢迎提交 Issue 和 Pull Request！
