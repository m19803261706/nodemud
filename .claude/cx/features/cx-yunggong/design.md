# Design Doc: 运功（内功特殊功能）指令系统

## 关联

- PRD: `.claude/cx/features/cx-yunggong/prd.md`
- Scope: `.claude/cx/features/cx-yunggong/scope.md`

## 基于现有代码

### 可直接复用

| 模块                                           | 路径                                  | 复用方式                                                          |
| ---------------------------------------------- | ------------------------------------- | ----------------------------------------------------------------- |
| `BaseEntity.setTemp/getTemp/delTemp`           | `engine/base-entity.ts:99-124`        | buff 状态存储（`exert/shield`, `exert/powerup`, `exert/healing`） |
| `BaseEntity.callOut/removeCallOut`             | `engine/base-entity.ts:319-334`       | buff 到期移除 + heal tick 循环                                    |
| `SkillManager.getActiveForce()`                | `engine/skills/skill-manager.ts:889`  | 获取当前激活内功 ID                                               |
| `SkillManager.improveSkill()`                  | `engine/skills/skill-manager.ts:256`  | 运功后概率提升内功                                                |
| `SkillManager.getSkillLevel()`                 | `engine/skills/skill-manager.ts:849`  | 获取内功等级                                                      |
| `LivingBase.recoverHp/recoverMp/recoverEnergy` | `game-objects/living-base.ts:224-235` | 资源恢复（返回实际恢复量）                                        |
| `LivingBase.isInCombat()`                      | `game-objects/living-base.ts:276`     | 战斗状态检测                                                      |
| `LivingBase.getMaxHp/getMaxMp`                 | `game-objects/living-base.ts:156-165` | 资源上限                                                          |
| `@Command` 装饰器                              | `engine/types/command.ts`             | exert 命令注册                                                    |
| `@MessageHandler` 装饰器                       | `core/factory/MessageFactory.ts`      | exertResult 消息注册                                              |
| `MessageFactory.create/serialize`              | `core/factory/MessageFactory.ts`      | 创建和发送消息                                                    |
| `ServiceLocator.skillRegistry`                 | `engine/service-locator.ts`           | 获取技能定义                                                      |
| `PlayerBase.sendToClient()`                    | `game-objects/player-base.ts`         | 推送消息到前端                                                    |
| `rt()/bold()`                                  | `engine/utils/rich-text.ts`           | 富文本输出                                                        |

### 需修改的模块

| 模块                                        | 修改内容                                                |
| ------------------------------------------- | ------------------------------------------------------- |
| `InternalSkillBase`                         | 新增 `getExertEffects(): string[]` 虚方法（默认空数组） |
| `SkillManager.getSkillBonusSummary()`       | 读取 `exert/shield` 和 `exert/powerup` tmpDbase 加成    |
| `packages/core/src/types/index.ts`          | 导出 `exert-constants`                                  |
| `packages/core/src/types/messages/index.ts` | 导出 `exert` 消息类型                                   |
| `packages/core/src/factory/index.ts`        | 导入 `exertResult` 处理器                               |

## 架构概览

```
┌─────────────────────────────────────────────────────────┐
│                    exert 命令入口                         │
│              commands/std/exert.ts                        │
│    解析参数 → 前置校验 → 查找效果 → 执行 → 推送结果     │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│               ExertEffectRegistry (单例)                 │
│    get(name) / getAll() / getUniversal()                 │
│    由 @ExertEffect 装饰器自动注册                        │
└────────────┬───────────────────────┬────────────────────┘
             │                       │
     ┌───────▼───────┐      ┌───────▼───────┐
     │  通用效果      │      │  特殊效果      │
     │  isUniversal   │      │  需内功支持    │
     ├───────────────┤      ├───────────────┤
     │ recover 调匀   │      │ shield 护体    │
     │ heal 疗伤      │      │ powerup 强化   │
     │ regenerate 提振│      │ (未来更多...)  │
     └───────┬───────┘      └───────┬───────┘
             │                       │
             ▼                       ▼
┌─────────────────────────────────────────────────────────┐
│                ExertEffectBase (抽象基类)                 │
│  name / displayName / isUniversal / canUseInCombat       │
│  execute(player, forceSkillId, forceLevel, target?)      │
│  getDescription()                                        │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                     PlayerBase                           │
│  setTemp/getTemp/delTemp (buff 存储)                     │
│  callOut/removeCallOut (定时器)                           │
│  recoverHp/recoverMp/recoverEnergy (资源恢复)            │
│  sendToClient → exertResult 消息                         │
└─────────────────────────────────────────────────────────┘
```

