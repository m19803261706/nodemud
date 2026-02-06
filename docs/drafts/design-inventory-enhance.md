# Design Doc: 背包系统细化 -- 全屏背包页 + 日志重构 + 装备入口

## 关联

- PRD: #164
- Scope: #163（背包系统细化探讨）
- 关联已完成 Epic: #156（物品系统 Phase 1）
- 关联 Design Doc: #155（物品系统 Phase 1 — 继承其消息协议和字段映射基础）

## 基于现有代码

| 模块                  | 现状                                               | 本次变更                                |
| --------------------- | -------------------------------------------------- | --------------------------------------- |
| `ItemBase`            | 13 个 getter，无 getActions()                      | 新增 `getActions(): string[]` 方法      |
| `PlayerBase`          | 继承 LivingBase，无 equipment 属性                 | 新增 `equipment` Map 数据结构           |
| `InventoryItem`       | 7 字段（id/name/short/type/weight/value/count）    | 新增 `actions: string[]` 字段           |
| `sendInventoryUpdate` | 推送背包列表，无 actions                           | 追加 actions 字段                       |
| `GameLog/index.tsx`   | ScrollView + `key={i}` + `scrollToEnd`             | 拆分 LogScrollView，FlatList 虚拟化     |
| `useGameStore` 日志   | `LogEntry { text, color }` + `[...spread]` 追加    | 升级为 `{ id, text, color, timestamp }` |
| `Inventory/index.tsx` | 右侧小面板，ScrollView 纯列表                      | 升级为全屏页面 + 分类 Tab + 操作弹窗    |
| `command-loader.ts`   | `@Command` 装饰器 + 目录扫描自动注册               | 无需修改（新指令自动发现）              |
| `NpcInfoModal.tsx`    | 水墨风 Modal 弹窗（Overlay + Card + 按钮）         | 参考样式设计物品操作菜单                |
| 物品蓝图（7 个）      | `create()` 中 `this.set()` 初始化，无 actions 配置 | 蓝图可选 override `getActions()`        |

## 架构概览

### 装备系统数据流

```
┌─ 装备穿戴流程 ──────────────────────────────────────────────────┐
│                                                                  │
│  玩家输入 "wear 布衣" / "wield 铁剑"                             │
│    └─ WearCommand / WieldCommand.execute()                       │
│      └─ player.findInInventory(匹配 ArmorBase/WeaponBase)        │
│        └─ player.equip(item, position)                           │
│          ├─ equipment[position] = item                           │
│          ├─ item 从 inventory 移除（仍属于 player 但标记为装备） │
│          ├─ sendInventoryUpdate(player)  → 背包更新              │
│          └─ sendEquipmentUpdate(player)  → 装备栏更新            │
│                                                                  │
│  玩家输入 "remove 布衣"                                          │
│    └─ RemoveCommand.execute()                                    │
│      └─ player.unequip(position)                                 │
│        ├─ item 回到 inventory                                    │
│        ├─ equipment[position] = null                             │
│        ├─ sendInventoryUpdate(player)                            │
│        └─ sendEquipmentUpdate(player)                            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 日志系统重构数据流

```
Server                                 Client
──────                                 ──────
gameLog { text, color }  ──WS──>  store.appendLog({ id: ++counter, text, color, timestamp })
                                       ↓
                              ┌─── LogScrollView (FlatList 虚拟化) ───┐
                              │                                        │
                              │  GameLog/index.tsx     (主页面用)      │
                              │  = MapDescription + LogScrollView      │
                              │    + ActionButton                      │
                              │                                        │
                              │  InventoryPage         (背包页面用)    │
                              │  = CategoryTabs + ItemList             │
                              │    + LogScrollView                     │
                              └────────────────────────────────────────┘
```

### 全屏背包页面切换

```
GameHomeScreen
  ├─ activeTab !== '背包'  →  左右布局（GameLog + ChatPanel + Map | NpcList）
  └─ activeTab === '背包'  →  全屏背包页面 InventoryPage
                                ├─ CategoryTabs
                                ├─ ItemList (flex: 3) 或 EquipmentView
                                └─ LogScrollView (flex: 2)
