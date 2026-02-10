# Design Doc: 任务系统 + 经验升级体系

## 关联

- Scope: #217
- PRD: #218
- 项目蓝图: #1

## 基于现有代码

### 可直接复用

| 模块     | 文件                         | 复用方式                                           |
| -------- | ---------------------------- | -------------------------------------------------- |
| NPC 钩子 | `npc-base.ts` L114-126       | `onReceiveItem()` → deliver 任务检测               |
| 事件定义 | `events.ts` L36              | `GameEvents.DEATH` → capture 任务检测（需补 emit） |
| 蓝图系统 | `blueprint-factory.ts`       | `set('quests', [...])` 扩展 NPC 蓝图               |
| 消息工厂 | `packages/core/src/factory/` | `@MessageHandler` 装饰器注册新消息                 |
| 发送工具 | `player-base.ts` L60-63      | `sendToClient()` 推送消息                          |
| 房间信息 | `room-utils.ts` L70-128      | `sendRoomInfo()` 扩展 NPC 任务角标                 |
| NPC look | `look.ts` L212-276           | `lookAtNpc()` 扩展任务信息                         |
| 统计推送 | `stats.utils.ts` L37-110     | `sendPlayerStats()` 扩展 exp/level                 |

### 需补充的基础设施

| 问题                          | 位置                  | 修复方案                                  |
| ----------------------------- | --------------------- | ----------------------------------------- |
| `die()` 不触发 DEATH 事件     | `living-base.ts`      | `die()` 中 `this.emit(GameEvents.DEATH)`  |
| `playerStats.level` 是 string | `playerStats.ts` L30  | 改为 `number` + 新增 `levelTitle: string` |
| Character 无 exp 字段         | `character.entity.ts` | 新增 6 个字段                             |
| dbase 无定期保存              | `player-base.ts`      | 新增 `saveToCharacter()` 方法             |

---

## 架构概览

```
┌─────────────────── 后端架构 ───────────────────┐
│                                                 │
│  QuestManager (全局单例)                        │
│  ├─ questRegistry: Map<questId, QuestDef>      │
│  ├─ registerQuest(def) — 注册任务定义          │
│  ├─ getAvailableQuests(player, npc) — 可接列表 │
│  ├─ acceptQuest(player, questId) — 接受任务    │
│  ├─ checkProgress(player, event) — 检查进度    │
│  ├─ completeQuest(player, questId) — 完成任务  │
│  └─ abandonQuest(player, questId) — 放弃任务   │
│                                                 │
│  ExpManager (全局单例)                          │
│  ├─ gainExp(player, amount, source) — 获得经验 │
│  ├─ checkLevelUp(player) — 升级检查            │
│  └─ allocatePoints(player, attr, count) — 加点 │
│                                                 │
│  事件驱动链路:                                   │
│  NPC.die() → DEATH 事件 → QuestManager.check   │
│  give 指令 → onReceiveItem → QuestManager.check│
│  进入房间 → POST_MOVE → QuestManager.notify    │
│  背包变更 → inventoryUpdate → QuestManager.check│
│                                                 │
└─────────────────────────────────────────────────┘

┌─────────────────── 前端架构 ───────────────────┐
│                                                 │
│  useGameStore                                   │
│  ├─ quests: QuestState                         │
│  │   ├─ active: ActiveQuest[]                  │
│  │   └─ completed: CompletedQuest[]            │
│  ├─ player.exp / player.level (数值型)         │
│  └─ player.freePoints / potential / score      │
│                                                 │
│  组件树:                                        │
│  LocationHeader                                │
│  └─ "任务" 按钮 → QuestListModal               │
│      ├─ ExpInfoBar (等级+经验条+潜能+阅历)     │
│      ├─ ActiveQuestCard[] (进行中任务)         │
│      └─ CompletedQuestList (已完成折叠)        │
│                                                 │
│  NpcInfoModal (扩展)                            │
│  └─ QuestSection (可接/进行中/可交付)           │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 数据流

```
[战斗击杀] → NPC.die() → emit(DEATH) → QuestManager.onNpcDeath()
            → ExpManager.gainExp() → checkLevelUp() → sendPlayerStats()
            → sendQuestUpdate()

[give 物品] → NPC.onReceiveItem() → QuestManager.onItemDelivered()
            → sendQuestUpdate()

[进入房间] → POST_MOVE → QuestManager.onPlayerEnterRoom()
            → 检查房间 NPC 可接任务 → appendLog("提示")

[接受任务] → WebSocket questAccept → QuestManager.acceptQuest()
            → 创建任务物品(如需) → sendQuestUpdate() + sendInventoryUpdate()

[查看任务] → "任务"按钮 / quest 指令 → sendQuestList()

[加点]     → WebSocket allocatePoints → ExpManager.allocatePoints()
            → sendPlayerStats()
