# PRD: 运功（内功特殊功能）指令系统

## 基本信息

- **创建时间**: 2026-02-10T21:55:00+08:00
- **优先级**: P0（紧急）
- **技术栈**: TypeScript / NestJS / React Native / pnpm monorepo
- **Scope 文档**: `.claude/cx/features/cx-yunggong/scope.md`

## 功能概述

实现 `exert`（运功）指令系统，让玩家激活内功后能主动使用内力执行特殊效果。建立完整的运功效果注册框架，支持通用效果（所有内功共享）和特殊效果（特定内功独有）两层体系。

运功是内力的主要主动消耗方式，也是内功系统的核心玩法循环：修炼内功 → 积累内力 → 运功使用内力 → 获得战斗/生存收益。

## 用户场景

### 场景 1: 战斗后恢复（调匀气息）

玩家战斗后气血大量损失，输入 `exert recover`，消耗内力瞬间恢复气血。内功等级越高，单位内力恢复的气血越多。

### 场景 2: 非战斗深度疗伤（运功疗伤）

玩家在安全地点输入 `exert heal`，进入持续疗伤状态，每 tick 消耗内力恢复气血，直到气血满、内力不足或被打断。效率高于调匀气息。

### 场景 3: 精力续航（提振精神）

玩家修炼/学习消耗大量精力后，输入 `exert regenerate`，消耗内力恢复精力，延长游戏续航。

### 场景 4: 战前增强（护体/强化）

玩家在战前输入 `exert shield` 获得临时防御加成，或 `exert powerup` 获得攻击/闪避/格挡加成。buff 有持续时间，到期自动移除。需要当前激活的内功支持该效果。

### 场景 5: 战斗中应急（战斗调息）

战斗中玩家气血告急，输入 `exert recover`，消耗更多内力恢复气血（战斗中消耗翻倍），为生存争取时间。

## 详细需求

### R1: exert 命令入口

- **命令**: `exert`
- **别名**: `运功`、`yunggong`
- **语法**: `exert <效果名> [目标]`
- **前置条件**:
  - 执行者为 PlayerBase
  - 有激活的内功（`skillManager.getActiveForce()` 非空）
  - 不在忙碌状态（如有 busy 机制）
- **效果查找流程**:
  1. 从 `ExertEffectRegistry` 查找效果名
  2. 若为通用效果（`isUniversal: true`），直接执行
  3. 若为特殊效果，检查当前激活内功的 `getExertEffects()` 是否包含该效果名
  4. 未找到则提示"你的内功没有这种运功方式"
- **无参数时**: 列出当前可用的运功效果列表

### R2: 效果注册框架

- **ExertEffectBase** 抽象基类:
  - `name`: 效果名称（英文标识，如 `recover`）
  - `displayName`: 中文显示名（如 `调匀气息`）
  - `isUniversal`: 是否通用效果
  - `canUseInCombat`: 战斗中是否可用
  - `execute(player, forceSkillId, forceLevel, target?)`: 执行效果
  - `getDescription()`: 效果说明文本
- **@ExertEffect 装饰器**: 自动注册到 `ExertEffectRegistry`
- **ExertEffectRegistry** 单例:
  - `get(name)`: 按名称查找效果
  - `getAll()`: 获取全部已注册效果
  - `getUniversal()`: 获取所有通用效果
- **InternalSkillBase** 增加:
  - `getExertEffects(): string[]` — 返回该内功支持的特殊效果名列表（默认空数组）

### R3: recover — 调匀气息

- **类型**: 通用，瞬发
- **战斗中**: 可用，消耗翻倍
- **前置**: 内力 >= 20，气血缺失 >= 10
- **内力消耗公式**: `cost = max(20, floor(100 * (maxHp - hp) / forceLevel))`
- **战斗中**: `cost = cost * 2`
- **效果**: 恢复 = min(缺失气血, 可恢复量)，其中可恢复量由实际扣除的内力反推
- **若内力不足以完全恢复**: 按比例部分恢复

