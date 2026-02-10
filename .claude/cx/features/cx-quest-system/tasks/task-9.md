# Task 9: QuestListModal 任务列表弹窗组件

## 关联

- Part of feature: 任务系统 + 经验升级体系
- Phase: 5 — 前端
- Design Doc: #219
- Depends on: Task 8
- Parallel with: Task 10

## 任务描述

创建 QuestListModal 任务列表弹窗组件，包含经验信息栏、进行中任务卡片、已完成任务列表。遵循 Unity3D 组件模型（极细粒度拆分）。

### 具体工作

1. **新建** `client/src/components/game/QuestListModal/index.tsx` — Modal 容器，从 store 取 quests + player 数据
2. **新建** `ExpInfoBar.tsx` — 等级 + 经验条 + 潜能 + 阅历数值
3. **新建** `ActiveQuestCard.tsx` — 进行中任务卡片（名称 + 类型标签 + 进度 + 放弃按钮）
4. **新建** `ObjectiveProgress.tsx` — 单个目标进度行（描述 + 当前/需求 + 勾选标记）
5. **新建** `CompletedQuestList.tsx` — 已完成任务折叠列表
6. 弹窗触发：通过 store 状态 `questModalVisible` 控制显隐

### UI 设计（水墨风）

- Modal 全屏或半屏，背景色 `#F5F0E8`
- 顶部：等级称号 + 经验条（渐变进度条） + 潜能/阅历数值
- 中部：进行中任务卡片列表（每卡片含任务名、类型角标、目标进度、放弃按钮）
- 底部：已完成任务折叠区（默认收起，点击展开）
- 放弃按钮发送 `questAbandon` 消息
- 关闭按钮在右上角

## 验收标准

- [ ] QuestListModal 从 store 读取 quests 和 player 数据
- [ ] ExpInfoBar 显示等级称号、经验条（current/max）、潜能、阅历
- [ ] ActiveQuestCard 显示任务名称、类型、进度、放弃按钮
- [ ] ObjectiveProgress 显示每个目标的描述和完成状态
- [ ] CompletedQuestList 可折叠展示已完成任务
- [ ] 放弃按钮发送 questAbandon WebSocket 消息
- [ ] 组件遵循 Unity3D 模型：一个组件一个文件、Props 显式声明、样式内聚
- [ ] 水墨风配色一致
- [ ] TypeScript 编译通过

## 📋 契约片段（来自 Design Doc）

### Store 数据

```typescript
// 从 store 取数据
const quests = useGameStore((state) => state.quests);
const player = useGameStore((state) => state.player);

// quests.active: ActiveQuestInfo[]
// quests.completed: CompletedQuestInfo[]
// player.level, player.levelTitle, player.exp, player.expToNextLevel
// player.potential, player.score
```

### questAbandon 消息

```typescript
// 放弃按钮发送
WebSocketService.getInstance().send(
  MessageFactory.serialize(MessageFactory.create('questAbandon', { questId })),
);
```

### 任务类型显示

| type     | 前端显示 |
| -------- | -------- |
| deliver  | 送信     |
| capture  | 剿灭     |
| collect  | 收集     |
| dialogue | 打探     |

## 代码参考

- 已有弹窗组件模式：`NpcList/NpcInfoModal.tsx`（Modal 使用方式）
- 已有弹窗组件模式：`NpcList/ItemInfoModal.tsx`
- 水墨风配色：主背景 `#F5F0E8`，文字 `#3A3530`/`#6B5D4D`/`#8B7A5A`
- 共享组件：`shared/GradientDivider.tsx`、`shared/StatBar.tsx`
- WebSocket 发送：`WebSocketService.getInstance().send()`
- Unity3D 组件模型：每个组件独立文件、独立 StyleSheet、Props interface