```

---

## 数据库设计

### Character 表新增字段

```sql
ALTER TABLE `character` ADD COLUMN `exp` INT NOT NULL DEFAULT 0 COMMENT '经验值';
ALTER TABLE `character` ADD COLUMN `level` INT NOT NULL DEFAULT 1 COMMENT '等级';
ALTER TABLE `character` ADD COLUMN `potential` INT NOT NULL DEFAULT 0 COMMENT '潜能';
ALTER TABLE `character` ADD COLUMN `score` INT NOT NULL DEFAULT 0 COMMENT '江湖阅历';
ALTER TABLE `character` ADD COLUMN `free_points` INT NOT NULL DEFAULT 0 COMMENT '未分配属性点';
ALTER TABLE `character` ADD COLUMN `quest_data` JSON NULL COMMENT '任务进度数据(JSON)';
```

> 使用 TypeORM `synchronize: true` 自动同步，无需手动 ALTER。

### 字段说明

| 数据库字段    | TypeORM 类型           | 默认值 | 说明                 |
| ------------- | ---------------------- | ------ | -------------------- |
| `exp`         | `int`                  | 0      | 累计经验值           |
| `level`       | `int`                  | 1      | 当前等级             |
| `potential`   | `int`                  | 0      | 潜能（技能消耗预留） |
| `score`       | `int`                  | 0      | 江湖阅历             |
| `free_points` | `int`                  | 0      | 未分配属性点         |
| `quest_data`  | `json` / `simple-json` | null   | 任务进度 JSON        |

### quest_data JSON 结构

```json
{
  "active": {
    "rift-town-001": {
      "status": "active",
      "objectives": { "0": 0 },
      "acceptedAt": 1707500000
    }
  },
  "completed": ["rift-town-001", "rift-town-002"]
}
```

---

## ⚡ WebSocket 消息契约（强制章节）

> **此章节是前后端的对齐合同。exec 阶段必须严格遵守。**

### 消息总览

| #   | 消息类型         | 方向            | 说明                  | 触发时机                |
| --- | ---------------- | --------------- | --------------------- | ----------------------- |
| 1   | `questUpdate`    | Server → Client | 任务列表/进度全量推送 | 接受/进度变更/完成/放弃 |
| 2   | `questAccept`    | Client → Server | 接受任务请求          | 玩家点击"接受任务"      |
| 3   | `questAbandon`   | Client → Server | 放弃任务请求          | 玩家点击"放弃"          |
| 4   | `questComplete`  | Client → Server | 交付完成任务请求      | 玩家点击"完成任务"      |
| 5   | `allocatePoints` | Client → Server | 属性加点请求          | 玩家分配属性点          |

> `playerStats` 消息（已有）扩展 exp/level 字段，不新增独立经验消息。
> `commandResult` 消息（已有）用于 quest 指令的文本输出。

### 消息详情

#### 1. questUpdate (Server → Client)

**触发时机**：接受/进度变更/完成/放弃任务后，全量推送玩家任务状态。

```typescript
// packages/core 类型定义
interface QuestUpdateData {
  active: ActiveQuestInfo[];
  completed: CompletedQuestInfo[];
  // 经验信息一并推送（减少消息数）
  exp: number;
  level: number;
  potential: number;
  score: number;
  freePoints: number;
}

interface ActiveQuestInfo {
  questId: string;
  name: string;
  description: string;
  type: 'deliver' | 'capture' | 'collect' | 'dialogue';
  giverNpcName: string;
  status: 'active' | 'ready'; // active=进行中, ready=可交付
  objectives: QuestObjectiveProgress[];
  acceptedAt: number;
}

interface QuestObjectiveProgress {
  description: string; // "击杀裂谷盗匪"
  current: number; // 当前进度 1
  required: number; // 需要数量 3
  completed: boolean; // 是否已完成
}

interface CompletedQuestInfo {
  questId: string;
  name: string;
}

interface QuestUpdateMessage {
  type: 'questUpdate';
  data: QuestUpdateData;
  timestamp: number;
}
```

#### 2. questAccept (Client → Server)

**触发时机**：玩家在 NpcInfoModal 中点击"接受任务"。

```typescript
interface QuestAcceptData {
  questId: string;
  npcId: string; // 发布任务的 NPC 实例 ID
}

interface QuestAcceptMessage {
  type: 'questAccept';
  data: QuestAcceptData;
  timestamp: number;
}
```

**成功响应**：服务端发送 `questUpdate`（全量）+ `commandResult`（日志消息 "你接受了任务：药师的来信"）+ `inventoryUpdate`（如有任务物品）

**失败响应**：`commandResult` with `success: false`（"你不满足接受此任务的条件"）

#### 3. questAbandon (Client → Server)

**触发时机**：玩家在 QuestListModal 中点击"放弃"。

```typescript
interface QuestAbandonData {
  questId: string;
}

