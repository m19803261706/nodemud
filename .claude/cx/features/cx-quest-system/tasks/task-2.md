# Task 2: server 端类型定义 + Character 实体扩展 + 数据加载保存

## 关联

- Part of feature: 任务系统 + 经验升级体系
- Phase: 1 — 共享类型与数据层
- Design Doc: #219
- Parallel with: Task 1

## 任务描述

在 server 端创建任务系统的枚举和接口定义，扩展 Character 实体新增 6 个字段，扩展数据加载/保存流程。

### 具体工作

1. **新建** `server/src/engine/quest/quest-definition.ts` — 枚举（QuestStatus/QuestType/ObjectiveType）+ 接口（QuestDefinition/QuestObjective/QuestPrerequisites/QuestRewards）
2. **新建** `server/src/engine/quest/quest-progress.ts` — QuestProgress + PlayerQuestData 接口
3. **新建** `server/src/engine/quest/index.ts` — 导出入口
4. **修改** `character.entity.ts` — 新增 exp/level/potential/score/freePoints/questData 字段
5. **修改** `stats.utils.ts` — loadCharacterToPlayer 加载 exp/level/potential/score/free_points/quests
6. **新增** savePlayerData() 函数 — 断线时保存所有数据到 Character
7. **修改** `character.service.ts` — 新增 savePlayerData 方法
8. **修改** WebSocket disconnect handler — 调用 savePlayerData()

## 验收标准

- [x] quest-definition.ts 包含 QuestStatus/QuestType/ObjectiveType 枚举，值与状态枚举对照表一致
- [x] quest-definition.ts 包含 QuestDefinition/QuestObjective/QuestPrerequisites/QuestRewards 接口
- [x] quest-progress.ts 包含 QuestProgress/PlayerQuestData 接口
- [x] Character 实体新增 6 个字段，TypeORM 装饰器正确
- [x] loadCharacterToPlayer() 正确加载所有新字段到 dbase
- [x] savePlayerData() 将 dbase 中的 exp/level/potential/score/free_points/quests 保存到 Character
- [x] 断线时自动调用 savePlayerData()
- [x] TypeScript 编译通过

## 📋 状态枚举对照表（来自 Design Doc）

> ⚠️ 枚举值必须严格一致。

### 任务状态

| 枚举值 | 后端常量                | API 传输值    | 说明       |
| ------ | ----------------------- | ------------- | ---------- |
| 隐藏   | `QuestStatus.HIDDEN`    | `'hidden'`    | 前置未满足 |
| 可接受 | `QuestStatus.AVAILABLE` | `'available'` | 等待接受   |
| 进行中 | `QuestStatus.ACTIVE`    | `'active'`    | 目标未完成 |
| 待交付 | `QuestStatus.READY`     | `'ready'`     | 等待交付   |
| 已完成 | `QuestStatus.COMPLETED` | `'completed'` | 奖励已发放 |

### 任务类型

| 后端常量             | API 传输值   |
| -------------------- | ------------ |
| `QuestType.DELIVER`  | `'deliver'`  |
| `QuestType.CAPTURE`  | `'capture'`  |
| `QuestType.COLLECT`  | `'collect'`  |
| `QuestType.DIALOGUE` | `'dialogue'` |

### 目标类型

| 后端常量                | API 传输值  |
| ----------------------- | ----------- |
| `ObjectiveType.KILL`    | `'kill'`    |
| `ObjectiveType.DELIVER` | `'deliver'` |
| `ObjectiveType.COLLECT` | `'collect'` |
| `ObjectiveType.TALK`    | `'talk'`    |

## 📋 字段映射（来自 Design Doc）

| #   | DB 字段 (snake_case) | dbase key     | API JSON     | 前端 TS      | TypeORM 类型           | 默认值 |
| --- | -------------------- | ------------- | ------------ | ------------ | ---------------------- | ------ |
| 1   | `exp`                | `exp`         | `exp`        | `exp`        | `int`                  | 0      |
| 2   | `level`              | `level`       | `level`      | `level`      | `int`                  | 1      |
| 3   | `potential`          | `potential`   | `potential`  | `potential`  | `int`                  | 0      |
| 4   | `score`              | `score`       | `score`      | `score`      | `int`                  | 0      |
| 5   | `free_points`        | `free_points` | `freePoints` | `freePoints` | `int`                  | 0      |
| 6   | `quest_data`         | `quests`      | —            | —            | `simple-json` / `json` | null   |

### QuestDefinition 接口

```typescript
interface QuestDefinition {
  id: string;
  name: string;
  description: string;
  type: QuestType;
  giverNpc: string;
  turnInNpc?: string;
  prerequisites?: QuestPrerequisites;
  objectives: QuestObjective[];
  rewards: QuestRewards;
  giveItems?: { blueprintId: string; count: number }[];
}
```

### PlayerQuestData 结构

```typescript
interface PlayerQuestData {
  active: { [questId: string]: QuestProgress };
  completed: string[];
}

interface QuestProgress {
  questId: string;
  status: QuestStatus.ACTIVE | QuestStatus.READY;
  objectives: { [index: number]: number };
  acceptedAt: number;
}
```

## 代码参考

- Character 实体：`server/src/character/character.entity.ts` L18-223
- 数据加载：`server/src/websocket/handlers/stats.utils.ts` L78-101 `loadCharacterToPlayer()`
- 断线处理：`server/src/websocket/websocket.gateway.ts` handleDisconnect
- Character Service：`server/src/character/character.service.ts`