```

## 数据库设计

本期无数据库变更。装备槽位数据存储在 PlayerBase 内存对象中（与 Phase 1 一致，物品不持久化）。

**设计决策**: 装备数据随服务重启丢失。持久化方案留给后续 Phase（需设计 player_equipment 表）。

---

## ⚡ WebSocket 消息契约（强制章节）

> **此章节是前后端的对齐合同。exec 阶段必须严格遵守此处定义的消息类型、字段名、数据结构。**

### 消息总览

| #   | 方向 | type              | 说明                              | 触发时机                       | 变更类型 |
| --- | ---- | ----------------- | --------------------------------- | ------------------------------ | -------- |
| 1   | S→C  | `inventoryUpdate` | 玩家背包更新（扩展 actions 字段） | get/drop/wear/wield/remove/use | 修改     |
| 2   | S→C  | `equipmentUpdate` | 玩家装备栏更新                    | wear/wield/remove              | 新增     |
| 3   | C→S  | `command`         | 指令发送（复用已有）              | drop/wear/wield/remove/eq/use  | 不变     |

### 消息详情

#### 1. inventoryUpdate 扩展（服务端 → 客户端）

在现有 inventoryUpdate 基础上，InventoryItem 新增 `actions` 字段：

```json
{
  "type": "inventoryUpdate",
  "data": {
    "items": [
      {
        "id": "item/rift-town/iron-sword#1",
        "name": "铁剑",
        "short": "一把普通的铁剑",
        "type": "weapon",
        "weight": 3,
        "value": 50,
        "count": 1,
        "actions": ["装备", "丢弃", "查看"]
      },
      {
        "id": "item/rift-town/golden-salve#2",
        "name": "金疮药",
        "short": "一瓶普通的金疮药",
        "type": "medicine",
        "weight": 1,
        "value": 20,
        "count": 3,
        "actions": ["使用", "丢弃", "查看"]
      }
    ]
  },
  "timestamp": 1738700000000
}
```

**items 元素字段说明**（加粗为新增字段）:

| 字段          | 类型         | 必填  | 说明                                            |
| ------------- | ------------ | ----- | ----------------------------------------------- |
| `id`          | string       | Y     | 物品实例 ID（继承 Phase 1）                     |
| `name`        | string       | Y     | 物品名称                                        |
| `short`       | string       | Y     | 简短描述                                        |
| `type`        | string       | Y     | 物品大类                                        |
| `weight`      | number       | Y     | 重量                                            |
| `value`       | number       | Y     | 基准价值                                        |
| `count`       | number       | Y     | 数量（堆叠物品 > 1，非堆叠 = 1）                |
| **`actions`** | **string[]** | **Y** | **可用操作列表，由 ItemBase.getActions() 返回** |

**触发时机**: get/drop/wear/wield/remove/use 成功后

#### 2. equipmentUpdate 新增（服务端 → 客户端）

**新增消息类型**，玩家装备栏变化时推送：

```json
{
  "type": "equipmentUpdate",
  "data": {
    "equipment": {
      "head": null,
      "body": {
        "id": "item/rift-town/cloth-armor#1",
        "name": "布衣",
        "type": "armor"
      },
      "hands": null,
      "feet": null,
      "waist": null,
      "weapon": {
        "id": "item/rift-town/iron-sword#1",
        "name": "铁剑",
        "type": "weapon"
      },
      "offhand": null,
      "neck": null,
      "finger": null,
      "wrist": null
    }
  },
  "timestamp": 1738700000000
}
```

**equipment 字段说明**:

| 字段      | 类型               | 说明     |
| --------- | ------------------ | -------- |
| `head`    | EquipmentSlot/null | 头部装备 |
| `body`    | EquipmentSlot/null | 身体装备 |
| `hands`   | EquipmentSlot/null | 手部装备 |
| `feet`    | EquipmentSlot/null | 脚部装备 |
| `waist`   | EquipmentSlot/null | 腰部装备 |
| `weapon`  | EquipmentSlot/null | 主手武器 |
| `offhand` | EquipmentSlot/null | 副手     |
| `neck`    | EquipmentSlot/null | 颈部装备 |
| `finger`  | EquipmentSlot/null | 手指装备 |
| `wrist`   | EquipmentSlot/null | 腕部装备 |

**EquipmentSlot 结构**:

```json
{
  "id": "item/rift-town/cloth-armor#1",
  "name": "布衣",
  "type": "armor"
}
```

| 字段   | 类型   | 说明        |
| ------ | ------ | ----------- |
| `id`   | string | 物品实例 ID |
| `name` | string | 物品名称    |
| `type` | string | 物品大类    |

**触发时机**: wear/wield/remove 成功后

#### 3. command 指令（客户端 → 服务端）

复用已有 command 消息，新指令示例：

```json
{ "type": "command", "data": { "input": "drop 铁剑" }, "timestamp": ... }
{ "type": "command", "data": { "input": "wear 布衣" }, "timestamp": ... }
{ "type": "command", "data": { "input": "wield 铁剑" }, "timestamp": ... }
{ "type": "command", "data": { "input": "remove 铁剑" }, "timestamp": ... }
{ "type": "command", "data": { "input": "eq" }, "timestamp": ... }
{ "type": "command", "data": { "input": "use 金疮药" }, "timestamp": ... }
```

指令执行结果通过 `gameLog` 消息返回（复用已有机制）。

#### 4. 物品操作菜单 → 指令映射

前端点击操作按钮后，发送对应的 command 指令：

| 操作按钮 | 发送指令          | 说明                     |
| -------- | ----------------- | ------------------------ |
| 装备     | `wield {物品名}`  | 武器类                   |
| 装备     | `wear {物品名}`   | 防具类                   |
| 丢弃     | `drop {物品名}`   | 通用                     |
| 查看     | `look {物品名}`   | 通用                     |
| 使用     | `use {物品名}`    | 消耗品                   |
| 研读     | `use {物品名}`    | 书籍类（后端统一用 use） |
| 脱下     | `remove {物品名}` | 已装备物品               |

**前端判定 "装备" 按钮对应 wear 还是 wield**: 根据 `item.type` 判断 — `weapon` 类型发送 `wield`，其余发送 `wear`。这是前端唯一需要做的类型判断。

---

## ⚡ 状态枚举对照表（强制章节）

### 物品大类 (ItemTypes) -- 继承 Phase 1

> 与 Design Doc #155 定义完全一致，不做变更。

| 枚举值 | Core 常量   | API 传输值    | TypeScript 常量 | 前端显示文本 |
| ------ | ----------- | ------------- | --------------- | ------------ |
| 武器   | `WEAPON`    | `"weapon"`    | `'weapon'`      | "武器"       |
| 防具   | `ARMOR`     | `"armor"`     | `'armor'`       | "防具"       |
| 药品   | `MEDICINE`  | `"medicine"`  | `'medicine'`    | "药品"       |
| 秘籍   | `BOOK`      | `"book"`      | `'book'`        | "秘籍"       |
| 容器   | `CONTAINER` | `"container"` | `'container'`   | "容器"       |
| 食物   | `FOOD`      | `"food"`      | `'food'`        | "食物"       |
| 钥匙   | `KEY`       | `"key"`       | `'key'`         | "钥匙"       |
| 杂物   | `MISC`      | `"misc"`      | `'misc'`        | "杂物"       |

### 装备位置 (WearPositions) -- 继承 Phase 1

> 与 Design Doc #155 定义完全一致，不做变更。

| 枚举值 | Core 常量 | API 传输值  | 前端显示 |
| ------ | --------- | ----------- | -------- |
| 头部   | `HEAD`    | `"head"`    | "头部"   |
| 身体   | `BODY`    | `"body"`    | "身体"   |
| 手部   | `HANDS`   | `"hands"`   | "手部"   |
| 脚部   | `FEET`    | `"feet"`    | "脚部"   |
| 腰部   | `WAIST`   | `"waist"`   | "腰部"   |
| 主手   | `WEAPON`  | `"weapon"`  | "主手"   |
| 副手   | `OFFHAND` | `"offhand"` | "副手"   |
| 颈部   | `NECK`    | `"neck"`    | "颈部"   |
| 手指   | `FINGER`  | `"finger"`  | "手指"   |
| 腕部   | `WRIST`   | `"wrist"`   | "腕部"   |

### 物品操作类型 (ItemActions) -- 新增

| 操作值 | 说明         | 对应指令     | 适用物品类型           |
| ------ | ------------ | ------------ | ---------------------- |
| 装备   | 穿戴/持用    | wear / wield | weapon, armor          |
| 丢弃   | 丢弃到地面   | drop         | 除不可丢弃物品外       |
| 查看   | 查看物品详情 | look         | 所有物品               |
| 使用   | 使用消耗品   | use          | medicine, food         |
| 研读   | 研读秘籍     | use          | book                   |
| 脱下   | 脱下装备     | remove       | 已装备的 weapon, armor |

### 背包分类 Tab (InventoryCategory) -- 新增

| Tab  | 过滤规则                                   | 说明                         |
| ---- | ------------------------------------------ | ---------------------------- |
| 装备 | 不过滤，切换到 EquipmentView               | 展示装备槽位                 |
| 全部 | 不过滤                                     | 显示所有背包物品             |
| 武器 | `type === 'weapon'`                        | 武器类                       |
| 防具 | `type === 'armor'`                         | 防具类                       |
| 药品 | `type === 'medicine' \|\| type === 'food'` | 消耗品合并                   |
| 杂物 | 其余类型                                   | book/container/key/misc 合并 |

---

## ⚡ 字段映射表（强制章节）

> **此表定义物品从引擎对象到前端的完整字段映射。继承 Phase 1 基础，新增 actions 字段。**

### InventoryItem 字段映射（扩展）

| #   | 引擎方法           | API JSON 字段 | TypeScript 字段 | 类型         | 变更     | 说明                  |
| --- | ------------------ | ------------- | --------------- | ------------ | -------- | --------------------- |
| 1   | `.id`              | `id`          | `id`            | string       | 继承     | 实例 ID（BaseEntity） |
| 2   | `getName()`        | `name`        | `name`          | string       | 继承     | 物品名称              |
| 3   | `getShort()`       | `short`       | `short`         | string       | 继承     | 简短描述              |
| 4   | `getType()`        | `type`        | `type`          | string       | 继承     | 物品大类              |
| 5   | `getWeight()`      | `weight`      | `weight`        | number       | 继承     | 重量                  |
| 6   | `getValue()`       | `value`       | `value`         | number       | 继承     | 基准价值              |
| 7   | (计算)             | `count`       | `count`         | number       | 继承     | 堆叠数量              |
| 8   | **`getActions()`** | **`actions`** | **`actions`**   | **string[]** | **新增** | **可用操作列表**      |

### EquipmentSlot 字段映射（新增）

| #   | 引擎方法    | API JSON 字段 | TypeScript 字段 | 类型   | 说明        |
| --- | ----------- | ------------- | --------------- | ------ | ----------- |
| 1   | `.id`       | `id`          | `id`            | string | 物品实例 ID |
| 2   | `getName()` | `name`        | `name`          | string | 物品名称    |
| 3   | `getType()` | `type`        | `type`          | string | 物品大类    |

### LogEntry 字段映射（升级）

| #   | 来源         | 字段        | 类型   | 变更     | 说明                 |
| --- | ------------ | ----------- | ------ | -------- | -------------------- |
| 1   | 自增计数器   | `id`        | number | **新增** | FlatList 稳定 key    |
| 2   | gameLog 消息 | `text`      | string | 继承     | 日志文本             |
| 3   | gameLog 消息 | `color`     | string | 继承     | 文本颜色             |
| 4   | Date.now()   | `timestamp` | number | **新增** | 时间戳，用于时间分隔 |

### 命名规范确认

- **引擎 dbase**: snake_case（如 `wear_position`）
- **引擎 getter**: camelCase（如 `getWearPosition()`）
- **API JSON**: camelCase（如 `wearPosition`）— 但本项目 InventoryItem 已有先例用全小写 `type`/`weight`
- **TypeScript**: camelCase（如 `wearPosition`）

### TypeScript 接口定义

**Core 包扩展** (`packages/core/src/types/messages/inventory.ts`):

```typescript
/** 背包物品信息（inventoryUpdate 用）— 扩展 actions */
export interface InventoryItem {
  id: string;
  name: string;
  short: string;
  type: string;
  weight: number;
  value: number;
  count: number;
  actions: string[]; // ← 新增
}

