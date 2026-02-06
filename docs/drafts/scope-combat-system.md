# Scope: 战斗系统（ATB 读条出手机制）

## 基本信息

- **创建时间**: 2026-02-06
- **范围**: Phase 0 (MVP) + Phase 1 (体验优化)
- **涉及层级**: 全栈（server + client + core）
- **关联文档**: 项目蓝图 #1，NPC 系统细化 #134

## 一、核心设计理念

### 区别于传统 MUD 的创新点

传统 MUD 战斗是"每心跳固定一次攻击"，所有参与者攻击频率一致。我们采用 **ATB（Active Time Battle）读条出手机制**：

- 每个战斗参与者有独立的**行动累积器**（ATB Gauge）
- 累积速度由角色属性复合计算，速度高的角色出手更快
- **同一个心跳 tick 内，快速角色可能出手 2 次，慢速角色出手 0~1 次**
- 这创造了属性养成的直接反馈感和战斗节奏的差异化

参考资料：

- [Final Fantasy ATB 系统](https://finalfantasy.fandom.com/wiki/Active_Time_Battle) — 伊藤裕之设计，灵感来自 F1 赛车起步后因加速度不同逐渐拉开差距
- [ATB 系统设计教程](https://himeworks.com/2016/01/tutorial-designing-a-simple-active-battle-system/) — 基础实现参考
- [MUD LPC 心跳战斗](<https://en.wikipedia.org/wiki/LPC_(programming_language)>) — 心跳驱动的服务端战斗模型

### 战斗体验

- **独立战斗页面**：玩家输入 `kill <target>` 后进入专用战斗画面（类似放置江湖风格）
- **实时数据推送**：战斗过程通过 WebSocket 实时推送，前端解析渲染
- **文字叙述为主**：保持 MUD 水墨风格，战斗日志是文学描述而非数值堆砌
- **ATB 可视化**：双方的读条进度实时展示，让玩家感知"谁即将出手"

## 二、ATB 读条出手机制详解

### 2.1 核心公式

```
常量:
  MAX_GAUGE = 1000       // ATB 满条阈值
  SPEED_FACTOR = 5       // 速度→填充速率系数

每秒心跳 tick:
  gauge += fill_rate
  while (gauge >= MAX_GAUGE):
    gauge -= MAX_GAUGE
    执行一次攻击()

fill_rate = speed × SPEED_FACTOR

speed（出手速度）= perception × 3 + spirit × 2 + strength × 1 + meridian × 1
```

### 2.2 六维属性 → 战斗数值映射

| 属性           | 中文 | 战斗映射                      | 权重说明                      |
| -------------- | ---- | ----------------------------- | ----------------------------- |
| **perception** | 感知 | 出手速度（主） + 命中率       | 反应速度，武侠中的"眼力/灵觉" |
| **spirit**     | 精神 | 出手速度（次） + 暴击率       | 意念驱动，武侠中的"心法/意境" |
| **strength**   | 力量 | 攻击力（主） + 出手速度（微） | 劈砍力道                      |
| **vitality**   | 体质 | 最大 HP + 防御力              | 扛打能力                      |
| **meridian**   | 经脉 | 出手速度（微） + 内力上限     | 经脉通畅度                    |
| **wisdom**     | 悟性 | 技能效果（Phase 2+）          | 留给技能系统                  |

### 2.3 攻防数值计算

```
// 攻击力 = 基础(力量) + 装备攻击 × 品质系数
totalAttack = strength × 2 + equipmentBonus.combat.attack

// 防御力 = 基础(体质) + 装备防御 × 品质系数
totalDefense = vitality × 1.5 + equipmentBonus.combat.defense

// 最大 HP = 基础(体质) + 装备加成
maxHp = baseHp + vitality × 10 + equipmentBonus.resources.maxHp
```

### 2.4 伤害公式（混合公式）

```
基础伤害 = totalAttack × random(0.8, 1.2)   // ±20% 波动

if (基础伤害 >= totalDefense):
  实际伤害 = 基础伤害 × 2 - totalDefense     // 碾压模式
else:
  实际伤害 = 基础伤害² / totalDefense         // 堆叠减益

实际伤害 = max(1, floor(实际伤害))            // 保底 1 点
```

### 2.5 ATB 节奏示例

```
场景：玩家(speed=70) vs 守卫(speed=50)
  fill_rate: 玩家=350, 守卫=250

Tick 1 (1秒):
  玩家 gauge: 0+350=350  → 未满
  守卫 gauge: 0+250=250  → 未满

Tick 2 (2秒):
  玩家 gauge: 350+350=700  → 未满
  守卫 gauge: 250+250=500  → 未满

Tick 3 (3秒):
  玩家 gauge: 700+350=1050 → 满！出手！→ 剩余 50
  守卫 gauge: 500+250=750  → 未满

Tick 4 (4秒):
  玩家 gauge: 50+350=400   → 未满
  守卫 gauge: 750+250=1000 → 满！出手！→ 剩余 0

Tick 5~6:
  玩家 gauge: 400+350=750 → 750+350=1100 → 满！出手！→ 剩余 100

结果：6秒内玩家出手 2 次，守卫出手 1 次 → 7:5 的出手比
```

## 三、战斗流程

### 3.1 战斗生命周期

```
玩家输入 kill <target>
  │
  ├─ 校验：目标是否存在、是否在同一房间、是否可攻击
  │
  ▼
CombatManager.startCombat(attacker, defender)
  │
  ├─ 创建 CombatInstance
  ├─ 双方标记战斗状态（tmpDbase: combat/*）
  ├─ 向双方推送 combatStart 消息
  ├─ 前端收到 → 跳转到 CombatScreen
  │
  ▼
心跳循环（每秒）
  │
  ├─ 双方 gauge += fill_rate
  ├─ gauge 满 → 执行攻击 → 计算伤害 → 扣血
  ├─ 推送 combatUpdate 给双方（攻击者、伤害、剩余 HP、ATB 进度）
  │
  ├─ 检查: HP <= 0 ?
  │   ├─ NPC 死亡 → NPC 销毁 + 定时刷新
  │   └─ 玩家死亡 → 传送至广场复活
  │
  ├─ 检查: 玩家输入 flee ?
  │   └─ 逃跑判定 → 成功则结束战斗
  │
  ▼
CombatManager.endCombat(reason)
  │
  ├─ 清除双方战斗状态
  ├─ 推送 combatEnd 消息（胜利/失败/逃跑）
  └─ 前端收到 → 返回 GameHomeScreen
```

### 3.2 NPC 死亡与刷新

```
NPC HP <= 0
  │
  ├─ 广播死亡消息（房间内所有人可见）
  ├─ 掉落物品（Phase 2+，暂不实现）
  ├─ NPC 销毁（destroy）
  │
  ▼
SpawnManager.scheduleRespawn(spawnRule)
  │
  ├─ 使用现有 SpawnRule.interval（默认 600000ms = 10 分钟）
  └─ callOut / setTimeout → 到期后重新 spawnByRule
```

### 3.3 玩家死亡

```
玩家 HP <= 0
  │
  ├─ 推送 combatEnd (reason: 'defeat')
  ├─ HP 恢复到 maxHp × 30%（不是满血复活）
  ├─ 传送至广场（裂谷镇广场）
  └─ 推送提示消息："你在战斗中被击败，醒来发现自己躺在广场上..."
```

### 3.4 逃跑机制

```
玩家输入 flee
  │
  ├─ 逃跑概率 = 50% + (玩家speed - 对手speed) × 0.5%
  │   (最低 20%，最高 90%)
  │
  ├─ 成功 → 结束战斗，推送 combatEnd (reason: 'flee')
  └─ 失败 → 推送提示 "你试图逃跑但失败了！"，本回合不攻击
```

## 四、Phase 0 — MVP 核心功能

### 4.1 后端

| 模块                  | 说明                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------ |
| **CombatManager**     | 战斗创建/轮转/结束，注册到心跳                                                                   |
| **DamageEngine**      | 伤害计算（攻击力/防御力/伤害公式）                                                               |
| **LivingBase 扩展**   | `receiveDamage()` / `die()` / `getAttack()` / `getDefense()` / `getCombatSpeed()` / 战斗状态管理 |
| **kill 指令**         | `kill <target>` — 发起战斗                                                                       |
| **flee 指令**         | `flee` — 逃跑                                                                                    |
| **SpawnManager 扩展** | NPC 死亡后定时重生                                                                               |
| **GameEvents 扩展**   | PRE_ATTACK / POST_ATTACK / COMBAT_START / COMBAT_END / DEATH                                     |
| **WebSocket 消息**    | combatStart / combatUpdate / combatEnd                                                           |

### 4.2 前端

| 模块              | 说明                                 |
| ----------------- | ------------------------------------ |
| **CombatScreen**  | 独立战斗页面（路由注册）             |
| **CombatHeader**  | 双方名字、等级                       |
| **HpBarDual**     | 双方血条                             |
| **AtbGauge**      | 双方 ATB 读条进度条                  |
| **CombatLog**     | 战斗文字日志（复用 RichText）        |
| **CombatActions** | 逃跑按钮（MVP 只有 flee）            |
| **combatStore**   | Zustand 战斗状态切片（或独立 store） |

### 4.3 Core（共享类型）

| 模块                | 说明                                                        |
| ------------------- | ----------------------------------------------------------- |
| **combat 消息类型** | CombatStartMessage / CombatUpdateMessage / CombatEndMessage |
| **combat 常量**     | MAX_GAUGE / SPEED_FACTOR / 伤害公式参数                     |

## 五、Phase 1 — 体验优化

### 5.1 命中/闪避/暴击

```
命中率 = 85% + (attackerPerception - defenderPerception) × 1%
  → 最低 50%，最高 99%

闪避: 未命中时判定
  → 推送 "你挥刀砍向对手，但对方灵巧地闪开了！"

暴击率 = 5% + spirit × 0.3%
暴击伤害 = 实际伤害 × 1.5
  → 推送 "[crit]暴击！[/crit]你一招精准刺中要害！"
```

### 5.2 NPC 战斗 AI

```
NpcBase.onAI() 扩展:
  if (处于战斗中):
    doCombat()    // 战斗 AI
  else:
    doChat()      // 闲聊（现有）

doCombat():
  // 基础 AI: HP < 20% 且非 boss → 尝试逃跑
  // 否则: 正常攻击（ATB 驱动）
```

### 5.3 HP 自然恢复

```
非战斗状态下，每心跳恢复:
  hpRegen = max(1, floor(maxHp × 0.02))  // 每秒恢复 2% maxHp

战斗状态下: 不自然恢复
```

### 5.4 富文本战斗描述

根据伤害占最大 HP 的比例，使用不同描述词：

| 伤害比例 | 描述                          |
| -------- | ----------------------------- |
| < 5%     | "轻轻擦过" / "造成了轻微伤害" |
| 5-15%    | "砍中了" / "击中了"           |
| 15-30%   | "狠狠砍中" / "重重一击"       |
| > 30%    | "猛烈一击" / "重创了"         |

新增 SemanticTag：

- `[damage]` — 伤害数字颜色
- `[crit]` — 暴击文字颜色
- `[heal]` — 回复文字颜色
- `[combat]` — 战斗系统提示颜色

### 5.5 战斗限制

- **同一时间只能参与一场战斗**
- **战斗中不能移动**（go 指令检查战斗状态）
- **战斗中不能使用非战斗指令**（或限制部分指令）
- **不能攻击 friendly 态度的 NPC**（需先有敌意触发机制，Phase 2+）
  - Phase 0 暂时允许攻击所有 NPC

## 六、前端战斗页面设计

### 6.1 页面布局

```
┌──────────────────────────────────────┐
│                 ⚔ 战斗               │
├──────────────────────────────────────┤
│                                      │
│  ┌────────────┐    ┌────────────┐    │
│  │  玩家名     │    │  NPC名     │    │
│  │  Lv.5      │    │  Lv.8      │    │
│  │  HP ████░ 80%│   │  HP ██░░ 45%│   │
│  │  ATB ██████░ │   │  ATB ████░░ │   │
│  └────────────┘    └────────────┘    │
│                                      │
├──────────────────────────────────────┤
│  战斗日志（LogScrollView 复用）       │
│                                      │
│  你挥动铁剑砍向北门守卫，             │
│  造成 23 点伤害。                     │
│                                      │
│  北门守卫挥刀反击，                   │
│  你受到 15 点伤害。                   │
│                                      │
│  你再次出手！重重一击！               │
│  造成 38 点暴击伤害！                 │
│                                      │
├──────────────────────────────────────┤
│              [ 逃 跑 ]               │
└──────────────────────────────────────┘
```

### 6.2 WebSocket 消息格式

```typescript
// 战斗开始
interface CombatStartData {
  combatId: string;
  player: { name: string; level: number; hp: number; maxHp: number };
  enemy: { name: string; level: number; hp: number; maxHp: number };
}

// 战斗更新（每次攻击推送一次）
interface CombatUpdateData {
  combatId: string;
  action: {
    attacker: 'player' | 'enemy';
    type: 'attack' | 'miss' | 'crit' | 'flee_fail';
    damage?: number;
    description: string; // 富文本战斗描述
  };
  player: { hp: number; maxHp: number; atbPct: number };
  enemy: { hp: number; maxHp: number; atbPct: number };
}

// 战斗结束
interface CombatEndData {
  combatId: string;
  reason: 'victory' | 'defeat' | 'flee';
  message: string; // 结算消息
}
```

## 七、与现有代码对接

| 现有系统                              | 对接方式                        |
| ------------------------------------- | ------------------------------- |
| `HeartbeatManager` (1s tick)          | CombatManager 注册为心跳实体    |
| `LivingBase.getEquipment()`           | 计算战斗属性时读取装备          |
| `PlayerBase.getEquipmentBonus()`      | 直接用于攻/防数值               |
| `WeaponBase.getDamage()`              | 纳入攻击力计算                  |
| `ArmorBase.getDefense()`              | 纳入防御力计算                  |
| `NpcBase.onAI()`                      | 扩展 doCombat() 战斗 AI         |
| `CommandManager`                      | 注册 kill/flee 指令             |
| `GameEvents` + `CancellableEvent`     | 新增战斗事件                    |
| `RoomBase.broadcast()`                | 战斗消息广播                    |
| `tmpDbase`                            | 战斗临时状态                    |
| `callOut`                             | 技能冷却 / NPC 刷新延时         |
| `ENCOUNTER` 事件                      | NPC 被攻击后记住仇恨（Phase 1） |
| `SpawnManager` + `SpawnRule.interval` | NPC 死亡重生                    |
| `RichText / SemanticTag`              | 战斗文本标签                    |
| `@react-navigation`                   | CombatScreen 路由注册           |
| `useGameStore (Zustand)`              | 战斗状态切片                    |

## 八、规模评估

| 维度         | 评估                               |
| ------------ | ---------------------------------- |
| 影响文件数   | 20+ 个                             |
| 涉及层级     | server + client + core（全栈）     |
| 新增消息类型 | 3 个（combatStart/Update/End）     |
| 新增指令     | 2 个（kill/flee）                  |
| 新增前端页面 | 1 个（CombatScreen）               |
| 新增后端模块 | 2 个（CombatManager/DamageEngine） |
| 架构变更     | LivingBase 扩展，SpawnManager 扩展 |
| **总体评估** | **L（大规模）**                    |

## 九、后续 Phase 展望（不在本次范围内）

### Phase 2: 技能系统

- 技能框架（主动/被动）
- 基础武侠招式（基于 weapon_type 解锁）
- 内力/气力消耗
- 技能冷却

### Phase 3: 高级战斗

- 多人战斗（PvE 群战、PvP）
- BOSS 机制（特殊技能、阶段转换）
- 经验/掉落/升级
- 武器类型克制
- 气势系统（连击积累）

---

> CX 工作流 | Scope | 战斗系统
