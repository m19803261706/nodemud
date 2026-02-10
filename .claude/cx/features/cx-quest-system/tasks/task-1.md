# Task 1: packages/core 消息类型定义 + Handler 注册

## 关联

- Part of feature: 任务系统 + 经验升级体系
- Phase: 1 — 共享类型与数据层
- Design Doc: #219
- PRD: #218

## 任务描述

在 `packages/core` 中定义所有新增的 WebSocket 消息类型接口和 Handler，并扩展已有的 `playerStats` 消息类型。这是其他所有任务的基础依赖。

### 具体工作

1. **新增消息类型文件** `packages/core/src/types/messages/quest.ts`，定义 5 个消息接口
2. **新增 Handler 文件** 5 个：questUpdate/questAccept/questAbandon/questComplete/allocatePoints
3. **修改 playerStats 类型**：level 从 string 改为 number，新增 levelTitle/exp/expToNextLevel/potential/score/freePoints
4. **修改 room.ts**：NpcBrief 新增 hasQuest/hasQuestReady 字段
5. **更新 index.ts 导出**
6. **执行 `pnpm build`**

## 验收标准

- [x] `packages/core/src/types/messages/quest.ts` 包含 QuestUpdateMessage、QuestAcceptMessage、QuestAbandonMessage、QuestCompleteMessage、AllocatePointsMessage 五个完整接口
- [x] 5 个 Handler 文件使用 `@MessageHandler` 装饰器注册，含 create() 和 validate()
- [x] `playerStats.ts` 中 level 为 number 类型，新增 levelTitle/exp/expToNextLevel/potential/score/freePoints
- [x] `room.ts` 中 NpcBrief 新增 hasQuest?: boolean 和 hasQuestReady?: boolean
- [x] `pnpm build` 通过

## 📋 消息契约片段（来自 Design Doc）

> ⚠️ 以下契约已在 Design Doc 中锁定，实现时必须严格遵守。

### questUpdate (Server → Client)

```typescript
interface QuestUpdateData {
  active: ActiveQuestInfo[];
  completed: CompletedQuestInfo[];
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
  status: 'active' | 'ready';
  objectives: QuestObjectiveProgress[];
  acceptedAt: number;
}

interface QuestObjectiveProgress {
  description: string;
  current: number;
  required: number;
  completed: boolean;
}

interface CompletedQuestInfo {
  questId: string;
  name: string;
}
```

### questAccept (Client → Server)

```typescript
interface QuestAcceptData {
  questId: string;
  npcId: string;
}
```

### questAbandon (Client → Server)

```typescript
interface QuestAbandonData {
  questId: string;
}
```

### questComplete (Client → Server)

```typescript
interface QuestCompleteData {
  questId: string;
  npcId: string;
}
```

### allocatePoints (Client → Server)

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
```

### playerStats 扩展

```typescript
interface PlayerStatsData {
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
  exp: number; // ← 新增
  expToNextLevel: number; // ← 新增
  potential: number; // ← 新增
  score: number; // ← 新增
  freePoints: number; // ← 新增
}
```

### NpcBrief 扩展 (room.ts)

```typescript
interface NpcBrief {
  // ...已有字段
  hasQuest?: boolean;
  hasQuestReady?: boolean;
}
```

## 代码参考

- 已有消息类型模式：`packages/core/src/types/messages/combat.ts`（{Type}Data + {Type}Message）
- 已有 Handler 模式：`packages/core/src/factory/handlers/combatStart.ts`（@MessageHandler 装饰器）
- playerStats 类型：`packages/core/src/types/messages/playerStats.ts` L26-39
- NpcBrief 类型：`packages/core/src/types/messages/room.ts` L16-40
- 导出入口：`packages/core/src/types/messages/index.ts`
- Handler 入口：`packages/core/src/factory/index.ts`
