# Design Doc: NPC 装备与部位色系统

## 关联

- PRD: #189
- Scope: #188
- 关联 Epic: #181（装备系统细化，已完成）、#156（物品系统 Phase 1，已完成）、#137（NPC Phase 0，已完成）
- 关联 Design Doc: #180（装备系统细化——继承其 EquipmentBonus/品质框架/装备计算引擎）

## 基于现有代码

### 可复用模块

| 模块                         | 路径                                            | 复用/扩展                                                         |
| ---------------------------- | ----------------------------------------------- | ----------------------------------------------------------------- |
| PlayerBase.\_equipment       | `server/src/engine/game-objects/player-base.ts` | **迁移**: 装备 Map + equip/unequip/getEquipment 上提到 LivingBase |
| LivingBase                   | `server/src/engine/game-objects/living-base.ts` | **扩展**: 接收从 PlayerBase 迁移的装备系统                        |
| NpcBase                      | `server/src/engine/game-objects/npc-base.ts`    | **继承**: 自动获得装备能力                                        |
| ArmorBase / WeaponBase       | `server/src/engine/game-objects/`               | **复用**: 装备蓝图基类不变                                        |
| SpawnManager                 | `server/src/engine/spawn-manager.ts`            | **扩展**: NPC spawn 时初始化装备                                  |
| SemanticTag                  | `packages/core/src/rich-text/types.ts`          | **扩展**: +10 个部位色标签                                        |
| SEMANTIC_TAGS / THEME_COLORS | `packages/core/src/rich-text/tags.ts`           | **扩展**: +10 条标签定义和色值                                    |
| QUALITY_RT_TAG               | `eq.ts` / `examine.ts` 中的局部常量             | **替换**: 改用新的 `getEquipmentTag()` 函数                       |
| look 命令                    | `server/src/engine/commands/std/look.ts`        | **扩展**: lookAtNpc 增加装备列表                                  |
| eq 命令                      | `server/src/engine/commands/std/eq.ts`          | **修改**: 使用部位色标签                                          |
| examine 命令                 | `server/src/engine/commands/std/examine.ts`     | **修改**: 使用部位色标签 + NPC examine 显示装备                   |

### 已有设计模式

- **蓝图属性存取**: `this.get<T>(key)` / `this.set(key, val)`
- **装备槽位常量**: `WearPositions`（core/constants/items.ts + player-base.ts 两处定义）
- **品质系统**: `ItemQuality` 枚举 + `QUALITY_MULTIPLIER` 乘数 + `QUALITY_LABEL` 中文标签
- **富文本标记**: `rt(tag, text)` 函数 + `SemanticTag` 类型 + `THEME_COLORS` 双主题色值表
- **NPC spawn**: `SpawnManager.spawnByRule()` 克隆蓝图 → moveTo 房间 → enableHeartbeat

## 架构概览

```
装备能力迁移:

LivingBase (新增装备能力)
  ├─ _equipment: Map<string, ItemBase | null>
  ├─ equip(item, position): boolean
  ├─ unequip(position): ItemBase | null
  ├─ getEquipment(): Map
  └─ findEquipped(predicate): [string, ItemBase] | null

PlayerBase (继承 LivingBase，删除重复定义)
  ├─ getEquipmentBonus(): EquipmentBonus  (保留，仅玩家需要)
  └─ ... WebSocket/权限等玩家专属能力

NpcBase (自动继承 LivingBase 装备能力)
  └─ 蓝图 create() 中声明 equipment 配置

NPC 装备初始化流程:

SpawnManager.spawnByRule(rule)
  └─ clone NPC 蓝图
       └─ ★ 检查 NPC 有 'equipment' 属性
            └─ 遍历 equipment 数组
                 └─ clone 装备蓝图 → equip 到 NPC
  └─ moveTo 房间
  └─ enableHeartbeat

部位色标签选择:

getEquipmentTag(position, quality)
  ├─ quality > COMMON → 返回品质色标签 (qfine/qrare/qepic/qlegend)
  └─ quality == COMMON → 返回部位色标签 (eqhead/eqbody/eqweapon/...)
```

