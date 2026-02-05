# PRD: 战斗系统（ATB 读条出手机制）

## 基本信息

- **创建时间**: 2026-02-06
- **优先级**: P1（高）
- **技术栈**: TypeScript (NestJS + React Native + 共享 Core)
- **范围**: Phase 0 (MVP) + Phase 1 (体验优化)

## 功能概述

为水墨风武侠 MUD 游戏实现战斗系统。核心创新采用 **ATB（Active Time Battle）读条出手机制**，区别于传统 MUD "每心跳固定一次攻击"的模式：每个战斗参与者有独立的行动累积器，速度属性决定出手频率，快速角色可在同一回合内出手多次。

战斗界面采用**独立战斗页面**（类放置江湖风格），通过 WebSocket 实时推送战斗数据，前端渲染 ATB 读条进度、双方血条和水墨风战斗文字描述。

## 用户场景

### 场景 1：玩家主动发起战斗

玩家在房间内输入 `kill 守卫`，系统校验目标存在且可攻击后，创建战斗实例。前端收到 `combatStart` 消息后跳转到独立战斗页面，实时展示双方 ATB 读条进度和血量。战斗过程全自动（ATB 驱动），玩家可随时输入 `flee` 尝试逃跑。

### 场景 2：战斗过程（ATB 读条）

战斗进入自动循环：每秒心跳 tick，双方 ATB 累积器增加（速度快的增加得多）。累积器满 1000 时触发一次攻击，计算伤害后扣血，推送 `combatUpdate` 消息。前端实时更新 ATB 进度条、血条和战斗日志文字。如果一方速度远超另一方，可能出现连续出手两次的情况。

### 场景 3：战斗胜利

NPC 的 HP 降到 0，NPC 死亡销毁。推送 `combatEnd(reason: 'victory')`，前端展示胜利信息后返回游戏主页。NPC 根据 SpawnRule.interval（默认 10 分钟）定时刷新。

### 场景 4：玩家战败

玩家 HP 降到 0，推送 `combatEnd(reason: 'defeat')`。玩家以 30% maxHP 在裂谷镇广场复活，无任何惩罚。前端展示 "你在战斗中被击败，醒来发现自己躺在广场上..." 后返回主页。

### 场景 5：逃跑

玩家在战斗中点击"逃跑"按钮，触发逃跑判定（基础 50%，速度差修正）。成功则结束战斗返回主页；失败则浪费本次出手机会。

### 场景 6：NPC 被攻击后记仇（Phase 1）

NPC 被玩家攻击过后记住仇恨状态。如果该 NPC 未被击杀也未刷新，玩家再次进入房间时 NPC 主动发起战斗。NPC 刷新后仇恨清除。

## 详细需求

### R1: ATB 读条出手核心机制

- **R1.1** 每个战斗参与者维护独立的 ATB 累积器（gauge），初始值 0
- **R1.2** 每秒心跳 tick，gauge += fill_rate，fill_rate = speed × SPEED_FACTOR(5)
- **R1.3** 当 gauge >= MAX_GAUGE(1000) 时触发一次攻击，gauge -= 1000（保留溢出）
- **R1.4** 同一 tick 内允许多次出手（while 循环直到 gauge < 1000）
- **R1.5** 速度计算: speed = perception×3 + spirit×2 + strength×1 + meridian×1

### R2: 伤害计算

- **R2.1** 攻击力 = strength×2 + 装备攻击加成（含品质系数）
- **R2.2** 防御力 = vitality×1.5 + 装备防御加成（含品质系数）
- **R2.3** 基础伤害 = 攻击力 × random(0.8, 1.2)
- **R2.4** 混合伤害公式:
  - 攻 >= 防: 实际伤害 = 基础伤害×2 - 防御力
  - 攻 < 防: 实际伤害 = 基础伤害² / 防御力
- **R2.5** 最低保底 1 点伤害

### R3: 命中/闪避/暴击（Phase 1）

- **R3.1** 命中率 = 85% + (攻方perception - 守方perception) × 1%，范围 [50%, 99%]
- **R3.2** 未命中时推送闪避描述
- **R3.3** 暴击率 = 5% + spirit × 0.3%
- **R3.4** 暴击伤害 = 实际伤害 × 1.5

### R4: 战斗生命周期