### R4: heal — 运功疗伤

- **类型**: 通用，持续
- **战斗中**: 不可用
- **前置**: 内力 >= 50，气血缺失 >= maxHp / 5
- **机制**:
  - 设置 `exert/healing` 临时状态
  - 每 tick（3 秒）消耗 50 内力，恢复 `10 + floor(forceLevel / 3)` 气血
  - 使用 call_out 注册 tick 循环
- **停止条件**: 气血满 / 内力 < 50 / 进入战斗 / 内功切换 / 玩家输入 `exert stop`
- **停止时**: 清除 `exert/healing` 状态，额外消耗 `min(100, 当前内力)` 收功

### R5: regenerate — 提振精神

- **类型**: 通用，瞬发
- **战斗中**: 不可用
- **前置**: 内力 >= 20，精力缺失 >= 10
- **内力消耗公式**: `cost = max(20, floor(缺失精力 * 60 / forceLevel))`
- **效果**: 恢复 = min(缺失精力, 可恢复量)

### R6: shield — 护体

- **类型**: 特殊，持续 buff
- **战斗中**: 不可用（战前使用）
- **前置**: 内力 >= 100，内功等级 >= 50，当前无 shield buff
- **消耗**: 100 内力
- **效果**:
  - 设置 `exert/shield` 临时状态，值为防御加成量
  - 防御加成 = `floor(forceLevel / 2)`
  - 持续时间 = `forceLevel` 秒
  - 到期自动移除（call_out 回调清除 tmpDbase）
- **重复使用**: 刷新持续时间和加成量（先移除旧的再应用新的）
- **属性聚合**: `getSkillBonusSummary()` 需读取 `exert/shield` 加到 defense

### R7: powerup — 强化

- **类型**: 特殊，持续 buff
- **战斗中**: 不可用（战前使用）
- **前置**: 内力 >= 150，内功等级 >= 40，当前无 powerup buff
- **消耗**: 150 内力（一次性）
- **效果**:
  - 设置 `exert/powerup` 临时状态
  - 攻击加成 = `floor(forceLevel * 2 / 5)`
  - 闪避加成 = `floor(forceLevel * 2 / 5)`
  - 格挡加成 = `floor(forceLevel * 2 / 5)`
  - 持续时间 = `forceLevel` 秒
- **属性聚合**: `getSkillBonusSummary()` 需读取 `exert/powerup` 加到 attack/dodge/parry

### R8: 运功技能提升

- 每次成功执行运功后，有小概率调用 `skillManager.improveSkill(forceSkillId, 1, true)` 提升内功经验
- 概率 = `max(1, 10 - floor(forceLevel / 50))` %（内功等级越高概率越低）
- 使用 weakMode（弱模式），不触发悟性加成

### R9: exertResult 消息类型

新增 `exertResult` ServerMessage（packages/core）:

```typescript
interface ExertResultData {
  effectName: string; // 效果名（如 'recover'）
  displayName: string; // 中文名（如 '调匀气息'）
  success: boolean;
  message: string; // 富文本结果描述
  resourceChanged: boolean; // 是否引发资源变化（触发 playerStats 推送）
  buffApplied?: {
    // buff 信息（shield/powerup）
    name: string;
    duration: number; // 持续时间（秒）
    bonuses: Record<string, number>;
  };
  buffRemoved?: string; // 移除的 buff 名
  healingStarted?: boolean; // 是否开始持续疗伤
  healingStopped?: boolean; // 是否停止持续疗伤
}
```

### R10: exert stop 子命令

- `exert stop` — 中断当前持续运功（如 heal）
- 清除 `exert/healing` 状态，执行收功逻辑

### R11: 战斗限制规则