## 数据库设计

本轮无数据库变更。所有数据通过蓝图属性系统（`this.get()` / `this.set()`）存取。

---

## ⚡ 类型契约（强制章节）

> **本功能无新 WebSocket 消息，核心契约是 SemanticTag 类型扩展和部位色映射函数。**

### 1. SemanticTag 类型扩展

**文件**: `packages/core/src/rich-text/types.ts`

```typescript
/** 语义标记类型（28 个，原 18 + 新增 10 部位色） */
export type SemanticTag =
  | 'rn'
  | 'rd'
  | 'exit'
  | 'npc'
  | 'player'
  | 'item'
  | 'damage'
  | 'heal'
  | 'sys'
  | 'combat'
  | 'skill'
  | 'chat'
  | 'emote'
  | 'imp'
  | 'qfine'
  | 'qrare'
  | 'qepic'
  | 'qlegend'
  // ★ 新增 10 个部位色标签
  | 'eqhead'
  | 'eqbody'
  | 'eqhands'
  | 'eqfeet'
  | 'eqwaist'
  | 'eqweapon'
  | 'eqoffhand'
  | 'eqneck'
  | 'eqfinger'
  | 'eqwrist';
```

### 2. 部位色 THEME_COLORS

**文件**: `packages/core/src/rich-text/tags.ts`

新增 10 条 SEMANTIC_TAGS 和对应色值：

| 标签        | Light     | Dark      | 语义              |
| ----------- | --------- | --------- | ----------------- |
| `eqhead`    | `#6B5B4D` | `#B0A090` | 铜灰 — 头冠盔     |
| `eqbody`    | `#5B6B4D` | `#A0B090` | 橄榄绿 — 衣袍甲   |
| `eqhands`   | `#6B4D5B` | `#B090A0` | 暗紫红 — 手套护腕 |
| `eqfeet`    | `#4D5B6B` | `#90A0B0` | 钢蓝 — 鞋靴       |
| `eqwaist`   | `#7A6B3A` | `#C0B080` | 土金 — 腰带       |
| `eqweapon`  | `#8B4513` | `#C07040` | 鞍褐 — 武器       |
| `eqoffhand` | `#6B5D4D` | `#B0A090` | 棕灰 — 副手       |
| `eqneck`    | `#5A6B5A` | `#A0B0A0` | 翡翠灰 — 项链     |
| `eqfinger`  | `#7A5A6B` | `#B090B0` | 紫灰 — 戒指       |
| `eqwrist`   | `#5A6B7A` | `#90B0C0` | 蓝灰 — 护腕       |

### 3. 部位色映射函数

**文件**: `packages/core/src/constants/quality.ts`（扩展现有文件）

```typescript
import type { SemanticTag } from '../rich-text/types';

/** 装备部位 → 部位色标签映射 */
export const POSITION_TAG: Record<string, SemanticTag> = {
  head: 'eqhead',
  body: 'eqbody',
  hands: 'eqhands',
  feet: 'eqfeet',
  waist: 'eqwaist',
  weapon: 'eqweapon',
  offhand: 'eqoffhand',
  neck: 'eqneck',
  finger: 'eqfinger',
  wrist: 'eqwrist',
};

/** 品质 → 品质色标签映射（COMMON 无品质色，返回 null） */
export const QUALITY_TAG: Record<number, SemanticTag | null> = {
  [ItemQuality.COMMON]: null, // 凡品使用部位色
  [ItemQuality.FINE]: 'qfine',
  [ItemQuality.RARE]: 'qrare',
  [ItemQuality.EPIC]: 'qepic',
  [ItemQuality.LEGENDARY]: 'qlegend',
};

/**
 * 获取装备名显示标签
 * 精良+使用品质色，凡品使用部位色，无部位信息回退 'item'
 */
export function getEquipmentTag(position: string, quality: number): SemanticTag {
  // 精良及以上使用品质色
  const qualityTag = QUALITY_TAG[quality];
  if (qualityTag) return qualityTag;
  // 凡品使用部位色
  return POSITION_TAG[position] ?? 'item';
}
```

