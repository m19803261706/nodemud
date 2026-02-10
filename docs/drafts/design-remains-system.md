# Design Doc: 残骸系统 — 死亡掉落 + 容器指令 + 地面物品展示

## 关联

- PRD: #208
- Scope: #207
- 物品系统 Design: #155（ItemBase / ContainerBase / ItemBrief 定义）
- 战斗系统 Design: #198（CombatManager / die() / endCombat 流程）
- NPC 弹窗 Design: #149（NpcInfoModal 模式）
- 项目蓝图: #1

## 基于现有代码

### 可直接复用

| 模块                     | 文件                                                  | 说明                                          |
| ------------------------ | ----------------------------------------------------- | --------------------------------------------- |
| ContainerBase            | `server/src/engine/game-objects/container-base.ts`    | 容器基类（仅 19 行，需完善）                  |
| BaseEntity inventory     | `server/src/engine/base-entity.ts`                    | `_inventory: Set` + `moveTo` + `getInventory` |
| handleInventoryOnDestroy | `server/src/engine/base-entity.ts:275-281`            | 销毁时内容物移至上层（残骸需覆写为空操作）    |
| HeartbeatManager         | `server/src/engine/heartbeat-manager.ts`              | 心跳注册，驱动衰腐倒计时                      |
| ItemBase                 | `server/src/engine/game-objects/item-base.ts`         | 物品属性体系（name/type/weight/quality 等）   |
| NpcBase.die()            | `server/src/engine/game-objects/npc-base.ts:77-86`    | 当前：super.die → 广播 → destroy              |
| SpawnManager             | `server/src/engine/spawn-manager.ts`                  | scheduleRespawn（死亡改造后无需改动）         |
| get 指令                 | `server/src/engine/commands/std/get.ts`               | 支持 `get all` / `get 物品名`，扩展 from      |
| look 指令                | `server/src/engine/commands/std/look.ts`              | 搜索顺序：背包→NPC→地面物品                   |
| examine 指令             | `server/src/engine/commands/std/examine.ts`           | 返回 ItemExamineData                          |
| NpcInfoModal             | `client/src/components/game/NpcList/NpcInfoModal.tsx` | 弹窗结构参考                                  |
| NpcList                  | `client/src/components/game/NpcList/index.tsx`        | 卡片列表参考                                  |
| roomInfo handler         | `packages/core/src/factory/handlers/roomInfo.ts`      | 房间信息消息格式                              |

### 关键发现

1. **ContainerBase 极简**：仅 `getCapacity()` 和 `getWeightLimit()` 两个方法，无 canAccept/getContents 等 API
2. **NpcBase.die() 立即销毁**：`destroy()` 调用 `handleInventoryOnDestroy()` 将物品散落到房间，需改为先创建残骸再销毁
3. **get 指令解析简单**：args 直接作为物品名，无 from 语法，需扩展
4. **ItemBrief 仅 4 字段**：`{ id, name, short, type }`，需扩展容器信息
5. **NpcList 模式成熟**：点击卡片 → sendCommand('look xxx') → store.npcDetail → NpcInfoModal，物品弹窗可复用此模式

## 架构概览

```
                    ┌──────────────┐
                    │ CombatManager │
                    │  endCombat()  │
                    └──────┬───────┘
                           │ reason=victory/defeat
                    ┌──────▼───────┐
                    │ LivingBase   │
                    │   die()      │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
        ┌─────▼─────┐            ┌─────▼─────┐
        │ NpcBase   │            │ PlayerBase │
        │ die():    │            │ die():     │
        │ 创建残骸   │            │ 创建空残骸  │
        │ 转移装备   │            │ (不掉物品)  │
        │ 转移背包   │            │ 放入房间    │
        │ 放入房间   │            │ revive()   │
        │ destroy() │            └───────────┘
        └───────────┘
              │
       ┌──────▼──────┐
       │ RemainsBase  │ (新增，继承 ContainerBase)
       │ - sourceName │
       │ - decayTimer │
       │ - 心跳衰腐   │
       │ - 10min 消失  │
       └──────┬──────┘
              │ roomInfo 推送
              ▼
  ┌────────────────────────┐
  │ Client: NpcList 区域    │
  │ ├── NpcCard (已有)      │
  │ ├── ItemCard (新增)     │  ← 地面物品/残骸卡片
  │ └── ItemInfoModal(新增) │  ← 物品/容器弹窗
  └────────────────────────┘
```

