# PRD: NPC 装备与部位色系统

## 基本信息

- **创建时间**: 2026-02-05
- **优先级**: P1（当前迭代）
- **技术栈**: TypeScript (NestJS + React Native), pnpm monorepo
- **关联 Scope**: #188

## 功能概述

为裂隙镇战斗型 NPC 穿上与描述一致的真实装备，并引入「部位色」标签系统让不同部位的装备名字呈现不同颜色。凡品装备按部位底色区分，精良及以上按品质色显示。

本功能是"新手村完善阶段2"的核心模块，解决三个问题：

1. NPC 文本描述有装备但实际没有装备数据
2. 装备蓝图种类过少（仅铁剑/木棍/布衣），只覆盖 weapon/body
3. 所有装备名字都是统一棕色，缺乏部位辨识度

## 用户场景

### 场景 1：查看 NPC 装备

玩家使用 `look 北门卫兵` 时，除了看到 NPC 描述，还能看到 NPC 身上穿戴的装备列表，装备名字按部位/品质着色。

### 场景 2：装备名字颜色区分

玩家在背包、地面、eq 界面看到装备名字时，凡品装备按部位颜色区分（头部铜灰、身体橄榄绿、武器鞍褐等），精良以上按品质色（绿/蓝/紫/红）。

### 场景 3：NPC 装备内容生态

6 个战斗型 NPC 穿戴合理装备，为后续战斗/掉落系统提供内容基础。

## 详细需求

### R1: 部位色标签系统

新增 10 个 SemanticTag，对应 10 个装备部位：

| 部位 | 标签        | Light 色值 | 说明   |
| ---- | ----------- | ---------- | ------ |
| 头部 | `eqhead`    | #6B5B4D    | 铜灰   |
| 身体 | `eqbody`    | #5B6B4D    | 橄榄绿 |
| 手部 | `eqhands`   | #6B4D5B    | 暗紫红 |
| 脚部 | `eqfeet`    | #4D5B6B    | 钢蓝   |
| 腰部 | `eqwaist`   | #7A6B3A    | 土金   |
| 武器 | `eqweapon`  | #8B4513    | 鞍褐   |
| 副手 | `eqoffhand` | #6B5D4D    | 棕灰   |
| 颈部 | `eqneck`    | #5A6B5A    | 翡翠灰 |
| 手指 | `eqfinger`  | #7A5A6B    | 紫灰   |
| 手腕 | `eqwrist`   | #5A6B7A    | 蓝灰   |

**颜色选择规则**：

- **凡品 (COMMON)**: 使用部位色标签
- **精良+ (FINE/RARE/EPIC/LEGENDARY)**: 使用品质色标签（已有 qfine/qrare/qepic/qlegend）

需要提供映射函数：`getEquipmentTag(position: string, quality: ItemQuality) → SemanticTag`

### R2: NPC 装备能力

将 PlayerBase 的装备系统（`_equipment` Map + equip/unequip）上提到 LivingBase，使 NPC 也能穿装备。

**核心变更**：

- LivingBase 增加 `_equipment` Map 和装备方法
- PlayerBase 不再重复定义装备逻辑
- NpcBase 自动继承装备能力

### R3: 新增装备蓝图（~17 件）

为战斗型 NPC 创建专属装备蓝图，覆盖多个部位：

**头部 (2件)**:

- 铁盔 — defense 3, COMMON
- 皮帽 — defense 1, COMMON

**身体 (5件)**:

- 制式铁甲 — defense 12, FINE
- 黑衣 — defense 6, RARE
- 破麻衣 — defense 1, COMMON
- 铁匠围裙 — defense 4, COMMON
- 药师布衫 — defense 3, COMMON

**手部 (3件)**:

- 铁臂甲 — defense 2, COMMON
- 黑手套 — defense 2, FINE
- 铁匠手套 — defense 2, COMMON

**脚部 (1件)**:

- 军靴 — defense 2, COMMON

**腰部 (1件)**:

- 牛皮腰带 — defense 1, COMMON

**武器 (4件)**:

- 制式长刀 — damage 20, FINE
- 短刀 — damage 12, COMMON
- 暗刺 — damage 25, RARE
- 铁锤 — damage 18, FINE

**手腕 (1件)**:

- 药囊手环 — defense 1, FINE, attribute_bonus: { spirit: 3 }

### R4: NPC 初始装备配置

6 个战斗型 NPC 在 create() 中声明 `equipment` 配置，SpawnManager 在 spawn 时自动为 NPC 克隆装备并穿戴。

