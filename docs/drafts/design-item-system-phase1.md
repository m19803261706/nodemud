# Design Doc: 物品系统 Phase 1 — 物品子类 + 基础交互 + 背包

## 关联

- PRD: #154
- Scope: #153（物品系统探讨）
- 关联已完成 Epic: #137（NPC Phase 0）、#150（NPC 信息弹窗）、#115（地图系统）
- 关联 Design Doc: #114（地图系统 — roomInfo 协议基础）、#65（Layer 3 游戏对象子类 — ItemBase 基础）

## 基于现有代码

| 模块                  | 现状                                                       | 本次变更                        |
| --------------------- | ---------------------------------------------------------- | ------------------------------- |
| `ItemBase`            | 7 个 getter（name/short/long/type/weight/value/stackable） | 扩展：新增 6 个属性方法         |
| `BaseEntity` 容器系统 | environment/inventory/moveTo 事件链完整                    | 无需修改                        |
| `BlueprintFactory`    | clone/getVirtual 完整                                      | 无需修改                        |
| `BlueprintLoader`     | 自动扫描 world/ 目录加载蓝图                               | 无需修改（自动发现 item/ 目录） |
| `GameEvents`          | GET/DROP/USE 事件已定义                                    | 无需修改                        |
| `ObjectManager`       | register/unregister/GC 完整                                | 无需修改                        |
| `RoomInfoMessage`     | short/long/exits/exitNames/coordinates/npcs                | 扩展：新增 items 字段           |
| `sendRoomInfo()`      | 收集 NPC 列表推送                                          | 扩展：同时收集物品列表          |
| `LookCommand`         | 支持无参(房间)/NPC                                         | 扩展：支持物品查看              |
| `useGameStore`        | player/location/gameLog/nearbyNpcs/activeTab               | 扩展：新增 inventory 状态       |
| `BottomNavBar`        | 5 tab（人物/技能/江湖/门派/背包）                          | 无需修改（背包 tab 已有）       |
| `WebSocketService`    | 消息监听分发机制                                           | 新增 inventoryUpdate 监听       |

## 架构概览

```
┌─ 物品生命周期 ───────────────────────────────────────────────┐
│                                                               │
│  Area.create()                                                │
│    └─ blueprintFactory.clone('item/rift-town/iron-sword')     │
│      └─ ironSword.moveTo(room)  ← 物品放入房间               │
│                                                               │
│  玩家输入 "get 铁剑"                                          │
│    └─ GetCommand.execute()                                    │
│      └─ room.findInInventory(匹配 ItemBase)                   │
│        └─ item.moveTo(player)   ← 物品移入玩家背包           │
│          └─ sendInventoryUpdate(player) → 客户端更新          │
│          └─ sendRoomInfo(player, room)  → 地面物品更新        │
│                                                               │
│  玩家输入 "i"                                                 │
│    └─ InventoryCommand.execute()                              │
│      └─ player.getInventory().filter(ItemBase)                │
│        └─ 格式化物品列表 → 返回给客户端                       │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### 数据流

```
Server                                  Client
──────                                  ──────
roomInfo { items: [...] }  ──WS──>  store.setGroundItems(items)
                                        → GameLog 显示地面物品
                                        → (预留)地面物品 UI

inventoryUpdate { items: [...] }  ──WS──>  store.setInventory(items)
                                        → Inventory 面板更新
                                        → (预留)背包图标角标