### 数据流

```
玩家输入 "exert recover"
  │
  ├─ exert.ts 解析 → effectName = "recover"
  ├─ 校验: 是 PlayerBase? 有 activeForce?
  ├─ ExertEffectRegistry.get("recover") → RecoverEffect
  ├─ 通用效果? → 直接执行
  ├─ RecoverEffect.execute(player, forceId, level)
  │   ├─ 计算 cost = max(20, floor(100*(maxHp-hp)/level))
  │   ├─ 战斗中? cost *= 2
  │   ├─ player.recoverMp(-cost)  (扣内力)
  │   ├─ player.recoverHp(amount) (加气血)
  │   └─ 概率提升内功: skillManager.improveSkill(forceId, 1, true)
  │
  └─ 推送 exertResult 消息
      ├─ resourceChanged: true → 前端拉取 playerStats
      └─ GameLog 显示文案
```

## ⚡ 消息契约（强制章节）

> **此章节是前后端的对齐合同。exec 阶段必须严格遵守。**

### 消息总览

| #   | 类型          | 消息名        | 方向            | 说明             |
| --- | ------------- | ------------- | --------------- | ---------------- |
| 1   | ServerMessage | `exertResult` | Server → Client | 运功执行结果推送 |

本功能仅新增 1 个消息类型。运功通过文本命令 `exert <effect>` 触发，无需新增 ClientMessage — 复用现有 `command` 消息通道。

### 消息详情

#### 1. exertResult — 运功执行结果

**触发时机**: 每次运功执行完成后（成功或失败），以及 heal 每 tick 更新、buff 移除时推送。

**消息结构**:

```typescript
// packages/core/src/types/messages/exert.ts

interface ExertResultData {
  effectName: string; // 效果名（如 'recover'、'heal'、'shield'）
  displayName: string; // 中文名（如 '调匀气息'、'运功疗伤'、'护体'）
  success: boolean; // 是否成功
  message: string; // 富文本结果描述（rt() 格式）
  resourceChanged: boolean; // 是否引发资源变化（前端据此刷新 playerStats）
  buffApplied?: {
    // buff 信息（shield/powerup 成功时）
    name: string; // buff 名（'shield' 或 'powerup'）
    duration: number; // 持续时间（秒）
    bonuses: Record<string, number>; // 属性加成 {defense: 50} 或 {attack: 40, dodge: 40, parry: 40}
  };
  buffRemoved?: string; // 移除的 buff 名（到期移除时推送）
  healingStarted?: boolean; // 是否开始持续疗伤
  healingStopped?: boolean; // 是否停止持续疗伤
}

interface ExertResultMessage extends ServerMessage {
  type: 'exertResult';
  data: ExertResultData;
}
```

**成功示例 (recover)**:

```json
{
  "type": "exertResult",
  "data": {
    "effectName": "recover",
    "displayName": "调匀气息",
    "success": true,
    "message": "你运功调匀气息，恢复了 150 点气血，消耗内力 80 点。",
    "resourceChanged": true
  },
  "timestamp": 1707580800000
}
```

**成功示例 (shield)**:

```json
{
  "type": "exertResult",
  "data": {
    "effectName": "shield",
    "displayName": "护体",
    "success": true,
    "message": "你运起内力护住全身，防御力大增！",
    "resourceChanged": true,
    "buffApplied": {
      "name": "shield",
      "duration": 100,
      "bonuses": { "defense": 50 }
    }
  },
  "timestamp": 1707580800000
}
```

**heal tick 推送**:

```json
{
  "type": "exertResult",
  "data": {
    "effectName": "heal",
    "displayName": "运功疗伤",
    "success": true,
    "message": "你运功疗伤，恢复了 43 点气血。",
    "resourceChanged": true
  },
  "timestamp": 1707580803000
}
```

**heal 停止**:

```json
{
  "type": "exertResult",
  "data": {
    "effectName": "heal",
    "displayName": "运功疗伤",
    "success": true,
    "message": "你收起内力，运功疗伤结束。",
    "resourceChanged": true,
    "healingStopped": true
  },
  "timestamp": 1707580830000
}
```

**失败示例**:

```json
{
  "type": "exertResult",
  "data": {
    "effectName": "recover",
    "displayName": "调匀气息",
    "success": false,
    "message": "你的内力不足，无法调匀气息。",
    "resourceChanged": false
  },
  "timestamp": 1707580800000
}
```

**前端处理**:

| 字段                                      | 前端行为                                     |
| ----------------------------------------- | -------------------------------------------- |
| `success: true` + `resourceChanged: true` | GameLog 显示 message，刷新 PlayerStats       |
| `success: false`                          | GameLog 显示失败 message（红色）             |
| `buffApplied`                             | GameLog 显示 buff 信息（可选未来 buff 图标） |
| `buffRemoved`                             | GameLog 显示 buff 移除信息                   |
| `healingStarted: true`                    | GameLog 提示疗伤开始                         |
| `healingStopped: true`                    | GameLog 提示疗伤结束                         |

---

## ⚡ 状态枚举对照表（强制章节）

> **前后端必须使用完全一致的枚举值。此处定义后，exec 阶段不允许修改。**

### 运功效果类型枚举

| 枚举值   | 后端常量     | Core 定义值    | 前端常量       | 显示文本   | 说明                      |
| -------- | ------------ | -------------- | -------------- | ---------- | ------------------------- |
| 调匀气息 | `RECOVER`    | `'recover'`    | `'recover'`    | `调匀气息` | 通用，瞬发，恢复气血      |
| 运功疗伤 | `HEAL`       | `'heal'`       | `'heal'`       | `运功疗伤` | 通用，持续，每 tick 恢复  |
| 提振精神 | `REGENERATE` | `'regenerate'` | `'regenerate'` | `提振精神` | 通用，瞬发，恢复精力      |
| 护体     | `SHIELD`     | `'shield'`     | `'shield'`     | `护体`     | 特殊，持续 buff，防御加成 |
| 强化     | `POWERUP`    | `'powerup'`    | `'powerup'`    | `强化`     | 特殊，持续 buff，属性强化 |

### Buff tmpDbase 键值对照

| buff 名 | tmpDbase 路径   | 值类型                                             | 说明                 |
| ------- | --------------- | -------------------------------------------------- | -------------------- |
| shield  | `exert/shield`  | `number`                                           | 防御加成值           |
| powerup | `exert/powerup` | `{ attack: number; dodge: number; parry: number }` | 属性加成对象         |
| healing | `exert/healing` | `boolean`                                          | 是否处于持续疗伤状态 |

### 效果类型分类

```
通用效果 (isUniversal: true)
├── recover  — 任何激活内功都可用
├── heal     — 任何激活内功都可用
└── regenerate — 任何激活内功都可用

特殊效果 (isUniversal: false)
├── shield   — 需内功 getExertEffects() 包含 'shield'
└── powerup  — 需内功 getExertEffects() 包含 'powerup'
```

### Core 枚举定义

```typescript
// packages/core/src/types/exert-constants.ts

/** 运功效果类型 */
export enum ExertEffectType {
  RECOVER = 'recover', // 调匀气息
  HEAL = 'heal', // 运功疗伤
  REGENERATE = 'regenerate', // 提振精神
  SHIELD = 'shield', // 护体
  POWERUP = 'powerup', // 强化
}

/** 运功效果元信息 */
export const EXERT_EFFECT_META: Record<
  ExertEffectType,
  {
    displayName: string;
    isUniversal: boolean;
    canUseInCombat: boolean;
  }
> = {
  [ExertEffectType.RECOVER]: { displayName: '调匀气息', isUniversal: true, canUseInCombat: true },
  [ExertEffectType.HEAL]: { displayName: '运功疗伤', isUniversal: true, canUseInCombat: false },
  [ExertEffectType.REGENERATE]: {
    displayName: '提振精神',
    isUniversal: true,
    canUseInCombat: false,
  },
  [ExertEffectType.SHIELD]: { displayName: '护体', isUniversal: false, canUseInCombat: false },
  [ExertEffectType.POWERUP]: { displayName: '强化', isUniversal: false, canUseInCombat: false },
};
```

---

## ⚡ 数据字段映射表（强制章节）

> **此表定义 ExertResultData 的完整字段映射。exec 阶段创建消息类型时必须严格遵循。**

