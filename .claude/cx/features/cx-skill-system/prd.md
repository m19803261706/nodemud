# PRD: 天衍技能系统

## 基本信息

- **创建时间**: 2026-02-10
- **优先级**: P0（紧急）
- **技术栈**: TypeScript (NestJS + React Native + 共享 core 包)
- **关联 Scope**: #222（天衍技能系统蓝图）
- **关联世界观**: #84（天衍世界观设定）

## 功能概述

为天衍世界构建完整的武学技能引擎框架，包含 17 个技能槽位的 TS 类继承体系、技能管理器（学习/升级/映射/激活）、数据库持久化、ATB 战斗集成（主动选招）、前端基础 UI（技能面板 + 战斗快捷栏）。

**第一版范围**：实现完整的框架和引擎机制，**不填充具体武学内容**（如独孤九剑、降龙十八掌等）。每个基类提供接口定义和默认实现，后续通过继承基类创建具体武学。

## 用户场景

### 场景 1: 战斗使用技能

1. 玩家发起战斗（kill 指令）
2. ATB 读条进行中，双方/多方 ATB 并行
3. 玩家 ATB 满 → **战斗暂停**（其他参与者 ATB 继续跑）
4. 底部弹出**招式快捷栏**（4-6 个常用招式按钮 + "更多"展开）
5. 玩家选择招式 → 执行招式效果（消耗资源、造成伤害/增益）
6. 若玩家不操作（超时）→ 自动使用当前装备武学的低级招式（普攻）
7. 招式执行后显示战斗日志描述文本
8. ATB 重置，继续下一轮

**内外功并行**：

- 外功招式按钮：攻击/防御/特殊攻击效果
- 内功招式按钮：增益 Buff、内力恢复、属性强化
- 两类招式在同一个快捷栏中，玩家自由选择

### 场景 2: 学习/提升技能

**拜师学艺**（对话 UI）：

1. 玩家点击师父 NPC → 弹出师徒对话框
2. 显示可学技能列表、消耗（潜能/精力）、当前 vs 师父等级
3. 选择技能和学习次数 → 确认 → 执行学习
4. 每次学习调用 improve_skill，积累经验到升级

**自行练功**（两种模式）：

- `practice <技能>`：即时消耗资源，获得一次 improve
- `dazuo`/`jingzuo`：进入练功状态，每隔几秒自动 improve 一次，直到资源耗尽或主动中断
- 内功用打坐（dazuo），外功用练习（practice）

**秘籍学习**：

- 使用秘籍物品 → 检查前置条件 → 学会新技能（set_skill）
- 秘籍分纪元品质（当世/中古/太古），影响技能威力系数

**战斗领悟**：

- 战斗中使用技能后，有概率自动调用 improve_skill
- 概率受技能等级、武学悟性(cognize)、对手强度影响

### 场景 3: 技能配置管理

**enable 映射**：

- `enable <槽位> <武学>` — 将具体武学映射到技能槽位
- `enable <槽位> none` — 取消映射
- `enable` — 查看当前所有映射

**内功切换**：

- `enable force <内功>` — 激活指定内功
- 切换时 MP（内力）清零，需重新修炼

**技能面板**：

- 查看所有已学技能列表（等级、升级进度、是否启用）
- 查看某个武学的招式详情（解锁状态、效果描述）
- 查看当前启用技能的属性加成汇总

## 详细需求

### R1: TS 类继承体系

#### R1.1 SkillBase（技能基类）

所有技能的根基类，定义通用接口：

