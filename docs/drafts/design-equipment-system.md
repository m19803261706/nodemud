# Design Doc: 装备系统细化 — 属性加成 + 穿戴流程 + 品质框架

## 关联

- PRD: #179
- Scope: #178
- 关联 Epic: #156（物品系统 Phase 1，已完成）、#166（背包系统，已完成）

## 基于现有代码

### 可复用模块

| 模块               | 路径                                               | 复用/扩展                                    |
| ------------------ | -------------------------------------------------- | -------------------------------------------- |
| PlayerBase         | `server/src/engine/game-objects/player-base.ts`    | 扩展：新增 `getEquipmentBonus()` 等方法      |
| ArmorBase          | `server/src/engine/game-objects/armor-base.ts`     | 扩展：`getAttributeBonus()` 已有但返回空对象 |
| WeaponBase         | `server/src/engine/game-objects/weapon-base.ts`    | 扩展：新增 `getAttributeBonus()`             |
| ItemBase           | `server/src/engine/game-objects/item-base.ts`      | 复用：`getLevelReq()` 已有                   |
| stats.utils        | `server/src/websocket/handlers/stats.utils.ts`     | 扩展：`derivePlayerStats()` 需含装备加成     |
| command.handler    | `server/src/websocket/handlers/command.handler.ts` | 扩展：wear/wield/remove 后推送 playerStats   |
| room-utils         | `server/src/websocket/handlers/room-utils.ts`      | 扩展：`sendEquipmentUpdate()` 增加品质字段   |
| PlayerStatsMessage | `packages/core/src/types/messages/playerStats.ts`  | 扩展：新增 equipBonus/combat 字段            |
| EquipmentSlot      | `packages/core/src/types/messages/equipment.ts`    | 扩展：新增 quality 字段                      |
| 富文本标记         | `packages/core/src/rich-text/`                     | 扩展：新增品质色标记                         |

### 已有设计模式

- **蓝图属性存取**: 所有游戏对象通过 `this.get<T>(key)` / `this.set(key, val)` 存取蓝图属性
- **WebSocket 消息**: 通过 `MessageFactory.create(type, data)` 创建，`player.sendToClient(serialize(msg))` 推送
- **指令模式**: `@Command` 装饰器注册，`execute(executor, args): CommandResult` 统一签名

## 架构概览

```
穿戴/脱下流程:

玩家执行 wear/wield/remove 指令
  └─ 指令层: 等级检查 + 双手武器检查
       └─ PlayerBase.equip()/unequip()
            └─ command.handler 后处理:
                 ├─ sendInventoryUpdate()     // 背包更新
                 ├─ sendEquipmentUpdate()     // 装备栏更新（含品质）
                 └─ sendPlayerStats()         // 属性更新（含装备加成）★新增

属性计算流程:

PlayerBase.getEquipmentBonus()  ★新增
  └─ 遍历 _equipment Map
       └─ 对每件装备:
            ├─ ArmorBase.getAttributeBonus()  // 六维+三维+攻防
            ├─ ArmorBase.getDefense()         // 防御
            ├─ WeaponBase.getDamage()         // 攻击
            └─ ItemBase.getQuality()          // 品质系数 ★新增
       └─ 汇总: Σ(属性 × 品质系数)

derivePlayerStats() 扩展:
  └─ 原始基础属性 + getEquipmentBonus()
       └─ hp.max = vitality*100 + bonus.resources.maxHp
       └─ attrs.strength = base.strength + bonus.attrs.strength
       └─ combat = { attack: Σ武器伤害, defense: Σ防具防御 }
```

## 数据库设计

本轮无数据库变更。装备属性全部来自蓝图定义（`this.get()` 存取），品质也存储在蓝图属性中。

---

## ⚡ WebSocket 消息契约

> **本项目通过 WebSocket 消息通信，无 REST API。以下定义的消息格式是前后端的对齐合同。**

### 消息总览

| #   | 消息类型          | 方向            | 变更类型 | 说明                            |
| --- | ----------------- | --------------- | -------- | ------------------------------- |
| 1   | `playerStats`     | Server → Client | **扩展** | 新增 equipBonus + combat 字段   |
| 2   | `equipmentUpdate` | Server → Client | **扩展** | EquipmentSlot 新增 quality 字段 |

### 消息详情

