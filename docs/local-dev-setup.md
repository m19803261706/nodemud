# 本地开发环境部署指南

从零开始搭建 RenZai Game 完整开发环境，包含后端、前端、数据库的安装与启动。

---

## 一、项目架构

```
renzaiGame/
├── packages/core/   # 共享类型包（pnpm）— 必须最先构建
├── server/          # NestJS 后端（pnpm）— 依赖 core + MySQL
├── client/          # React Native 前端（npm）— 依赖 core
```

**启动顺序**: MySQL → core 构建 → server → client (Metro) → 模拟器/真机

**包管理器**: server 和 core 使用 **pnpm**，client 使用 **npm**（React Native 与 pnpm 符号链接不兼容）。

---

## 二、环境要求

| 软件 | 版本要求 | 安装方式 |
|------|----------|----------|
| Node.js | >= 18（client 要求 >= 20） | https://nodejs.org |
| pnpm | >= 8 | `npm install -g pnpm` |
| JDK | **17** | https://adoptium.net |
| MySQL | >= 8.0 | https://dev.mysql.com/downloads 或 Homebrew |
| Android Studio | 最新稳定版 | https://developer.android.com/studio |
| Xcode | 最新稳定版（仅 macOS，iOS 开发需要） | App Store |

### 验证环境

```bash
node -v          # >= 18
pnpm -v          # >= 8
java -version    # 17.x（不能是 24）
mysql --version  # >= 8.0
```

---

## 三、数据库配置

### 3.1 安装 MySQL

**macOS (Homebrew)**:

```bash
brew install mysql
brew services start mysql
```

**Windows**:

下载 MySQL Installer 并按向导安装，记住设置的 root 密码。

**Linux (Ubuntu/Debian)**:

```bash
sudo apt update && sudo apt install mysql-server
sudo systemctl start mysql
```

### 3.2 创建数据库

```bash
mysql -u root -p
```

```sql
CREATE DATABASE renzai_game CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3.3 配置 server/.env

在 `server/` 目录下创建 `.env` 文件：

```env
NODE_ENV=development
PORT=4000
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=你的MySQL密码
DB_DATABASE=renzai_game
```

> 开发环境使用 `synchronize: true`，TypeORM 会自动根据实体创建/同步表结构，无需手动建表。

---

## 四、安装依赖

三个目录需要分别安装，**顺序很重要**：

```bash
# 1. 安装 core 依赖并构建（server 和 client 都依赖 core 的编译产物）
cd packages/core
pnpm install
pnpm build

# 2. 安装 server 依赖
cd ../../server
pnpm install

# 3. 安装 client 依赖（注意：用 npm，不是 pnpm）
cd ../client
npm install
```

### 一键安装脚本

```bash
# 在项目根目录执行
cd packages/core && pnpm install && pnpm build && cd ../../server && pnpm install && cd ../client && npm install
```

---

## 五、启动服务

需要打开 **3 个终端窗口**，分别运行以下服务：

### 终端 1：core watch（可选，修改 core 时需要）

```bash
cd packages/core
pnpm build:watch
```

> 监听 core 源码变更并自动重新编译。如果不修改 core 代码，可以跳过此步（首次 `pnpm build` 即可）。

### 终端 2：后端服务

```bash
cd server
pnpm start:dev
```

成功启动后会看到：

```
[Nest] LOG [NestApplication] Nest application successfully started
```

验证：访问 http://localhost:4000/health 应返回健康状态。

### 终端 3：前端 Metro bundler

```bash
cd client
npm start
```

成功启动后会看到 Metro bundler 界面。

### 终端 4（可选）：启动模拟器/真机

```bash
# Android 模拟器
cd client
npm run android

# iOS 模拟器（仅 macOS）
cd client
npm run ios

# Android 真机（需先 adb reverse）
adb reverse tcp:8081 tcp:8081
adb reverse tcp:4000 tcp:4000
cd client
npx react-native run-android --device <设备序列号>
```

> Android 开发详细说明见 [Android 开发调试指南](./android-emulator-setup.md)。

---

## 六、完整启动流程速查

```bash
# === 前置条件 ===
# 确保 MySQL 已启动，server/.env 已配置

# === 终端 1：core watch ===
cd packages/core && pnpm build:watch

# === 终端 2：后端 ===
cd server && pnpm start:dev

# === 终端 3：前端 Metro ===
cd client && npm start

