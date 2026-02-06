# PRD: 装备系统细化 — 属性加成 + 穿戴流程 + 品质框架

## 基本信息

- **创建时间**: 2026-02-05
- **优先级**: P1（高）
- **技术栈**: TypeScript（React Native + NestJS + packages/core）
- **Scope**: #178

## 功能概述

当前装备系统已具备基本的穿脱功能（wear/wield/remove/eq），但装备穿上后**对角色属性没有任何影响**——纯粹是装饰性的。本次需求的核心是：**让装备真正影响角色属性**，穿上/脱下时实时计算并推送属性变化。

同时修复穿戴流程中缺失的逻辑（双手武器、等级需求），并建立品质系统的基础框架为后续锻造/强化做准备。

## 用户场景

### 场景 1: 穿戴装备获得属性加成

玩家在背包中选择一件防具或武器穿戴，角色属性立即变化。顶部状态栏的 HP/MP/Energy 上限、六维属性数值实时更新。

### 场景 2: 脱下装备属性回退

玩家脱下一件装备后，角色属性回退。如果脱下导致 HP 上限降低，当前 HP 不超过新上限。

### 场景 3: 查看装备详情

玩家使用 examine 查看装备时，能看到该装备提供的属性加成、品质、攻防数值等详细信息。

### 场景 4: 双手武器装备

玩家装备一把双手武器时，自动占用主手+副手两个槽位。如果副手已有装备，先自动卸到背包。

### 场景 5: 等级不足无法穿戴

玩家尝试穿戴一件高于自身等级要求的装备时，收到提示告知等级不足。

### 场景 6: 品质显示

不同品质的物品在 examine/eq/背包中显示不同颜色的名称。

## 详细需求

### 需求 1: 装备属性加成系统（核心）

**1.1 EquipmentBonus 数据结构**

每件装备（ArmorBase/WeaponBase）可定义三类加成：

- **六维属性加成**: wisdom/perception/spirit/meridian/strength/vitality
- **三维资源上限加成**: maxHp/maxMp/maxEnergy
- **攻防数值**: attack/defense

**1.2 属性计算引擎**

- PlayerBase 新增方法：汇总所有已装备物品的 EquipmentBonus
- 计算公式：最终属性 = 基础属性 + Σ(装备加成 × 品质系数)
- 穿上/脱下装备时自动触发重算

**1.3 资源上限联动**

- 资源上限变化时（maxHp/maxMp/maxEnergy），当前值不超过新上限
- 例：maxHp 从 200 降到 150，hp.current 从 180 变为 150

**1.4 playerStats 推送扩展**

扩展 WebSocket `playerStats` 消息：

- 资源值的 max 需包含装备加成
- 新增 `equipBonus` 汇总字段
- 新增 `combat` 攻防数值字段

### 需求 2: 穿戴流程修复

**2.1 双手武器逻辑**

- wield 指令检查 `isTwoHanded()`
- 双手武器装备时：同时占用 weapon + offhand
- 如 offhand 已有装备 → 先卸到背包
- 装备单手武器时：如当前主手是双手武器 → 先卸下

**2.2 等级需求检查**

- wear 和 wield 检查 `getLevelReq()`
- 不满足时提示："你的修为不足以使用{物品名}（需要{等级}）"

### 需求 3: 品质系统框架

**3.1 品质枚举**

5 级品质：凡品(白)/精良(绿)/稀有(蓝)/史诗(紫)/传说(橙)

**3.2 品质系数**

品质影响装备属性加成的倍率：

- 凡品 ×1.0 / 精良 ×1.2 / 稀有 ×1.5 / 史诗 ×2.0 / 传说 ×3.0

**3.3 现有物品默认品质**

所有已有蓝图物品默认为「凡品」品质，无需修改现有蓝图文件。

**3.4 品质颜色显示**

品质影响物品名称的富文本颜色标记：

- 凡品: 默认色（无标记）
- 精良: `<hig>` 绿色
- 稀有: `<cmd>` 蓝色
- 史诗: 紫色（需新增标记或直接用色值）
- 传说: 橙色

### 需求 4: 客户端展示增强

**4.1 PlayerStats 面板**

- 显示攻击力/防御力数值
- 六维属性旁显示装备加成（如 "力量 15 (+3)"）

**4.2 装备栏品质色**

- EquipmentView 中装备名称按品质着色

**4.3 examine 增强**