### 数据流

```
1. NPC 死亡
   → NpcBase.die()
   → 创建 RemainsBase
   → NPC 装备/物品 moveTo 残骸
   → 残骸 moveTo 房间
   → destroy NPC
   → sendRoomInfo (含残骸在 items 列表)
   → 前端更新物品卡片

2. 玩家搜刮残骸
   → 点击残骸卡片 → sendCommand('look 残骸')
   → commandResult → store.itemDetail → ItemInfoModal
   → 点击 [取出] → sendCommand('get 铁剑 from 残骸')
   → commandResult → inventoryUpdate + roomInfo 刷新

3. 残骸腐烂
   → RemainsBase.onHeartbeat() 每 tick 递减
   → decayTimer <= 0 → 广播腐烂消息 → destroy()
   → handleInventoryOnDestroy 空操作（内容物一并销毁）
   → 房间推送 roomInfo（残骸消失）
```

## ⚡ 消息协议契约

> 本项目使用 WebSocket + MessageFactory 协议，非 REST API。以下定义前后端消息格式。

### 消息总览

| #   | 消息类型          | 方向 | 说明                                         | 变更类型 |
| --- | ----------------- | ---- | -------------------------------------------- | -------- |
| 1   | `roomInfo`        | S→C  | 房间信息（items 字段扩展）                   | 修改     |
| 2   | `commandResult`   | S→C  | 指令结果（新增 get_from/put/look_container） | 扩展     |
| 3   | `inventoryUpdate` | S→C  | 背包更新（已有，无需改动）                   | 不变     |

### 消息详情

#### 1. roomInfo（修改：items 字段扩展）

**当前 ItemBrief**:

```typescript
interface ItemBrief {
  id: string;
  name: string;
  short: string;
  type: string;
}
```

**扩展后 ItemBrief**:

```typescript
interface ItemBrief {
  id: string;
  name: string;
  short: string;
  type: string;
  // ---- 新增字段 ----
  isContainer?: boolean; // 是否为容器
  isRemains?: boolean; // 是否为残骸（前端特殊样式）
  contentCount?: number; // 内容物数量（仅容器有值）
}
```

> 不在 ItemBrief 中传输完整内容物列表（避免 roomInfo 过大），内容物通过 `look/examine` 指令按需获取。

#### 2. commandResult — look 容器结果

当 `look` 目标为容器时，返回容器详情 + 内容物列表：

```json
{
  "type": "commandResult",
  "data": {
    "success": true,
    "message": "[item]北门卫兵的残骸[/item]，散发着余温。\n残骸中有：\n  [item]铁剑[/item]\n  [item]皮甲[/item]",
    "data": {
      "action": "look",
      "target": "container",
      "containerId": "remains#1",
      "containerName": "北门卫兵的残骸",
      "isRemains": true,
      "contents": [
        { "id": "item#1", "name": "铁剑", "short": "铁剑", "type": "weapon" },
        { "id": "item#2", "name": "皮甲", "short": "皮甲", "type": "armor" }
      ]
    }
  }
}
```

#### 3. commandResult — get from 结果

```json
{
  "type": "commandResult",
  "data": {
    "success": true,
    "message": "你从[item]北门卫兵的残骸[/item]中取出了[item]铁剑[/item]。",
    "data": {
      "action": "get_from",
      "itemId": "item#1",
      "itemName": "铁剑",
      "containerId": "remains#1",
      "containerName": "北门卫兵的残骸"
    }
  }
}
```

