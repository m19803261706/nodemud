[根目录](../CLAUDE.md) > **client**

# Client 模块 - React Native 移动端

## 模块职责

基于 React Native 的水墨风武侠游戏客户端，支持 iOS 和 Android，通过 WebSocket 与后端通信。

## 入口与启动

- **入口文件**: `App.tsx`
- **启动命令**: `pnpm start`（Metro bundler）/ `pnpm ios` / `pnpm android`
- **WebSocket**: App 启动时自动连接 `ws://localhost:4000`

## 路由结构

```
Login (初始页)
  ├── Register          # 注册
  ├── CreateCharacter   # 创建角色（占位）
  └── GameHome          # 游戏主页（占位）
```

导航: `@react-navigation/native-stack`，无 header。

## 对外接口

### WebSocket 消息（发送）

- `login(username, password)` - 登录请求
- `register(username, password, phone)` - 注册请求
- `ping` - 心跳（30秒间隔，自动）

### WebSocket 消息（监听）

- `loginSuccess` -> 跳转 GameHome 或 CreateCharacter
- `loginFailed` -> 显示 GameAlert
- `registerSuccess` / `registerFailed`
- `connectionChanged` -> 连接状态变化

## 关键依赖与配置

- **React Native** 0.83.1 + **React** 19.2
- **@react-navigation**: 路由导航
- **react-native-linear-gradient**: 水墨风渐变背景
- **react-native-vector-icons** (Feather): 图标
- **@packages/core**: 消息类型和 MessageFactory

### Metro 配置

`metro.config.js` 配置了 monorepo `watchFolders`，使 Metro 能够解析根目录的 `packages/core`。

## UI 设计规范（水墨风）

- **主背景**: 渐变 `#F5F0E8` -> `#D5CEC0`
- **文字色**: 深 `#3A3530`，中 `#6B5D4D`，浅 `#8B7A5A`
- **字体**: Noto Serif SC
- **装饰**: 渐变分隔线，无圆角（方正风格）
- **组件**: GameAlert（弹窗）、GameToast（提示）、UIProvider（全局 UI Context）

## 测试与质量

```bash
pnpm test    # Jest + React Test Renderer
pnpm lint    # ESLint
```

## 常见问题 (FAQ)

**Q: 修改代码后需要重启 Metro 吗？**
A: 不需要。Metro 自动热重载。仅在安装新依赖或修改 `metro.config.js` 时才需重启。

**Q: 如何添加新页面？**
A: 1) 在 `src/screens/` 创建组件 -> 2) 在 `App.tsx` 的 `Stack.Navigator` 中注册路由。

**Q: packages/core 修改后客户端没有生效？**
A: 需要先 `cd packages/core && pnpm build`，然后 Metro bundler 会自动拾取变更。

## 相关文件清单

- `App.tsx` - 根组件、路由、WebSocket 初始化
- `src/services/WebSocketService.ts` - WebSocket 单例（连接/重连/心跳）
- `src/screens/LoginScreen.tsx` - 登录页面（完整实现）
- `src/screens/RegisterScreen.tsx` - 注册页面（完整实现）
- `src/screens/CreateCharacterScreen.tsx` - 创建角色（占位）
- `src/screens/GameHomeScreen.tsx` - 游戏主页（占位）
- `src/components/` - 共享 UI 组件

## 变更记录 (Changelog)

- **2026-02-02**: 初始化模块文档