```

## 数据库设计

本 Phase 无数据库变更。物品为内存对象（BaseEntity 继承链），通过蓝图系统克隆创建。

**设计决策**: 物品不持久化到数据库（当前阶段）。服务重启后物品由 Area spawn 重新生成。玩家背包持久化留给后续 Phase（需要设计 item_instance 表）。

---

## ⚡ WebSocket 消息契约（强制章节）

> **此章节是前后端的对齐合同。exec 阶段必须严格遵守此处定义的消息类型、字段名、数据结构。**

### 消息总览

| #   | 方向 | type              | 说明                        | 触发时机              |
| --- | ---- | ----------------- | --------------------------- | --------------------- |
| 1   | S→C  | `roomInfo`        | 房间信息（扩展 items 字段） | 进场/移动/物品变化    |
| 2   | S→C  | `inventoryUpdate` | 玩家背包更新                | get/drop/buy/sell     |
| 3   | C→S  | `command`         | 指令发送（复用已有）        | get/inventory/look 等 |

**设计决策**:

- **roomInfo 扩展 items 字段** — 不新增独立的 groundItems 消息，复用已有 roomInfo 推送，保持协议一致
- **新增独立的 inventoryUpdate 消息** — 背包是玩家私有数据，不随 roomInfo 推送，独立消息触发
- **command 消息复用** — get/inventory 等指令走已有的 command handler 链路

### 消息详情

#### 1. roomInfo 扩展（服务端 → 客户端）

在现有 RoomInfoMessage 基础上新增 `items` 字段：

```json
{
  "type": "roomInfo",
  "data": {
    "short": "裂隙镇·铁匠铺",
    "long": "铁匠铺里炉火通明...",
    "exits": ["south"],
    "exitNames": { "south": "北街" },
    "coordinates": { "x": 0, "y": 2, "z": 0 },
    "npcs": [
      { "id": "npc/rift-town/blacksmith#1", "name": "老周铁匠", ... }
    ],
    "items": [
      {
        "id": "item/rift-town/iron-sword#1",
        "name": "铁剑",
        "short": "一把普通的铁剑",
        "type": "weapon"
      }
    ]
  },
  "timestamp": 1738700000000
}
```

**items 字段说明**:

| 字段    | 类型   | 必填 | 说明                                                           |
| ------- | ------ | ---- | -------------------------------------------------------------- |
| `id`    | string | ✅   | 物品实例 ID（蓝图ID#序号）                                     |
| `name`  | string | ✅   | 物品名称                                                       |
| `short` | string | ✅   | 简短描述                                                       |
| `type`  | string | ✅   | 物品大类（weapon/armor/medicine/book/container/food/key/misc） |

#### 2. inventoryUpdate（服务端 → 客户端）

**新增消息类型**，玩家背包内容变化时推送：

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
        "count": 1
      },
      {
        "id": "item/rift-town/golden-salve#2",
        "name": "金疮药",
        "short": "一瓶普通的金疮药",
        "type": "medicine",
        "weight": 1,
        "value": 20,
        "count": 3
      }
    ]
  },
  "timestamp": 1738700000000
}
```

**items 元素字段说明**:

| 字段     | 类型   | 必填 | 说明                             |
| -------- | ------ | ---- | -------------------------------- |
| `id`     | string | ✅   | 物品实例 ID                      |
| `name`   | string | ✅   | 物品名称                         |
| `short`  | string | ✅   | 简短描述                         |
| `type`   | string | ✅   | 物品大类                         |
| `weight` | number | ✅   | 重量                             |
| `value`  | number | ✅   | 基准价值                         |
| `count`  | number | ✅   | 数量（堆叠物品 > 1，非堆叠 = 1） |

**触发时机**: get 成功后、drop 成功后、buy/sell 后（Phase 2）

#### 3. command 指令（客户端 → 服务端）

复用已有 command 消息：

```json
{ "type": "command", "data": { "input": "get 铁剑" }, "timestamp": ... }
{ "type": "command", "data": { "input": "i" }, "timestamp": ... }
{ "type": "command", "data": { "input": "look 铁剑" }, "timestamp": ... }
```

指令执行结果通过 `gameLog` 消息返回（复用已有机制）。

---

## ⚡ 状态枚举对照表（强制章节）

### 物品大类 (ItemTypes)

| 枚举值 | Core 常量   | API 传输值    | TypeScript 常量 | 前端显示文本 | 说明          |
| ------ | ----------- | ------------- | --------------- | ------------ | ------------- |
| 武器   | `WEAPON`    | `"weapon"`    | `'weapon'`      | "武器"       | WeaponBase    |
| 防具   | `ARMOR`     | `"armor"`     | `'armor'`       | "防具"       | ArmorBase     |
| 药品   | `MEDICINE`  | `"medicine"`  | `'medicine'`    | "药品"       | MedicineBase  |
| 秘籍   | `BOOK`      | `"book"`      | `'book'`        | "秘籍"       | BookBase      |
| 容器   | `CONTAINER` | `"container"` | `'container'`   | "容器"       | ContainerBase |
| 食物   | `FOOD`      | `"food"`      | `'food'`        | "食物"       | FoodBase      |
| 钥匙   | `KEY`       | `"key"`       | `'key'`         | "钥匙"       | KeyBase       |
| 杂物   | `MISC`      | `"misc"`      | `'misc'`        | "杂物"       | ItemBase 默认 |

