# PRD: 物品系统 Phase 1 — 物品子类 + 基础交互 + 背包

## 基本信息

- **创建时间**: 2026-02-05 17:30
- **优先级**: P0（Phase 2 商店系统前置）
- **技术栈**: TypeScript (NestJS + React Native + 共享 Core 包)
- **关联 Scope**: #153（物品系统探讨）、#134（NPC 系统）
- **关联 Epic**: #137（NPC Phase 0，已完成）

## 功能概述

完善物品基础体系：定义 7 个物品子类（武器/防具/药品/秘籍/容器/食物/钥匙），扩展 ItemBase 通用属性，创建裂隙镇初始物品蓝图，实现 get/inventory 最小交互指令，前端背包面板展示。

**为什么是 P0**: Phase 2 商店系统需要物品子类和基础交互作为前置，没有物品蓝图商店无法卖东西，没有 get/inventory 买了物品无处可放。

## 用户场景

### 场景 1: 房间内显示地面物品

**前置**: 裂隙镇某些房间地面放置了初始物品（通过 Area spawn 或房间 create() 初始化）

**流程**:

1. 玩家进入房间，服务端推送 roomInfo
2. roomInfo 附带地面物品列表（items 字段）
3. 前端游戏日志区域显示："这里的地上有：铁剑、布衣。"
4. 或在 look 房间时显示地面物品

**验收标准**:

- roomInfo 消息包含 `items: Array<{ id, name, short, type }>` 字段
- 进入有物品的房间时，日志显示地面物品列表

### 场景 2: 捡起物品 (get)

**前置**: 房间地面有物品

**流程**:

1. 玩家输入 `get 铁剑` 或 `get all`
2. 服务端执行：
   - 在房间 inventory 中查找匹配物品
   - 检查物品是否可拾取（非固定物品）
   - 调用 `item.moveTo(player)` 将物品移入玩家 inventory
3. 日志显示："你捡起了铁剑。"
4. 推送更新：房间地面物品列表更新 + 玩家背包更新

**指令格式**:

- `get <物品名>` — 捡起指定物品
- `get all` — 捡起房间内所有可拾取物品
- 别名: `take`、`拿`、`捡`

**验收标准**:

- 成功捡起物品后，物品从房间移入玩家 inventory
- 房间其他玩家收到通知："泡泡捡起了铁剑。"
- 物品不存在时提示："这里没有这个东西。"
- `get all` 一次捡起所有可拾取物品

### 场景 3: 查看背包 (inventory)

**前置**: 玩家背包中有物品

**流程**:

1. 玩家输入 `i` 或 `inventory`
2. 服务端遍历玩家 inventory，生成物品列表
3. 返回格式化的背包内容

**显示格式**:

```
你的随身物品：
  铁剑（武器）
  布衣（防具）
  金疮药 x3（药品）
  干粮 x2（食物）
```

**指令格式**:

- `inventory` / `i` — 查看背包
- 别名: `背包`、`物品`

**验收标准**:

- 正确显示所有背包物品，含名称和类型
- 可堆叠物品显示数量（x3）
- 背包为空时提示："你什么都没有。"

### 场景 4: 前端背包面板

**前置**: 底部导航已有"背包" tab

**流程**:

1. 玩家点击底部"背包" tab
2. 显示背包面板（替换当前日志区域，或使用弹窗/抽屉）
3. 列表展示所有背包物品，每个物品显示：名称、类型图标、数量
4. 点击物品可查看详情（复用 look 物品）

**验收标准**:

- 底部"背包" tab 点击后显示物品列表
- 物品列表实时更新（捡起/丢弃后自动刷新）
- 背包为空时显示空状态提示
- 物品卡片显示名称、类型、数量

### 场景 5: 查看物品详情 (look)

**前置**: 物品在玩家背包或房间地面

**流程**:

1. 玩家输入 `look 铁剑`
2. 服务端查找匹配物品（先查背包，再查房间）
3. 返回物品详情

**显示格式**:

```
铁剑（武器）
一把普通的铁质长剑，剑身有些锈迹。
类型: 武器（剑）
重量: 3 斤
价值: 50 文
```

**验收标准**:

- look 指令支持查看背包内和地面物品
- 显示物品的 long 描述 + 类型/重量/价值等属性
- 物品不存在时提示："这里没有这个东西。"

## 详细需求

### 1. ItemBase 通用属性扩展

