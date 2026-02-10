# Task 10: NpcInfoModal QuestSection + NpcCard 角标 + LocationHeader 任务按钮

## 关联

- Part of feature: 任务系统 + 经验升级体系
- Phase: 5 — 前端
- Design Doc: #219
- Depends on: Task 8
- Parallel with: Task 9

## 任务描述

扩展 NpcInfoModal 添加任务交互区域，NpcCard 添加任务角标，LocationHeader 添加"任务"按钮打开 QuestListModal。

### 具体工作

1. **新建** `client/src/components/game/NpcList/QuestSection.tsx` — NPC 弹窗内任务区域
   - available 状态：任务描述 + "接受任务"按钮
   - active 状态：进度展示
   - ready 状态："完成任务"按钮
2. **修改** `NpcInfoModal.tsx` — 引入 QuestSection，从 capabilities.quests 取数据
3. **修改** `NpcCard.tsx` — 添加任务角标（? 可接 / ! 可交付）
4. **修改** `LocationHeader/index.tsx` — 添加"任务"按钮（替换"邮件"）
5. 任务按钮点击 → 发送 quest 指令或直接通过 store 控制 QuestListModal 显隐
6. "接受任务"按钮发送 `questAccept` 消息
7. "完成任务"按钮发送 `questComplete` 消息

## 验收标准

- [ ] QuestSection 根据 quest state 渲染不同 UI（available/active/ready）
- [ ] "接受任务"按钮发送 questAccept 消息（含 questId + npcId）
- [ ] "完成任务"按钮发送 questComplete 消息（含 questId + npcId）
- [ ] NpcInfoModal 正确渲染 QuestSection
- [ ] NpcCard 有任务的 NPC 显示角标（? 或 !）
- [ ] LocationHeader 有"任务"按钮
- [ ] 点击"任务"按钮打开 QuestListModal
- [ ] 组件遵循 Unity3D 模型
- [ ] 水墨风配色一致
- [ ] TypeScript 编译通过

## 📋 契约片段（来自 Design Doc）

### QuestSection Props

```typescript
interface QuestSectionProps {
  quests: NpcQuestBrief[];
  npcId: string;
  npcName: string;
  onAccept: (questId: string, npcId: string) => void;
  onComplete: (questId: string, npcId: string) => void;
}
```

### NpcQuestBrief

```typescript
interface NpcQuestBrief {
  questId: string;
  name: string;
  description: string;
  state: 'available' | 'active' | 'ready';
  objectives?: QuestObjectiveProgress[];
}
```

### questAccept 消息

```typescript
WebSocketService.getInstance().send(
  MessageFactory.serialize(MessageFactory.create('questAccept', { questId, npcId })),
);
```

### questComplete 消息

```typescript
WebSocketService.getInstance().send(
  MessageFactory.serialize(MessageFactory.create('questComplete', { questId, npcId })),
);
```

### NpcCard 角标

```typescript
// hasQuestReady → 金色 ! （可交付，高优先级）
// hasQuest && !hasQuestReady → 灰色 ? （可接受）
{npc.hasQuestReady && <Text style={s.questBadgeReady}>!</Text>}
{npc.hasQuest && !npc.hasQuestReady && <Text style={s.questBadge}>?</Text>}
```

### LocationHeader 任务按钮

```typescript
// 替换 actions 中的 "邮件" 为 "任务"
// 或添加独立的任务按钮组件
<LocationActionButton label="任务" onPress={() => setQuestModalVisible(true)} />
```

## 代码参考

- NpcInfoModal：`client/src/components/game/NpcList/NpcInfoModal.tsx` L66-73（Props）
- NpcCard：`client/src/components/game/NpcList/NpcCard.tsx`
- LocationHeader：`client/src/components/game/LocationHeader/index.tsx`
- LocationActionButton：`client/src/components/game/LocationHeader/LocationActionButton.tsx`
- location.actions 默认值：`useGameStore.ts` L298 `['回城', '飞行', '地图', '邮件']`
- WebSocket 发送：WebSocketService.getInstance().send()