| #   | 功能      | 后端变量 (camelCase) | Core 接口字段     | 前端 Store 字段   | 类型                   | 必填 | 说明                     |
| --- | --------- | -------------------- | ----------------- | ----------------- | ---------------------- | ---- | ------------------------ |
| 1   | 效果名    | `effectName`         | `effectName`      | `effectName`      | `string`               | ✅   | 效果标识（如 'recover'） |
| 2   | 显示名    | `displayName`        | `displayName`     | `displayName`     | `string`               | ✅   | 中文名（如 '调匀气息'）  |
| 3   | 成功      | `success`            | `success`         | `success`         | `boolean`              | ✅   | 是否成功                 |
| 4   | 消息      | `message`            | `message`         | `message`         | `string`               | ✅   | 富文本结果描述           |
| 5   | 资源变化  | `resourceChanged`    | `resourceChanged` | `resourceChanged` | `boolean`              | ✅   | 是否引发资源变化         |
| 6   | Buff 应用 | `buffApplied`        | `buffApplied`     | `buffApplied`     | `object \| undefined`  | ❌   | shield/powerup buff 信息 |
| 7   | Buff 移除 | `buffRemoved`        | `buffRemoved`     | `buffRemoved`     | `string \| undefined`  | ❌   | 移除的 buff 名           |
| 8   | 疗伤开始  | `healingStarted`     | `healingStarted`  | `healingStarted`  | `boolean \| undefined` | ❌   | 开始持续疗伤             |
| 9   | 疗伤停止  | `healingStopped`     | `healingStopped`  | `healingStopped`  | `boolean \| undefined` | ❌   | 停止持续疗伤             |

### buffApplied 子对象字段映射

| #   | 字段       | 类型                     | 说明                             |
| --- | ---------- | ------------------------ | -------------------------------- |
| 1   | `name`     | `string`                 | buff 名（'shield' 或 'powerup'） |
| 2   | `duration` | `number`                 | 持续时间（秒）                   |
| 3   | `bonuses`  | `Record<string, number>` | 属性加成键值对                   |

### 命名规范确认

- Core 接口: camelCase（`effectName`、`resourceChanged`）
- 后端: camelCase（与 Core 一致）
- 前端: camelCase（与 Core 一致）
- 消息传输: JSON camelCase（无需转换）

### TypeScript 类型定义

**Core (packages/core)**:

```typescript
/** 运功结果消息数据 */
export interface ExertResultData {
  /** 效果名（如 'recover'） */
  effectName: string;
  /** 中文显示名（如 '调匀气息'） */
  displayName: string;
  /** 是否成功 */
  success: boolean;
  /** 富文本结果描述 */
  message: string;
  /** 是否引发资源变化 */
  resourceChanged: boolean;
  /** buff 应用信息 */
  buffApplied?: {
    name: string;
    duration: number;
    bonuses: Record<string, number>;
  };
  /** 移除的 buff 名 */
  buffRemoved?: string;
  /** 是否开始持续疗伤 */
  healingStarted?: boolean;
  /** 是否停止持续疗伤 */
  healingStopped?: boolean;
}
```

---

## 后端设计

### 模块结构

```
server/src/engine/
├── exert/
│   ├── exert-effect-base.ts           # 效果抽象基类 + @ExertEffect 装饰器
│   ├── exert-effect-registry.ts       # 效果注册表（单例）
│   └── effects/
│       ├── recover.ts                 # 调匀气息（通用）
│       ├── heal.ts                    # 运功疗伤（通用，持续）
│       ├── regenerate.ts              # 提振精神（通用）
│       ├── shield.ts                  # 护体（特殊，buff）
│       └── powerup.ts                # 强化（特殊，buff）
├── commands/std/
│   └── exert.ts                       # exert 命令入口
└── skills/internal/
    └── internal-skill-base.ts         # 增加 getExertEffects()
```

### ExertEffectBase 抽象基类

```typescript
// server/src/engine/exert/exert-effect-base.ts

import type { PlayerBase } from '../game-objects/player-base';

/** 效果执行结果 */
export interface ExertExecuteResult {
  success: boolean;
  message: string; // 富文本
  resourceChanged: boolean;
  buffApplied?: { name: string; duration: number; bonuses: Record<string, number> };
  buffRemoved?: string;
  healingStarted?: boolean;
  healingStopped?: boolean;
}

/** 运功效果基类 */
export abstract class ExertEffectBase {
  abstract readonly name: string;
  abstract readonly displayName: string;
  abstract readonly isUniversal: boolean;
  abstract readonly canUseInCombat: boolean;

  /** 执行效果 */
  abstract execute(
    player: PlayerBase,
    forceSkillId: string,
    forceLevel: number,
    target?: string,
  ): ExertExecuteResult;

  /** 效果说明 */
  abstract getDescription(): string;
}

/** @ExertEffect 装饰器 — 自动注册到 ExertEffectRegistry */
export function ExertEffect() {
  return function <T extends { new (...args: any[]): ExertEffectBase }>(constructor: T) {
    const instance = new constructor();
    ExertEffectRegistry.getInstance().register(instance);
    return constructor;
  };
}
```