在现有 7 个 getter 基础上，新增以下便捷方法：

| 属性           | getter 方法          | 类型    | 默认值 | 说明              |
| -------------- | -------------------- | ------- | ------ | ----------------- |
| tradeable      | `isTradeable()`      | boolean | true   | 可交易            |
| droppable      | `isDroppable()`      | boolean | true   | 可丢弃            |
| unique         | `isUnique()`         | boolean | false  | 唯一物品          |
| level_req      | `getLevelReq()`      | number  | 0      | 等级要求          |
| durability     | `getDurability()`    | number  | -1     | 当前耐久(-1=无限) |
| max_durability | `getMaxDurability()` | number  | -1     | 最大耐久          |

### 2. 物品子类定义（7 个）

所有子类继承 ItemBase，添加各自特有的属性 getter。

#### 2.1 WeaponBase (武器)

```typescript
class WeaponBase extends ItemBase {
  getDamage(): number; // 伤害值
  getWeaponType(): string; // 武器类型（sword/blade/spear/...）
  isTwoHanded(): boolean; // 是否双手
}
```

蓝图 `create()` 中通过 `set()` 设置：damage, weapon_type, two_handed

#### 2.2 ArmorBase (防具)

```typescript
class ArmorBase extends ItemBase {
  getDefense(): number; // 防御值
  getWearPosition(): string; // 装备位（head/body/hands/feet/...）
  getAttributeBonus(): Record<string, number>; // 属性加成
}
```

备注: Phase 1 只定义类，穿戴逻辑留 Phase 3

#### 2.3 MedicineBase (药品/消耗品)

```typescript
class MedicineBase extends ItemBase {
  getHealHp(): number; // 回复气血
  getHealMp(): number; // 回复内力
  getUseCount(): number; // 可使用次数
  getCooldown(): number; // 冷却时间(ms)
}
```

备注: Phase 1 只定义类，use 指令留后续

#### 2.4 BookBase (秘籍/书籍)

```typescript
class BookBase extends ItemBase {
  getSkillName(): string; // 关联技能名
  getSkillLevel(): number; // 技能等级
  getReadRequirement(): Record<string, number>; // 阅读条件
}
```

#### 2.5 ContainerBase (容器/包裹)

```typescript
class ContainerBase extends ItemBase {
  getCapacity(): number; // 容量上限
  getWeightLimit(): number; // 重量上限
  // 重写 getInventory() 限制容量
}
```

#### 2.6 FoodBase (食物/饮品)

```typescript
class FoodBase extends ItemBase {
  getHungerRestore(): number; // 恢复饱食度
  getThirstRestore(): number; // 恢复口渴度
  getBuffType(): string; // 附加效果类型
  getBuffDuration(): number; // 效果持续时间(ms)
}
```

#### 2.7 KeyBase (钥匙/特殊物品)

```typescript
class KeyBase extends ItemBase {
  getLockId(): string; // 对应的锁 ID
  isSingleUse(): boolean; // 是否一次性
}
```

### 3. 物品类型常量 (Core 包)

```typescript
// packages/core/src/constants/items.ts

// 武器类型
export const WeaponTypes = {
  SWORD: 'sword', // 剑
  BLADE: 'blade', // 刀
  SPEAR: 'spear', // 枪
  STAFF: 'staff', // 杖/棍
  FIST: 'fist', // 拳/爪
  DAGGER: 'dagger', // 匕首
  WHIP: 'whip', // 鞭
  HAMMER: 'hammer', // 锤
  AXE: 'axe', // 斧
} as const;

// 装备位置
export const WearPositions = {
  HEAD: 'head', // 头部
  BODY: 'body', // 身体
  HANDS: 'hands', // 手部
  FEET: 'feet', // 脚部
  WAIST: 'waist', // 腰部
  WEAPON: 'weapon', // 主手武器
  OFFHAND: 'offhand', // 副手
  NECK: 'neck', // 颈部
  FINGER: 'finger', // 手指
  WRIST: 'wrist', // 腕部
} as const;

// 物品大类
export const ItemTypes = {
  WEAPON: 'weapon',
  ARMOR: 'armor',
  MEDICINE: 'medicine',
  BOOK: 'book',
  CONTAINER: 'container',
  FOOD: 'food',
  KEY: 'key',
  MISC: 'misc',
} as const;
```

### 4. 裂隙镇初始物品蓝图（5-8 个）