/** 装备槽位信息（equipmentUpdate 用）— 新增 */
export interface EquipmentSlot {
  id: string;
  name: string;
  type: string;
}

/** 装备栏数据 — 新增 */
export type EquipmentData = Record<string, EquipmentSlot | null>;

/** 装备栏更新消息（服务端 → 客户端）— 新增 */
export interface EquipmentUpdateMessage extends ServerMessage {
  type: 'equipmentUpdate';
  data: {
    equipment: EquipmentData;
  };
}
```

**前端日志条目升级** (`client/src/stores/useGameStore.ts`):

```typescript
/** 日志条目 — 升级版 */
export interface LogEntry {
  id: number; // 自增计数器
  text: string;
  color: string;
  timestamp: number; // Date.now()
}
```

---

## 后端设计

### ItemBase.getActions() 实现

```typescript
// server/src/engine/game-objects/item-base.ts

/** 获取物品可用操作列表（子类/蓝图可 override） */
getActions(): string[] {
  const actions: string[] = [];

  // 默认操作（所有物品都有"查看"）
  actions.push('查看');

  // 可丢弃
  if (this.isDroppable()) {
    actions.push('丢弃');
  }

  return actions;
}
```

各子类 override:

```typescript
// WeaponBase
getActions(): string[] {
  return ['装备', ...super.getActions()];
}