### ExertEffectRegistry 单例

```typescript
// server/src/engine/exert/exert-effect-registry.ts

export class ExertEffectRegistry {
  private static instance: ExertEffectRegistry;
  private effects: Map<string, ExertEffectBase> = new Map();

  static getInstance(): ExertEffectRegistry { ... }

  register(effect: ExertEffectBase): void {
    this.effects.set(effect.name, effect);
  }

  get(name: string): ExertEffectBase | undefined {
    return this.effects.get(name);
  }

  getAll(): ExertEffectBase[] {
    return [...this.effects.values()];
  }

  getUniversal(): ExertEffectBase[] {
    return this.getAll().filter(e => e.isUniversal);
  }
}
```

### exert 命令

```typescript
// server/src/engine/commands/std/exert.ts

@Command({
  name: 'exert',
  aliases: ['运功', 'yunggong'],
  description: '运功 — 使用内力施展特殊效果',
})
export class ExertCommand implements ICommand {
  execute(executor: LivingBase, args: string[]): CommandResult {
    // 1. 类型守卫: executor instanceof PlayerBase
    // 2. 获取 activeForce，无则失败
    // 3. 获取内功等级
    // 4. 无参数时: 列出可用效果列表
    // 5. args[0] === 'stop' → 中断持续运功（heal）
    // 6. 从 ExertEffectRegistry 查找效果
    // 7. 通用效果直接执行; 特殊效果检查 getExertEffects()
    // 8. 战斗限制检查
    // 9. effect.execute(player, forceId, level, target)
    // 10. 推送 exertResult 消息
    // 11. 概率提升内功: max(1, 10 - floor(level/50))%
  }
}
```

### 效果实现概要

#### recover — 调匀气息

```typescript
@ExertEffect()
export class RecoverEffect extends ExertEffectBase {
  name = 'recover';
  displayName = '调匀气息';
  isUniversal = true;
  canUseInCombat = true;

  execute(player, forceSkillId, forceLevel): ExertExecuteResult {
    const hp = player.get<number>('hp') ?? 0;
    const maxHp = player.getMaxHp();
    const mp = player.get<number>('mp') ?? 0;
    const missing = maxHp - hp;

    // 前置: 内力 >= 20, 缺失 >= 10
    if (mp < 20) return fail('内力不足');
    if (missing < 10) return fail('气血充足');

    // 消耗公式
    let cost = Math.max(20, Math.floor((100 * missing) / forceLevel));
    if (player.isInCombat()) cost *= 2;

    // 实际消耗 = min(cost, 当前内力)
    const actualCost = Math.min(cost, mp);
    const recoverRatio = actualCost / cost;
    const healAmount = Math.floor(missing * recoverRatio);

    player.set('mp', mp - actualCost);
    const actualHeal = player.recoverHp(healAmount);

    return {
      success: true,
      message: `...恢复 ${actualHeal} 气血，消耗 ${actualCost} 内力`,
      resourceChanged: true,
    };
  }
}
```

#### heal — 运功疗伤