```typescript
abstract class SkillBase {
  // 技能标识
  abstract get skillId(): string;
  abstract get skillName(): string; // 中文名
  abstract get skillType(): SkillSlotType; // 槽位类型

  // 技能分类
  abstract get category(): SkillCategory; // martial / internal / support / cognize
  abstract get type(): string; // 具体类型标识

  // 学习限制
  validLearn(player: PlayerBase): boolean | string; // 是否可学，返回 false 或拒绝原因
  validLearnLevel(): number; // 从师父处可学的最高等级

  // 升级
  canImprove(player: PlayerBase): boolean; // 是否可提升（战斗经验门槛等）
  onSkillImproved(player: PlayerBase): void; // 升级时的回调

  // 死亡惩罚
  onDeathPenalty(player: PlayerBase): void; // 默认 level -1

  // 子技能/组合
  getSubSkills(): Map<string, number> | null; // 组合技能的前置条件
}
```

#### R1.2 MartialSkillBase（武学基类）

继承 SkillBase，增加战斗相关接口：

```typescript
abstract class MartialSkillBase extends SkillBase {
  // 招式列表
  abstract get actions(): SkillAction[];

  // 根据玩家等级获取可用招式
  getAvailableActions(level: number): SkillAction[];

  // 根据等级获取当前招式（普攻时随机选择）
  getAutoAction(level: number): SkillAction;

  // 可启用的槽位类型（如八卦掌可启用为 palm 或 parry）
  abstract validEnable(usage: SkillSlotType): boolean;

  // 练习消耗
  getPracticeCost(player: PlayerBase): { resource: string; amount: number };
}
```

#### R1.3 SkillAction（招式数据结构）

```typescript
interface SkillAction {
  skillName: string; // 招式中文名
  description: string; // 招式描述文本（支持 $N/$n/$l 变量）
  lvl: number; // 解锁等级
  // 以下由每个具体武学类自行定义
  getCost(caster: LivingBase): ResourceCost[]; // 消耗资源（类型+数量）
  applyEffect(caster: LivingBase, target: LivingBase): SkillEffectResult; // 执行效果
  getModifiers(): ActionModifiers; // 攻防闪避加成
}

interface ResourceCost {
  resource: 'hp' | 'mp' | 'energy' | string; // 灵活资源类型
  amount: number;
}

interface ActionModifiers {
  attack: number; // 攻击加成
  damage: number; // 伤害加成
  dodge: number; // 闪避加成
  parry: number; // 格挡加成
  damageType: string; // 伤害类型（瘀伤/内伤/...）
}
```

#### R1.4 大类基类（9 + 2 + 1 + 4 + 1 = 17 个小类基类）

**外功·兵刃**：

- WeaponSkillBase（兵刃武学基类）→ SwordSkillBase / BladeSkillBase / SpearSkillBase / StaffSkillBase / ThrowingSkillBase

**外功·空手**：

- UnarmedSkillBase（空手武学基类）→ FistSkillBase / PalmSkillBase / FingerSkillBase / ClawSkillBase

**身法**：

- DodgeSkillBase（轻功基类）
- ParrySkillBase（招架基类）

**内功**：

- InternalSkillBase（内功基类）
  - 三丹田子类：ShenInternalBase / QiInternalBase / JingInternalBase

**辅技**：

- SupportSkillBase（辅技基类）→ MedicalSkillBase / PoisonSkillBase / ForgeSkillBase / AppraiseSkillBase

**悟道**：

- CognizeSkill（武学悟性，无需子类，直接实现）

### R2: SkillManager（技能管理器）

核心引擎，处理所有技能相关操作。

#### R2.1 技能学习

```
learnSkill(player, skillId, source: 'npc' | 'scroll' | 'quest')
  - 检查 validLearn 前置条件
  - 检查技能冲突
  - 消耗潜能/物品
  - 创建 PlayerSkill 记录（level=0, learned=0）
  - 推送 skillLearn 消息
```

#### R2.2 技能提升（improve_skill）

混合升级模型：

```
improveSkill(player, skillId, amount, weakMode?)
  - 悟性加成: amount += amount * cognize_level / 500
  - 属性加成: amount = 1 + amount * 100 / (level + 100)
  - 累加 learned 值
  - 升级判定: learned >= (level + 1)²
  - 满足则: level++, learned = 0, 推送升级消息
```