#### 1. playerStats 消息（扩展）

现有格式（保持向后兼容，客户端已有字段不变）：

```json
{
  "type": "playerStats",
  "data": {
    "name": "云中子",
    "level": "初入江湖",
    "hp": { "current": 500, "max": 530 },
    "mp": { "current": 400, "max": 400 },
    "energy": { "current": 450, "max": 450 },
    "attrs": {
      "wisdom": 5,
      "perception": 5,
      "spirit": 5,
      "meridian": 5,
      "strength": 5,
      "vitality": 5
    },
    "equipBonus": {
      "attrs": {
        "strength": 3,
        "vitality": 2
      },
      "resources": {
        "maxHp": 30,
        "maxMp": 0,
        "maxEnergy": 0
      },
      "combat": {
        "attack": 15,
        "defense": 8
      }
    },
    "combat": {
      "attack": 15,
      "defense": 8
    }
  },
  "timestamp": 1707120000000
}
```

**字段说明**：

| 字段                   | 类型   | 变更     | 说明                                                                  |
| ---------------------- | ------ | -------- | --------------------------------------------------------------------- |
| `hp.max`               | number | **修改** | 含装备加成：`vitality*100 + equipBonus.resources.maxHp`               |
| `mp.max`               | number | **修改** | 含装备加成：`spirit*80 + equipBonus.resources.maxMp`                  |
| `energy.max`           | number | **修改** | 含装备加成：`(wisdom+perception)*50 + equipBonus.resources.maxEnergy` |
| `attrs`                | object | **不变** | 仍是角色基础六维属性（不含装备加成）                                  |
| `equipBonus`           | object | **新增** | 装备加成汇总                                                          |
| `equipBonus.attrs`     | object | 新增     | 六维属性加成（仅列出非 0 项）                                         |
| `equipBonus.resources` | object | 新增     | 三维资源上限加成                                                      |
| `equipBonus.combat`    | object | 新增     | 攻防数值加成                                                          |
| `combat`               | object | **新增** | 最终攻防数值（等于 equipBonus.combat，后续战斗系统可叠加技能/buff）   |

**资源上限联动规则**：

- `hp.max` = `vitality * 100 + equipBonus.resources.maxHp`
- `hp.current` = `min(hp.current, hp.max)` — 脱装备导致上限降低时钳制
- mp、energy 同理

#### 2. equipmentUpdate 消息（扩展）

```json
{
  "type": "equipmentUpdate",
  "data": {
    "equipment": {
      "head": null,
      "body": {
        "id": "item_001",
        "name": "布衣",
        "type": "armor",
        "quality": 0
      },
      "weapon": {
        "id": "item_002",
        "name": "铁剑",
        "type": "weapon",
        "quality": 0
      },
      "offhand": null,
      "hands": null,
      "feet": null,
      "waist": null,
      "neck": null,
      "finger": null,
      "wrist": null
    }
  },
  "timestamp": 1707120000000
}
```

**EquipmentSlot 扩展**：

| 字段      | 类型   | 变更     | 说明              |
| --------- | ------ | -------- | ----------------- |
| `id`      | string | 不变     | 物品 ID           |
| `name`    | string | 不变     | 物品名称          |
| `type`    | string | 不变     | 物品类型          |
| `quality` | number | **新增** | 品质枚举值（0-4） |

---

## ⚡ 品质枚举对照表

> **前后端必须使用完全一致的枚举值。**

### ItemQuality 品质枚举

| 枚举值 | 数字值 | 后端常量    | 前端常量    | 中文名 | 富文本标记       | light 色值 | dark 色值 |
| ------ | ------ | ----------- | ----------- | ------ | ---------------- | ---------- | --------- |
| 凡品   | 0      | `COMMON`    | `COMMON`    | 凡品   | 无标记（默认色） | —          | —         |
| 精良   | 1      | `FINE`      | `FINE`      | 精良   | `<qfine>`        | `#2F7A3F`  | `#5FBA6F` |
| 稀有   | 2      | `RARE`      | `RARE`      | 稀有   | `<qrare>`        | `#2E6B8A`  | `#6CB8D8` |
| 史诗   | 3      | `EPIC`      | `EPIC`      | 史诗   | `<qepic>`        | `#6B2F8A`  | `#A06FCA` |
| 传说   | 4      | `LEGENDARY` | `LEGENDARY` | 传说   | `<qlegend>`      | `#C04020`  | `#FF6040` |