```typescript
@ExertEffect()
export class HealEffect extends ExertEffectBase {
  name = 'heal';
  displayName = '运功疗伤';
  isUniversal = true;
  canUseInCombat = false;

  execute(player, forceSkillId, forceLevel): ExertExecuteResult {
    // 前置: 内力 >= 50, 缺失 >= maxHp/5, 非战斗, 非已在疗伤
    if (player.getTemp<boolean>('exert/healing')) return fail('已在运功疗伤中');

    // 设置疗伤状态
    player.setTemp('exert/healing', true);

    // 注册 tick 循环（每 3 秒）
    const tickFn = () => {
      const mp = player.get<number>('mp') ?? 0;
      const hp = player.get<number>('hp') ?? 0;
      const maxHp = player.getMaxHp();

      // 停止条件
      if (hp >= maxHp || mp < 50 || player.isInCombat() || !player.getTemp('exert/healing')) {
        this.stopHealing(player);
        return;
      }

      // 消耗 50 内力，恢复 10 + floor(level/3) 气血
      player.set('mp', mp - 50);
      const healAmt = 10 + Math.floor(forceLevel / 3);
      const actual = player.recoverHp(healAmt);

      // 推送 tick 结果（exertResult 消息）
      // ...

      // 注册下一个 tick
      player.callOut(tickFn, 3000);
    };

    player.callOut(tickFn, 3000);
    return {
      success: true,
      message: '开始运功疗伤...',
      resourceChanged: false,
      healingStarted: true,
    };
  }

  stopHealing(player): void {
    player.delTemp('exert/healing');
    // 收功消耗 min(100, 当前内力)
    const mp = player.get<number>('mp') ?? 0;
    const finalCost = Math.min(100, mp);
    player.set('mp', mp - finalCost);
    // 推送 healingStopped 消息
  }
}
```

#### regenerate — 提振精神

```typescript
@ExertEffect()
export class RegenerateEffect extends ExertEffectBase {
  name = 'regenerate';
  displayName = '提振精神';
  isUniversal = true;
  canUseInCombat = false;

  execute(player, forceSkillId, forceLevel): ExertExecuteResult {
    // 前置: 内力 >= 20, 精力缺失 >= 10
    // 消耗: cost = max(20, floor(缺失精力 * 60 / forceLevel))
    // 效果: 恢复 min(缺失精力, 可恢复量)
  }
}
```

#### shield — 护体

```typescript
@ExertEffect()
export class ShieldEffect extends ExertEffectBase {
  name = 'shield';
  displayName = '护体';
  isUniversal = false;
  canUseInCombat = false;

  execute(player, forceSkillId, forceLevel): ExertExecuteResult {
    // 前置: 内力 >= 100, 内功等级 >= 50
    // 消耗: 100 内力
    // 重复使用: 先移除旧 buff + 旧 callOut
    // 设置 exert/shield = floor(forceLevel / 2)
    // callOut 到期移除 + 推送 buffRemoved
    const bonus = Math.floor(forceLevel / 2);
    const duration = forceLevel; // 秒

    player.set('mp', mp - 100);
    player.setTemp('exert/shield', bonus);

    // 存储 callOut ID 以便刷新时取消
    const oldCallOutId = player.getTemp<string>('exert/shield_callout');
    if (oldCallOutId) player.removeCallOut(oldCallOutId);

    const callOutId = player.callOut(() => {
      player.delTemp('exert/shield');
      player.delTemp('exert/shield_callout');
      // 推送 buffRemoved
    }, duration * 1000);
    player.setTemp('exert/shield_callout', callOutId);

    return {
      success: true,
      message: '...',
      resourceChanged: true,
      buffApplied: { name: 'shield', duration, bonuses: { defense: bonus } },
    };
  }
}
```

#### powerup — 强化

```typescript
@ExertEffect()
export class PowerupEffect extends ExertEffectBase {
  name = 'powerup';
  displayName = '强化';
  isUniversal = false;
  canUseInCombat = false;

  execute(player, forceSkillId, forceLevel): ExertExecuteResult {
    // 前置: 内力 >= 150, 内功等级 >= 40
    // 消耗: 150 内力
    const bonus = Math.floor((forceLevel * 2) / 5);
    const duration = forceLevel;

    // 设置 exert/powerup = { attack: bonus, dodge: bonus, parry: bonus }
    // callOut 到期移除
    // 存储 callOut ID (exert/powerup_callout)

    return {
      success: true,
      message: '...',
      resourceChanged: true,
      buffApplied: {
        name: 'powerup',
        duration,
        bonuses: { attack: bonus, dodge: bonus, parry: bonus },
      },
    };
  }
}
```

### SkillManager.getSkillBonusSummary() 修改

在现有方法末尾（`return summary` 之前）追加 buff 读取：

```typescript
// 读取运功 buff 加成
const shieldBonus = this.player.getTemp<number>('exert/shield');
if (shieldBonus) {
  summary.defense += shieldBonus;
}

const powerupBonus = this.player.getTemp<{ attack: number; dodge: number; parry: number }>(
  'exert/powerup',
);
if (powerupBonus) {
  summary.attack += powerupBonus.attack;
  summary.dodge += powerupBonus.dodge;
  summary.parry += powerupBonus.parry;
}
```

