# Task 6: quest 指令 + WebSocket 消息路由 + NPC look/roomInfo 扩展

## 关联

- Part of feature: 任务系统 + 经验升级体系
- Phase: 3 — 后端集成
- Design Doc: #219
- Depends on: Task 3, Task 4
- Parallel with: Task 5

## 任务描述

实现 quest 指令，在 WebSocket Gateway 中添加新消息路由，扩展 NPC look 和 roomInfo 以携带任务信息。

### 具体工作

1. **新建** `server/src/engine/commands/std/quest.ts` — quest 指令（推送 questUpdate 到前端）
2. **注册** quest 指令到命令系统
3. **修改** `websocket.gateway.ts` — 添加 questAccept/questAbandon/questComplete/allocatePoints 消息路由
4. **修改** `look.ts` `lookAtNpc()` — 在 data.capabilities 中新增 quests 字段（NpcQuestBrief[]）
5. **修改** `room-utils.ts` `sendRoomInfo()` — NPC 数据中新增 hasQuest/hasQuestReady 字段

## 验收标准

- [ ] `quest` 指令向前端推送 questUpdate 消息（不输出日志文本）
- [ ] quest 指令在命令系统中注册
- [ ] WebSocket Gateway 正确路由 questAccept → QuestManager.acceptQuest()
- [ ] WebSocket Gateway 正确路由 questAbandon → QuestManager.abandonQuest()
- [ ] WebSocket Gateway 正确路由 questComplete → QuestManager.completeQuest()
- [ ] WebSocket Gateway 正确路由 allocatePoints → ExpManager.allocatePoints()
- [ ] NPC look 返回 capabilities.quests（NpcQuestBrief[]）
- [ ] roomInfo NPC 数据包含 hasQuest/hasQuestReady 布尔值
- [ ] TypeScript 编译通过

## 📋 契约片段（来自 Design Doc）

### quest 指令

```typescript
// 不输出文本，纯消息推送
execute(player: PlayerBase): CommandResult {
  questManager.sendQuestUpdate(player);
  return { success: true, message: '' };
}
```

### WebSocket 路由

```
questAccept  → questManager.acceptQuest(player, data.questId, npc)
questAbandon → questManager.abandonQuest(player, data.questId)
questComplete → questManager.completeQuest(player, data.questId, npc)
allocatePoints → expManager.allocatePoints(player, data.allocations)
```

注意：questAccept/questComplete 需要通过 data.npcId 找到对应 NPC 实例。

### NPC look capabilities 扩展

```typescript
capabilities: {
  shop: boolean;
  quests: NpcQuestBrief[];    // ← 新增
}
```

```typescript
interface NpcQuestBrief {
  questId: string;
  name: string;
  description: string;
  state: 'available' | 'active' | 'ready';
  objectives?: QuestObjectiveProgress[];
}
```

### roomInfo NpcBrief 扩展

```typescript
// 每个 NPC 新增
hasQuest?: boolean;          // 有可接任务
hasQuestReady?: boolean;     // 有可交付任务
```

## 代码参考

- 已有指令注册方式：参考 `server/src/engine/commands/` 下任意指令的注册模式
- WebSocket Gateway：`server/src/websocket/websocket.gateway.ts`（switch 路由）
- lookAtNpc()：`look.ts` L212-276（capabilities 字段在 L268-270）
- sendRoomInfo() NPC 构建：`room-utils.ts` L83-92
- ObjectManager 查找 NPC：通过 npcId 在房间内查找 NPC 实例