// ArmorBase
getActions(): string[] {
  return ['装备', ...super.getActions()];
}

// MedicineBase / FoodBase
getActions(): string[] {
  return ['使用', ...super.getActions()];
}

// BookBase
getActions(): string[] {
  return ['研读', ...super.getActions()];
}
```

蓝图级别可进一步 override（如诅咒物品只返回 `['查看']`）。

### PlayerBase 装备系统

```typescript
// server/src/engine/game-objects/player-base.ts

/** 装备槽位 Map */
private equipment: Map<string, ItemBase | null> = new Map([
  ['head', null], ['body', null], ['hands', null],
  ['feet', null], ['waist', null], ['weapon', null],
  ['offhand', null], ['neck', null], ['finger', null], ['wrist', null],
]);

/** 装备物品到指定槽位 */
equip(item: ItemBase, position: string): boolean {
  if (!this.equipment.has(position)) return false;
  if (this.equipment.get(position) !== null) return false; // 槽位已占用
  this.equipment.set(position, item);
  return true;
}

/** 脱下指定槽位的装备 */
unequip(position: string): ItemBase | null {
  const item = this.equipment.get(position) ?? null;
  if (item) this.equipment.set(position, null);
  return item;
}

/** 获取所有装备 */
getEquipment(): Map<string, ItemBase | null> {
  return this.equipment;
}