### 武器类型 (WeaponTypes)

| 枚举值 | Core 常量 | API 传输值 | 前端显示 | 说明     |
| ------ | --------- | ---------- | -------- | -------- |
| 剑     | `SWORD`   | `"sword"`  | "剑"     | 剑法技能 |
| 刀     | `BLADE`   | `"blade"`  | "刀"     | 刀法技能 |
| 枪     | `SPEAR`   | `"spear"`  | "枪"     | 枪法技能 |
| 杖     | `STAFF`   | `"staff"`  | "杖"     | 杖法技能 |
| 拳     | `FIST`    | `"fist"`   | "拳"     | 拳法技能 |
| 匕     | `DAGGER`  | `"dagger"` | "匕"     | 匕法技能 |
| 鞭     | `WHIP`    | `"whip"`   | "鞭"     | 鞭法技能 |
| 锤     | `HAMMER`  | `"hammer"` | "锤"     | 锤法技能 |
| 斧     | `AXE`     | `"axe"`    | "斧"     | 斧法技能 |

### 装备位置 (WearPositions)

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

---

## ⚡ 字段映射表（强制章节）

> **此表定义了物品从引擎对象到前端的完整字段映射链。**

### 物品通用字段映射

| #   | 引擎 dbase 键    | ItemBase getter      | API JSON 字段 | TypeScript 字段 | 类型    | 说明                  |
| --- | ---------------- | -------------------- | ------------- | --------------- | ------- | --------------------- |
| 1   | -                | `.id`                | `id`          | `id`            | string  | 实例 ID（BaseEntity） |
| 2   | `name`           | `getName()`          | `name`        | `name`          | string  | 物品名称              |
| 3   | `short`          | `getShort()`         | `short`       | `short`         | string  | 简短描述              |
| 4   | `long`           | `getLong()`          | `long`        | `long`          | string  | 详细描述（look 用）   |
| 5   | `type`           | `getType()`          | `type`        | `type`          | string  | 物品大类              |
| 6   | `weight`         | `getWeight()`        | `weight`      | `weight`        | number  | 重量                  |
| 7   | `value`          | `getValue()`         | `value`       | `value`         | number  | 基准价值              |
| 8   | `stackable`      | `isStackable()`      | -             | -               | boolean | 可堆叠（内部用）      |
| 9   | `tradeable`      | `isTradeable()`      | -             | -               | boolean | 可交易（Phase 2 用）  |
| 10  | `droppable`      | `isDroppable()`      | -             | -               | boolean | 可丢弃                |
| 11  | `unique`         | `isUnique()`         | -             | -               | boolean | 唯一物品              |
| 12  | `level_req`      | `getLevelReq()`      | -             | -               | number  | 等级要求              |
| 13  | `durability`     | `getDurability()`    | -             | -               | number  | 当前耐久              |
| 14  | `max_durability` | `getMaxDurability()` | -             | -               | number  | 最大耐久              |
| 15  | -                | (计算)               | `count`       | `count`         | number  | 堆叠数量              |

### 武器特有字段映射

| #   | dbase 键      | getter            | 类型    | 说明                 |
| --- | ------------- | ----------------- | ------- | -------------------- |
| 1   | `damage`      | `getDamage()`     | number  | 伤害值               |
| 2   | `weapon_type` | `getWeaponType()` | string  | 武器类型（见枚举表） |
| 3   | `two_handed`  | `isTwoHanded()`   | boolean | 是否双手             |

### 防具特有字段映射

| #   | dbase 键          | getter                | 类型   | 说明               |
| --- | ----------------- | --------------------- | ------ | ------------------ |
| 1   | `defense`         | `getDefense()`        | number | 防御值             |
| 2   | `wear_position`   | `getWearPosition()`   | string | 装备位（见枚举表） |
| 3   | `attribute_bonus` | `getAttributeBonus()` | Record | 属性加成           |