在 `server/src/world/item/rift-town/` 目录创建初始物品：

| 物品         | 子类          | 放置位置     | 说明                                |
| ------------ | ------------- | ------------ | ----------------------------------- |
| 铁剑         | WeaponBase    | 铁匠铺地面   | damage: 15, weapon_type: sword      |
| 木棍         | WeaponBase    | 裂谷北道地面 | damage: 5, weapon_type: staff       |
| 布衣         | ArmorBase     | 杂货铺地面   | defense: 5, wear_position: body     |
| 金疮药       | MedicineBase  | 药铺地面     | heal_hp: 50, stackable: true        |
| 干粮         | FoodBase      | 客栈地面     | hunger_restore: 30, stackable: true |
| 包裹         | ContainerBase | 杂货铺地面   | capacity: 10                        |
| 基础剑法残页 | BookBase      | 酒馆地面     | skill_name: 基础剑法                |

物品通过房间 `create()` 或 Area spawn 放置到地面。

### 5. 物品推送协议

#### 5.1 roomInfo 扩展

现有 roomInfo 消息新增 `items` 字段：

```typescript
interface RoomInfoData {
  // ... 现有字段
  items: Array<{
    id: string; // 物品实例 ID
    name: string; // 物品名称
    short: string; // 短描述
    type: string; // 物品大类 (weapon/armor/medicine/...)
  }>;
}
```

#### 5.2 背包更新消息（新增）

```typescript
// 消息类型: inventoryUpdate
interface InventoryUpdateData {
  items: Array<{
    id: string;
    name: string;
    short: string;
    type: string;
    weight: number;
    value: number;
    stackable: boolean;
    count: number; // 堆叠数量
  }>;
}
```

触发时机：玩家 get/drop/buy/sell 等导致背包变化时推送。

### 6. get 指令

| 属性   | 值                         |
| ------ | -------------------------- |
| 指令名 | get                        |
| 别名   | take, 拿, 捡               |
| 格式   | `get <物品名>` / `get all` |
| 目录   | std                        |

**执行逻辑**:

1. 解析参数（物品名或 "all"）
2. 在当前房间 inventory 中查找匹配 ItemBase
3. 检查物品是否可拾取（不是固定物品）
4. `item.moveTo(player)` — 使用已有的容器事件链
5. 广播房间消息："泡泡捡起了铁剑。"
6. 推送 inventoryUpdate 给玩家
7. 推送 roomInfo 更新（地面物品变化）

### 7. inventory 指令

| 属性   | 值                |
| ------ | ----------------- |
| 指令名 | inventory         |
| 别名   | i, 背包, 物品     |
| 格式   | `inventory` / `i` |
| 目录   | std               |

**执行逻辑**:

1. 遍历玩家 getInventory()
2. 过滤出 ItemBase 实例
3. 格式化输出物品列表
4. 可堆叠物品合并显示数量

### 8. look 指令扩展

现有 look 指令需扩展支持查看物品：

**查找顺序**: 先查玩家背包 → 再查房间 inventory

**物品 look 返回**:

```
铁剑（武器）
一把普通的铁质长剑，剑身有些锈迹。
─────────────
类型: 武器（剑）
重量: 3 斤
价值: 50 文
```

### 9. 前端背包面板

**组件结构**:

```
client/src/components/game/Inventory/
├── index.tsx            # 背包面板容器，订阅 store.inventory
├── InventoryItem.tsx    # 单个物品条目
└── ItemDetailModal.tsx  # 物品详情弹窗（可选，Phase 1 简单版可省略）
```

**Store 扩展** (`useGameStore.ts`):

- 新增 `inventory: InventoryItem[]` 状态
- 新增 `setInventory(items)` action
- WebSocket 监听 `inventoryUpdate` 消息更新 store

**UI 设计**:

- 水墨风列表，每个物品一行
- 显示：物品名 + 类型标签 + 数量（堆叠时）
- 底部"背包" tab 点击时切换到此面板

## 现有代码基础

| 模块                | 状态    | 可复用                      |
| ------------------- | ------- | --------------------------- |
| ItemBase 类         | ✅ 完整 | 直接继承扩展                |
| BaseEntity 容器系统 | ✅ 完整 | moveTo 事件链               |
| 蓝图系统            | ✅ 完整 | BlueprintFactory.clone()    |
| GC 清理             | ✅ 完整 | 无环境物品自动回收          |
| GameEvents          | ✅ 预留 | GET/DROP/USE 事件已定义     |
| 底部导航"背包" tab  | ✅ 已有 | activeTab 状态已支持        |
| NPC 蓝图模式        | ✅ 参考 | 物品蓝图可参考 NPC 蓝图结构 |