/** 查找已装备的物品（按名称） */
findEquipped(predicate: (item: ItemBase) => boolean): [string, ItemBase] | null {
  for (const [pos, item] of this.equipment) {
    if (item && predicate(item)) return [pos, item];
  }
  return null;
}
```

### 新增指令实现

#### drop 指令

```typescript
@Command({ name: 'drop', aliases: ['丢', '丢弃'], description: '丢弃物品' })
export class DropCommand implements ICommand {
  execute(executor: LivingBase, args: string[]): CommandResult {
    const targetName = args.join(' ');
    const item = executor.findInInventory(
      (e) => e instanceof ItemBase && (e as ItemBase).getName().includes(targetName),
    ) as ItemBase | null;
    if (!item) return { success: false, message: '你没有这个东西。' };
    if (!item.isDroppable()) return { success: false, message: '你无法丢弃这个东西。' };

    const env = executor.getEnvironment();
    // item.moveTo(env) 将物品从玩家移到房间
    return {
      success: true,
      message: `你丢弃了${rt('item', item.getName())}。`,
      data: { action: 'drop', itemId: item.id, itemName: item.getName() },
    };
  }
}
```

#### wear 指令

```typescript
@Command({ name: 'wear', aliases: ['穿', '穿戴'], description: '穿戴防具' })
export class WearCommand implements ICommand {
  execute(executor: LivingBase, args: string[]): CommandResult {
    const targetName = args.join(' ');
    const item = executor.findInInventory(
      (e) => e instanceof ArmorBase && (e as ArmorBase).getName().includes(targetName),
    ) as ArmorBase | null;
    if (!item) return { success: false, message: '你没有这件防具。' };

    const position = item.getWearPosition();
    const player = executor as PlayerBase;
    if (!player.equip(item, position)) {
      return { success: false, message: `你的${WearPositionLabel[position]}已经有装备了。` };
    }

    return {
      success: true,
      message: `你穿上了${rt('item', item.getName())}。`,
      data: { action: 'wear', itemId: item.id, position },
    };
  }
}
```

#### wield 指令

```typescript
@Command({ name: 'wield', aliases: ['持', '装备'], description: '装备武器' })
export class WieldCommand implements ICommand {
  execute(executor: LivingBase, args: string[]): CommandResult {
    const targetName = args.join(' ');
    const item = executor.findInInventory(
      (e) => e instanceof WeaponBase && (e as WeaponBase).getName().includes(targetName),
    ) as WeaponBase | null;
    if (!item) return { success: false, message: '你没有这件武器。' };

    const position = item.isTwoHanded() ? 'weapon' : 'weapon'; // 双手武器占主手
    const player = executor as PlayerBase;
    if (!player.equip(item, position)) {
      return { success: false, message: '你已经持有武器了。' };
    }

    return {
      success: true,
      message: `你手持${rt('item', item.getName())}。`,
      data: { action: 'wield', itemId: item.id, position },
    };
  }
}
```

#### remove 指令

```typescript
@Command({ name: 'remove', aliases: ['脱', '卸下'], description: '脱下装备' })
export class RemoveCommand implements ICommand {
  execute(executor: LivingBase, args: string[]): CommandResult {
    const targetName = args.join(' ');
    const player = executor as PlayerBase;
    const found = player.findEquipped((item) => item.getName().includes(targetName));
    if (!found) return { success: false, message: '你没有装备这个东西。' };

    const [position, item] = found;
    player.unequip(position);
    // item 回到 inventory（已在 player 中，只是标记变更）

    return {
      success: true,
      message: `你卸下了${rt('item', item.getName())}。`,
      data: { action: 'remove', itemId: item.id, position },
    };
  }
}
```

#### eq 指令

```typescript
@Command({ name: 'eq', aliases: ['装备栏'], description: '查看装备' })
export class EqCommand implements ICommand {
  execute(executor: LivingBase, args: string[]): CommandResult {
    const player = executor as PlayerBase;
    const equipment = player.getEquipment();
    // 格式化装备列表
    return {
      success: true,
      message: formatted,
      data: { action: 'eq' },
    };
  }
}
```

#### use 指令

```typescript
@Command({ name: 'use', aliases: ['使用'], description: '使用物品' })
export class UseCommand implements ICommand {
  execute(executor: LivingBase, args: string[]): CommandResult {
    const targetName = args.join(' ');
    const item = executor.findInInventory(
      (e) => e instanceof ItemBase && (e as ItemBase).getName().includes(targetName),
    ) as ItemBase | null;
    if (!item) return { success: false, message: '你没有这个东西。' };

    // 药品: 回复生命/内力
    if (item instanceof MedicineBase) {
      const healHp = item.getHealHp();
      const healMp = item.getHealMp();
      // 应用效果 + 消耗物品
      return {
        success: true,
        message: `你使用了${rt('item', item.getName())}。`,
        data: { action: 'use', itemId: item.id, consumed: true },
      };
    }

    // 食物: 回复饥饿值（简化版先回复少量生命）
    if (item instanceof FoodBase) {
      // 类似处理
    }

    // 书籍: 研读
    if (item instanceof BookBase) {
      return {
        success: true,
        message: `你翻开${rt('item', item.getName())}研读...`,
        data: { action: 'use', itemId: item.id, consumed: false },
      };
    }

    return { success: false, message: '你不知道该怎么使用这个东西。' };
  }
}
```

### command.handler 推送链扩展

```typescript
// server/src/websocket/handlers/command.handler.ts

