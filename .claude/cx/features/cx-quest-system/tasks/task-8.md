# Task 8: 前端 Store 扩展 + App.tsx 消息监听 + playerStats 适配

## 关联

- Part of feature: 任务系统 + 经验升级体系
- Phase: 5 — 前端
- Design Doc: #219
- Depends on: Task 1

## 任务描述

扩展前端 Zustand store 和 App.tsx 消息监听，适配 playerStats 类型变更，为前端 UI 组件提供数据基础。

### 具体工作

1. **修改** `useGameStore.ts` — PlayerData 中 level 改为 number，新增 levelTitle/exp/expToNextLevel/potential/score/freePoints
2. **修改** `useGameStore.ts` — 新增 quests slice（QuestState）
3. **修改** `useGameStore.ts` — NpcData 新增 hasQuest/hasQuestReady
4. **修改** `useGameStore.ts` — NpcDetailData.capabilities 新增 quests 字段
5. **修改** `App.tsx` — 新增 questUpdate 消息监听
6. **修改** `App.tsx` — handlePlayerStats 适配新字段
7. **修改** 所有使用 `player.level` 的前端组件 — 适配 number → 显示用 levelTitle

## 验收标准

- [ ] PlayerData.level 为 number 类型
- [ ] PlayerData 新增 levelTitle/exp/expToNextLevel/potential/score/freePoints
- [ ] useGameStore 新增 quests: QuestState + setQuests action
- [ ] NpcData 新增 hasQuest?/hasQuestReady?
- [ ] NpcDetailData.capabilities 新增 quests: NpcQuestBrief[]
- [ ] App.tsx 监听 questUpdate 消息并更新 store
- [ ] playerStats handler 正确处理新字段
- [ ] 所有使用 level 的组件适配完成（显示 levelTitle）
- [ ] TypeScript 编译通过

## 📋 契约片段（来自 Design Doc）

### PlayerData 修改

```typescript
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
  exp: number; // ← 新增
  expToNextLevel: number; // ← 新增
  potential: number; // ← 新增
  score: number; // ← 新增
  freePoints: number; // ← 新增
}
```

### QuestState

```typescript
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

### App.tsx questUpdate 监听

```typescript
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

### NpcData 扩展

```typescript
interface NpcData {
  // ...已有字段
  hasQuest?: boolean;
  hasQuestReady?: boolean;
}
```

## 代码参考

- useGameStore：`client/src/stores/useGameStore.ts` L128-198
- PlayerData：`useGameStore.ts` L44-55
- NpcData：`useGameStore.ts`（NpcBrief 前端对应）
- NpcDetailData：`useGameStore.ts` L113-126
- App.tsx 消息监听注册：`App.tsx` L143-151
- handlePlayerStats：`App.tsx`（handlePlayerStats 函数）
- 使用 level 的组件：PlayerStats 区域组件
