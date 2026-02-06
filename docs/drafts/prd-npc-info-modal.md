# PRD: NPC 信息弹窗

## 基本信息

- **创建时间**: 2026-02-04 23:50
- **优先级**: P1（高）
- **技术栈**: TypeScript (React Native + NestJS)
- **关联 Scope**: #147

## 功能概述

玩家点击右侧 NPC 列表中的 NPC 卡片后，弹出水墨风信息弹窗，展示 NPC 的完整结构化信息（名字、头衔、性别、势力、等级、态度、血量、描述），并提供交互按钮（对话、关闭）。未来可扩展攻击/交易按钮。

## 用户场景

### 场景 1: 查看 NPC 信息

玩家进入房间，右侧 NPC 列表显示当前房间的 NPC 卡片。点击某个 NPC 卡片 → 弹出信息弹窗，展示该 NPC 的完整信息，包括详细描述（long）。

### 场景 2: 快捷对话

弹窗底部有「对话」按钮，点击后执行 `ask <npcName> default` 指令，NPC 的默认回复显示在游戏日志区。

### 场景 3: 快捷操作入口（占位）

弹窗预留攻击/交易按钮的位置，待战斗系统和商店系统实现后激活。本次不实现具体逻辑。

## 详细需求

### 1. 后端: look 指令扩展 NPC data 字段

**当前** `lookAtNpc()` 返回:

```typescript
data: { action: 'look', target: 'npc', npcId: npc.id }
```

**扩展为**:

```typescript
data: {
  action: 'look',
  target: 'npc',
  npcId: string,       // NPC 实例 ID
  name: string,        // 名字
  title: string,       // 头衔（如"裂隙镇"）
  gender: string,      // 性别 male/female
  faction: string,     // 可见势力名
  level: number,       // 等级
  hpPct: number,       // 血量百分比 0-100
  attitude: string,    // 态度 friendly/neutral/aggressive
  short: string,       // 简短描述
  long: string,        // 详细描述
}
```

**修改文件**: `server/src/engine/commands/std/look.ts` → `lookAtNpc()` 方法

### 2. 前端: Zustand store 扩展

在 `useGameStore.ts` 新增:

```typescript
/** NPC 详情数据（弹窗用） */
export interface NpcDetailData {
  npcId: string;
  name: string;
  title: string;
  gender: string;
  faction: string;
  level: number;
  hpPct: number;
  attitude: string;
  short: string;
  long: string;
}

// store 新增字段
npcDetail: NpcDetailData | null;
setNpcDetail: (detail: NpcDetailData | null) => void;
```

### 3. 前端: NpcCard 点击行为

`NpcCard.tsx` 的 `onPress` 绑定:

- 调用 `sendCommand("look <npc.name>")` 发送 look 指令

### 4. 前端: commandResult 消息分发

在 App.tsx 的 WebSocket 消息监听中:

- 监听 `commandResult` 事件
- 当 `data.action === 'look' && data.target === 'npc'` 时
- 调用 `store.setNpcDetail(data)` 写入 store
- NpcInfoModal 自动显示

### 5. 前端: NpcInfoModal 组件

新增 `client/src/components/game/NpcList/NpcInfoModal.tsx`

水墨风 Modal 弹窗，设计风格与 `GameAlert.tsx` 一致:

- 背景: LinearGradient `#F5F0E8` → `#D5CEC0`
- 边框: `#8B7A5A40` 墨线
- 字体: Noto Serif SC

**弹窗布局**:

```
┌──────────────────────────────┐
│  「裂隙镇」杂货商        ♂  │  头衔 + 名字 + 性别图标
│  Lv.18  散盟                │  等级 + 势力
│  ──────────────────────────  │  渐变分隔线
│  一个精明的中年商人          │  short 描述
│  ──────────────────────────  │
│  杂货铺老板是个精瘦的        │  long 详细描述
│  中年人，一双小眼睛...       │  （ScrollView 可滚动）
│  ──────────────────────────  │
│  ██████████████████ 100%    │  血条（HpBar 组件）
│  ──────────────────────────  │
│     [ 对话 ]    [ 关闭 ]    │  交互按钮
└──────────────────────────────┘
```