## 代码影响范围

| 层级           | 模块                                               | 变更类型                     |
| -------------- | -------------------------------------------------- | ---------------------------- |
| Core 共享包    | `packages/core/src/constants/items.ts`             | 新增                         |
| Core 共享包    | `packages/core/src/types/messages/inventory.ts`    | 新增                         |
| 后端引擎       | `server/src/engine/game-objects/item-base.ts`      | 修改（扩展属性）             |
| 后端引擎       | `server/src/engine/game-objects/weapon-base.ts`    | 新增                         |
| 后端引擎       | `server/src/engine/game-objects/armor-base.ts`     | 新增                         |
| 后端引擎       | `server/src/engine/game-objects/medicine-base.ts`  | 新增                         |
| 后端引擎       | `server/src/engine/game-objects/book-base.ts`      | 新增                         |
| 后端引擎       | `server/src/engine/game-objects/container-base.ts` | 新增                         |
| 后端引擎       | `server/src/engine/game-objects/food-base.ts`      | 新增                         |
| 后端引擎       | `server/src/engine/game-objects/key-base.ts`       | 新增                         |
| 后端世界       | `server/src/world/item/rift-town/*.ts`             | 新增（5-8 个蓝图）           |
| 后端指令       | `server/src/engine/commands/std/get.ts`            | 新增                         |
| 后端指令       | `server/src/engine/commands/std/inventory.ts`      | 新增                         |
| 后端指令       | `server/src/engine/commands/std/look.ts`           | 修改（支持物品）             |
| 后端 WebSocket | `server/src/websocket/handlers/room-utils.ts`      | 修改（roomInfo 加 items）    |
| 前端 Store     | `client/src/stores/useGameStore.ts`                | 修改（加 inventory 状态）    |
| 前端 WebSocket | `client/src/services/WebSocketService.ts`          | 修改（监听 inventoryUpdate） |
| 前端组件       | `client/src/components/game/Inventory/`            | 新增                         |

## 任务拆分（初步）

- [ ] 1-1: ItemBase 属性扩展（6 个新 getter）
- [ ] 1-2: 物品子类定义（7 个子类文件 + 导出）
- [ ] 1-3: 物品类型常量（Core 包 constants/items.ts）
- [ ] 1-4: 裂隙镇初始物品蓝图（5-8 个物品 + 房间放置）
- [ ] 1-5: get 指令实现
- [ ] 1-6: inventory 指令实现
- [ ] 1-7: look 指令扩展（支持查看物品详情）
- [ ] 1-8: roomInfo 协议扩展（附带地面物品列表）
- [ ] 1-9: inventoryUpdate 消息类型（Core + 后端推送）
- [ ] 1-10: 前端 Store inventory 状态 + WebSocket 监听
- [ ] 1-11: 前端背包面板组件

## 验收标准

- [ ] 7 个物品子类全部定义完成，有对应的 getter 方法
- [ ] ItemBase 新增 6 个属性便捷方法（tradeable/droppable/unique/level_req/durability/max_durability）
- [ ] 裂隙镇至少 5 个物品蓝图可正常克隆
- [ ] 进入有物品的房间，日志显示地面物品
- [ ] `get <物品名>` 成功捡起物品，物品从房间移入背包
- [ ] `get all` 一次捡起所有可拾取物品
- [ ] `i` / `inventory` 正确显示背包物品列表，堆叠物品显示数量
- [ ] `look <物品>` 显示物品详细信息（类型/重量/价值）
- [ ] 前端"背包" tab 点击后显示物品列表
- [ ] 背包实时更新（捡起后自动刷新）

## 不包含（明确排除）

- ❌ drop 指令（Phase 2）
- ❌ wear/wield/remove 指令（Phase 3）
- ❌ use/eat/drink 指令（Phase 3）
- ❌ 装备穿戴逻辑和属性加成（Phase 3）
- ❌ 金钱系统（Phase 2）
- ❌ 商店交易（Phase 2）
- ❌ 物品耐久度消耗（Phase 3）
- ❌ 背包容量限制（后续根据 ContainerBase 实现）

---

> CX 工作流 | PRD
