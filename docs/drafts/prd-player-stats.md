# PRD: 页面顶部状态栏真实数据实时更新

## 基本信息

- **创建时间**: 2026-02-04
- **优先级**: P0（紧急）
- **技术栈**: TypeScript（React Native + NestJS + @packages/core）
- **关联 Scope**: #124

## 功能概述

将 GameHome 页面顶部状态栏（PlayerStats 组件）从 Mock 硬编码数据改为真实角色数据。基于三丹田六属性体系，在登录时从数据库读取角色六维属性，推导运行时属性（气血/内力/精力），通过 WebSocket 每秒心跳推送保持数据实时更新。同时重构状态栏布局：第一行显示三大进度条（气血/内力/精力），第二行显示六维属性纯数值。

## 用户场景

### 场景 1: 登录后看到真实角色数据

- 玩家登录进入 GameHome
- 状态栏立即显示真实的角色名、等级（"初入江湖"）、气血/内力/精力值
- 六维属性（慧根/心眼/气海/脉络/筋骨/血气）显示创建角色时的真实数值

### 场景 2: 实时数据刷新

- 服务端每 1 秒推送一次 playerStats
- 前端自动更新状态栏（为后续战斗系统中 HP/MP 变化做好基础）
- 网络断开重连后，心跳恢复时自动获取最新数据

## 详细需求

### 1. 状态栏布局重构

**第一行：三大进度条**（与三丹田对应）

| 条目 | 含义        | 推导公式                     | 格式      | 颜色      |
| ---- | ----------- | ---------------------------- | --------- | --------- |
| 气血 | 生命值 (HP) | `vitality * 100`             | `600/600` | `#A65D5D` |
| 内力 | 内力值 (MP) | `spirit * 80`                | `640/640` | `#4A6B6B` |
| 精力 | 精神力      | `(wisdom + perception) * 50` | `500/500` | `#8B7355` |

**第二行：六维属性数值**（纯数字展示，不用进度条）

| 属性 | 标签 | 数据源               |
| ---- | ---- | -------------------- |
| 慧根 | 慧根 | character.wisdom     |
| 心眼 | 心眼 | character.perception |
| 气海 | 气海 | character.spirit     |
| 脉络 | 脉络 | character.meridian   |
| 筋骨 | 筋骨 | character.strength   |
| 血气 | 血气 | character.vitality   |

**角色等级**: 新角色固定显示 "初入江湖"（后续升级系统再扩展映射表）

### 2. 消息协议 — playerStats

**方向**: 服务端 → 客户端

```typescript
{
  type: 'playerStats',
  data: {
    name: string;           // 角色名
    level: string;          // 中文等级（"初入江湖"）
    hp: { current: number; max: number };
    mp: { current: number; max: number };
    energy: { current: number; max: number };
    attrs: {
      wisdom: number;
      perception: number;
      spirit: number;
      meridian: number;
      strength: number;
      vitality: number;
    };
  }
}
```

### 3. 推送时机

- **登录进场后**: auth.handler 在 loginSuccess + roomInfo 之后推送一次 playerStats
- **定时心跳**: 服务端每 **1 秒** 向已登录的玩家推送 playerStats
- **角色创建后**: character.handler 创建角色进场后推送一次 playerStats

### 4. 前端数据更新

- `useGameStore` 的 `player` 类型重构为匹配 playerStats.data 结构
- `App.tsx` 全局监听 `playerStats` 消息，更新 store
- `PlayerStats` 组件订阅新的 player 数据结构渲染
- 去除所有 Mock 数据（INITIAL_STATS）

## 关联文档

- **Scope**: #124（页面顶部状态栏真实数据实时更新）
- **创建角色系统**: Epic #30（六维属性数据来源）
- **玩家上线系统**: Epic #115（登录进场流程）
- **游戏首页组件化**: Epic #100（PlayerStats 组件结构）

## 现有代码基础

### 可复用

| 模块                  | 路径                                            | 复用方式                   |
| --------------------- | ----------------------------------------------- | -------------------------- |
| Character 实体        | `server/src/character/character.entity.ts`      | 六维属性字段已有           |
| CharacterService      | `server/src/character/character.service.ts`     | `findByAccountId` 查询     |
| auth.handler 登录流程 | `server/src/websocket/handlers/auth.handler.ts` | 已查询 character，追加推送 |
| PlayerStats 组件      | `client/src/components/game/PlayerStats/`       | 重构数据源                 |
| StatBar 组件          | `client/src/components/game/shared/StatBar.tsx` | 第一行继续使用             |
| useGameStore          | `client/src/stores/useGameStore.ts`             | 重构 player 类型           |
| MessageFactory        | `packages/core/src/factory/`                    | 新增 playerStats handler   |

### 需新增

- core: `playerStats` 消息类型 + handler
- server: 心跳推送逻辑（1 秒定时器）
- server: 属性推导工具函数
- client: 六维属性展示组件（替代第二行 StatBar）

## 代码影响范围

| 层级       | 影响模块                                                                    |
| ---------- | --------------------------------------------------------------------------- |
| **core**   | 新增 playerStats 消息类型和 handler                                         |
| **server** | auth.handler（推送）、character.handler（推送）、心跳推送（新增 1s 定时器） |
| **client** | useGameStore（player 类型重构）、PlayerStats 组件、App.tsx（监听）          |

## 任务拆分（初步）

- [ ] Core: 新增 playerStats 消息类型定义和 MessageHandler
- [ ] Server: 属性推导工具 + playerStats 推送函数
- [ ] Server: auth.handler 登录后推送 playerStats
- [ ] Server: 1 秒心跳定时推送 playerStats
- [ ] Client: useGameStore player 类型重构 + playerStats 监听
- [ ] Client: PlayerStats 组件重构（第一行进度条 + 第二行六维数值）

## 验收标准

- [ ] 登录后状态栏显示真实角色名（来自 Character 表）
- [ ] 等级显示 "初入江湖"
- [ ] 第一行三个进度条显示正确的气血/内力/精力值（根据六维属性推导）
- [ ] 第二行显示六个属性的真实数值
- [ ] 服务端每 1 秒推送一次 playerStats
- [ ] 前端实时更新（无需手动刷新）
- [ ] 断线重连后数据自动恢复
- [ ] 无 Mock 硬编码数据残留

---

> CX 工作流 | PRD | Scope #124