### 药品特有字段映射

| #   | dbase 键    | getter          | 类型   | 说明     |
| --- | ----------- | --------------- | ------ | -------- |
| 1   | `heal_hp`   | `getHealHp()`   | number | 回复气血 |
| 2   | `heal_mp`   | `getHealMp()`   | number | 回复内力 |
| 3   | `use_count` | `getUseCount()` | number | 使用次数 |
| 4   | `cooldown`  | `getCooldown()` | number | 冷却(ms) |

### TypeScript 接口定义

**Core 包** (`packages/core/src/types/messages/inventory.ts`):

```typescript
/** 地面物品简要信息（roomInfo 用） */
export interface ItemBrief {
  id: string;
  name: string;
  short: string;
  type: string;
}

/** 背包物品信息（inventoryUpdate 用） */
export interface InventoryItem {
  id: string;
  name: string;
  short: string;
  type: string;
  weight: number;
  value: number;
  count: number;
}

/** 背包更新消息（服务端 → 客户端） */
export interface InventoryUpdateMessage extends ServerMessage {
  type: 'inventoryUpdate';
  data: {
    items: InventoryItem[];
  };
}
```

**RoomInfoMessage 扩展**:

```typescript
export interface RoomInfoMessage extends ServerMessage {
  type: 'roomInfo';
  data: {
    short: string;
    long: string;
    exits: string[];
    exitNames: Record<string, string>;
    coordinates: RoomCoordinates;
    npcs: NpcBrief[];
    items: ItemBrief[]; // ← 新增
  };
}
```

---

## 后端设计

### 物品子类继承体系

```
BaseEntity
└── ItemBase (已有，扩展属性)
    ├── WeaponBase     → type 默认 'weapon'
    ├── ArmorBase      → type 默认 'armor'
    ├── MedicineBase   → type 默认 'medicine'
    ├── BookBase       → type 默认 'book'
    ├── ContainerBase  → type 默认 'container'
    ├── FoodBase       → type 默认 'food'
    └── KeyBase        → type 默认 'key'
```

每个子类的模式完全一致：

1. 继承 ItemBase
2. `static virtual = false`（可克隆）
3. 添加特有 getter 方法
4. 不覆写 `create()` — 留给具体蓝图

### 蓝图放置策略

物品通过 Area `create()` 方法放置到房间：

```typescript
// server/src/world/area/rift-town/area.ts 的 create() 中
// 在 NPC spawn 逻辑之后，追加物品放置
const sword = this.blueprintFactory.clone('item/rift-town/iron-sword');
const smithRoom = this.blueprintFactory.getVirtual('area/rift-town/smithy');
if (sword && smithRoom) {
  await sword.moveTo(smithRoom, { quiet: true });
}
```

### get 指令实现

```typescript
@Command({ name: 'get', aliases: ['take', '拿', '捡'], description: '捡起物品' })
export class GetCommand implements ICommand {
  execute(executor: LivingBase, args: string[]): CommandResult {
    // 1. 解析参数
    const targetName = args.join(' ');
    const env = executor.getEnvironment() as RoomBase;

    // 2. "get all" 处理
    if (targetName === 'all') {
      const items = env.getInventory().filter((e) => e instanceof ItemBase);
      // 逐个 moveTo(executor)
      return { success: true, message: '...', data: { action: 'get', all: true } };
    }

    // 3. 查找匹配物品
    const item = env.findInInventory(
      (e) => e instanceof ItemBase && (e as ItemBase).getName().includes(targetName),
    );

    // 4. moveTo(executor)
    // 5. 返回结果
    return {
      success: true,
      message: `你捡起了${rt('item', item.getName())}。`,
      data: { action: 'get', itemId: item.id, itemName: item.getName() },
    };
  }
}
```

### inventory 指令实现