### InternalSkillBase 修改

```typescript
// server/src/engine/skills/internal/internal-skill-base.ts
// 新增方法（默认实现）

/**
 * 获取该内功支持的运功特殊效果列表
 * 子类可覆盖以声明支持 shield/powerup 等特殊效果
 * @returns 效果名数组
 */
getExertEffects(): string[] {
  return [];
}
```

### 运功技能提升逻辑

在 exert 命令中，每次成功执行后：

```typescript
// 概率提升内功: max(1, 10 - floor(level/50))%
const improveChance = Math.max(1, 10 - Math.floor(forceLevel / 50));
if (Math.random() * 100 < improveChance) {
  player.skillManager.improveSkill(forceSkillId, 1, true); // weakMode
}
```

## 前端设计

本期前端仅处理 `exertResult` 消息在 GameLog 中的展示，不新增 UI 组件。

### 消息订阅（Zustand Store）

在 `useGameStore` 的 WebSocket 消息处理中新增 `exertResult` case：

```typescript
case 'exertResult': {
  const data = msg.data as ExertResultData;
  // 添加到 gameLog（展示 message 文本）
  addGameLog(data.message);
  // resourceChanged 时前端会通过 playerStats 消息自动更新
  break;
}
```

## 影响范围

### 新增文件

| 层级   | 路径                                                | 说明                          |
| ------ | --------------------------------------------------- | ----------------------------- |
| Core   | `packages/core/src/types/messages/exert.ts`         | ExertResultData 消息类型      |
| Core   | `packages/core/src/types/exert-constants.ts`        | ExertEffectType 枚举 + 元信息 |
| Core   | `packages/core/src/factory/handlers/exertResult.ts` | 消息处理器                    |
| Engine | `server/src/engine/exert/exert-effect-base.ts`      | 效果基类 + 装饰器             |
| Engine | `server/src/engine/exert/exert-effect-registry.ts`  | 效果注册表                    |
| Engine | `server/src/engine/exert/effects/recover.ts`        | 调匀气息                      |
| Engine | `server/src/engine/exert/effects/heal.ts`           | 运功疗伤                      |
| Engine | `server/src/engine/exert/effects/regenerate.ts`     | 提振精神                      |
| Engine | `server/src/engine/exert/effects/shield.ts`         | 护体                          |
| Engine | `server/src/engine/exert/effects/powerup.ts`        | 强化                          |
| Engine | `server/src/engine/commands/std/exert.ts`           | exert 命令                    |
| Test   | `server/src/engine/__tests__/exert-*.spec.ts`       | 单元测试                      |

### 修改文件

| 层级   | 路径                                                       | 修改内容                                 |
| ------ | ---------------------------------------------------------- | ---------------------------------------- |
| Core   | `packages/core/src/types/index.ts`                         | 添加 `export * from './exert-constants'` |
| Core   | `packages/core/src/types/messages/index.ts`                | 添加 `export * from './exert'`           |
| Core   | `packages/core/src/factory/index.ts`                       | 添加 `import './handlers/exertResult'`   |
| Engine | `server/src/engine/skills/internal/internal-skill-base.ts` | 新增 `getExertEffects()` 方法            |
| Engine | `server/src/engine/skills/skill-manager.ts`                | `getSkillBonusSummary()` 读取 buff 加成  |

**总计**: 12 个新建文件 + 5 个修改文件

## 风险点

| 风险                                  | 等级 | 应对方案                                                              |
| ------------------------------------- | ---- | --------------------------------------------------------------------- |
| heal tick 循环未正确清理（内存泄漏）  | 中   | stopHealing 必须清除所有 callOut；玩家下线时 clearCallOuts() 自动清理 |
| buff callOut 刷新时旧定时器残留       | 中   | 使用 `exert/shield_callout` 存储 callOut ID，刷新前先 removeCallOut   |
| getSkillBonusSummary 新增读取影响性能 | 低   | 仅增加 2 次 getTemp 调用，开销可忽略                                  |
| 战斗中 heal 未被正确中断              | 中   | heal tick 每次检查 isInCombat()，进入战斗时自然停止                   |
| 装饰器导入顺序导致效果未注册          | 低   | exert 命令文件中显式导入所有效果文件，确保装饰器执行                  |