### 4. NPC 蓝图 equipment 属性格式

NPC 蓝图中通过 `this.set('equipment', [...])` 声明装备配置：

```typescript
/** NPC 蓝图中的装备声明格式 */
interface NpcEquipmentConfig {
  blueprintId: string; // 装备蓝图 ID（如 'rift-town/iron-helmet'）
  position: string; // 穿戴位置（如 'head'）
}

// 示例：北门卫兵蓝图
this.set('equipment', [
  { blueprintId: 'rift-town/iron-helmet', position: 'head' },
  { blueprintId: 'rift-town/guard-armor', position: 'body' },
  { blueprintId: 'rift-town/iron-vambrace', position: 'hands' },
  { blueprintId: 'rift-town/military-boots', position: 'feet' },
  { blueprintId: 'rift-town/leather-belt', position: 'waist' },
  { blueprintId: 'rift-town/guard-blade', position: 'weapon' },
]);
```

### 5. SpawnManager 装备初始化逻辑

**文件**: `server/src/engine/spawn-manager.ts`

在 `spawnByRule()` 中，clone NPC 后检查 `equipment` 属性：

```typescript
// clone NPC 后
const npc = this.blueprintFactory.clone(rule.blueprintId) as NpcBase;

// ★ 初始化 NPC 装备
const equipConfig = npc.get<{ blueprintId: string; position: string }[]>('equipment');
if (equipConfig && equipConfig.length > 0) {
  for (const { blueprintId, position } of equipConfig) {
    try {
      const item = this.blueprintFactory.clone(blueprintId);
      npc.equip(item as ItemBase, position);
    } catch (err) {
      this.logger.warn(`NPC ${npc.getName()} 装备 ${blueprintId} 失败: ${err}`);
    }
  }
}
```

---

## ⚡ 装备蓝图定义表（强制章节）

> **以下 17 件装备蓝图在 exec 阶段必须严格按此表创建。**

### 头部 (head)

| #   | 蓝图 ID                 | 类名       | name | defense | quality   | weight | value |
| --- | ----------------------- | ---------- | ---- | ------- | --------- | ------ | ----- |
| 1   | `rift-town/iron-helmet` | IronHelmet | 铁盔 | 3       | COMMON(0) | 2      | 25    |
| 2   | `rift-town/leather-cap` | LeatherCap | 皮帽 | 1       | COMMON(0) | 1      | 10    |

### 身体 (body)

| #   | 蓝图 ID                 | 类名       | name     | defense | quality   | weight | value |
| --- | ----------------------- | ---------- | -------- | ------- | --------- | ------ | ----- |
| 3   | `rift-town/guard-armor` | GuardArmor | 制式铁甲 | 12      | FINE(1)   | 8      | 200   |
| 4   | `rift-town/dark-robe`   | DarkRobe   | 黑衣     | 6       | RARE(2)   | 2      | 300   |
| 5   | `rift-town/torn-rags`   | TornRags   | 破麻衣   | 1       | COMMON(0) | 1      | 2     |
| 6   | `rift-town/smith-apron` | SmithApron | 铁匠围裙 | 4       | COMMON(0) | 3      | 40    |
| 7   | `rift-town/herb-shirt`  | HerbShirt  | 药师布衫 | 3       | COMMON(0) | 1      | 35    |

### 手部 (hands)