- **R4.1** `kill <target>` 指令发起战斗
- **R4.2** 战斗状态存储在 tmpDbase（combat/state, combat/target, combat/instance）
- **R4.3** 战斗中禁止移动（go 指令检查战斗状态）
- **R4.4** 同一时间只能参与一场战斗
- **R4.5** Phase 0 允许攻击所有 NPC（不区分 attitude）

### R5: 逃跑机制

- **R5.1** `flee` 指令在战斗中可用
- **R5.2** 逃跑概率 = 50% + (玩家speed - 对手speed) × 0.5%，范围 [20%, 90%]
- **R5.3** 逃跑失败不执行攻击（浪费本次出手）
- **R5.4** 逃跑成功结束战斗，推送 combatEnd(reason: 'flee')

### R6: 死亡与刷新

- **R6.1** NPC HP <= 0 → 销毁 NPC 对象
- **R6.2** SpawnManager 按 SpawnRule.interval（默认 600000ms）定时重生
- **R6.3** 玩家 HP <= 0 → 以 30% maxHp 复活在裂谷镇广场
- **R6.4** 玩家死亡无惩罚（暂不掉经验/装备）

### R7: NPC 战斗 AI（Phase 1）

- **R7.1** NPC 处于战斗中时，onAI() 执行 doCombat() 而非 doChat()
- **R7.2** 基础 AI: HP < 20% 且非 boss 类型 → 尝试逃跑
- **R7.3** NPC 被攻击后记住仇恨（tmpDbase: combat/hatred），玩家再入房间时主动攻击
- **R7.4** NPC 刷新后仇恨清除

### R8: HP 自然恢复（Phase 1）

- **R8.1** 非战斗状态下，每心跳恢复 max(1, floor(maxHp × 0.02))
- **R8.2** 战斗状态下不自然恢复

### R9: 前端战斗页面

- **R9.1** 独立 CombatScreen，路由注册到 react-navigation
- **R9.2** 收到 combatStart → 自动跳转到 CombatScreen
- **R9.3** 实时显示双方名字、等级、HP 条、ATB 读条进度
- **R9.4** 战斗日志使用 RichText 渲染，新增战斗语义标签（damage/crit/heal/combat）
- **R9.5** 逃跑按钮（MVP 唯一交互按钮）
- **R9.6** 收到 combatEnd → 展示结算信息后返回 GameHomeScreen

### R10: WebSocket 消息协议

- **R10.1** `combatStart`: 战斗 ID + 双方基本信息（名字/等级/HP/maxHp）
- **R10.2** `combatUpdate`: 攻击结果 + 双方当前 HP + 双方 ATB 百分比
- **R10.3** `combatEnd`: 结束原因(victory/defeat/flee) + 结算消息

### R11: 富文本战斗描述（Phase 1）

- **R11.1** 根据伤害占 maxHp 比例使用不同描述词（轻伤/重击/暴击等）
- **R11.2** 新增 SemanticTag: damage/crit/heal/combat
- **R11.3** 战斗日志是文学叙述风格，非纯数值展示

## 关联文档

- **Scope**: #196 [Scope] 战斗系统（ATB 读条出手机制）
- **项目蓝图**: #1 NodeMUD 项目蓝图
- **NPC 系统**: #134 NPC 系统细化设计
- **装备系统**: #180 装备系统细化（攻防数值基础）

## 现有代码基础

### 可直接复用

| 模块 | 文件 | 复用方式 |
|------|------|---------|
| HeartbeatManager | `server/src/engine/heartbeat-manager.ts` | CombatManager 注册心跳 |
| LivingBase 装备系统 | `server/src/engine/game-objects/living-base.ts` | 读取装备计算攻防 |
| EquipmentBonus | `packages/core/src/types/equipment-bonus.ts` | combat.attack/defense |
| WeaponBase.getDamage() | `server/src/engine/game-objects/weapon-base.ts` | 武器伤害 |
| ArmorBase.getDefense() | `server/src/engine/game-objects/armor-base.ts` | 防具防御 |
| NpcBase.onAI() | `server/src/engine/game-objects/npc-base.ts` | 扩展战斗 AI |
| CommandManager | `server/src/engine/command-loader.ts` | 注册 kill/flee |
| GameEvents | `server/src/engine/types/events.ts` | 扩展战斗事件 |
| SpawnManager | `server/src/engine/spawn-manager.ts` | NPC 死亡重生 |
| RichText/SemanticTag | `packages/core/src/types/rich-text.ts` | 战斗标签 |
| LogScrollView | `client/src/components/game/shared/LogScrollView.tsx` | 战斗日志 |
| PlayerBase.getEquipmentBonus() | `server/src/engine/game-objects/player-base.ts` | 装备加成汇总 |