**态度标签**:

- friendly → 绿色 `#2F5D3A`
- neutral → 褐色 `#8B7A5A`
- aggressive → 红色 `#8B2500`

**交互按钮**:

- 「对话」→ 执行 `sendCommand("ask <npcName> default")`，关闭弹窗
- 「关闭」→ `store.setNpcDetail(null)`

### 6. 前端: NpcList/index.tsx 绑定

NpcCard 的 `onPress` 传入点击处理函数:

```typescript
<NpcCard key={npc.id} npc={npc} onPress={() => sendCommand(`look ${npc.name}`)} />
```

## 关联文档

- Scope #147: NPC 信息弹窗功能探讨
- Epic #137: NPC 基础系统 Phase 0
- #142: look NPC 指令（已实现）
- #143: ask 对话指令（已实现）
- #145: 前端 NPC 真实数据适配（已实现）

## 现有代码基础

| 可复用             | 文件                      | 说明                              |
| ------------------ | ------------------------- | --------------------------------- |
| NPC 卡片           | `NpcCard.tsx`             | 已有 onPress prop，直接绑定       |
| 水墨风弹窗         | `GameAlert.tsx`           | 复用 LinearGradient + 墨线风格    |
| 血条组件           | `shared/HpBar.tsx`        | 直接复用                          |
| 态度颜色           | `NpcCard.tsx`             | 复用 ATTITUDE_COLORS 常量         |
| look 指令          | `look.ts` → `lookAtNpc()` | 已有 NPC 查看逻辑，扩展 data 字段 |
| WebSocket 消息分发 | `App.tsx`                 | 已有 commandResult 监听           |

## 代码影响范围

| 层级 | 文件                                                  | 改动类型                                   |
| ---- | ----------------------------------------------------- | ------------------------------------------ |
| 后端 | `server/src/engine/commands/std/look.ts`              | 修改: lookAtNpc data 字段扩展              |
| 前端 | `client/src/stores/useGameStore.ts`                   | 修改: 新增 NpcDetailData 类型和 store 字段 |
| 前端 | `client/src/components/game/NpcList/NpcInfoModal.tsx` | 新增: 水墨风信息弹窗组件                   |
| 前端 | `client/src/components/game/NpcList/NpcCard.tsx`      | 修改: onPress 绑定 look 指令               |
| 前端 | `client/src/components/game/NpcList/index.tsx`        | 修改: 传入 onPress + 挂载 NpcInfoModal     |
| 前端 | `client/App.tsx`                                      | 修改: commandResult 中识别 NPC look 结果   |

## 任务拆分（初步）

- [ ] 后端: look 指令 lookAtNpc() 扩展 data 字段
- [ ] 前端: useGameStore 新增 npcDetail 状态
- [ ] 前端: 新建 NpcInfoModal 水墨风弹窗组件
- [ ] 前端: NpcList/NpcCard 绑定点击行为
- [ ] 前端: App.tsx commandResult 消息识别 + 写入 store
- [ ] 测试: look npc 返回完整数据验证

## 验收标准

- [ ] 点击 NPC 卡片弹出水墨风信息弹窗
- [ ] 弹窗显示完整 NPC 信息: 名字、头衔、性别、势力、等级、态度、血量、描述
- [ ] 「对话」按钮点击后执行 ask 指令，日志区显示 NPC 回复
- [ ] 「关闭」按钮或点击遮罩关闭弹窗
- [ ] 弹窗 long 描述过长时可滚动
- [ ] 态度颜色正确显示（friendly 绿/neutral 褐/aggressive 红）
- [ ] NPC 不存在时（已被 GC）不弹窗，日志区显示错误提示

---

> CX 工作流 | PRD