interface QuestAbandonMessage {
  type: 'questAbandon';
  data: QuestAbandonData;
  timestamp: number;
}
```

**响应**：`questUpdate` + `commandResult`（"你放弃了任务：药师的来信"）

#### 4. questComplete (Client → Server)

**触发时机**：玩家在 NpcInfoModal 中点击"完成任务"（任务状态为 ready 时可见）。

```typescript
interface QuestCompleteData {
  questId: string;
  npcId: string; // 交付 NPC 实例 ID
}

interface QuestCompleteMessage {
  type: 'questComplete';
  data: QuestCompleteData;
  timestamp: number;
}
```

**成功响应**：

- `questUpdate`（全量，任务移到 completed）
- `playerStats`（exp/level 变更）
- `commandResult`（"任务完成！获得经验 100，阅历 5"）
- `inventoryUpdate`（如有物品奖励）

**失败响应**：`commandResult` with `success: false`（"任务目标尚未完成"或"你不在正确的 NPC 身边"）

#### 5. allocatePoints (Client → Server)

**触发时机**：玩家在加点界面分配属性点。

```typescript
interface AllocatePointsData {
  allocations: {
    wisdom?: number;
    perception?: number;
    spirit?: number;
    meridian?: number;
    strength?: number;
    vitality?: number;
  };
}

interface AllocatePointsMessage {
  type: 'allocatePoints';
  data: AllocatePointsData;
  timestamp: number;
}
```

**成功响应**：`playerStats`（属性更新 + freePoints 减少）+ `commandResult`（"属性分配成功"）

**失败响应**：`commandResult` with `success: false`（"属性点不足"或"超过属性上限"）

### 已有消息扩展

#### playerStats 扩展

```typescript
// 修改前 (playerStats.ts L26-39)
interface PlayerStatsData {
  name: string;
  level: string; // ← 当前是字符串
  silver: number;
  hp: ResourceValue;
  mp: ResourceValue;
  energy: ResourceValue;
  attrs: CharacterAttrs;
  equipBonus: EquipmentBonus;
  combat: CombatData;
}

// 修改后
interface PlayerStatsData {
  name: string;
  level: number; // ← 改为数值
  levelTitle: string; // ← 新增，中文等级称号（"初入江湖"等）
  silver: number;
  hp: ResourceValue;
  mp: ResourceValue;
  energy: ResourceValue;
  attrs: CharacterAttrs;
  equipBonus: EquipmentBonus;
  combat: CombatData;
  // 新增字段
  exp: number;
  expToNextLevel: number; // 升到下一级还需多少 exp
  potential: number;
  score: number;
  freePoints: number;
}
```

#### roomInfo NPC 扩展

```typescript
// NpcBrief 新增字段
interface NpcBrief {
  // ...已有字段
  hasQuest?: boolean; // 是否有可接任务（角标显示）
  hasQuestReady?: boolean; // 是否有可交付任务
}
```

#### NPC look 返回扩展

```typescript
// lookAtNpc() 返回 data 中新增
{
  // ...已有字段
  capabilities: {
    shop: boolean;
    // 新增
    quests: NpcQuestBrief[];    // 可接/进行中/可交付任务列表
  },
}

interface NpcQuestBrief {
  questId: string;
  name: string;
  description: string;
  state: 'available' | 'active' | 'ready';  // 对该玩家的状态
  objectives?: QuestObjectiveProgress[];     // 进行中时显示进度
}
```

---

## ⚡ 状态枚举对照表（强制章节）

> **前后端必须使用完全一致的枚举值。此处定义后，exec 阶段不允许修改。**

### 任务状态

| 枚举值 | 后端常量                | API 传输值    | 前端常量      | 显示文本 | 说明                   |
| ------ | ----------------------- | ------------- | ------------- | -------- | ---------------------- |
| 隐藏   | `QuestStatus.HIDDEN`    | `'hidden'`    | `'hidden'`    | —        | 前置未满足，不可见     |
| 可接受 | `QuestStatus.AVAILABLE` | `'available'` | `'available'` | "可接受" | 前置满足，等待玩家接受 |
| 进行中 | `QuestStatus.ACTIVE`    | `'active'`    | `'active'`    | "进行中" | 玩家已接受，目标未完成 |
| 待交付 | `QuestStatus.READY`     | `'ready'`     | `'ready'`     | "可交付" | 所有目标完成，等待交付 |
| 已完成 | `QuestStatus.COMPLETED` | `'completed'` | `'completed'` | "已完成" | 奖励已发放             |

### 状态流转规则

```
HIDDEN ──(前置满足)──→ AVAILABLE ──(玩家接受)──→ ACTIVE ──(目标完成)──→ READY ──(交付)──→ COMPLETED
                           ↑                       │
                           └──────(放弃)────────────┘