### 需要扩展

| 模块 | 扩展内容 |
|------|---------|
| LivingBase | receiveDamage/die/getAttack/getDefense/getCombatSpeed/战斗状态 |
| NpcBase | doCombat() + 仇恨系统 |
| SpawnManager | scheduleRespawn() 定时重生 |
| GameEvents | PRE_ATTACK/POST_ATTACK/COMBAT_START/COMBAT_END/DEATH |
| MessageFactory | combatStart/combatUpdate/combatEnd 消息处理器 |
| useGameStore | 战斗状态切片 |

## 代码影响范围

- **Server 引擎层**: LivingBase/NpcBase/PlayerBase 扩展 + 新增 CombatManager/DamageEngine
- **Server 指令层**: 新增 kill/flee 指令，go 指令增加战斗状态检查
- **Server WebSocket**: 新增战斗消息路由
- **Core 共享类型**: 新增战斗消息类型 + 常量 + SemanticTag
- **Client 页面**: 新增 CombatScreen + 战斗组件
- **Client 状态**: useGameStore 战斗切片 + WebSocket 消息监听

## 任务拆分（初步）

### Phase 0: MVP 核心

- [ ] Core: 战斗消息类型定义（combatStart/Update/End）+ 战斗常量
- [ ] Core: 新增战斗语义标签（damage/crit/heal/combat）
- [ ] Server: LivingBase 战斗属性扩展（getAttack/getDefense/getCombatSpeed/receiveDamage/die）
- [ ] Server: DamageEngine 伤害计算引擎
- [ ] Server: CombatManager 战斗调度器（ATB 读条 + 心跳轮转）
- [ ] Server: kill 指令 + flee 指令
- [ ] Server: SpawnManager 扩展 — NPC 死亡定时重生
- [ ] Server: GameEvents 战斗事件 + WebSocket 消息路由
- [ ] Server: go 指令增加战斗状态检查
- [ ] Client: CombatScreen 战斗页面（布局 + 路由）
- [ ] Client: 战斗 UI 组件（HpBar/AtbGauge/CombatLog/FleeButton）
- [ ] Client: useGameStore 战斗状态 + WebSocket 消息监听

### Phase 1: 体验优化

- [ ] Server: 命中/闪避/暴击判定
- [ ] Server: NPC 战斗 AI（doCombat + 仇恨系统）
- [ ] Server: HP 自然恢复机制
- [ ] Server/Core: 富文本战斗描述（伤害等级 → 描述词）
- [ ] Client: 战斗页面体验优化（动画/音效占位/战斗描述美化）

## 验收标准

### Phase 0

- [ ] 输入 `kill <npc>` 成功发起战斗，前端跳转到独立战斗页面
- [ ] 战斗页面实时显示双方 HP 条和 ATB 读条进度
- [ ] ATB 满条自动攻击，速度快的角色出手更频繁
- [ ] 速度碾压时出现同一秒内出手 2 次的情况
- [ ] NPC HP 归零后死亡，推送胜利消息，返回主页
- [ ] NPC 死亡后按 interval 设定定时刷新
- [ ] 玩家 HP 归零后以 30% HP 在广场复活
- [ ] 逃跑按钮可用，概率计算正确
- [ ] 战斗中无法使用 go 指令移动
- [ ] 战斗日志使用 RichText 渲染，可读性良好

### Phase 1

- [ ] 攻击有命中/闪避判定，描述文字不同
- [ ] 暴击触发时有特殊描述和伤害加成
- [ ] NPC 低血量时尝试逃跑
- [ ] NPC 被攻击后记仇，玩家再入房间时主动攻击
- [ ] 非战斗状态 HP 自然恢复
- [ ] 战斗描述根据伤害比例使用不同文学描述词

---
> CX 工作流 | PRD | Scope #196
