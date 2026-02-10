# 功能探讨: 运功（内功特殊功能）指令系统

## 功能目标

实现 `exert`（运功）指令，让玩家激活内功后能主动使用内力执行特殊效果：恢复气血、持续疗伤、恢复精力、护体增防、强化属性等。建立完整的运功效果注册框架，支持通用效果（所有内功共享）和特殊效果（特定内功独有）两层体系。

对标：炎黄 MUD `cmds/skill/exert.c` + `kungfu/skill/force/` 体系。

## 用户流程

1. 玩家已激活一个内功（通过技能面板映射到 FORCE 槽位）
2. 输入 `exert recover` — 消耗内力瞬间恢复气血
3. 输入 `exert heal` — 非战斗中持续消耗内力恢复气血
4. 输入 `exert regenerate` — 消耗内力恢复精力
5. 输入 `exert shield` — 消耗内力获得临时防御 buff（需要内功支持此效果）
6. 输入 `exert powerup` — 消耗内力获得临时属性强化 buff（需要内功支持此效果）
7. 前端通过 `exertResult` 消息接收运功结果，可做特殊渲染（buff 图标、计时器等）

## 方案概要

### 指令设计

- **主命令**: `exert`
- **别名**: `运功`、`yunggong`
- **语法**: `exert <效果名> [目标]`
- **示例**: `exert recover`、`exert heal`、`exert shield`、`exert dispel 张三`

### 效果体系（两层架构）

#### 通用效果（所有内功共享）

| 效果       | 名称     | 类型 | 消耗      | 说明                                                       |
| ---------- | -------- | ---- | --------- | ---------------------------------------------------------- |
| recover    | 调匀气息 | 瞬发 | 内力      | 消耗内力恢复气血，公式: cost = 100 \* 缺失气血 / 内功等级  |
| heal       | 运功疗伤 | 持续 | 内力/tick | 非战斗中持续消耗内力恢复气血，每 tick 恢复 10 + 内功等级/3 |
| regenerate | 提振精神 | 瞬发 | 内力      | 消耗内力恢复精力，公式: cost = 缺失精力 \* 60 / 内功等级   |

#### 特殊效果（由具体内功注册）

| 效果    | 名称 | 类型      | 消耗     | 说明                                          |
| ------- | ---- | --------- | -------- | --------------------------------------------- |
| shield  | 护体 | 持续 buff | 100 内力 | 临时增加防御（+内功等级/2），持续 内功等级 秒 |
| powerup | 强化 | 持续 buff | 150 内力 | 临时增加攻击/闪避/格挡，持续 内功等级 秒      |

### 效果注册机制

- 每个效果一个独立文件，继承 `ExertEffectBase`
- 使用 `@ExertEffect({ name, type, isUniversal })` 装饰器注册到 `ExertEffectRegistry`
- 通用效果: `isUniversal: true`，任何激活内功都能用
- 特殊效果: `isUniversal: false`，由 `InternalSkillBase.getExertEffects()` 声明支持列表

### Buff 机制

- 使用现有 tmpDbase 体系（`set_temp` / `get_temp`）存储 buff 状态
- 使用 BaseEntity 的 `call_out` 延迟调用机制设置 buff 过期移除
- 同类 buff 不叠加，新的覆盖旧的（刷新持续时间）
- buff 属性键: `exert/shield`、`exert/powerup` 等

### Heal 持续疗伤机制

- 独立实现，不复用 PracticeManager
- 使用 call_out 注册 tick 循环（每秒或每几秒一次）
- 临时状态: `exert/healing` 标记疗伤中
- 停止条件: 气血满、内力不足、进入战斗、玩家移动、内功切换

### 前端消息

新增 `exertResult` 消息类型（ServerMessage），包含:

- effectName: string — 效果名称
- success: boolean — 是否成功
- message: string — 富文本结果描述
- buffApplied?: { name, duration, bonuses } — buff 信息（如有）
- buffRemoved?: string — 移除的 buff 名（如有）
- resourceChanged: boolean — 是否引发资源变化