```

- `HIDDEN → AVAILABLE`：QuestManager 在玩家等级变化/任务完成时自动检查
- `AVAILABLE → ACTIVE`：玩家发送 `questAccept` 消息
- `ACTIVE → READY`：QuestManager 在事件触发时自动检查目标完成
- `READY → COMPLETED`：玩家发送 `questComplete` 消息，在正确 NPC 旁
- `ACTIVE → AVAILABLE`：玩家发送 `questAbandon` 消息（放弃）

### 任务类型

| 枚举值 | 后端常量             | API 传输值   | 前端显示 | 说明             |
| ------ | -------------------- | ------------ | -------- | ---------------- |
| 交付   | `QuestType.DELIVER`  | `'deliver'`  | "送信"   | give 物品给 NPC  |
| 击杀   | `QuestType.CAPTURE`  | `'capture'`  | "剿灭"   | 杀死目标 NPC     |
| 收集   | `QuestType.COLLECT`  | `'collect'`  | "收集"   | 背包中有足够物品 |
| 对话   | `QuestType.DIALOGUE` | `'dialogue'` | "打探"   | 依次与 NPC 对话  |

### 目标类型

| 枚举值 | 后端常量                | API 传输值  | 说明                |
| ------ | ----------------------- | ----------- | ------------------- |
| 击杀   | `ObjectiveType.KILL`    | `'kill'`    | 击杀指定 NPC 蓝图   |
| 交付   | `ObjectiveType.DELIVER` | `'deliver'` | give 物品给指定 NPC |
| 收集   | `ObjectiveType.COLLECT` | `'collect'` | 背包中有指定物品    |
| 对话   | `ObjectiveType.TALK`    | `'talk'`    | 与指定 NPC 对话     |

### NPC 态度（已有，无变更）

| 枚举值 | 传输值       | 说明               |
| ------ | ------------ | ------------------ |
| 友好   | `'friendly'` | 不主动攻击，可交互 |
| 中立   | `'neutral'`  | 不主动攻击         |
| 敌对   | `'hostile'`  | 主动攻击           |

---

## ⚡ VO/DTO 字段映射表（强制章节）

> **此表定义从数据库到前端的完整字段映射链。exec 阶段必须严格遵循。**

### 经验升级字段映射

| #   | 功能     | DB 字段 (snake_case) | dbase key     | API JSON (camelCase) | 前端 TS          | 类型     | 说明                           |
| --- | -------- | -------------------- | ------------- | -------------------- | ---------------- | -------- | ------------------------------ |
| 1   | 经验值   | `exp`                | `exp`         | `exp`                | `exp`            | `number` | 累计经验                       |
| 2   | 等级     | `level`              | `level`       | `level`              | `level`          | `number` | 当前等级（改为数值型）         |
| 3   | 等级称号 | —                    | —             | `levelTitle`         | `levelTitle`     | `string` | 中文等级名（运行时计算）       |
| 4   | 下级经验 | —                    | —             | `expToNextLevel`     | `expToNextLevel` | `number` | 升下一级还需 exp（运行时计算） |
| 5   | 潜能     | `potential`          | `potential`   | `potential`          | `potential`      | `number` | 技能消耗预留                   |
| 6   | 阅历     | `score`              | `score`       | `score`              | `score`          | `number` | 江湖阅历                       |
| 7   | 自由点   | `free_points`        | `free_points` | `freePoints`         | `freePoints`     | `number` | 未分配属性点                   |

### 任务数据字段映射

| #   | 功能     | DB JSON path             | dbase key            | API JSON     | 前端 TS      | 类型                   | 说明           |
| --- | -------- | ------------------------ | -------------------- | ------------ | ------------ | ---------------------- | -------------- |
| 1   | 任务ID   | `active.{id}`            | `quests.active.{id}` | `questId`    | `questId`    | `string`               | 任务唯一标识   |
| 2   | 任务状态 | `active.{id}.status`     | 同左                 | `status`     | `status`     | `QuestStatus`          | active/ready   |
| 3   | 目标进度 | `active.{id}.objectives` | 同左                 | `objectives` | `objectives` | `ObjectiveProgress[]`  | 各目标当前计数 |
| 4   | 接受时间 | `active.{id}.acceptedAt` | 同左                 | `acceptedAt` | `acceptedAt` | `number`               | Unix timestamp |
| 5   | 已完成   | `completed[]`            | `quests.completed`   | `completed`  | `completed`  | `CompletedQuestInfo[]` | ID+名称列表    |

### NPC 任务角标字段映射

| #   | 功能     | 来源                    | API JSON              | 前端 TS               | 类型              | 说明          |
| --- | -------- | ----------------------- | --------------------- | --------------------- | ----------------- | ------------- |
| 1   | 有任务   | QuestManager 运行时计算 | `hasQuest`            | `hasQuest`            | `boolean?`        | NpcBrief 新增 |
| 2   | 可交付   | QuestManager 运行时计算 | `hasQuestReady`       | `hasQuestReady`       | `boolean?`        | NpcBrief 新增 |
| 3   | 任务详情 | QuestManager 运行时计算 | `capabilities.quests` | `capabilities.quests` | `NpcQuestBrief[]` | NPC look 扩展 |

### 前端 TypeScript 类型定义

```typescript
// useGameStore.ts 新增/修改