| #   | 蓝图 ID                   | 类名         | name     | defense | quality   | weight | value |
| --- | ------------------------- | ------------ | -------- | ------- | --------- | ------ | ----- |
| 8   | `rift-town/iron-vambrace` | IronVambrace | 铁臂甲   | 2       | COMMON(0) | 1      | 20    |
| 9   | `rift-town/dark-gloves`   | DarkGloves   | 黑手套   | 2       | FINE(1)   | 1      | 80    |
| 10  | `rift-town/smith-gloves`  | SmithGloves  | 铁匠手套 | 2       | COMMON(0) | 1      | 15    |

### 脚部 (feet)

| #   | 蓝图 ID                    | 类名          | name | defense | quality   | weight | value |
| --- | -------------------------- | ------------- | ---- | ------- | --------- | ------ | ----- |
| 11  | `rift-town/military-boots` | MilitaryBoots | 军靴 | 2       | COMMON(0) | 2      | 30    |

### 腰部 (waist)

| #   | 蓝图 ID                  | 类名        | name     | defense | quality   | weight | value |
| --- | ------------------------ | ----------- | -------- | ------- | --------- | ------ | ----- |
| 12  | `rift-town/leather-belt` | LeatherBelt | 牛皮腰带 | 1       | COMMON(0) | 1      | 15    |

### 武器 (weapon)

| #   | 蓝图 ID                  | 类名        | name     | damage | weapon_type | quality   | weight | value |
| --- | ------------------------ | ----------- | -------- | ------ | ----------- | --------- | ------ | ----- |
| 13  | `rift-town/guard-blade`  | GuardBlade  | 制式长刀 | 20     | blade       | FINE(1)   | 4      | 150   |
| 14  | `rift-town/short-knife`  | ShortKnife  | 短刀     | 12     | dagger      | COMMON(0) | 1      | 40    |
| 15  | `rift-town/dark-spike`   | DarkSpike   | 暗刺     | 25     | dagger      | RARE(2)   | 1      | 400   |
| 16  | `rift-town/smith-hammer` | SmithHammer | 铁锤     | 18     | hammer      | FINE(1)   | 5      | 100   |

### 手腕 (wrist)

| #   | 蓝图 ID                   | 类名         | name     | defense | quality | weight | value | attribute_bonus |
| --- | ------------------------- | ------------ | -------- | ------- | ------- | ------ | ----- | --------------- |
| 17  | `rift-town/herb-bracelet` | HerbBracelet | 药囊手环 | 1       | FINE(1) | 0      | 60    | { spirit: 3 }   |

---

## ⚡ NPC 装备分配表（强制章节）

| NPC      | 蓝图 ID                         | 等级 | 装备（蓝图ID → 部位）                                                                                                |
| -------- | ------------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------- |
| 北门卫兵 | `rift-town/north-guard`         | 20   | iron-helmet→head, guard-armor→body, iron-vambrace→hands, military-boots→feet, leather-belt→waist, guard-blade→weapon |
| 南门卫兵 | `rift-town/south-guard`         | 18   | leather-cap→head, guard-armor→body, military-boots→feet, short-knife→weapon                                          |
| 神秘旅人 | `rift-town/mysterious-traveler` | 30   | dark-robe→body, dark-gloves→hands, dark-spike→weapon                                                                 |
| 老乞丐   | `rift-town/old-beggar`          | 10   | torn-rags→body                                                                                                       |
| 老周铁匠 | `rift-town/blacksmith`          | 25   | smith-apron→body, smith-gloves→hands, smith-hammer→weapon                                                            |
| 白发药师 | `rift-town/herbalist`           | 35   | herb-shirt→body, herb-bracelet→wrist                                                                                 |

---

## 后端设计

### 代码路径