#### R2.3 技能映射（enable）

```
mapSkill(player, slotType, skillId?)
  - 校验: 玩家已学该技能 && 技能的 validEnable(slotType) 返回 true
  - 更新内存映射 skillMap[slotType] = skillId
  - 持久化到 PlayerSkill.is_mapped
  - 特殊处理: enable force 时清零 MP
```

#### R2.4 死亡惩罚

```
applyDeathPenalty(player)
  - 所有已学技能 level -1（最低 0）
  - 有 learned 保护机制（参照炎黄: 若 learned > (level+1)*(level+1)/2 则不扣 level，只清 learned）
  - 清空所有 skillMap 映射
  - 推送 skillUpdate 消息
```

#### R2.5 战斗领悟

```
onCombatSkillUse(player, skillId)
  - 判定概率: random(120) < player.getSkillLevel(skillId)
  - 成功则调用 improveSkill(player, skillId, 1, weakMode=true)
```

### R3: 数据库 PlayerSkill 实体

```typescript
@Entity('player_skills')
class PlayerSkill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Character)
  @JoinColumn({ name: 'character_id' })
  character: Character;

  @Column({ comment: '技能标识' })
  skillId: string;

  @Column({ comment: '槽位类型' })
  skillType: string;

  @Column({ default: 0, comment: '当前等级' })
  level: number;

  @Column({ default: 0, comment: '当前积累经验' })
  learned: number;

  @Column({ default: false, comment: '是否映射到槽位' })
  isMapped: boolean;

  @Column({ nullable: true, comment: '映射的槽位类型' })
  mappedSlot: string;

  @Column({ default: false, comment: '是否为激活的内功' })
  isActiveForce: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### R4: CombatManager 改造

#### R4.1 选招阶段

ATB gauge 达到 MAX_GAUGE 时：

1. 如果是玩家 → 进入 `AWAITING_ACTION` 状态
2. 推送 `combatAwaitAction` 消息，附带可用招式列表
3. **暂停该玩家的 ATB**（其他参与者 ATB 继续跑）
4. 等待玩家选择（`skillUse` 消息）或超时

#### R4.2 招式执行

```
收到 skillUse 消息:
  - 校验: 玩家处于 AWAITING_ACTION && 招式可用 && 资源充足
  - 扣除资源（调用 action.getCost）
  - 应用效果（调用 action.applyEffect）
  - 获取招式 modifiers，参与 DamageEngine 计算
  - 推送 combatUpdate（包含招式描述文本）
  - 触发战斗领悟判定
  - 重置 ATB gauge
```

#### R4.3 超时普攻

```
超时（可配置秒数）:
  - 获取当前装备的武学
  - 从已解锁招式中取低级招式（getAutoAction）
  - 执行该招式（不消耗额外资源）
  - 重置 ATB
```

#### R4.4 装备软性关联

- 持兵器时：优先使用对应兵刃武学招式
- 空手时：优先使用空手武学招式
- **不匹配时可用但威力降低**：伤害 × 0.6 系数

### R5: DamageEngine 扩展

在现有伤害公式基础上增加招式加成：

```
// 现有公式
baseDamage = attack × randomFactor(0.8~1.2)