// PlayerData 修改
interface PlayerData {
  name: string;
  level: number; // ← 改为 number
  levelTitle: string; // ← 新增
  silver: number;
  hp: ResourceValue;
  mp: ResourceValue;
  energy: ResourceValue;
  attrs: CharacterAttrs;
  equipBonus: EquipmentBonus;
  combat: CombatData;
  // 新增
  exp: number;
  expToNextLevel: number;
  potential: number;
  score: number;
  freePoints: number;
}

// NpcData 修改（NpcBrief 前端对应）
interface NpcData {
  // ...已有字段
  hasQuest?: boolean;
  hasQuestReady?: boolean;
}

// NpcDetailData 修改
interface NpcDetailData {
  // ...已有字段
  capabilities: {
    shop: boolean;
    quests: NpcQuestBrief[]; // 新增
  };
}

// 新增类型
interface NpcQuestBrief {
  questId: string;
  name: string;
  description: string;
  state: 'available' | 'active' | 'ready';
  objectives?: QuestObjectiveProgress[];
}

interface QuestObjectiveProgress {
  description: string;
  current: number;
  required: number;
  completed: boolean;
}

// QuestState — 新增 store slice
interface QuestState {
  active: ActiveQuestInfo[];
  completed: CompletedQuestInfo[];
}

interface ActiveQuestInfo {
  questId: string;
  name: string;
  description: string;
  type: 'deliver' | 'capture' | 'collect' | 'dialogue';
  giverNpcName: string;
  status: 'active' | 'ready';
  objectives: QuestObjectiveProgress[];
  acceptedAt: number;
}

interface CompletedQuestInfo {
  questId: string;
  name: string;
}
```

### 后端 TypeScript 类型定义

```typescript
// server/src/engine/quest/quest-definition.ts

enum QuestStatus {
  HIDDEN = 'hidden',
  AVAILABLE = 'available',
  ACTIVE = 'active',
  READY = 'ready',
  COMPLETED = 'completed',
}

enum QuestType {
  DELIVER = 'deliver',
  CAPTURE = 'capture',
  COLLECT = 'collect',
  DIALOGUE = 'dialogue',
}

enum ObjectiveType {
  KILL = 'kill',
  DELIVER = 'deliver',
  COLLECT = 'collect',
  TALK = 'talk',
}

interface QuestDefinition {
  id: string;
  name: string;
  description: string;
  type: QuestType;
  giverNpc: string; // 蓝图 ID
  turnInNpc?: string; // 蓝图 ID，默认同 giver
  prerequisites?: QuestPrerequisites;
  objectives: QuestObjective[];
  rewards: QuestRewards;
  // 任务物品：接受时创建并给予玩家
  giveItems?: { blueprintId: string; count: number }[];
}

interface QuestPrerequisites {
  level?: number;
  quests?: string[]; // 前置任务 ID
  score?: number;
}

interface QuestObjective {
  type: ObjectiveType;
  target: string; // NPC 蓝图 ID 或物品蓝图 ID
  count?: number; // 默认 1
  description: string;
}

interface QuestRewards {
  exp?: number;
  potential?: number;
  score?: number;
  items?: { blueprintId: string; count: number }[];
}

// server/src/engine/quest/quest-progress.ts

interface QuestProgress {
  questId: string;
  status: QuestStatus.ACTIVE | QuestStatus.READY;
  objectives: { [index: number]: number }; // 目标索引 → 当前计数
  acceptedAt: number;
}

interface PlayerQuestData {
  active: { [questId: string]: QuestProgress };
  completed: string[];
}
```

---

## 后端设计

### QuestManager (全局单例)

**文件**: `server/src/engine/quest/quest-manager.ts`

**注册到 ServiceLocator**，与 ObjectManager/CombatManager 同级。

```typescript
class QuestManager {
  private questRegistry = new Map<string, QuestDefinition>();

  /** 注册任务定义（蓝图加载时调用） */
  registerQuest(def: QuestDefinition): void;

  /** 获取 NPC 对某玩家的可用任务列表 */
  getAvailableQuests(player: PlayerBase, npcBlueprintId: string): QuestDefinition[];

  /** 获取 NPC 对某玩家的任务状态摘要（用于 look/roomInfo） */
  getNpcQuestBriefs(player: PlayerBase, npcBlueprintId: string): NpcQuestBrief[];

  /** 接受任务 */
  acceptQuest(player: PlayerBase, questId: string, npc: NpcBase): CommandResult;

  /** 放弃任务 */
  abandonQuest(player: PlayerBase, questId: string): CommandResult;