```
packages/core/src/
├── rich-text/
│   ├── types.ts              # ★ 修改: +10 SemanticTag
│   └── tags.ts               # ★ 修改: +10 SEMANTIC_TAGS + THEME_COLORS
├── constants/
│   └── quality.ts            # ★ 扩展: +POSITION_TAG +QUALITY_TAG +getEquipmentTag()
└── index.ts                  # ★ 修改: 导出新常量和函数

server/src/engine/
├── game-objects/
│   ├── living-base.ts        # ★ 修改: +装备系统（从 player-base 迁移）
│   └── player-base.ts        # ★ 修改: -装备 Map（迁移到 living-base），保留 getEquipmentBonus()
├── spawn-manager.ts          # ★ 修改: +NPC 装备初始化逻辑
└── commands/std/
    ├── look.ts               # ★ 修改: lookAtNpc +装备列表
    ├── eq.ts                 # ★ 修改: 使用 getEquipmentTag()
    └── examine.ts            # ★ 修改: 使用 getEquipmentTag() + examineNpc +装备列表

server/src/world/item/rift-town/
├── iron-helmet.ts            # ★ 新建
├── leather-cap.ts            # ★ 新建
├── guard-armor.ts            # ★ 新建
├── dark-robe.ts              # ★ 新建
├── torn-rags.ts              # ★ 新建
├── smith-apron.ts            # ★ 新建
├── herb-shirt.ts             # ★ 新建
├── iron-vambrace.ts          # ★ 新建
├── dark-gloves.ts            # ★ 新建
├── smith-gloves.ts           # ★ 新建
├── military-boots.ts         # ★ 新建
├── leather-belt.ts           # ★ 新建
├── guard-blade.ts            # ★ 新建
├── short-knife.ts            # ★ 新建
├── dark-spike.ts             # ★ 新建
├── smith-hammer.ts           # ★ 新建
└── herb-bracelet.ts          # ★ 新建

server/src/world/npc/rift-town/
├── north-guard.ts            # ★ 修改: +equipment 配置
├── south-guard.ts            # ★ 修改: +equipment 配置
├── mysterious-traveler.ts    # ★ 修改: +equipment 配置
├── old-beggar.ts             # ★ 修改: +equipment 配置
├── blacksmith.ts             # ★ 修改: +equipment 配置
└── herbalist.ts              # ★ 修改: +equipment 配置
```

### 关键类/模块变更

#### LivingBase（装备系统迁移）

```typescript
// living-base.ts 新增内容
import type { ItemBase } from './item-base';

export class LivingBase extends BaseEntity {
  // ... 现有方法不变 ...

  // ★ 从 PlayerBase 迁移
  private _equipment: Map<string, ItemBase | null> = new Map([
    ['head', null], ['body', null], ['hands', null],
    ['feet', null], ['waist', null], ['weapon', null],
    ['offhand', null], ['neck', null], ['finger', null], ['wrist', null],
  ]);

  equip(item: ItemBase, position: string): boolean { ... }
  unequip(position: string): ItemBase | null { ... }
  getEquipment(): Map<string, ItemBase | null> { ... }
  findEquipped(predicate: (item: ItemBase) => boolean): [string, ItemBase] | null { ... }
}
```

#### PlayerBase（简化）

```typescript
// player-base.ts 删除 _equipment 及 equip/unequip/getEquipment/findEquipped
// 保留 getEquipmentBonus()（仅玩家需要汇总装备加成）
export class PlayerBase extends LivingBase {
  // 删除: _equipment, equip(), unequip(), getEquipment(), findEquipped()
  // 保留: getEquipmentBonus(), WebSocket 能力, 权限等
}
```

#### eq 命令（使用 getEquipmentTag）

```typescript
// 替换现有 QUALITY_RT_TAG 局部常量
import { getEquipmentTag } from '@packages/core';

// 原来：const tag = QUALITY_RT_TAG[quality] ?? 'item';
// 改为：
const wearPos = item.get<string>('wear_position') ?? pos;
const tag = getEquipmentTag(wearPos, quality);
lines.push(`  ${label}: ${rt(tag, item.getName())}`);
```

#### examine 命令（使用 getEquipmentTag + NPC 装备列表）