#### 4. commandResult — put in 结果

```json
{
  "type": "commandResult",
  "data": {
    "success": true,
    "message": "你把[item]治伤药[/item]放入了[item]北门卫兵的残骸[/item]。",
    "data": {
      "action": "put",
      "itemId": "item#3",
      "itemName": "治伤药",
      "containerId": "remains#1",
      "containerName": "北门卫兵的残骸"
    }
  }
}
```

## ⚡ 类型与字段映射表

### ItemBrief 扩展字段

| #   | 字段         | 类型    | 必填 | 说明        | 前端用途       |
| --- | ------------ | ------- | ---- | ----------- | -------------- |
| 1   | id           | string  | ✅   | 物品实例 ID | 唯一标识       |
| 2   | name         | string  | ✅   | 物品名称    | 卡片标题       |
| 3   | short        | string  | ✅   | 简短描述    | 卡片副标题     |
| 4   | type         | string  | ✅   | 物品类型    | 类型标签       |
| 5   | isContainer  | boolean | ❌   | 是否为容器  | 弹窗展示内容物 |
| 6   | isRemains    | boolean | ❌   | 是否为残骸  | 特殊卡片样式   |
| 7   | contentCount | number  | ❌   | 内容物数量  | 卡片角标       |

### ContainerLookData（容器查看数据）

| #   | 字段          | 类型          | 必填 | 说明        |
| --- | ------------- | ------------- | ---- | ----------- |
| 1   | action        | `'look'`      | ✅   | 动作标识    |
| 2   | target        | `'container'` | ✅   | 目标类型    |
| 3   | containerId   | string        | ✅   | 容器实例 ID |
| 4   | containerName | string        | ✅   | 容器名称    |
| 5   | isRemains     | boolean       | ✅   | 是否为残骸  |
| 6   | contents      | ItemBrief[]   | ✅   | 内容物列表  |

### 前端 TypeScript 类型定义

```typescript
/** 容器查看结果（look 容器时 commandResult.data.data） */
interface ContainerLookData {
  action: 'look';
  target: 'container';
  containerId: string;
  containerName: string;
  isRemains: boolean;
  contents: ItemBrief[];
}

/** 物品弹窗详情（store 中存储） */
interface ItemDetailData {
  id: string;
  name: string;
  short: string;
  type: string;
  long?: string;
  quality?: number;
  // 容器相关
  isContainer?: boolean;
  isRemains?: boolean;
  contents?: ItemBrief[];
}
```

## 后端设计

### 新增文件

```
server/src/engine/game-objects/remains-base.ts    # 残骸类
server/src/engine/commands/std/put.ts             # put 指令
```

### 修改文件

```
server/src/engine/game-objects/container-base.ts  # 完善容器 API
server/src/engine/game-objects/npc-base.ts        # die() 改造
server/src/engine/game-objects/player-base.ts     # die() 增加空残骸
server/src/engine/commands/std/get.ts             # 扩展 from 语法
server/src/engine/commands/std/look.ts            # 容器内容展示
server/src/engine/commands/std/examine.ts         # 容器内容展示
server/src/websocket/handlers/room-utils.ts       # sendRoomInfo 适配 ItemBrief 新字段
server/src/websocket/handlers/command.handler.ts  # get_from/put 结果处理
```

### RemainsBase 类设计