  /** 交付完成任务 */
  completeQuest(player: PlayerBase, questId: string, npc: NpcBase): CommandResult;

  /** 事件处理：NPC 死亡 */
  onNpcDeath(npc: NpcBase, killer: LivingBase): void;

  /** 事件处理：物品交付给 NPC */
  onItemDelivered(npc: NpcBase, giver: LivingBase, item: ItemBase): void;

  /** 事件处理：玩家进入房间 */
  onPlayerEnterRoom(player: PlayerBase, room: RoomBase): void;

  /** 事件处理：背包变更（collect 类） */
  onInventoryChange(player: PlayerBase): void;

  /** 检查并更新所有活跃任务的进度 */
  private checkAllObjectives(player: PlayerBase): void;

  /** 推送任务状态到前端 */
  sendQuestUpdate(player: PlayerBase): void;

  /** 检查前置条件 */
  private canAccept(player: PlayerBase, def: QuestDefinition): boolean;

  /** 检查任务目标是否全部完成 */
  private isAllComplete(player: PlayerBase, questId: string): boolean;
}
```

### ExpManager (全局单例)

**文件**: `server/src/engine/quest/exp-manager.ts`

```typescript
class ExpManager {
  /** 升级公式系数 */
  private readonly K = 0.01; // 待调参

  /** 获得经验 */
  gainExp(player: PlayerBase, amount: number, source: string): void;

  /** 获得潜能 */
  gainPotential(player: PlayerBase, amount: number): void;

  /** 获得阅历 */
  gainScore(player: PlayerBase, amount: number): void;

  /** 检查并执行升级（支持跨级） */
  private checkLevelUp(player: PlayerBase): number; // 返回升了几级

  /** 计算等级对应的累计经验阈值 */
  getExpForLevel(level: number): number;

  /** 计算经验对应的等级 */
  getLevelForExp(exp: number): number;

  /** 等级称号 */
  getLevelTitle(level: number): string;

  /** 分配属性点 */
  allocatePoints(player: PlayerBase, allocations: Record<string, number>): CommandResult;

  /** 战斗经验衰减（等级差） */
  calculateCombatExp(playerLevel: number, npcLevel: number, baseExp: number): number;
}
```

**升级公式实现**：

```typescript
getExpForLevel(level: number): number {
  if (level <= 1) return 0;
  // level = floor(cbrt(exp * K)) + 1
  // => exp = (level - 1)^3 / K
  return Math.ceil(Math.pow(level - 1, 3) / this.K);
}

getLevelForExp(exp: number): number {
  return Math.floor(Math.cbrt(exp * this.K)) + 1;
}
```

**等级称号表**（初步）：

| 等级范围 | 称号     |
| -------- | -------- |
| 1-4      | 初入江湖 |
| 5-9      | 小有名气 |
| 10-14    | 江湖新秀 |
| 15-19    | 侠名远播 |
| 20+      | 一代宗师 |

**升级奖励**：

```typescript
// 每级奖励常量
const POINTS_PER_LEVEL = 3; // 每级 3 个属性点
const HP_PER_LEVEL = 50; // 每级 max_hp +50
const MP_PER_LEVEL = 30; // 每级 max_mp +30
```

**等级差衰减**：

```typescript
calculateCombatExp(playerLevel: number, npcLevel: number, baseExp: number): number {
  const diff = playerLevel - npcLevel;
  if (diff <= 0) return baseExp;           // 同级或低级，全额
  if (diff <= 3) return baseExp;           // 高 1-3 级，全额
  if (diff <= 5) return Math.floor(baseExp * 0.5);  // 高 4-5 级，50%
  if (diff <= 10) return Math.floor(baseExp * 0.2); // 高 6-10 级，20%
  return 0;                                // 高 10+ 级，无经验
}
```

### quest 指令

**文件**: `server/src/engine/commands/std/quest.ts`

```typescript
// quest — 推送 questUpdate 消息到前端（前端弹出 QuestListModal）
// 不输出文本，纯消息推送
execute(player: PlayerBase): CommandResult {
  questManager.sendQuestUpdate(player);
  return { success: true, message: '' };  // 空消息，不写日志
}
```

### NPC 蓝图扩展（任务注册）

**在 NPC 蓝图 `create()` 中定义任务**：

```typescript
// server/src/world/npc/rift-town/blacksmith.ts
create() {
  // ...已有属性
  this.set('quests', [{
    id: 'rift-town-001',
    name: '药师的来信',
    description: '老周铁匠有一封重要的信需要送到白发药师手中。',
    type: 'deliver',
    giverNpc: 'npc/rift-town/blacksmith',
    turnInNpc: 'npc/rift-town/herbalist',
    objectives: [{
      type: 'deliver',
      target: 'item/quest/blacksmith-letter',
      count: 1,
      description: '将铁匠的信交给白发药师',
    }],
    rewards: { exp: 100, score: 5 },
    giveItems: [{ blueprintId: 'item/quest/blacksmith-letter', count: 1 }],
  }]);
}
```

**蓝图加载时自动注册**：BlueprintFactory 在加载 NPC 蓝图后，检查 `quests` 字段，调用 `QuestManager.registerQuest()`。

### 事件挂载

**在 GameGateway 初始化或 PlayerBase 进场时挂载**：

```typescript
// 玩家进入房间后
player.on(GameEvents.POST_MOVE, (data) => {
  questManager.onPlayerEnterRoom(player, data.room);
});