```typescript
// examineItem: 替换 QUALITY_RT_TAG
const wearPos = item.get<string>('wear_position') ?? '';
const qualityTag = getEquipmentTag(wearPos, quality);
lines.push(rt(qualityTag, bold(name)));

// examineNpc: 新增装备列表
const equipment = npc.getEquipment();
const eqLines: string[] = [];
const seen = new Set<string>();
for (const [pos, item] of equipment) {
  if (!item || seen.has(item.id)) continue;
  seen.add(item.id);
  const quality = item.getQuality();
  const wearPos = item.get<string>('wear_position') ?? pos;
  const tag = getEquipmentTag(wearPos, quality);
  eqLines.push(`${POSITION_LABEL[pos]}: ${rt(tag, item.getName())}`);
}
if (eqLines.length > 0) {
  lines.push('装备:');
  eqLines.forEach((l) => lines.push(`  ${l}`));
}
```

#### look 命令（NPC 装备列表）

```typescript
// lookAtNpc: 新增装备展示（简化版）
const equipment = npc.getEquipment();
const eqNames: string[] = [];
const seen = new Set<string>();
for (const [pos, item] of equipment) {
  if (!item || seen.has(item.id)) continue;
  seen.add(item.id);
  const quality = item.getQuality();
  const wearPos = item.get<string>('wear_position') ?? pos;
  const tag = getEquipmentTag(wearPos, quality);
  eqNames.push(rt(tag, item.getName()));
}
if (eqNames.length > 0) {
  lines.push(`装备: ${eqNames.join('、')}`);
}
```

## 前端设计

本轮无前端 UI 变更。部位色标签在 `packages/core` 中定义后，客户端的 RichText 组件会自动根据 `THEME_COLORS` 渲染对应颜色，无需修改前端代码。

## 影响范围

### 修改的已有文件（10 个）

| 文件                                            | 变更                                          |
| ----------------------------------------------- | --------------------------------------------- |
| `packages/core/src/rich-text/types.ts`          | +10 SemanticTag                               |
| `packages/core/src/rich-text/tags.ts`           | +10 SEMANTIC_TAGS + THEME_COLORS              |
| `packages/core/src/constants/quality.ts`        | +POSITION_TAG, QUALITY_TAG, getEquipmentTag() |
| `packages/core/src/index.ts`                    | 导出新常量和函数                              |
| `server/src/engine/game-objects/living-base.ts` | +装备系统                                     |
| `server/src/engine/game-objects/player-base.ts` | -装备系统（迁移）                             |
| `server/src/engine/spawn-manager.ts`            | +NPC 装备初始化                               |
| `server/src/engine/commands/std/look.ts`        | +NPC 装备列表                                 |
| `server/src/engine/commands/std/eq.ts`          | 使用 getEquipmentTag()                        |
| `server/src/engine/commands/std/examine.ts`     | 使用 getEquipmentTag() + NPC 装备列表         |

### 新增的文件（23 个）

- 17 个装备蓝图文件（`server/src/world/item/rift-town/`）
- 6 个 NPC 蓝图修改（仅添加 equipment 配置，不算新文件）

### 潜在冲突

- `PlayerBase` 的装备方法迁移到 `LivingBase`，现有 `wear`/`wield`/`remove` 命令调用 `executor.equip()` 等方法时 executor 类型是 `LivingBase`，但实际只在 PlayerBase 子类中调用，迁移后 API 签名不变，无兼容性问题。

## 风险点

| 风险                                    | 影响 | 应对方案                               |
| --------------------------------------- | ---- | -------------------------------------- |
| LivingBase 装备迁移可能影响现有穿戴指令 | 中   | 迁移后运行现有指令测试验证             |
| 10 个新 SemanticTag 需要 core build     | 低   | 使用 `pnpm dev` 自动 watch 编译        |
| NPC 装备克隆增加 spawn 时间             | 低   | 17 件装备克隆开销极小                  |
| 双手武器去重逻辑需兼容 NPC 装备         | 低   | 复用 eq 命令已有的 `seen` Set 去重模式 |

---

> CX 工作流 | Design Doc | PRD #189
