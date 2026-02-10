# Task 7: 示例任务定义 + NPC 蓝图扩展 + 任务物品蓝图

## 关联

- Part of feature: 任务系统 + 经验升级体系
- Phase: 4 — 游戏内容
- Design Doc: #219
- Depends on: Task 4, Task 5, Task 6

## 任务描述

创建两个示例任务的定义、任务物品蓝图、新 NPC 蓝图，并在已有 NPC 蓝图中添加任务配置和 combat_exp 字段。

### 具体工作

1. **新建** `server/src/world/item/quest/blacksmith-letter.ts` — 铁匠的信（ItemBase 蓝图）
2. **修改** 老周铁匠蓝图 — 添加 `quests` 字段（rift-town-001）和 `combat_exp` 字段
3. **修改** 白发药师蓝图（如存在）— 确保可作为 turnInNpc
4. **新建** 镇长 NPC 蓝图（如不存在）— 添加 `quests` 字段（rift-town-002）
5. **新建** `server/src/world/npc/rift-town/bandit.ts` — 裂谷盗匪（低级敌对 NPC）
6. **修改** BlueprintFactory — 加载 NPC 蓝图时自动注册 quests 到 QuestManager
7. **为所有战斗 NPC 蓝图补充** `combat_exp` 字段（经验奖励值）

## 验收标准

- [ ] blacksmith-letter 蓝图：ItemBase 子类，name "铁匠的信"，short 描述
- [ ] 老周铁匠蓝图包含 rift-town-001 任务定义（deliver 类型）
- [ ] rift-town-001 定义：giverNpc=blacksmith, turnInNpc=herbalist, rewards exp:100 score:5
- [ ] rift-town-002 定义：giverNpc=town-elder, type=capture, prerequisites quests:['rift-town-001'], rewards exp:200 potential:50 score:10
- [ ] 裂谷盗匪蓝图：attitude hostile, level 5, combat_exp 50, 合理属性
- [ ] BlueprintFactory 加载 NPC 时检查 quests 字段并调用 QuestManager.registerQuest()
- [ ] 所有战斗 NPC 有 combat_exp 字段
- [ ] TypeScript 编译通过

## 📋 契约片段（来自 Design Doc）

### 任务 1：药师的来信 (deliver)

```typescript
{
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
}
```

### 任务 2：裂谷盗匪 (capture)

```typescript
{
  id: 'rift-town-002',
  name: '裂谷盗匪',
  description: '镇长希望你能清除盘踞在裂谷北道的盗匪。',
  type: 'capture',
  giverNpc: 'npc/rift-town/town-elder',
  prerequisites: { quests: ['rift-town-001'] },
  objectives: [{
    type: 'kill',
    target: 'npc/rift-town/bandit',
    count: 1,
    description: '击杀裂谷北道的盗匪',
  }],
  rewards: {
    exp: 200,
    potential: 50,
    score: 10,
    items: [{ blueprintId: 'item/weapon/short-knife', count: 1 }],
  },
}
```

### 蓝图任务注册

```typescript
// BlueprintFactory 加载 NPC 蓝图后
const quests = npc.get<QuestDefinition[]>('quests');
if (quests) {
  quests.forEach((def) => questManager.registerQuest(def));
}
```

## 代码参考

- 已有 NPC 蓝图：`server/src/world/npc/rift-town/blacksmith.ts`
- 已有物品蓝图：`server/src/world/item/` 下的物品定义
- BlueprintFactory：`server/src/engine/blueprint-factory.ts`
- SpawnManager：`server/src/engine/spawn-manager.ts`（NPC 创建流程）