# === 终端 4：运行到设备 ===
# Android 模拟器
cd client && npm run android
# 或 Android 真机（先设置端口转发）
adb reverse tcp:8081 tcp:8081 && adb reverse tcp:4000 tcp:4000
cd client && npx react-native run-android --device <序列号>
# 或 iOS 模拟器
cd client && npm run ios
```

---

## 七、端口说明

| 端口 | 服务 | 说明 |
|------|------|------|
| 4000 | NestJS 后端 | HTTP（健康检查）+ WebSocket（游戏通信）共用 |
| 8081 | Metro bundler | React Native JS 代码打包服务 |
| 3306 | MySQL | 数据库（默认端口） |

---

## 八、Android 环境配置

### 环境变量（写入 `~/.zshrc` 或 `~/.bash_profile`）

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
```

### local.properties

如果构建报 `SDK location not found`，在 `client/android/local.properties` 写入：

```properties
# macOS
sdk.dir=/Users/<用户名>/Library/Android/sdk

# Windows
sdk.dir=C:\\Users\\<用户名>\\AppData\\Local\\Android\\Sdk
```

---

## 九、Windows 特别说明

Windows 上的开发流程与 macOS 基本一致，需要注意以下差异：

### 9.1 MySQL

推荐使用 MySQL Installer 安装，安装过程中会引导配置 root 密码和服务。安装完成后 MySQL 作为 Windows 服务自动启动。

### 9.2 JDK

下载 JDK 17（推荐 Adoptium Temurin），环境变量设置：

| 变量 | 值 |
|------|----|
| `JAVA_HOME` | `C:\Program Files\Eclipse Adoptium\jdk-17...` |
| `ANDROID_HOME` | `C:\Users\<用户名>\AppData\Local\Android\Sdk` |

在 `Path` 中添加：

```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\emulator
```

### 9.3 终端

推荐使用 **Windows Terminal** + **PowerShell**，或者 **Git Bash**。

命令差异：

```powershell
# PowerShell 中 cd 到各目录的方式相同
cd packages\core; pnpm install; pnpm build
cd ..\..\server; pnpm install
cd ..\client; npm install
```

---

## 十、常见问题

### Q: 启动 server 报 `环境变量验证失败`

缺少 `.env` 文件或字段不完整。参照第三节创建 `server/.env`。

### Q: 启动 server 报数据库连接失败

1. 确认 MySQL 正在运行：`mysql -u root -p` 能否登录
2. 确认 `.env` 中的密码正确
3. 确认 `renzai_game` 数据库已创建

### Q: client 安装依赖报 workspace 相关错误

client 必须用 **npm** 安装，不能用 pnpm：

```bash
cd client
rm -rf node_modules
npm install
```

### Q: 修改了 core 代码但 server/client 没有生效

core 需要重新编译：

```bash
cd packages/core && pnpm build
```

或者保持 `pnpm build:watch` 运行。

### Q: Android 构建报 CMake / JDK 错误

确认 JDK 版本为 17：

```bash
java -version   # 应显示 17.x
```

如果默认 JDK 不是 17，临时切换：

```bash
# macOS
export JAVA_HOME=$(/usr/libexec/java_home -v 17)

# Windows — 修改环境变量 JAVA_HOME 指向 JDK 17 路径
```

### Q: 真机连接不上 WebSocket

确保执行了 adb 端口转发：

```bash
adb reverse tcp:4000 tcp:4000
adb reverse tcp:8081 tcp:8081
```

断开重连 USB 后需要重新执行。

### Q: iOS pod install 失败

```bash
cd client/ios
bundle install          # 安装 CocoaPods
bundle exec pod install # 安装 iOS 原生依赖
```

---

## 十一、服务依赖关系图

```
MySQL (3306)
  │
  ▼
packages/core  ──pnpm build──►  dist/
  │                                │
  ▼                                ▼
server (4000)                   client
  │ NestJS + TypeORM              │ React Native
  │ WebSocket Gateway             │ Metro bundler (8081)
  │                                │
  └────── WebSocket ◄─────────────┘
             通信
```

---

## 十二、关闭服务

各终端窗口按 `Ctrl+C` 即可停止对应服务。

停止 MySQL：

```bash
# macOS
brew services stop mysql

# Windows
net stop MySQL

# Linux
sudo systemctl stop mysql
```