```typescript
/** 残骸 — 死亡后留下的容器物品 */
export class RemainsBase extends ContainerBase {
  static virtual = false;

  /** 腐烂剩余时间（秒） */
  private decayRemaining: number;

  constructor(id: string, sourceName: string) {
    super(id);
    this.set('name', `${sourceName}的残骸`);
    this.set('short', `${sourceName}的残骸`);
    this.set('long', `${sourceName}的残骸，散发着余温。`);
    this.set('type', 'remains');
    this.set('source_name', sourceName);
    this.set('droppable', true);
    this.set('tradeable', false);
    this.set('stackable', false);
    this.set('capacity', 50); // 足够容纳 NPC 全部物品
    this.decayRemaining = 600; // 10 分钟
  }

  /** 心跳：衰腐倒计时 */
  onHeartbeat(): void {
    this.decayRemaining -= 1;
    if (this.decayRemaining <= 0) {
      this.decay();
    }
  }

  /** 腐烂消失 */
  private decay(): void {
    const env = this.getEnvironment();
    if (env) {
      const { RoomBase } = require('./room-base');
      if (env instanceof RoomBase) {
        env.broadcast(`[item]${this.getName()}[/item]化为尘土，消散了。`);
      }
    }
    this.destroy();
  }

  /** 覆写：销毁时内容物一并消失，不散落 */
  protected handleInventoryOnDestroy(): void {
    for (const child of [...this.getInventory()]) {
      child.destroy();
    }
  }

  /** 覆写 onCleanUp：无环境时可被 GC 回收 */
  public onCleanUp(): boolean {
    return !this.getEnvironment();
  }
}
```

### ContainerBase 完善

```typescript
export class ContainerBase extends ItemBase {
  static virtual = false;

  getCapacity(): number {
    return this.get<number>('capacity') ?? 10;
  }

  getWeightLimit(): number {
    return this.get<number>('weight_limit') ?? 100;
  }

  /** 检查是否可接受物品 */
  canAccept(item: ItemBase): { ok: boolean; reason?: string } {
    const current = this.getInventory().length;
    if (current >= this.getCapacity()) {
      return { ok: false, reason: '容器已满' };
    }
    return { ok: true };
  }

  /** 获取内容物列表 */
  getContents(): ItemBase[] {
    return this.getInventory().filter((e): e is ItemBase => e instanceof ItemBase);
  }

  /** 获取内容物简要信息（用于网络传输） */
  getContentsBrief(): { id: string; name: string; short: string; type: string }[] {
    return this.getContents().map((item) => ({
      id: item.id,
      name: item.getName(),
      short: item.getShort(),
      type: item.getType(),
    }));
  }
}
```

### NpcBase.die() 改造

```typescript
die(): void {
  super.die();
  const env = this.getEnvironment();

  // 创建残骸
  const remainsId = ServiceLocator.objectManager.nextInstanceId('remains');
  const remains = new RemainsBase(remainsId, this.getName());
  ServiceLocator.objectManager.register(remains);
  ServiceLocator.heartbeatManager.register(remains, 1000);

  // 转移装备到残骸
  for (const [pos, item] of this.getEquipment()) {
    if (item) {
      this.unequip(pos);
      item.moveTo(remains, { quiet: true });
    }
  }

  // 转移背包物品到残骸
  for (const child of [...this.getInventory()]) {
    if (child instanceof ItemBase) {
      child.moveTo(remains, { quiet: true });
    }
  }

  // 残骸放入房间
  if (env) {
    const { RoomBase } = require('./room-base');
    if (env instanceof RoomBase) {
      remains.moveTo(env, { quiet: true });
      env.broadcast(`[npc]${this.getName()}[/npc]倒在了地上，留下了一具残骸。`);
    }
  }

  // 销毁 NPC（inventory 已清空，不会散落）
  this.destroy();
}
```

### get 指令 from 语法扩展

```typescript
execute(executor: LivingBase, args: string[]): CommandResult {
  if (args.length === 0) return { success: false, message: '取什么？' };

  // 检测 from / 从 关键词
  const fromIdx = args.findIndex(a => a === 'from' || a === '从');
  if (fromIdx > 0) {
    const itemName = args.slice(0, fromIdx).join(' ');
    const containerName = args.slice(fromIdx + 1).join(' ');
    return this.getFromContainer(executor, itemName, containerName);
  }

  // 原有逻辑: get all / get 物品名
  // ...
}

private getFromContainer(executor: LivingBase, itemName: string, containerName: string): CommandResult {
  // 查找容器：房间地面 → 背包
  const container = this.findContainer(executor, containerName);
  if (!container) return { success: false, message: `这里没有${containerName}。` };

  // 查找容器内物品
  const item = container.getContents().find(i => i.getName().includes(itemName));
  if (!item) return { success: false, message: `${containerName}中没有${itemName}。` };

  // 物品移到玩家背包
  item.moveTo(executor, { quiet: true });

  return {
    success: true,
    message: `你从[item]${container.getName()}[/item]中取出了[item]${item.getName()}[/item]。`,
    data: { action: 'get_from', itemId: item.id, itemName: item.getName(),
            containerId: container.id, containerName: container.getName() },
  };
}
```