### 品质系数

| 品质      | 系数 |
| --------- | ---- |
| COMMON    | 1.0  |
| FINE      | 1.2  |
| RARE      | 1.5  |
| EPIC      | 2.0  |
| LEGENDARY | 3.0  |

### 命名规范

- **蓝图属性 key**: `quality`（number，默认 0）
- **后端常量**: `ItemQuality.COMMON` 等（定义在 `packages/core`）
- **前端常量**: 同后端（从 `@packages/core` 导入）
- **品质系数常量**: `QUALITY_MULTIPLIER`（定义在 `packages/core`）

---

## ⚡ 字段映射表

> **蓝图属性 → 后端方法 → WebSocket 字段 → 前端字段完整映射链**

### 装备加成字段映射

| #   | 功能     | 蓝图属性 key      | 后端方法                      | WS 消息字段                 | 前端 TS 字段                | 类型    | 说明       |
| --- | -------- | ----------------- | ----------------------------- | --------------------------- | --------------------------- | ------- | ---------- |
| 1   | 防御力   | `defense`         | `ArmorBase.getDefense()`      | `equipBonus.combat.defense` | `equipBonus.combat.defense` | number  | 防具防御值 |
| 2   | 攻击力   | `damage`          | `WeaponBase.getDamage()`      | `equipBonus.combat.attack`  | `equipBonus.combat.attack`  | number  | 武器伤害值 |
| 3   | 属性加成 | `attribute_bonus` | `getAttributeBonus()`         | `equipBonus.attrs.*`        | `equipBonus.attrs.*`        | Record  | 六维+三维  |
| 4   | 品质     | `quality`         | `ItemBase.getQuality()`       | `quality`                   | `quality`                   | number  | 0-4 枚举   |
| 5   | 等级需求 | `level_req`       | `ItemBase.getLevelReq()`      | —                           | —                           | number  | 穿戴检查用 |
| 6   | 双手武器 | `two_handed`      | `WeaponBase.isTwoHanded()`    | —                           | —                           | boolean | 穿戴逻辑用 |
| 7   | 穿戴位置 | `wear_position`   | `ArmorBase.getWearPosition()` | —                           | —                           | string  | 槽位判定用 |

### EquipmentBonus 结构定义

**packages/core TypeScript（前后端共享）**：

```typescript
/** 装备属性加成（单件或汇总） */
export interface EquipmentBonus {
  /** 六维属性加成 */
  attrs?: Partial<CharacterAttrs>;
  /** 三维资源上限加成 */
  resources?: {
    maxHp?: number;
    maxMp?: number;
    maxEnergy?: number;
  };
  /** 攻防数值 */
  combat?: {
    attack?: number;
    defense?: number;
  };
}
```

### PlayerStatsMessage 扩展

```typescript
/** playerStats 消息（扩展后） */
export interface PlayerStatsMessage extends ServerMessage {
  type: 'playerStats';
  data: {
    name: string;
    level: string;
    hp: ResourceValue;
    mp: ResourceValue;
    energy: ResourceValue;
    attrs: CharacterAttrs; // 基础六维（不变）
    equipBonus: EquipmentBonus; // ★ 新增：装备加成汇总
    combat: {
      // ★ 新增：最终攻防
      attack: number;
      defense: number;
    };
  };
}
```

### EquipmentSlot 扩展

```typescript
/** 装备槽位信息（扩展后） */
export interface EquipmentSlot {
  id: string;
  name: string;
  type: string;
  quality: number; // ★ 新增：品质枚举值 0-4
}
```

### 客户端 Store 扩展

```typescript
/** useGameStore PlayerData 扩展 */
export interface PlayerData {
  name: string;
  level: string;
  hp: ResourceValue;
  mp: ResourceValue;
  energy: ResourceValue;
  attrs: CharacterAttrs;
  equipBonus: EquipmentBonus; // ★ 新增
  combat: { attack: number; defense: number }; // ★ 新增
}
```

---

## 后端设计

### 代码路径

