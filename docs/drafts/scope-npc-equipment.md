# Scope: NPC 装备与部位色系统

## 背景

新手村（裂隙镇）已完成装备系统细化（Epic #181），玩家可以穿戴装备并看到属性加成。但目前存在几个问题：

1. **NPC 没有装备** — 虽然 NPC 描述中提到"身着铁甲"、"腰佩长刀"，但 NPC 实际上没有装备数据
2. **装备种类单一** — 目前只有 3 件装备蓝图（铁剑、木棍、布衣），且只覆盖 body/weapon 两个部位
3. **装备名字无部位区分** — 所有装备名字都用同一个 `item` 颜色标签（棕铜色），看不出部位差异

## 目标

- 让战斗型 NPC 穿上合理的装备，与 NPC 描述文本匹配
- 创建覆盖多个部位的装备蓝图（head/body/hands/feet/waist/weapon）
- **装备名字按部位 + 品质双色** — 不同部位有不同底色，品质再叠加颜色加深/变调

## 范围

### 涉及 NPC（6 个战斗型）

| NPC      | 等级 | 描述中提到的装备           | 规划装备                     |
| -------- | ---- | -------------------------- | ---------------------------- |
| 北门卫兵 | 20   | 铁甲、长刀、铭牌           | head + body + weapon + waist |
| 南门卫兵 | 18   | 制式铠甲                   | head + body + weapon         |
| 神秘旅人 | 30   | 黑衣、腰间（暗器？）       | body + hands + weapon        |
| 老乞丐   | 10   | 破烂麻衣                   | body（破麻衣）               |
| 老周铁匠 | 25   | 锻铁工具、旧疤暗示战斗经历 | body + hands + weapon        |
| 白发药师 | 35   | 药师装扮                   | body + wrist                 |

### 不涉及 NPC（4 个非战斗型）

- 客栈老板：商人，无装备
- 杂货商人：商人，无装备
- 酒保：服务人员，无装备
- 镇长：管理人员，本期不含

### 模块分布

| 模块                     | 变更内容                                                   |
| ------------------------ | ---------------------------------------------------------- |
| `packages/core`          | 新增 10 个部位色 SemanticTag + 部位色映射常量              |
| `server/engine`          | NpcBase 增加装备能力（复用 \_equipment Map）               |
| `server/world/item`      | ~15 个新装备蓝图（覆盖 head/body/hands/feet/waist/weapon） |
| `server/world/npc`       | 6 个 NPC 蓝图添加初始装备                                  |
| `server/engine/commands` | look NPC 展示装备、eq 使用部位色标签                       |

### 装备部位色方案（两者结合：部位底色 + 品质叠加）

**10 个部位底色标签**（新增 SemanticTag）:

| 部位    | 标签名      | Light 色值 | 语义              |
| ------- | ----------- | ---------- | ----------------- |
| head    | `eqhead`    | #6B5B4D    | 铜灰 — 头冠盔     |
| body    | `eqbody`    | #5B6B4D    | 橄榄绿 — 衣袍甲   |
| hands   | `eqhands`   | #6B4D5B    | 暗紫红 — 手套护腕 |
| feet    | `eqfeet`    | #4D5B6B    | 钢蓝 — 鞋靴       |
| waist   | `eqwaist`   | #7A6B3A    | 土金 — 腰带       |
| weapon  | `eqweapon`  | #8B4513    | 鞍褐 — 武器       |
| offhand | `eqoffhand` | #6B5D4D    | 棕灰 — 副手       |
| neck    | `eqneck`    | #5A6B5A    | 翡翠灰 — 项链     |
| finger  | `eqfinger`  | #7A5A6B    | 紫灰 — 戒指       |
| wrist   | `eqwrist`   | #5A6B7A    | 蓝灰 — 护腕       |

品质叠加规则：

- **凡品** (COMMON): 使用部位底色
- **精良** (FINE): 使用 `qfine` 标签色
- **稀有** (RARE): 使用 `qrare` 标签色
- **史诗** (EPIC): 使用 `qepic` 标签色
- **传说** (LEGENDARY): 使用 `qlegend` 标签色

即：凡品装备按部位区分颜色，精良及以上按品质颜色（已有 qfine/qrare/qepic/qlegend 标签）。

### 新增装备蓝图规划（~15 件）

**头部 (head)**:

- 铁盔 — 卫兵标配，defense 3, COMMON
- 皮帽 — 轻便头饰，defense 1, COMMON

**身体 (body)**:

- 制式铁甲 — 卫兵铠甲，defense 12, FINE
- 黑衣 — 神秘旅人，defense 6, RARE（暗示暗器衬甲）
- 破麻衣 — 老乞丐，defense 1, COMMON
- 铁匠围裙 — 老周专用，defense 4, COMMON
- 药师布衫 — 白发药师，defense 3, COMMON

**手部 (hands)**:

- 铁臂甲 — 卫兵护臂，defense 2, COMMON
- 黑手套 — 神秘旅人，defense 2, FINE
- 铁匠手套 — 老周专用，defense 2, COMMON

**脚部 (feet)**:

- 军靴 — 卫兵标配，defense 2, COMMON

**腰部 (waist)**:

- 牛皮腰带 — 卫兵标配，defense 1, COMMON

**武器 (weapon)**:

- 制式长刀 — 北门卫兵，damage 20, FINE
- 短刀 — 南门卫兵，damage 12, COMMON
- 暗刺 — 神秘旅人，damage 25, RARE
- 铁锤 — 老周铁匠，damage 18, FINE

**手腕 (wrist)**:

- 药囊手环 — 白发药师，defense 1, FINE, +spirit 属性

### NPC 装备分配

| NPC              | 装备                                                              |
| ---------------- | ----------------------------------------------------------------- |
| 北门卫兵 (Lv.20) | 铁盔 + 制式铁甲(FINE) + 铁臂甲 + 军靴 + 牛皮腰带 + 制式长刀(FINE) |
| 南门卫兵 (Lv.18) | 皮帽 + 制式铁甲(FINE) + 军靴 + 短刀                               |
| 神秘旅人 (Lv.30) | 黑衣(RARE) + 黑手套(FINE) + 暗刺(RARE)                            |
| 老乞丐 (Lv.10)   | 破麻衣                                                            |
| 老周铁匠 (Lv.25) | 铁匠围裙 + 铁匠手套 + 铁锤(FINE)                                  |
| 白发药师 (Lv.35) | 药师布衫 + 药囊手环(FINE)                                         |

## 不含（本期排除）

- NPC 装备掉落系统（击杀 NPC 后掉落装备）
- NPC 装备耐久度
- 非战斗型 NPC 装备
- NPC 装备属性加成到 NPC 战斗数值
- 前端 NPC 装备信息弹窗

## 技术风险

1. **NpcBase 装备能力** — NpcBase 目前继承 LivingBase，没有装备 Map。需要将 PlayerBase 的装备逻辑提取到 LivingBase 或 NpcBase 独立实现
2. **部位色标签数量** — 新增 10 个 SemanticTag，需要同时更新 types.ts、tags.ts、theme colors

## 规模评估

- 影响层级: core + server（无前端 UI 变更）
- 新增文件: ~17 个蓝图 + 少量修改
- 新增 API: 无新 WebSocket 消息
- 架构变更: LivingBase 装备能力提取

**评估: M（中规模）** — 需要 Design Doc 定义部位色方案和 NPC 装备分配细节

---

> CX 工作流 | Scope
