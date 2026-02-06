# 功能探讨: 页面顶部状态栏真实数据实时更新

## 基本信息

- **创建时间**: 2026-02-04
- **关联项目蓝图**: #1（NodeMUD 项目蓝图）
- **前置依赖**: 创建角色系统（#30 已完成）、玩家上线初始地图系统（#115 已完成）
- **后续影响**: 战斗系统（HP/MP 消耗）、经验/升级系统、经济系统

## 功能目标

将 GameHome 顶部状态栏从 Mock 硬编码数据改为真实角色数据，基于三丹田六属性体系推导运行时属性，通过 WebSocket 心跳定时推送保持数据实时更新。

## 当前状态

### 前端

- `PlayerStats` 组件显示 2 行 × 3 列共 6 个 StatBar 进度条
- 数据来自 `useGameStore` 的 `INITIAL_STATS` 硬编码 Mock
- 角色名 "剑心侠客"、等级 "五十八级" 都是 Mock

### 后端

- `Character` 表有六维属性（wisdom/perception/spirit/meridian/strength/vitality）及各自上限
- `PlayerBase` 登录后只设置了 `name`，未加载属性数据
- 没有 `playerStats` 消息类型
- 没有运行时属性推导逻辑

## 方案概要

### 状态栏布局重构

**第一行：三大进度条**（与三丹田对应的运行时属性）

| 条目 | 含义        | 推导公式                     | 格式      | 颜色      |
| ---- | ----------- | ---------------------------- | --------- | --------- |
| 气血 | 生命值 (HP) | `vitality * 100`             | `600/600` | `#A65D5D` |
| 内力 | 内力值 (MP) | `spirit * 80`                | `640/640` | `#4A6B6B` |
| 精力 | 精神力      | `(wisdom + perception) * 50` | `500/500` | `#8B7355` |

**第二行：六维属性数值**（纯数字，不用进度条）

| 属性 | 数据源               | 含义         |
| ---- | -------------------- | ------------ |
| 慧根 | character.wisdom     | 武学领悟速度 |
| 心眼 | character.perception | 战斗感知     |
| 气海 | character.spirit     | 内力总量     |
| 脉络 | character.meridian   | 内力流转速度 |
| 筋骨 | character.strength   | 外功伤害     |
| 血气 | character.vitality   | 生命总量     |

**角色等级**：中文等级体系

- 新角色显示 "初入江湖"
- 后续做升级系统时定义等级映射（如 1-10级 → 初入江湖, 11-20级 → 小有名气, ...）
- 当前 Character 表没有 level 字段，暂用固定文本

### 数据流

```
登录成功
  → auth.handler 查 character 表获取六维属性
  → 计算运行时属性（hp/mp/energy 的 max 和 current）
  → 推送 playerStats 消息
  → 前端 store 更新 → 状态栏渲染真实数据

定时心跳（复用已有 30s ping 机制）
  → 服务端收到 ping 后回复 playerStats
  → 前端自动更新
```

### 消息协议

```typescript
// playerStats 消息（服务端 → 客户端）
{
  type: 'playerStats',
  data: {
    name: string;           // 角色名
    level: string;          // 中文等级（如 "初入江湖"）
    // 三大运行时属性（进度条用）
    hp: { current: number; max: number };   // 气血
    mp: { current: number; max: number };   // 内力
    energy: { current: number; max: number }; // 精力
    // 六维属性（纯数值）
    attrs: {
      wisdom: number;      // 慧根
      perception: number;  // 心眼
      spirit: number;      // 气海
      meridian: number;    // 脉络
      strength: number;    // 筋骨
      vitality: number;    // 血气
    };
  }
}
```

## 与现有功能的关系

- **依赖**: 创建角色系统（六维属性数据来源）、玩家上线系统（登录进场流程）
- **影响**: `PlayerStats` 组件重构、`useGameStore` player 类型变更、core 新增消息类型
- **复用**: auth.handler 已有 character 查询逻辑、心跳机制已有 ping/pong

## 边界和约束

- 当前 HP/MP 初始时 = 满值（无战斗系统消耗）
- 经验/银两/潜能等暂不在状态栏显示（无数据来源），留给后续对应系统
- 六维属性是创建时固定的，当前不会变化（后续修炼系统可能改变）
- 心跳推送频率复用已有 30s，不单独创建新定时器

## 开放问题

- 精力（energy）的具体游戏意义需要在战斗系统设计时细化
- 等级体系的完整映射表留给升级系统设计时确定
- 是否需要在第二行显示属性上限（如 "慧根 8/10"）待定

## 探讨记录

1. **数据来源讨论**: 确认六维属性在登录时从 DB 读取，运行时属性通过公式计算，不额外存储
2. **更新机制确认**: 定时心跳推送，复用已有 30s ping 机制
3. **状态栏布局决策**: 两行都改 — 第一行改为气血/内力/精力三个进度条，第二行改为六维属性纯数值
4. **等级体系决策**: 使用中文等级（"初入江湖"），后续做升级系统时定义映射

---

> CX 工作流 | 功能探讨