| 效果       | 战斗中可用 | 额外限制                       |
| ---------- | ---------- | ------------------------------ |
| recover    | 是         | 内力消耗翻倍                   |
| heal       | 否         | 进入战斗自动中断               |
| regenerate | 否         | —                              |
| shield     | 否         | 战前使用，战斗中不会被提前移除 |
| powerup    | 否         | 战前使用，战斗中不会被提前移除 |

## 现有代码基础

### 可直接复用

- `SkillManager.getActiveForce()` — 获取激活内功 ID
- `SkillManager.getSkillBonusSummary()` — 属性聚合（需扩展读取 buff）
- `SkillManager.improveSkill()` — 运功提升内功
- `InternalSkillBase` — 内功基类（需增加 `getExertEffects()`）
- `BaseEntity.set_temp() / get_temp() / delete_temp()` — buff 存储
- `BaseEntity.call_out() / cancel_call_out()` — 定时移除 / heal tick
- `PlayerBase.sendToClient()` — 推送消息
- `CommandLoader` 自动发现 — 新命令放 `commands/std/`
- `MessageFactory` + `@MessageHandler` — 新消息类型注册
- `rt()` / `bold()` — 富文本输出
- `ServiceLocator.skillRegistry` — 技能注册表访问

### 需修改的模块

- `InternalSkillBase` — 新增 `getExertEffects()` 虚方法
- `SkillManager.getSkillBonusSummary()` — 读取 buff 临时属性
- `packages/core/src/types/index.ts` — 导出新类型
- `packages/core/src/factory/index.ts` — 导入新消息处理器

## 代码影响范围

| 层级   | 文件                                     | 操作         |
| ------ | ---------------------------------------- | ------------ |
| Core   | `types/messages/exert.ts`                | 新建         |
| Core   | `types/exert-constants.ts`               | 新建         |
| Core   | `factory/handlers/exertResult.ts`        | 新建         |
| Core   | `types/index.ts`                         | 修改（导出） |
| Core   | `factory/index.ts`                       | 修改（导入） |
| Engine | `exert/exert-effect-base.ts`             | 新建         |
| Engine | `exert/exert-effect-registry.ts`         | 新建         |
| Engine | `exert/effects/recover.ts`               | 新建         |
| Engine | `exert/effects/heal.ts`                  | 新建         |
| Engine | `exert/effects/regenerate.ts`            | 新建         |
| Engine | `exert/effects/shield.ts`                | 新建         |
| Engine | `exert/effects/powerup.ts`               | 新建         |
| Engine | `commands/std/exert.ts`                  | 新建         |
| Engine | `skills/internal/internal-skill-base.ts` | 修改         |
| Engine | `skills/skill-manager.ts`                | 修改         |
| Test   | `engine/__tests__/exert-*.spec.ts`       | 新建         |

**总计**: 约 11 个新建文件 + 4 个修改文件 + 测试文件

## 验收标准

- [ ] `exert` 命令可识别，别名 `运功/yunggong` 可用
- [ ] 无参数输入 `exert` 列出当前可用运功效果
- [ ] `exert recover` 消耗内力恢复气血，内力不足时提示
- [ ] `exert recover` 战斗中消耗翻倍
- [ ] `exert heal` 进入持续疗伤，每 tick 消耗内力恢复气血
- [ ] `exert heal` 战斗中被禁止
- [ ] `exert stop` 中断持续疗伤
- [ ] `exert regenerate` 消耗内力恢复精力
- [ ] `exert shield` 获得临时防御 buff，到期自动移除
- [ ] `exert powerup` 获得临时属性强化 buff，到期自动移除
- [ ] shield/powerup 需要内功支持（`getExertEffects()` 包含）
- [ ] 未激活内功时运功失败并提示
- [ ] 运功成功后小概率提升内功经验
- [ ] `exertResult` 消息正确推送到前端
- [ ] `getSkillBonusSummary()` 正确聚合 buff 加成
- [ ] 现有测试不回归
- [ ] `pnpm build`（core）编译通过