// 新增招式加成
effectiveAttack = baseAttack + action.modifiers.attack
effectiveDamage = baseDamage + action.modifiers.damage
effectiveDodge = baseDodge + action.modifiers.dodge   // Phase 1 命中率
effectiveParry = baseParry + action.modifiers.parry   // 减伤计算
```

### R6: core 消息类型

新增 WebSocket 消息定义：

| 消息类型            | 方向 | 数据                                                       |
| ------------------- | ---- | ---------------------------------------------------------- |
| `skillList`         | S→C  | 玩家所有技能列表（id, name, type, level, learned, mapped） |
| `skillUpdate`       | S→C  | 单个技能更新（升级、映射变化）                             |
| `skillLearn`        | S→C  | 学到新技能通知                                             |
| `combatAwaitAction` | S→C  | ATB 满，可用招式列表                                       |
| `skillUse`          | C→S  | 玩家选择使用招式                                           |
| `skillMap`          | C→S  | 玩家 enable 映射操作                                       |
| `skillPanel`        | C→S  | 请求技能面板数据                                           |
| `skillPanelData`    | S→C  | 技能面板完整数据（列表+招式详情+属性加成）                 |
| `practiceStart`     | C→S  | 开始练功                                                   |
| `practiceEnd`       | C→S  | 停止练功                                                   |
| `practiceUpdate`    | S→C  | 练功进度更新                                               |

### R7: 前端基础 UI

#### R7.1 战斗招式快捷栏

- ATB 满后底部弹出
- 4-6 个可自定义常用招式按钮
- "更多" 按钮展开全部可用招式
- 外功招式和内功招式在同一栏，可通过图标/颜色区分
- 每个按钮显示：招式名 + 消耗（简写）
- 不可用招式（资源不足）灰显

#### R7.2 技能面板

- 入口：底部导航栏 or 角色面板
- **技能列表页**：分类展示（外功/内功/辅技/悟道），每行显示技能名、等级、升级进度条、是否启用
- **招式详情页**：点击某技能展开，显示所有招式（已解锁/未解锁）、效果描述
- **属性加成汇总**：当前启用技能提供的总攻防命中暴击等加成

### R8: 练功系统

#### R8.1 即时练功（practice）

- 指令：`practice <技能>`
- 消耗：气力（energy）— 具体数值由技能类 getPracticeCost 定义
- 效果：一次 improve_skill 调用
- 限制：不可在战斗/忙碌中使用

#### R8.2 打坐练功（dazuo/jingzuo）

- 指令：`dazuo`（内功）/ `jingzuo`（外功——静坐冥想回顾招式）
- 进入"练功状态"：每 N 秒自动执行一次 improve_skill
- 持续消耗资源，资源耗尽或输入中断指令（`stop`）停止
- 练功期间不可战斗、移动、使用其他指令
- 推送 practiceUpdate 消息给前端显示进度

### R9: 技能冲突系统

#### R9.1 内功互斥

- 同时只能激活一种内功（enable force 处理）
- 部分邪道/正道内功学习互斥（由每个内功类的 validLearn 中定义）

#### R9.2 武学前置条件

- 高级武学可要求基础技能达到特定等级
- 在 validLearn 中检查 player.getSkillLevel(prerequisiteSkill) >= requiredLevel

#### R9.3 门派桎锁

- 门派武学标记 `factionRequired: string`
- 叛出门派后标记为 locked，不可使用和提升（但不删除）
- 在 validEnable 和 canImprove 中检查

## 现有代码基础

### 可复用

| 模块             | 路径                                            | 复用方式                   |
| ---------------- | ----------------------------------------------- | -------------------------- |
| CombatManager    | `server/src/engine/combat/combat-manager.ts`    | 直接改造，增加选招阶段     |
| DamageEngine     | `server/src/engine/combat/damage-engine.ts`     | 扩展，增加招式 modifiers   |
| LivingBase       | `server/src/engine/game-objects/living-base.ts` | 增加技能相关方法           |
| PlayerBase       | `server/src/engine/game-objects/player-base.ts` | 增加 SkillManager 引用     |
| ExpManager       | `server/src/engine/quest/exp-manager.ts`        | 参考升级模型设计           |
| WeaponBase       | `server/src/engine/game-objects/weapon-base.ts` | 读取 weaponType 做软性关联 |
| combat-constants | `packages/core/src/types/combat-constants.ts`   | 扩展，增加技能常量         |
| combat messages  | `packages/core/src/types/messages/combat.ts`    | 扩展，增加选招消息         |

### 需新增

| 模块             | 路径（建议）                                 | 内容                   |
| ---------------- | -------------------------------------------- | ---------------------- |
| 技能基类体系     | `server/src/engine/skills/`                  | SkillBase 及所有子类   |
| SkillManager     | `server/src/engine/skills/skill-manager.ts`  | 技能管理器             |
| PlayerSkill 实体 | `server/src/entities/player-skill.entity.ts` | 数据库实体             |
| 技能常量         | `packages/core/src/types/skill-constants.ts` | 槽位类型、技能分类枚举 |
| 技能消息         | `packages/core/src/types/messages/skill.ts`  | WebSocket 消息类型     |
| 前端技能 Store   | `client/src/stores/useSkillStore.ts`         | 技能状态管理           |
| 战斗快捷栏组件   | `client/src/components/game/CombatActions/`  | 招式按钮 UI            |
| 技能面板组件     | `client/src/components/game/SkillPanel/`     | 技能查看 UI            |

## 代码影响范围

| 层级                 | 影响                                                                        |
| -------------------- | --------------------------------------------------------------------------- |
| **server 引擎**      | 新增 skills/ 目录，改造 CombatManager、DamageEngine、LivingBase、PlayerBase |
| **server 数据**      | 新增 PlayerSkill 实体、SkillModule                                          |
| **server WebSocket** | gateway 增加技能相关消息路由，新增 skill handler                            |
| **core 共享**        | 新增 skill 消息类型、技能常量/枚举                                          |
| **client 前端**      | 新增技能 Store、战斗快捷栏组件、技能面板组件                                |

## 验收标准

### 引擎框架

- [ ] 17 个技能槽位的基类全部实现，接口定义完整
- [ ] SkillBase 提供 validLearn / canImprove / onSkillImproved / onDeathPenalty 等核心接口
- [ ] MartialSkillBase 提供 actions / getAvailableActions / getAutoAction / validEnable 等战斗接口
- [ ] InternalSkillBase 提供三丹田分类和属性加成接口
- [ ] SupportSkillBase 提供辅技使用接口

### SkillManager

- [ ] learnSkill：学习新技能，前置条件校验，冲突检查
- [ ] improveSkill：混合升级模型（平方沉淀 + 属性加成），悟性加速
- [ ] mapSkill：enable 映射，内功切换清零 MP
- [ ] applyDeathPenalty：技能 -1，learned 保护，清空映射
- [ ] getSkillLevel / getEffectiveLevel：查询技能等级（含映射加成）

### 数据库

- [ ] PlayerSkill 实体正确定义，与 Character 关联
- [ ] 技能数据正确持久化和加载
- [ ] 角色登录时加载技能数据到内存

### 战斗集成

- [ ] ATB 满后进入 AWAITING_ACTION 状态，暂停等待
- [ ] 收到 skillUse 消息后执行招式，扣除资源，应用效果
- [ ] 超时自动使用低级招式普攻
- [ ] 装备软性关联（不匹配威力 ×0.6）
- [ ] DamageEngine 正确应用招式 modifiers
- [ ] 战斗中使用技能触发领悟判定

### 消息协议

- [ ] core 中定义完整的技能消息类型
- [ ] WebSocket gateway 正确路由技能消息

### 前端

- [ ] 技能面板：分类展示技能列表、等级、进度、启用状态
- [ ] 技能面板：招式详情展开，显示解锁状态和效果
- [ ] 技能面板：属性加成汇总
- [ ] 战斗快捷栏：ATB 满后弹出 4-6 个招式按钮
- [ ] 战斗快捷栏："更多"展开全部招式
- [ ] 战斗快捷栏：资源不足灰显

### 练功系统

- [ ] practice 即时练功：消耗资源，执行一次 improve
- [ ] dazuo/jingzuo 连续练功：定时 improve，资源耗尽或中断停止
- [ ] 练功状态互斥（不可战斗/移动）

---

> CX 工作流 | PRD 文档
> 创建时间: 2026-02-10