## 与现有功能的关系

### 依赖

- `SkillManager.activeForce` — 获取当前激活内功
- `InternalSkillBase` — 内功基类，需增加 `getExertEffects()` 虚方法
- `BaseEntity.call_out()` — buff 定时移除和 heal tick
- `BaseEntity.set_temp() / get_temp()` — buff 状态存储
- `PlayerBase` 资源属性 — hp/mp/energy 的读写
- `SkillBonusSummary` — buff 加成需要参与属性聚合

### 影响

- `SkillManager.getSkillBonusSummary()` — 需读取 tmpDbase 中的 buff 加成
- `PlayerBase` 资源变化 — exert 会直接改变 hp/mp/energy
- 战斗系统 — shield/powerup buff 影响战斗属性
- 前端 — 新增 exertResult 消息处理（GameLog 展示 + 可选 buff 图标）

### 复用

- `CommandLoader` 自动发现 — exert.ts 放 `commands/std/` 即可
- `rt()` / `bold()` 富文本工具 — 运功输出文案
- `MessageFactory` — 创建 exertResult 消息
- `ServiceLocator` — 访问 skillRegistry

## 文件结构

```
packages/core/
  src/types/messages/exert.ts          # ExertResultData 消息类型
  src/factory/handlers/exertResult.ts  # 消息处理器
  src/types/exert-constants.ts         # ExertEffectType 枚举

server/src/engine/
  exert/
    exert-effect-base.ts               # 效果基类 + @ExertEffect 装饰器
    exert-effect-registry.ts           # 效果注册表（单例）
    effects/
      recover.ts                       # 调匀气息（通用）
      heal.ts                          # 运功疗伤（通用）
      regenerate.ts                    # 提振精神（通用）
      shield.ts                        # 护体（特殊效果模板）
      powerup.ts                       # 强化（特殊效果模板）
  commands/std/
    exert.ts                           # exert 命令入口
  skills/internal/
    internal-skill-base.ts             # 增加 getExertEffects() 虚方法
```

## 边界和约束

### 技术限制

- 持续疗伤需要可靠的 tick 机制，依赖 call_out 延迟调用
- Buff 加成需要被战斗系统正确读取（可能需要调整 getSkillBonusSummary）
- 同类 buff 不叠加，需要正确处理覆盖和移除

### 业务规则

- 运功必须有激活内功才能执行
- 战斗中部分运功有忙碌时间（busy 状态）限制
- Heal 疗伤只能在非战斗状态使用
- 内力不足时自动中断持续效果
- 运功消耗公式参考炎黄 MUD，内功等级越高效率越高

## 开放问题

1. **dispel（疗解毒素）、power（提升战力）、roar（内劲伤敌）** 等更高级的通用效果是否在本次范围内？— 建议作为后续迭代
2. **lifeheal（为他人疗伤）** 需要目标选择和同意机制，建议后续做
3. **Buff 图标** 前端是否需要在 PlayerStats 区域显示 buff 状态？— 建议后续迭代
4. **特殊效果的具体内功绑定** — 等有具体内功实例（如九阳神功）时再做具体注册
5. **运功能力提升** — 参考 MUD 成功运功有概率提升内功等级，是否纳入？

## 探讨记录

### 关键决策

1. **MVP 范围**: 完整体系（通用 + 特殊效果框架）
2. **核心效果**: recover / heal / regenerate / shield / powerup
3. **指令格式**: `exert <效果> [目标]`，经典 MUD 语法
4. **Buff 机制**: 轻量 tmpDbase + call_out，不新建 BuffManager
5. **效果注册**: 独立文件 + 装饰器注册到全局效果表
6. **Heal 实现**: 独立 tick 循环，不复用 PracticeManager
7. **前端交互**: 新增 exertResult 消息类型
8. **示例内功**: 不需要，运功系统只依赖 activeForce + InternalSkillBase 接口