// 已有 get 推送逻辑
if (result.success && result.data?.action === 'get') { ... }

// 新增 drop 推送
if (result.success && result.data?.action === 'drop') {
  sendInventoryUpdate(player);
  if (room) {
    sendRoomInfo(player, room, ...);
    room.broadcast(`${player.getName()}丢弃了一些东西。`, player);
  }
}

// 新增 wear/wield/remove 推送
if (result.success && ['wear', 'wield', 'remove'].includes(result.data?.action)) {
  sendInventoryUpdate(player);
  sendEquipmentUpdate(player);
}

// 新增 use 推送（消耗品被使用后更新背包）
if (result.success && result.data?.action === 'use' && result.data?.consumed) {
  sendInventoryUpdate(player);
}
```

### sendInventoryUpdate 扩展

```typescript
// server/src/websocket/handlers/room-utils.ts

export function sendInventoryUpdate(player: PlayerBase): void {
  const equipped = player.getEquipment(); // 获取已装备物品
  const equippedIds = new Set<string>();
  for (const [, item] of equipped) {
    if (item) equippedIds.add(item.id);
  }

  const items: InventoryItem[] = player
    .getInventory()
    .filter((e): e is ItemBase => e instanceof ItemBase)
    .filter((item) => !equippedIds.has(item.id)) // 排除已装备的物品
    .map((item) => ({
      id: item.id,
      name: item.getName(),
      short: item.getShort(),
      type: item.getType(),
      weight: item.getWeight(),
      value: item.getValue(),
      count: 1,
      actions: item.getActions(), // ← 新增
    }));

  const msg = MessageFactory.create('inventoryUpdate', items);
  if (msg) player.sendToClient(MessageFactory.serialize(msg));
}
```

### sendEquipmentUpdate 新增

```typescript
// server/src/websocket/handlers/room-utils.ts