### put 指令设计

```typescript
@Command({ name: 'put', aliases: ['放', '放入'], description: '放入容器' })
export class PutCommand implements ICommand {
  execute(executor: LivingBase, args: string[]): CommandResult {
    // 检测 in / 进 / 里 关键词
    const inIdx = args.findIndex((a) => ['in', '进', '里'].includes(a));
    if (inIdx <= 0) return { success: false, message: '用法：put <物品> in <容器>' };

    const itemName = args.slice(0, inIdx).join(' ');
    const containerName = args.slice(inIdx + 1).join(' ');

    // 查找物品：玩家背包
    const item = executor
      .getInventory()
      .filter((e): e is ItemBase => e instanceof ItemBase)
      .find((i) => i.getName().includes(itemName));
    if (!item) return { success: false, message: `你没有${itemName}。` };

    // 查找容器：房间地面 → 背包
    const container = this.findContainer(executor, containerName);
    if (!container) return { success: false, message: `这里没有${containerName}。` };

    // 容量检查
    const check = container.canAccept(item);
    if (!check.ok) return { success: false, message: check.reason! };

    // 物品移入容器
    item.moveTo(container, { quiet: true });

    return {
      success: true,
      message: `你把[item]${item.getName()}[/item]放入了[item]${container.getName()}[/item]。`,
      data: {
        action: 'put',
        itemId: item.id,
        itemName: item.getName(),
        containerId: container.id,
        containerName: container.getName(),
      },
    };
  }
}
```

## 前端设计

### 新增文件

```
client/src/components/game/NpcList/ItemCard.tsx        # 地面物品卡片
client/src/components/game/NpcList/ItemInfoModal.tsx    # 物品/容器弹窗
```

### 修改文件

```
client/src/components/game/NpcList/index.tsx            # 添加物品卡片渲染
client/src/stores/useGameStore.ts                       # 新增 itemDetail 状态
client/App.tsx                                          # commandResult 处理扩展
packages/core/src/types/messages/inventory.ts           # ItemBrief 扩展
packages/core/src/factory/handlers/roomInfo.ts          # validate 适配
```

### 组件结构

```
NpcList/
├── index.tsx              # 区域容器（NPC + 物品卡片）
├── NpcCard.tsx            # NPC 卡片（已有）
├── NpcInfoModal.tsx       # NPC 弹窗（已有）
├── ItemCard.tsx           # 物品卡片（新增）
└── ItemInfoModal.tsx      # 物品弹窗（新增）
```

### ItemCard 组件

```typescript
interface ItemCardProps {
  item: ItemBrief;
  onPress: () => void;
}
```

- 普通物品：物品名 + 类型标签，底色 `#EDE8DD`
- 残骸：物品名 + 内容物数量角标，底色 `#E0D8CB`，左侧特殊图标

### ItemInfoModal 组件

```typescript
interface ItemInfoModalProps {
  detail: ItemDetailData | null;
  onClose: () => void;
  onGet: (itemName: string) => void; // 拾取
  onGetFrom: (itemName: string, containerName: string) => void; // 从容器取出
  onExamine: (itemName: string) => void; // 鉴定
}
```

- 顶部：物品名称 + 类型
- 中部：物品描述
- 容器类额外区域：内容物列表，每项有 [取出] 按钮
- 底部：[拾取] [鉴定] [关闭] 按钮

