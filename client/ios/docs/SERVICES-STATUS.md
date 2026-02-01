# NodeMUD 服务状态

## 启动时间

2026-02-02 01:21:56 AM

---

## 运行中的服务

### 1. 后端服务 ✅

**配置**:
- 框架: NestJS 11.1.12
- 端口: 4000
- 环境: development
- PID: 6427

**健康检查**:
```bash
curl http://localhost:4000/health
```

**响应示例**:
```json
{
  "status": "ok",
  "timestamp": "2026-02-01T17:25:37.665Z",
  "uptime": 221.75,
  "database": "not configured",
  "environment": "development",
  "message": "系统运行正常（数据库未配置，请参考 README.md 配置数据库连接）"
}
```

**日志**:
```bash
tail -f logs/server.log
```

---

### 2. Metro Bundler ✅

**配置**:
- 版本: Metro v0.83.3
- 端口: 8081
- 状态: Dev server ready

**访问**:
```bash
open http://localhost:8081
```

**日志**:
```bash
tail -f logs/metro.log
```

---

### 3. iOS 应用 ✅

**模拟器**:
- 设备: iPhone 16 Pro
- 设备 ID: 0F064696-8B23-4D3F-89F8-EF9D1B246F74
- OS: iOS 18.4
- 状态: Booted

**应用信息**:
- Bundle ID: org.reactjs.native.example.client
- 应用名称: NodeMUD
- 版本: 0.1.0
- 状态: 已安装并运行

**重新启动**:
```bash
cd client
pnpm run ios
```

---

### 4. 华为云数据库 ✅

**连接信息**:
- 主机: 106.8.105.61
- 端口: 3306
- 用户: root
- 密码: asd123
- 数据库: nodemud

**字符集**:
- CHARACTER SET: utf8mb4
- COLLATE: utf8mb4_unicode_ci

**测试连接**:
```bash
mysql -h 106.8.105.61 -u root -pasd123 -D nodemud
```

**已有数据库**:
- nodemud (NodeMUD 项目) ✨
- tc_jianfei (太初减肥)
- tc_mud (MUD 游戏)
- tc_yunwei (太初运维)
- yingjiguanli (营级管理)

---

## 停止服务

```bash
# 停止后端
kill $(cat logs/server.pid)

# 停止 Metro
kill $(cat logs/metro.pid)

# 或者全部停止
killall -9 node
```

---

## 重启服务

```bash
# 从项目根目录执行
pnpm run server:dev    # 启动后端
pnpm run client:start  # 启动 Metro
pnpm run client:ios    # 启动 iOS 应用
```

---

## 注意事项

### 数据库连接未启用

当前后端代码中 TypeORM 配置被注释（`app.module.ts`），需要取消注释才能真正连接数据库：

```typescript
// 当前（已注释）
// TypeOrmModule.forRootAsync({
//   imports: [ConfigModule],
//   inject: [ConfigService],
//   useFactory: getDatabaseConfig,
// }),

// 需要启用（取消注释）
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: getDatabaseConfig,
}),
```

---

> 创建时间: 2026-02-02 01:22:00
> 更新时间: 2026-02-02 01:25:00
> 所有服务状态: ✅ 正常运行