| NPC      | 等级 | 装备列表                                              |
| -------- | ---- | ----------------------------------------------------- |
| 北门卫兵 | 20   | 铁盔 + 制式铁甲 + 铁臂甲 + 军靴 + 牛皮腰带 + 制式长刀 |
| 南门卫兵 | 18   | 皮帽 + 制式铁甲 + 军靴 + 短刀                         |
| 神秘旅人 | 30   | 黑衣 + 黑手套 + 暗刺                                  |
| 老乞丐   | 10   | 破麻衣                                                |
| 老周铁匠 | 25   | 铁匠围裙 + 铁匠手套 + 铁锤                            |
| 白发药师 | 35   | 药师布衫 + 药囊手环                                   |

### R5: look NPC 展示装备

`look <NPC>` 时在 NPC 描述下方显示装备列表，装备名用部位色/品质色富文本标签。格式类似 eq 命令输出。

### R6: eq/examine/inventory 使用部位色

将现有 eq 命令、examine 命令、inventory 命令中的装备名颜色改为使用新的部位色标签（凡品时）或品质色标签（精良+）。

## 关联文档

- **Scope**: #188 — NPC 装备与部位色系统
- **装备系统 Epic**: #181（已完成）— EquipmentBonus/品质/穿戴流程
- **装备系统 Design**: #180（已完成）— 装备属性加成计算引擎
- **物品系统 Epic**: #156（已完成）— 物品子类/基础交互/背包
- **NPC Phase0 Epic**: #137（已完成）— NPC 存活/闲聊

## 现有代码基础

### 可复用模块

- `PlayerBase._equipment` Map + equip/unequip/getEquipment — 直接上提到 LivingBase
- `ItemQuality` + `QUALITY_MULTIPLIER` + `QUALITY_LABEL` — 品质体系已完善
- `SemanticTag` + `SEMANTIC_COLORS` + `THEME_COLORS` — 富文本标签协议已完善
- `SpawnManager.spawnByRule()` — NPC spawn 流程，可扩展装备初始化
- `ArmorBase` / `WeaponBase` — 装备基类已完善

### 需扩展模块

- `LivingBase` — 新增装备能力（从 PlayerBase 迁移）
- `SpawnManager` — spawn NPC 时初始化装备
- `look` 命令 — NPC 详情增加装备列表
- `eq`/`examine` 命令 — 使用部位色标签
- `packages/core` 富文本协议 — 新增 10 个部位色 SemanticTag

## 代码影响范围

| 层级              | 文件                          | 变更                             |
| ----------------- | ----------------------------- | -------------------------------- |
| core              | `rich-text/types.ts`          | +10 SemanticTag                  |
| core              | `rich-text/tags.ts`           | +10 SEMANTIC_TAGS + THEME_COLORS |
| core              | `constants/items.ts` 或新文件 | 部位→标签映射函数                |
| server/engine     | `living-base.ts`              | +装备 Map（从 PlayerBase 迁移）  |
| server/engine     | `player-base.ts`              | -装备 Map（已迁移到 LivingBase） |
| server/engine     | `spawn-manager.ts`            | +NPC 装备初始化                  |
| server/commands   | `look.ts`                     | +NPC 装备展示                    |
| server/commands   | `eq.ts`                       | 使用部位色标签                   |
| server/commands   | `examine.ts`                  | 使用部位色标签                   |
| server/world/item | ~17 个新蓝图文件              | 新建                             |
| server/world/npc  | 6 个 NPC 蓝图                 | +equipment 配置                  |

## 任务拆分（初步）

- [ ] core: 新增 10 个部位色 SemanticTag + 映射函数
- [ ] server: LivingBase 装备能力（从 PlayerBase 提取）
- [ ] server: 17 个新装备蓝图
- [ ] server: 6 个 NPC 蓝图添加 equipment 配置 + SpawnManager 装备初始化
- [ ] server: look NPC 展示装备 + eq/examine 部位色标签

## 验收标准

- [ ] `look 北门卫兵` 显示其 6 件装备，装备名按部位色/品质色着色
- [ ] `eq` 命令中凡品装备名用部位底色，精良装备名用品质色
- [ ] `examine <装备>` 中装备名用对应颜色标签
- [ ] 6 个战斗型 NPC 全部穿戴合理装备
- [ ] 所有 17 件新装备蓝图有正确的 name/short/long/defense|damage/wear_position/quality
- [ ] NPC 装备在 SpawnManager spawn 时自动初始化
- [ ] `packages/core` 的 SemanticTag 类型、SEMANTIC_TAGS 常量、THEME_COLORS 正确扩展
- [ ] TypeScript 编译无错误

## 不含（本期排除）

- NPC 装备掉落（击杀后掉落）
- NPC 装备耐久度
- 非战斗型 NPC 装备
- NPC 装备属性加成到 NPC 战斗数值
- 前端 NPC 装备信息弹窗（NpcInfoModal）

---

> CX 工作流 | PRD | Scope #188