- 查看装备时显示属性加成详情、品质、攻防数值

## 关联文档

- Scope: #178（装备系统细化）
- 物品系统 Scope: #153
- 物品系统 Phase 1 PRD: #154
- 物品系统 Phase 1 Epic: #156（已完成）
- 背包系统 Epic: #166（已完成）

## 现有代码基础

### 可复用模块

| 模块          | 路径                                                     | 可复用点                                          |
| ------------- | -------------------------------------------------------- | ------------------------------------------------- |
| PlayerBase    | `server/src/engine/game-objects/player-base.ts`          | equip/unequip 方法，WearPositions 常量            |
| ArmorBase     | `server/src/engine/game-objects/armor-base.ts`           | getAttributeBonus()（空实现待填充）、getDefense() |
| WeaponBase    | `server/src/engine/game-objects/weapon-base.ts`          | getDamage()、isTwoHanded()（已有但未使用）        |
| ItemBase      | `server/src/engine/game-objects/item-base.ts`            | getLevelReq()（已有但未使用）                     |
| stats.utils   | `server/src/websocket/handlers/stats.utils.ts`           | buildPlayerStats()（需扩展）                      |
| EquipmentView | `client/src/components/game/Inventory/EquipmentView.tsx` | 装备栏展示组件                                    |
| PlayerStats   | `client/src/components/game/PlayerStats/`                | 状态面板组件                                      |

### 需修改的指令

| 指令    | 路径                                        | 修改点                      |
| ------- | ------------------------------------------- | --------------------------- |
| wear    | `server/src/engine/commands/std/wear.ts`    | 添加等级检查                |
| wield   | `server/src/engine/commands/std/wield.ts`   | 添加双手武器逻辑 + 等级检查 |
| examine | `server/src/engine/commands/std/examine.ts` | 增强装备详情展示            |
| eq      | `server/src/engine/commands/std/eq.ts`      | 品质颜色显示                |

## 代码影响范围

| 层级         | 影响模块                            | 说明                                                |
| ------------ | ----------------------------------- | --------------------------------------------------- |
| Core 包      | `packages/core/src/types/`          | 扩展 playerStats 消息类型、新增 EquipmentBonus 类型 |
| 后端引擎     | `server/src/engine/game-objects/`   | PlayerBase 属性计算、ArmorBase/WeaponBase 加成定义  |
| 后端指令     | `server/src/engine/commands/std/`   | wear/wield/examine/eq 逻辑修改                      |
| 后端 WS      | `server/src/websocket/handlers/`    | stats.utils 扩展                                    |
| 客户端 Store | `client/src/stores/useGameStore.ts` | PlayerData 类型扩展                                 |
| 客户端组件   | `client/src/components/game/`       | PlayerStats 面板 + EquipmentView + 品质色           |

## 任务拆分（初步）

### Phase 1: 核心属性加成（后端）

- [ ] EquipmentBonus 接口定义（core 包）
- [ ] 品质枚举 + 系数定义（core 包）
- [ ] PlayerBase 装备加成计算引擎
- [ ] ArmorBase/WeaponBase 蓝图扩展属性加成
- [ ] playerStats 扩展推送装备加成

### Phase 2: 穿戴流程修复（后端）

- [ ] wield 双手武器逻辑
- [ ] wear/wield 等级需求检查

### Phase 3: 客户端展示

- [ ] PlayerStats 面板增加攻防 + 加成显示
- [ ] EquipmentView 品质颜色
- [ ] examine 装备详情增强

## 验收标准

- [ ] 穿戴装备后 playerStats 中 HP/MP/Energy 上限实时变化
- [ ] 穿戴装备后六维属性数值包含装备加成
- [ ] 脱下装备后属性正确回退，资源当前值不超过新上限
- [ ] 双手武器装备时自动占用 weapon+offhand，冲突装备自动卸下
- [ ] 等级不足时穿戴失败并提示
- [ ] examine 装备可看到完整属性加成信息
- [ ] 品质系数正确应用到属性加成计算
- [ ] 客户端 PlayerStats 面板显示攻防数值和装备加成标注
- [ ] 不同品质物品名称显示对应颜色

## 范围排除

- ❌ 战斗系统（攻防仅定义和展示）
- ❌ 商店/交易
- ❌ 锻造/强化/附魔
- ❌ 套装效果
- ❌ 耐久度消耗

---

> CX 工作流 | PRD | Scope #178