```
packages/core/src/
├── types/messages/
│   ├── playerStats.ts          # 扩展: EquipmentBonus + combat
│   └── equipment.ts            # 扩展: EquipmentSlot.quality
├── types/
│   └── equipment-bonus.ts      # 新增: EquipmentBonus 接口
├── constants/
│   └── quality.ts              # 新增: ItemQuality 枚举 + QUALITY_MULTIPLIER
└── rich-text/
    ├── types.ts                # 扩展: 品质色 SemanticTag
    └── tags.ts                 # 扩展: 品质色值

server/src/engine/game-objects/
├── item-base.ts                # 扩展: getQuality()
├── armor-base.ts               # 扩展: getAttributeBonus() 返回完整 EquipmentBonus
├── weapon-base.ts              # 扩展: getAttributeBonus() 新增
└── player-base.ts              # 扩展: getEquipmentBonus() 汇总

server/src/engine/commands/std/
├── wear.ts                     # 扩展: 等级检查
├── wield.ts                    # 扩展: 双手武器逻辑 + 等级检查
├── examine.ts                  # 扩展: 品质 + 属性加成展示
└── eq.ts                       # 扩展: 品质颜色

server/src/websocket/handlers/
├── stats.utils.ts              # 扩展: 装备加成计算 + 资源上限联动
├── room-utils.ts               # 扩展: sendEquipmentUpdate 含 quality
└── command.handler.ts          # 扩展: wear/wield/remove 后推送 playerStats
```

### 关键类/方法设计

#### ItemBase 扩展

```typescript
/** 获取品质（默认 COMMON = 0） */
getQuality(): number {
  return this.get<number>('quality') ?? 0;
}
```

#### ArmorBase.getAttributeBonus() 重定义

当前返回 `Record<string, number>`，改为返回 `EquipmentBonus` 结构。为保持蓝图兼容，蓝图的 `attribute_bonus` 属性仍使用扁平 Record，由方法内部转换：

```typescript
getAttributeBonus(): EquipmentBonus {
  const raw = this.get<Record<string, number>>('attribute_bonus') ?? {};
  // 将扁平 key 分组到 attrs / resources / combat
  return parseRawBonus(raw);
}
```

`parseRawBonus` 规则：

- `wisdom/perception/spirit/meridian/strength/vitality` → `attrs`
- `maxHp/maxMp/maxEnergy` → `resources`
- `attack/defense` → `combat`

#### WeaponBase 新增 getAttributeBonus()

```typescript
getAttributeBonus(): EquipmentBonus {
  const raw = this.get<Record<string, number>>('attribute_bonus') ?? {};
  const bonus = parseRawBonus(raw);
  // 武器伤害自动进入 combat.attack
  const damage = this.getDamage();
  if (damage > 0) {
    bonus.combat = bonus.combat ?? {};
    bonus.combat.attack = (bonus.combat.attack ?? 0) + damage;
  }
  return bonus;
}
```

#### PlayerBase.getEquipmentBonus()

```typescript
/** 汇总所有装备加成（含品质系数） */
getEquipmentBonus(): EquipmentBonus {
  const total: EquipmentBonus = { attrs: {}, resources: {}, combat: {} };
  for (const [, item] of this._equipment) {
    if (!item) continue;
    const quality = item.getQuality();
    const multiplier = QUALITY_MULTIPLIER[quality] ?? 1.0;

    let bonus: EquipmentBonus;
    if (item instanceof ArmorBase) {
      bonus = item.getAttributeBonus();
      // 防具防御自动进入 combat.defense
      const defense = item.getDefense();
      if (defense > 0) {
        bonus.combat = bonus.combat ?? {};
        bonus.combat.defense = (bonus.combat.defense ?? 0) + defense;
      }
    } else if (item instanceof WeaponBase) {
      bonus = item.getAttributeBonus();
    } else continue;

    // 乘以品质系数后累加
    mergeBonus(total, bonus, multiplier);
  }
  return total;
}
```

#### derivePlayerStats() 扩展