export function sendEquipmentUpdate(player: PlayerBase): void {
  const equipment: Record<string, EquipmentSlot | null> = {};
  for (const [pos, item] of player.getEquipment()) {
    equipment[pos] = item ? { id: item.id, name: item.getName(), type: item.getType() } : null;
  }

  const msg = MessageFactory.create('equipmentUpdate', equipment);
  if (msg) player.sendToClient(MessageFactory.serialize(msg));
}
```

---

## 前端设计

### 页面/组件结构

```
client/src/
├── components/game/
│   ├── shared/
│   │   └── LogScrollView.tsx        # 新增: 纯日志虚拟滚动 (FlatList + 智能滚动)
│   ├── GameLog/
│   │   ├── index.tsx                # 修改: 替换 ScrollView 为 LogScrollView
│   │   ├── LogEntry.tsx             # 不变
│   │   ├── ActionButton.tsx         # 不变
│   │   └── MapDescription.tsx       # 不变
│   └── Inventory/
│       ├── index.tsx                # 重写: 全屏背包页面容器
│       ├── CategoryTabs.tsx         # 新增: 分类 Tab 栏
│       ├── ItemList.tsx             # 新增: 物品列表（FlatList）
│       ├── ItemRow.tsx              # 重命名: InventoryItemRow -> ItemRow，增加点击事件
│       ├── ItemActionSheet.tsx      # 新增: 物品操作弹窗（水墨风）
│       └── EquipmentView.tsx        # 新增: 装备槽位展示
├── stores/
│   └── useGameStore.ts              # 修改: LogEntry 升级 + equipment 状态 + 日志 ID
```

### LogScrollView 共享组件

```typescript
// client/src/components/game/shared/LogScrollView.tsx

interface LogScrollViewProps {
  style?: ViewStyle;
}