// NPC 死亡（需要在 die() 中 emit DEATH）
// 在 NPC die() 中:
die(): void {
  this.emit(GameEvents.DEATH, { victim: this });
  // ...已有逻辑
}

// CombatManager 击杀后通知 QuestManager
// endCombat() 中：
if (reason === 'victory') {
  const killer = combat.participants[0].entity;  // player
  questManager.onNpcDeath(enemy, killer);
  expManager.gainExp(killer as PlayerBase, calculateCombatExp(...));
}
```

### 数据持久化

**在 `stats.utils.ts` 中扩展**：

```typescript
// loadCharacterToPlayer() 新增
player.set('exp', character.exp ?? 0);
player.set('level', character.level ?? 1);
player.set('potential', character.potential ?? 0);
player.set('score', character.score ?? 0);
player.set('free_points', character.freePoints ?? 0);
if (character.questData) {
  player.set('quests', character.questData);
}

// 新增 savePlayerData()（断线时调用）
function savePlayerData(player: PlayerBase, character: Character): void {
  character.exp = player.get<number>('exp') ?? 0;
  character.level = player.get<number>('level') ?? 1;
  character.potential = player.get<number>('potential') ?? 0;
  character.score = player.get<number>('score') ?? 0;
  character.freePoints = player.get<number>('free_points') ?? 0;
  character.questData = player.get('quests') ?? null;
  // characterService.save(character)
}
```

---

## 前端设计

### 组件结构

```
client/src/components/game/
├── QuestListModal/                    # 新增：任务列表弹窗
│   ├── index.tsx                      # 弹窗容器（Modal）
│   ├── ExpInfoBar.tsx                 # 经验/等级/潜能/阅历信息栏
│   ├── ActiveQuestCard.tsx            # 进行中任务卡片
│   ├── ObjectiveProgress.tsx          # 单个目标进度行
│   └── CompletedQuestList.tsx         # 已完成任务折叠列表
├── NpcList/
│   ├── NpcCard.tsx                    # 修改：添加任务角标
│   ├── NpcInfoModal.tsx               # 修改：添加 QuestSection
│   └── QuestSection.tsx               # 新增：NPC 弹窗内任务区域
└── LocationHeader/
    └── index.tsx                      # 修改：添加"任务"按钮
```

### useGameStore 扩展

```typescript
// 新增 slice
quests: QuestState;
setQuests: (state: QuestState) => void;