```typescript
export function derivePlayerStats(character: Character, player: PlayerBase) {
  const equipBonus = player.getEquipmentBonus();

  const hpMax = character.vitality * 100 + (equipBonus.resources?.maxHp ?? 0);
  const mpMax = character.spirit * 80 + (equipBonus.resources?.maxMp ?? 0);
  const energyMax =
    (character.wisdom + character.perception) * 50 + (equipBonus.resources?.maxEnergy ?? 0);

  // 资源当前值钳制（不超过新上限）
  const hpCurrent = Math.min(player.get<number>('hp_current') ?? hpMax, hpMax);
  const mpCurrent = Math.min(player.get<number>('mp_current') ?? mpMax, mpMax);
  const energyCurrent = Math.min(player.get<number>('energy_current') ?? energyMax, energyMax);

  return {
    name: character.name,
    level: getLevelText(),
    hp: { current: hpCurrent, max: hpMax },
    mp: { current: mpCurrent, max: mpMax },
    energy: { current: energyCurrent, max: energyMax },
    attrs: {
      wisdom: character.wisdom,
      perception: character.perception,
      spirit: character.spirit,
      meridian: character.meridian,
      strength: character.strength,
      vitality: character.vitality,
    },
    equipBonus,
    combat: {
      attack: equipBonus.combat?.attack ?? 0,
      defense: equipBonus.combat?.defense ?? 0,
    },
  };
}
```

**关键变更**: `derivePlayerStats` 签名新增 `player: PlayerBase` 参数，调用处需同步修改。

#### wield 双手武器逻辑

```typescript
// 在 equip 之前检查
if (weapon.isTwoHanded()) {
  // 卸下副手
  const offhandItem = executor.unequip(WearPositions.OFFHAND);
  if (offhandItem) {
    /* 放回背包 */
  }
  // 装备武器到主手
  executor.equip(weapon, WearPositions.WEAPON);
  // 标记副手为"被双手武器占用"
  executor.equip(weapon, WearPositions.OFFHAND); // 或用特殊标记
} else {
  // 单手武器：如果当前主手是双手武器，需先卸下
  const currentWeapon = executor.getEquipment().get(WearPositions.WEAPON);
  if (currentWeapon instanceof WeaponBase && currentWeapon.isTwoHanded()) {
    executor.unequip(WearPositions.WEAPON);
    executor.unequip(WearPositions.OFFHAND);
    // 旧武器放回背包
  }
  executor.equip(weapon, WearPositions.WEAPON);
}
```

#### command.handler 后处理扩展

```typescript
// wear/wield/remove 命令成功后：推送 inventoryUpdate + equipmentUpdate + playerStats ★
if (result.success && ['wear', 'wield', 'remove'].includes(result.data?.action)) {
  sendInventoryUpdate(player);
  sendEquipmentUpdate(player);
  sendPlayerStats(player, session.character); // ★ 新增
}
```

---

## 前端设计

### 页面/组件结构

```
client/src/components/game/
├── PlayerStats/
│   ├── index.tsx              # 扩展: 增加攻防行
│   ├── PlayerNameBadge.tsx    # 不变
│   ├── AttrValue.tsx          # 扩展: 支持显示加成值
│   └── CombatValue.tsx        # 新增: 攻击/防御数值组件
├── Inventory/
│   └── EquipmentView.tsx      # 扩展: 品质颜色
```

### 状态管理

useGameStore.ts 的 PlayerData 接口扩展：

```typescript
export interface PlayerData {
  name: string;
  level: string;
  hp: ResourceValue;
  mp: ResourceValue;
  energy: ResourceValue;
  attrs: CharacterAttrs;
  equipBonus: EquipmentBonus; // ★ 新增
  combat: { attack: number; defense: number }; // ★ 新增
}
```

初始值：

```typescript
const INITIAL_PLAYER: PlayerData = {
  // ...existing...
  equipBonus: { attrs: {}, resources: {}, combat: {} },
  combat: { attack: 0, defense: 0 },
};
```

### AttrValue 组件扩展

```typescript
interface AttrValueProps {
  label: string;
  value: number;
  bonus?: number; // ★ 新增: 装备加成值（可选）
}

// bonus > 0 时显示 "+{bonus}" 绿色文本
```

### CombatValue 新增组件

```typescript
interface CombatValueProps {
  label: string; // "攻击" | "防御"
  value: number;
}
```

### PlayerStats index.tsx 扩展

在六维属性行下方增加攻防行：

```
[气血条] [内力条] [精力条]
[慧根] [心眼] [气海] [脉络] [筋骨] [血气]
[攻击: 15] [防御: 8]                     ★ 新增行
────分隔线────
```

---

## 富文本标记扩展（品质色）