```typescript
@Command({ name: 'inventory', aliases: ['i', '背包', '物品'], description: '查看背包' })
export class InventoryCommand implements ICommand {
  execute(executor: LivingBase, args: string[]): CommandResult {
    const items = executor.getInventory().filter((e) => e instanceof ItemBase) as ItemBase[];
    // 格式化列表（堆叠物品合并显示数量）
    return {
      success: true,
      message: formatted,
      data: { action: 'inventory', items: serialized },
    };
  }
}
```

### look 指令扩展

在现有 `LookCommand.execute()` 中，有参数时的查找顺序：

```
1. 先查玩家背包中的物品 (executor.findInInventory)
2. 再查房间中的 NPC (现有逻辑)
3. 再查房间中的物品 (env.findInInventory)
```

物品 look 返回：

```typescript
data: {
  action: 'look',
  target: 'item',
  itemId: item.id,
  name: item.getName(),
  long: item.getLong(),
  type: item.getType(),
  weight: item.getWeight(),
  value: item.getValue(),
  // 子类特有属性（如武器的 damage）
  extra: { damage: 15, weapon_type: 'sword' }
}
```

### sendRoomInfo 扩展

在现有 `sendRoomInfo()` 中，收集 NPC 之后追加物品收集：

```typescript
// 收集房间内物品列表
const items: ItemBrief[] = room
  .getInventory()
  .filter((e): e is ItemBase => e instanceof ItemBase)
  .map((item) => ({
    id: item.id,
    name: item.getName(),
    short: item.getShort(),
    type: item.getType(),
  }));
```

### sendInventoryUpdate 新增

```typescript
export function sendInventoryUpdate(player: PlayerBase): void {
  const items: InventoryItem[] = player
    .getInventory()
    .filter((e): e is ItemBase => e instanceof ItemBase)
    .map((item) => ({
      id: item.id,
      name: item.getName(),
      short: item.getShort(),
      type: item.getType(),
      weight: item.getWeight(),
      value: item.getValue(),
      count: 1, // Phase 1 暂不实现堆叠合并
    }));

  const msg = MessageFactory.create('inventoryUpdate', items);
  if (msg) player.sendToClient(MessageFactory.serialize(msg));
}
```

### get 指令成功后的推送链

```
GetCommand.execute() → CommandResult { data: { action: 'get' } }
  → command.handler.ts 检测 data.action === 'get'
    → sendInventoryUpdate(player)   // 推送背包更新
    → sendRoomInfo(player, room)    // 推送地面物品更新
```

---

## 前端设计

### 页面/组件结构

```
client/src/components/game/Inventory/
├── index.tsx              # 背包面板容器，从 store 取 inventory
└── InventoryItem.tsx      # 单个物品条目（名称 + 类型 + 数量）
```

### Store 扩展

```typescript
// useGameStore.ts 新增
interface GameState {
  // ... 现有字段
  inventory: InventoryItem[];       // 背包物品列表
  groundItems: ItemBrief[];         // 当前房间地面物品（从 roomInfo.items 提取）
}

// Actions
setInventory: (items: InventoryItem[]) => void;
setGroundItems: (items: ItemBrief[]) => void;
```

### WebSocket 监听

```typescript
// WebSocketService 或 store bridge 中新增
wsService.on('inventoryUpdate', (data) => {
  useGameStore.getState().setInventory(data.items);
});

// roomInfo 处理中追加
wsService.on('roomInfo', (data) => {
  // ... 现有 location/directions/npcs 处理
  useGameStore.getState().setGroundItems(data.items ?? []);
});
```

### Inventory 组件

遵循 Unity3D 组件模型：

```typescript
// index.tsx — 容器组件，从 store 取数据
export const Inventory = () => {
  const inventory = useGameStore(state => state.inventory);
  return (
    <ScrollView>
      {inventory.length === 0 ? <EmptyState /> : (
        inventory.map(item => <InventoryItem key={item.id} item={item} />)
      )}
    </ScrollView>
  );
};

// InventoryItem.tsx — 子组件，通过 props 接收
interface Props { item: InventoryItem }
export const InventoryItem = ({ item }: Props) => (
  <View style={s.row}>
    <Text>{item.name}</Text>
    <Text style={s.type}>{ItemTypeLabel[item.type]}</Text>
    {item.count > 1 && <Text>x{item.count}</Text>}
  </View>
);
```

### GameHomeScreen 挂载