### Store 扩展

```typescript
// useGameStore 新增
itemDetail: ItemDetailData | null;
setItemDetail: (data: ItemDetailData | null) => void;
```

### App.tsx commandResult 处理

```typescript
// 扩展 handleCommandResult
if (data.data?.action === 'look' && data.data?.target === 'container') {
  useGameStore.getState().setItemDetail(data.data);
  return;
}
if (data.data?.action === 'look' && data.data?.target === 'item') {
  useGameStore.getState().setItemDetail(data.data);
  return;
}
// get_from / put 成功后刷新 roomInfo + inventoryUpdate
if (['get_from', 'put'].includes(data.data?.action)) {
  // roomInfo 和 inventoryUpdate 由服务端推送，前端自动更新
}
```

## 指令处理后推送

### command.handler.ts 扩展

```typescript
// get_from 成功后：推送 inventoryUpdate + roomInfo
if (result.success && result.data?.action === 'get_from') {
  sendInventoryUpdate(player);
  const room = player.getEnvironment() as RoomBase | null;
  if (room) sendRoomInfo(player, room, this.blueprintFactory);
}

// put 成功后：推送 inventoryUpdate + roomInfo
if (result.success && result.data?.action === 'put') {
  sendInventoryUpdate(player);
  const room = player.getEnvironment() as RoomBase | null;
  if (room) sendRoomInfo(player, room, this.blueprintFactory);
}
```

## 影响范围

### 修改的已有文件

| 文件                                               | 变更内容                                    |
| -------------------------------------------------- | ------------------------------------------- |
| `packages/core/src/types/messages/inventory.ts`    | ItemBrief 新增 3 个可选字段                 |
| `packages/core/src/factory/handlers/roomInfo.ts`   | validate 适配新字段                         |
| `server/src/engine/game-objects/container-base.ts` | 新增 canAccept/getContents/getContentsBrief |
| `server/src/engine/game-objects/npc-base.ts`       | die() 创建残骸                              |
| `server/src/engine/game-objects/player-base.ts`    | die() 创建空残骸                            |
| `server/src/engine/commands/std/get.ts`            | from 语法                                   |
| `server/src/engine/commands/std/look.ts`           | 容器内容展示                                |
| `server/src/engine/commands/std/examine.ts`        | 容器内容展示                                |
| `server/src/websocket/handlers/room-utils.ts`      | sendRoomInfo 适配新字段                     |
| `server/src/websocket/handlers/command.handler.ts` | get_from/put 推送                           |
| `server/src/engine/command-loader.ts`              | 注册 put 指令                               |
| `client/src/components/game/NpcList/index.tsx`     | 物品卡片渲染                                |
| `client/src/stores/useGameStore.ts`                | itemDetail 状态                             |
| `client/App.tsx`                                   | commandResult 容器处理                      |

### 新增的文件

| 文件                                                   | 说明     |
| ------------------------------------------------------ | -------- |
| `server/src/engine/game-objects/remains-base.ts`       | 残骸类   |
| `server/src/engine/commands/std/put.ts`                | put 指令 |
| `client/src/components/game/NpcList/ItemCard.tsx`      | 物品卡片 |
| `client/src/components/game/NpcList/ItemInfoModal.tsx` | 物品弹窗 |

## 风险点

- **RemainsBase 心跳注册**：每个残骸都注册 1s 心跳，大量 NPC 同时死亡时可能产生性能压力 → 应对：可改为 5s/10s 心跳间隔，衰腐精度不需要秒级
- **容器嵌套**：残骸中的物品如果也是容器（如背包），不限制嵌套 → 应对：BaseEntity inventory 天然支持，但 look 展示只展示一层
- **from/in 关键词冲突**：如果物品名含 "from" 或 "in"（如 "来自远方的信"） → 应对：从右往左搜索关键词，优先取最后一个 from/in

---

> CX 工作流 | Design Doc | PRD #208