### 新增 SemanticTag

在 `packages/core/src/rich-text/types.ts` 的 `SemanticTag` 类型中新增 4 个品质标记：

```typescript
export type SemanticTag =
  | ... // 现有 14 个
  | 'qfine'    // 精良 绿
  | 'qrare'    // 稀有 蓝
  | 'qepic'    // 史诗 紫
  | 'qlegend'  // 传说 橙
```

### 新增色值

```typescript
// light
qfine: '#2F7A3F',   // 复用 heal 色
qrare: '#2E6B8A',   // 复用 exit 色
qepic: '#6B2F8A',   // 复用 skill 色
qlegend: '#C04020', // 复用 imp 色

// dark
qfine: '#5FBA6F',
qrare: '#6CB8D8',
qepic: '#A06FCA',
qlegend: '#FF6040',
```

---

## 影响范围

### 修改的已有文件

| 文件                                                   | 变更                           |
| ------------------------------------------------------ | ------------------------------ |
| `packages/core/src/types/messages/playerStats.ts`      | 扩展 PlayerStatsMessage        |
| `packages/core/src/types/messages/equipment.ts`        | EquipmentSlot 新增 quality     |
| `packages/core/src/rich-text/types.ts`                 | 新增品质 SemanticTag           |
| `packages/core/src/rich-text/tags.ts`                  | 新增品质色值                   |
| `server/src/engine/game-objects/item-base.ts`          | 新增 getQuality()              |
| `server/src/engine/game-objects/armor-base.ts`         | 重构 getAttributeBonus()       |
| `server/src/engine/game-objects/weapon-base.ts`        | 新增 getAttributeBonus()       |
| `server/src/engine/game-objects/player-base.ts`        | 新增 getEquipmentBonus()       |
| `server/src/engine/commands/std/wear.ts`               | 等级检查                       |
| `server/src/engine/commands/std/wield.ts`              | 双手武器 + 等级检查            |
| `server/src/engine/commands/std/examine.ts`            | 品质 + 属性加成展示            |
| `server/src/engine/commands/std/eq.ts`                 | 品质颜色                       |
| `server/src/websocket/handlers/stats.utils.ts`         | 装备加成计算                   |
| `server/src/websocket/handlers/room-utils.ts`          | sendEquipmentUpdate 含 quality |
| `server/src/websocket/handlers/command.handler.ts`     | 穿脱后推送 playerStats         |
| `client/src/stores/useGameStore.ts`                    | PlayerData 扩展                |
| `client/src/components/game/PlayerStats/index.tsx`     | 攻防行                         |
| `client/src/components/game/PlayerStats/AttrValue.tsx` | 加成显示                       |

### 新增文件

| 文件                                                     | 说明                                  |
| -------------------------------------------------------- | ------------------------------------- |
| `packages/core/src/types/equipment-bonus.ts`             | EquipmentBonus 接口 + parseRawBonus   |
| `packages/core/src/constants/quality.ts`                 | ItemQuality 枚举 + QUALITY_MULTIPLIER |
| `client/src/components/game/PlayerStats/CombatValue.tsx` | 攻防数值组件                          |

### 潜在冲突

- `derivePlayerStats()` 签名变更（新增 player 参数），需更新所有调用处
- `ArmorBase.getAttributeBonus()` 返回类型从 `Record<string, number>` 改为 `EquipmentBonus`，当前无其他调用处，风险低

## 风险点

- **资源当前值钳制**: 脱装备后 hp.current 可能需要持久化到 player 对象上，当前 `derivePlayerStats` 用 hpMax 作为 current，需要改为追踪真实当前值
  - 应对: PlayerBase 新增 `hp_current`/`mp_current`/`energy_current` 属性，初次登录设为满值

- **双手武器占用两个槽位**: `equip()` 当前检查 `position !== null` 才返回 false，双手武器需要将同一物品放到两个槽位
  - 应对: 在 `wield` 指令层处理，不修改 `equip()` 底层逻辑，副手放相同引用即可

- **品质色标记增加**: 富文本解析器和 RichText 组件需要识别新标记
  - 应对: 已有的 `ALL_TAGS` Set 和 `THEME_COLORS` 自动包含新增标记，客户端 `RichText.tsx` 无需修改

---

> CX 工作流 | Design Doc | PRD #179