背包面板在 `activeTab === '背包'` 时替换主内容区域，与现有 tab 切换逻辑一致。

---

## 代码路径

### 新增文件

```
packages/core/src/
├── constants/
│   └── items.ts                       # 物品类型/武器类型/装备位常量
├── types/messages/
│   └── inventory.ts                   # ItemBrief + InventoryItem + InventoryUpdateMessage
├── factory/handlers/
│   └── inventoryUpdate.ts             # @MessageHandler('inventoryUpdate')

server/src/
├── engine/game-objects/
│   ├── weapon-base.ts                 # 武器基类
│   ├── armor-base.ts                  # 防具基类
│   ├── medicine-base.ts               # 药品基类
│   ├── book-base.ts                   # 秘籍基类
│   ├── container-base.ts              # 容器基类
│   ├── food-base.ts                   # 食物基类
│   └── key-base.ts                    # 钥匙基类
├── engine/commands/std/
│   ├── get.ts                         # get/take 指令
│   └── inventory.ts                   # inventory/i 指令
├── world/item/rift-town/
│   ├── iron-sword.ts                  # 铁剑（WeaponBase）
│   ├── wooden-staff.ts                # 木棍（WeaponBase）
│   ├── cloth-armor.ts                 # 布衣（ArmorBase）
│   ├── golden-salve.ts                # 金疮药（MedicineBase）
│   ├── dry-rations.ts                 # 干粮（FoodBase）
│   ├── small-pouch.ts                 # 小包裹（ContainerBase）
│   └── basic-sword-page.ts            # 基础剑法残页（BookBase）

client/src/
├── components/game/Inventory/
│   ├── index.tsx                      # 背包面板容器
│   └── InventoryItem.tsx              # 物品条目
```

### 修改文件

```
packages/core/src/
├── types/messages/room.ts             # RoomInfoMessage 新增 items 字段
├── types/messages/index.ts            # 导出 inventory 类型
├── factory/handlers/roomInfo.ts       # create() 新增 items 参数
├── factory/index.ts                   # 导入 inventoryUpdate handler
├── index.ts                           # 导出常量和类型

server/src/
├── engine/game-objects/item-base.ts   # 新增 6 个属性方法
├── engine/game-objects/index.ts       # 导出 7 个新子类
├── engine/commands/std/look.ts        # 扩展支持物品查看
├── websocket/handlers/room-utils.ts   # sendRoomInfo 收集物品 + sendInventoryUpdate
├── websocket/handlers/command.handler.ts  # get 成功后推送
├── world/area/rift-town/area.ts       # 物品放置逻辑

client/src/
├── stores/useGameStore.ts             # 新增 inventory/groundItems 状态
├── services/WebSocketService.ts       # 新增 inventoryUpdate 监听
├── screens/GameHomeScreen.tsx         # 背包 tab 对应面板挂载
```

## 影响范围

- **新增文件**: 20 个（Core 3 + Server 16 + Client 2）
- **修改文件**: 12 个（Core 4 + Server 5 + Client 3）
- **潜在冲突**: 无 — roomInfo 扩展为追加字段（向后兼容），其余均为新增

## 风险点

| 风险                                       | 影响                     | 应对方案                                                                |
| ------------------------------------------ | ------------------------ | ----------------------------------------------------------------------- |
| roomInfo 新增 items 字段，旧客户端可能报错 | 前端解析异常             | items 字段默认为 `[]`，前端用 `data.items ?? []` 防御                   |
| 物品蓝图未被 BlueprintLoader 发现          | 物品无法创建             | 确认 `world/item/` 在扫描路径中（BlueprintLoader 按 `world/` 递归扫描） |
| get all 捡起大量物品性能问题               | 服务端卡顿               | 限制单次 get all 最大数量（如 20 个）                                   |
| 堆叠物品的 count 计算                      | inventoryUpdate 数量不准 | Phase 1 暂不实现堆叠合并，每个实例 count=1，Phase 2 再优化              |
| 服务重启后物品丢失                         | 玩家背包清空             | 当前阶段物品不持久化，已在 PRD 中排除；后续 Phase 实现持久化            |

---

> CX 工作流 | Design Doc | PRD #154