// 修改 player 类型（上面 VO/DTO 已定义）
```

### App.tsx 消息监听

```typescript
// 新增 questUpdate 监听
wsService.on('questUpdate', (data: QuestUpdateData) => {
  const { setQuests, updatePlayer } = useGameStore.getState();
  setQuests({ active: data.active, completed: data.completed });
  updatePlayer({
    exp: data.exp,
    level: data.level,
    potential: data.potential,
    score: data.score,
    freePoints: data.freePoints,
  });
});
```

### LocationHeader 改造

将 `location.actions` 中的"邮件"替换为"任务"，点击后打开 QuestListModal：

```typescript
// LocationHeader/index.tsx
// "任务"按钮用独立组件，不走 actions 数组
<QuestButton onPress={() => setQuestModalVisible(true)} />
```

> 或者保留 actions 数组机制但处理 onPress：当 label === '任务' 时弹出 QuestListModal。

### NpcCard 任务角标

```typescript
// NpcCard.tsx
// 在 NPC 名字旁显示角标
{npc.hasQuestReady && <Text style={s.questBadge}>!</Text>}   // 金色感叹号（可交付）
{npc.hasQuest && !npc.hasQuestReady && <Text style={s.questBadge}>?</Text>}  // 灰色问号（可接）
```

### NpcInfoModal QuestSection

```typescript
// QuestSection.tsx
// 根据 capabilities.quests 渲染：
// - available: 任务描述 + "接受任务"按钮
// - active: 进度展示
// - ready: "完成任务"按钮
```

---

## 影响范围

### 修改的已有文件

| 文件                                                  | 修改内容                                                                       |
| ----------------------------------------------------- | ------------------------------------------------------------------------------ |
| `packages/core/src/types/messages/playerStats.ts`     | level 改 number，新增 exp/potential/score/freePoints/levelTitle/expToNextLevel |
| `packages/core/src/types/messages/room.ts`            | NpcBrief 新增 hasQuest/hasQuestReady                                           |
| `packages/core/src/types/messages/index.ts`           | 导出 quest 消息类型                                                            |
| `packages/core/src/factory/index.ts`                  | 导入 quest handlers                                                            |
| `server/src/character/character.entity.ts`            | 新增 6 字段                                                                    |
| `server/src/character/character.service.ts`           | 新增 savePlayerData 方法                                                       |
| `server/src/engine/game-objects/living-base.ts`       | die() 中 emit DEATH 事件                                                       |
| `server/src/engine/game-objects/npc-base.ts`          | getQuests() 方法                                                               |
| `server/src/engine/game-objects/player-base.ts`       | 任务数据访问方法                                                               |
| `server/src/engine/commands/std/look.ts`              | lookAtNpc 扩展 capabilities.quests                                             |
| `server/src/engine/combat/combat-manager.ts`          | 击杀后通知 QuestManager + ExpManager                                           |
| `server/src/websocket/handlers/room-utils.ts`         | sendRoomInfo NPC 角标 + sendPlayerStats 扩展                                   |
| `server/src/websocket/handlers/stats.utils.ts`        | loadCharacterToPlayer 扩展 + savePlayerData                                    |
| `server/src/websocket/websocket.gateway.ts`           | 新增 questAccept/questAbandon/questComplete/allocatePoints 路由                |
| `client/App.tsx`                                      | 新增 questUpdate 监听                                                          |
| `client/src/stores/useGameStore.ts`                   | 扩展 PlayerData + 新增 quests slice                                            |
| `client/src/components/game/NpcList/NpcCard.tsx`      | 任务角标                                                                       |
| `client/src/components/game/NpcList/NpcInfoModal.tsx` | QuestSection                                                                   |
| `client/src/components/game/LocationHeader/index.tsx` | "任务"按钮                                                                     |

### 新增文件

| 文件                                                               | 说明                    |
| ------------------------------------------------------------------ | ----------------------- |
| `server/src/engine/quest/quest-definition.ts`                      | 枚举 + 接口定义         |
| `server/src/engine/quest/quest-manager.ts`                         | QuestManager 全局管理器 |
| `server/src/engine/quest/exp-manager.ts`                           | ExpManager 经验管理器   |
| `server/src/engine/quest/quest-progress.ts`                        | QuestProgress 类型      |
| `server/src/engine/quest/index.ts`                                 | 导出入口                |
| `server/src/engine/commands/std/quest.ts`                          | quest 指令              |
| `server/src/world/item/quest/blacksmith-letter.ts`                 | 任务物品蓝图            |
| `server/src/world/npc/rift-town/bandit.ts`                         | 新 NPC：裂谷盗匪        |
| `packages/core/src/types/messages/quest.ts`                        | 任务消息类型            |
| `packages/core/src/factory/handlers/questUpdate.ts`                | questUpdate handler     |
| `packages/core/src/factory/handlers/questAccept.ts`                | questAccept handler     |
| `packages/core/src/factory/handlers/questAbandon.ts`               | questAbandon handler    |
| `packages/core/src/factory/handlers/questComplete.ts`              | questComplete handler   |
| `packages/core/src/factory/handlers/allocatePoints.ts`             | allocatePoints handler  |
| `client/src/components/game/QuestListModal/index.tsx`              | 任务弹窗容器            |
| `client/src/components/game/QuestListModal/ExpInfoBar.tsx`         | 经验信息栏              |
| `client/src/components/game/QuestListModal/ActiveQuestCard.tsx`    | 任务卡片                |
| `client/src/components/game/QuestListModal/ObjectiveProgress.tsx`  | 目标进度                |
| `client/src/components/game/QuestListModal/CompletedQuestList.tsx` | 已完成列表              |
| `client/src/components/game/NpcList/QuestSection.tsx`              | NPC 弹窗任务区域        |

---

## 风险点

| 风险                                       | 影响                                 | 应对方案                                               |
| ------------------------------------------ | ------------------------------------ | ------------------------------------------------------ |
| playerStats.level 类型变更 (string→number) | 前端所有使用 level 的地方需适配      | 前端统一使用 `levelTitle` 显示中文，`level` 纯数值计算 |
| DEATH 事件当前未触发                       | capture 任务检测不到 NPC 死亡        | 在 `LivingBase.die()` 中补 `emit(DEATH)`               |
| 任务物品丢失                               | 玩家丢失任务物品后无法完成           | 放弃重接机制，NPC 重新给物品                           |
| 多玩家任务状态隔离                         | NPC 任务是全局定义，进度是每玩家独立 | QuestManager 按 player 维度管理进度                    |
| dbase 数据持久化时机                       | 断线如果不保存会丢进度               | 在 disconnect handler 中调用 savePlayerData()          |
| 立方根系数 K 调参                          | 影响升级体验                         | Design 阶段给初始值，上线后可热调                      |

---

> CX 工作流 | Design Doc
