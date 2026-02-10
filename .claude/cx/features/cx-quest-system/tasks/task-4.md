# Task 4: QuestManager 任务管理器

## 关联

- Part of feature: 任务系统 + 经验升级体系
- Phase: 2 — 后端核心引擎
- Design Doc: #219
- Depends on: Task 1, Task 2
- Parallel with: Task 3

## 任务描述

实现 QuestManager 全局单例，负责任务注册、前置条件检查、接受/放弃/完成、进度追踪和奖励发放。注册到 ServiceLocator。

### 具体工作

1. **新建** `server/src/engine/quest/quest-manager.ts`
2. 实现 registerQuest() — 注册任务定义
3. 实现 canAccept() — 检查前置条件（level/quests/score）
4. 实现 getAvailableQuests() — 获取 NPC 对某玩家的可用任务
5. 实现 getNpcQuestBriefs() — 获取 NPC 任务状态摘要（用于 look/roomInfo）
6. 实现 acceptQuest() — 接受任务（创建进度 + 给予任务物品）
7. 实现 abandonQuest() — 放弃任务（清除进度，状态回 available）
8. 实现 completeQuest() — 交付完成（校验 NPC + 发放奖励 + 调用 ExpManager）
9. 实现 onNpcDeath() / onItemDelivered() / onPlayerEnterRoom() / onInventoryChange() — 事件回调
10. 实现 sendQuestUpdate() — 构建 QuestUpdateData 并推送到前端
11. 注册到 ServiceLocator

## 验收标准

- [ ] QuestManager 注册到 ServiceLocator
- [ ] registerQuest() 正确存储任务定义
- [ ] canAccept() 检查 level/quests/score 前置条件
- [ ] acceptQuest() 创建 QuestProgress，给予 giveItems 物品
- [ ] abandonQuest() 清除进度，任务回到 available
- [ ] completeQuest() 校验 turnInNpc 匹配，检查目标全部完成，发放奖励
- [ ] onNpcDeath() 更新 capture 类型任务的 kill 目标计数
- [ ] onItemDelivered() 更新 deliver 类型任务进度
- [ ] onPlayerEnterRoom() 检查房间 NPC 可接任务并推送日志提示
- [ ] onInventoryChange() 检查 collect 类型任务的物品数量
- [ ] 目标全部完成时自动将状态从 active 切换为 ready
- [ ] sendQuestUpdate() 推送完整的 QuestUpdateData
- [ ] TypeScript 编译通过

## 📋 契约片段（来自 Design Doc）

### QuestManager 方法签名

```typescript
class QuestManager {
  registerQuest(def: QuestDefinition): void;
  getAvailableQuests(player: PlayerBase, npcBlueprintId: string): QuestDefinition[];
  getNpcQuestBriefs(player: PlayerBase, npcBlueprintId: string): NpcQuestBrief[];
  acceptQuest(player: PlayerBase, questId: string, npc: NpcBase): CommandResult;
  abandonQuest(player: PlayerBase, questId: string): CommandResult;
  completeQuest(player: PlayerBase, questId: string, npc: NpcBase): CommandResult;
  onNpcDeath(npc: NpcBase, killer: LivingBase): void;
  onItemDelivered(npc: NpcBase, giver: LivingBase, item: ItemBase): void;
  onPlayerEnterRoom(player: PlayerBase, room: RoomBase): void;
  onInventoryChange(player: PlayerBase): void;
  sendQuestUpdate(player: PlayerBase): void;
}
```

### NpcQuestBrief (look 返回用)

```typescript
interface NpcQuestBrief {
  questId: string;
  name: string;
  description: string;
  state: 'available' | 'active' | 'ready';
  objectives?: QuestObjectiveProgress[];
}
```

### questUpdate 消息结构

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
```

### 状态流转

```
HIDDEN ──(前置满足)──→ AVAILABLE ──(接受)──→ ACTIVE ──(目标完成)──→ READY ──(交付)──→ COMPLETED
                           ↑                    │
                           └──────(放弃)─────────┘
```

### 任务接受响应

成功 → questUpdate + commandResult("你接受了任务：{name}") + inventoryUpdate(如有 giveItems)
失败 → commandResult success:false ("你不满足接受此任务的条件")

### 任务完成响应

成功 → questUpdate + playerStats + commandResult("任务完成！获得经验 100，阅历 5") + inventoryUpdate(如有物品奖励)
失败 → commandResult success:false ("任务目标尚未完成"或"你不在正确的 NPC 身边")

### 进入房间日志提示格式

```
"你注意到{npcName}似乎有事相求。"
```

## 代码参考

- NpcBase.onReceiveItem()：`npc-base.ts` L116-126
- GameEvents：`events.ts` L5-37（DEATH, POST_MOVE, POST_RECEIVE）
- sendRoomInfo NPC 构建：`room-utils.ts` L83-92
- CommandResult 返回格式：参考 `look.ts` 的返回结构
- ServiceLocator：`server/src/engine/service-locator.ts`
- 蓝图 ID 获取：NPC 实例的 `this.blueprintId` 或通过 `BlueprintFactory.getBlueprintId(npc)`