export const LogScrollView = ({ style }: LogScrollViewProps) => {
  const gameLog = useGameStore(state => state.gameLog);
  const flatListRef = useRef<FlatList>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  // FlatList 虚拟化
  const renderItem = useCallback(({ item }: { item: LogEntry }) => (
    <LogEntry text={item.text} color={item.color} />
  ), []);

  const keyExtractor = useCallback((item: LogEntry) => String(item.id), []);

  // 固定行高优化
  const getItemLayout = useCallback((_: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }), []);

  // 智能自动滚动
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceFromBottom = contentSize.height - contentOffset.y - layoutMeasurement.height;
    setIsAtBottom(distanceFromBottom < 50);
  }, []);

  useEffect(() => {
    if (isAtBottom && gameLog.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    } else if (!isAtBottom && gameLog.length > prevLength) {
      setHasNewMessage(true);
    }
  }, [gameLog.length]);

  const scrollToBottom = useCallback(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
    setHasNewMessage(false);
  }, []);

  return (
    <View style={[s.container, style]}>
      <FlatList
        ref={flatListRef}
        data={gameLog}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        initialNumToRender={20}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
      {hasNewMessage && !isAtBottom && (
        <TouchableOpacity style={s.newMessageBadge} onPress={scrollToBottom}>
          <Text style={s.newMessageText}>新消息</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
```

### Store 扩展

```typescript
// useGameStore.ts 扩展

interface GameState {
  // 日志 — 升级
  gameLog: LogEntry[];           // LogEntry 新增 id + timestamp
  appendLog: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void;  // 自动添加 id 和 timestamp

  // 装备 — 新增
  equipment: EquipmentData;
  setEquipment: (eq: EquipmentData) => void;
}

// 实现
let logIdCounter = 0;

appendLog: (entry) => set(state => ({
  gameLog: [...state.gameLog, {
    ...entry,
    id: ++logIdCounter,
    timestamp: Date.now(),
  }],
})),

equipment: {
  head: null, body: null, hands: null, feet: null, waist: null,
  weapon: null, offhand: null, neck: null, finger: null, wrist: null,
},
setEquipment: (eq) => set({ equipment: eq }),
```

### WebSocket 监听扩展

```typescript
// App.tsx 新增
const handleEquipmentUpdate = (data: any) => {
  useGameStore.getState().setEquipment(data.equipment ?? {});
};
wsService.on('equipmentUpdate', handleEquipmentUpdate);
```

### InventoryPage 全屏背包页面

```typescript
// client/src/components/game/Inventory/index.tsx

export const InventoryPage = () => {
  const inventory = useGameStore(state => state.inventory);
  const equipment = useGameStore(state => state.equipment);
  const [activeCategory, setActiveCategory] = useState('全部');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // 分类过滤
  const filteredItems = useMemo(() => {
    if (activeCategory === '全部') return inventory;
    // ... 按分类过滤
  }, [inventory, activeCategory]);

  return (
    <View style={s.container}>
      <CategoryTabs active={activeCategory} onChange={setActiveCategory} />
      {activeCategory === '装备' ? (
        <EquipmentView equipment={equipment} style={{ flex: 3 }} />
      ) : (
        <ItemList items={filteredItems} onItemPress={setSelectedItem} style={{ flex: 3 }} />
      )}
      <LogScrollView style={{ flex: 2 }} />
      {selectedItem && (
        <ItemActionSheet item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </View>
  );
};
```

### GameHomeScreen 页面切换

```typescript
// client/src/screens/GameHomeScreen.tsx

export const GameHomeScreen = () => {
  const activeTab = useGameStore(state => state.activeTab);

  return (
    <LinearGradient ...>
      <View style={[s.safeArea, { paddingTop: insets.top }]}>
        <PlayerStats />
        {activeTab === '背包' ? (
          <InventoryPage />
        ) : (
          <>
            <LocationHeader />
            <View style={s.mainContent}>
              <View style={s.leftPanel}>
                <GameLog />
                <ChatPanel />
                <MapNavigation />
              </View>
              <NpcList />
            </View>
          </>
        )}
        <BottomNavBar />
      </View>
    </LinearGradient>
  );
};
```

---

## 影响范围

### 新增文件

```
packages/core/src/
├── types/messages/equipment.ts          # EquipmentSlot + EquipmentData + EquipmentUpdateMessage
├── factory/handlers/equipmentUpdate.ts  # @MessageHandler('equipmentUpdate')

server/src/
├── engine/commands/std/drop.ts          # drop 指令
├── engine/commands/std/wear.ts          # wear 指令
├── engine/commands/std/wield.ts         # wield 指令
├── engine/commands/std/remove.ts        # remove 指令
├── engine/commands/std/eq.ts            # eq 指令
├── engine/commands/std/use.ts           # use 指令

client/src/
├── components/game/shared/LogScrollView.tsx    # 日志虚拟滚动共享组件
├── components/game/Inventory/CategoryTabs.tsx  # 分类 Tab 栏
├── components/game/Inventory/ItemList.tsx      # 物品列表
├── components/game/Inventory/ItemActionSheet.tsx  # 物品操作弹窗
├── components/game/Inventory/EquipmentView.tsx # 装备槽位展示
```

共 13 个新增文件。

### 修改文件

```
packages/core/src/
├── types/messages/inventory.ts          # InventoryItem 新增 actions 字段
├── types/messages/index.ts              # 导出 equipment 类型
├── factory/index.ts                     # 导入 equipmentUpdate handler
├── index.ts                             # 导出新类型

server/src/
├── engine/game-objects/item-base.ts     # 新增 getActions()
├── engine/game-objects/weapon-base.ts   # override getActions()
├── engine/game-objects/armor-base.ts    # override getActions()
├── engine/game-objects/medicine-base.ts # override getActions()
├── engine/game-objects/food-base.ts     # override getActions()
├── engine/game-objects/book-base.ts     # override getActions()
├── engine/game-objects/player-base.ts   # 新增 equipment 数据结构 + equip/unequip
├── websocket/handlers/room-utils.ts     # sendInventoryUpdate 扩展 actions + sendEquipmentUpdate 新增
├── websocket/handlers/command.handler.ts # 新增 drop/wear/wield/remove/use 推送链

client/src/
├── stores/useGameStore.ts               # LogEntry 升级 + equipment 状态 + appendLog 自增 id
├── components/game/GameLog/index.tsx    # ScrollView → LogScrollView 替换
├── components/game/Inventory/index.tsx  # 重写为全屏背包页面
├── components/game/Inventory/InventoryItemRow.tsx  # 重命名 + 增加点击事件 (或删除，被 ItemRow 替代)
├── screens/GameHomeScreen.tsx           # 背包页面切换逻辑
├── App.tsx                              # 新增 equipmentUpdate 监听
```

共 19 个修改文件。

### 潜在冲突

- `InventoryItem` 接口新增 `actions` 字段为 **非向后兼容变更**，但前端和后端同时更新，不存在版本不一致问题
- `GameLog` 组件 ScrollView → FlatList 替换，需确保 LogEntry 组件接口不变

## 风险点

| 风险                                    | 影响                      | 应对方案                                                          |
| --------------------------------------- | ------------------------- | ----------------------------------------------------------------- |
| FlatList getItemLayout 假设固定行高     | 多行日志高度不一致        | LogEntry 使用 `numberOfLines={1}` 强制单行，或改用动态行高        |
| 装备物品是否从 inventory 中移除         | 背包列表和装备列表重复    | equip 后从 inventory 过滤掉已装备物品（通过 equippedIds Set）     |
| appendLog 的 `[...spread]` 在日志量大时 | 内存分配开销              | 当前保持 spread，观察性能；如有问题可改用 immer 或 linked list    |
| 物品操作按钮 "装备" 需判断 wear/wield   | 前端需知道 item.type      | 这是前端唯一的类型判断；后续可改为后端直接返回指令名              |
| 已装备物品的 actions 需包含 "脱下"      | getActions 需感知装备状态 | getActions 传入 context 参数，或在 sendInventoryUpdate 时动态计算 |

---

> CX 工作流 | Design Doc | PRD #164
