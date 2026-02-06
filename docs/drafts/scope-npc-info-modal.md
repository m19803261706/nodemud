# 功能探讨: NPC 信息弹窗

## 基本信息

- **创建时间**: 2026-02-04 23:45
- **关联项目蓝图**: #1
- **关联 Scope**: #134 (NPC 系统细化设计)

## 功能目标

点击 NPC 卡片后弹出水墨风信息弹窗，完整展示 NPC 的信息（名字、头衔、性别、势力、等级、血量、态度、详细描述），并提供交互按钮（查看详情、对话）。让玩家能直观地了解 NPC 并快速发起交互。

## 用户流程

```
1. 玩家在右侧 NPC 列表看到 NPC 卡片
2. 点击 NPC 卡片
3. 前端发送 `look <npcName>` 指令到后端
4. 后端返回 commandResult，data 包含完整 NPC 结构化信息
5. 前端识别 data.action === 'look' && data.target === 'npc'
6. 弹出 NpcInfoModal，展示完整信息 + 交互按钮
7. 玩家可点击「对话」按钮 → 弹出对话输入或直接执行 ask 指令
8. 玩家可点击「关闭」或点击遮罩关闭弹窗
```

## 方案概要

### 数据流

```
NpcCard.onPress → sendCommand("look <npcName>")
                ↓
Server: LookCommand.lookAtNpc() → 返回扩展 data
                ↓
Client: WebSocketService → commandResult 事件
                ↓
识别 data.action='look' + data.target='npc'
                ↓
store.setNpcDetail(data) → NpcInfoModal 显示
```

### 后端改动: look 指令扩展 NPC data 字段

`server/src/engine/commands/std/look.ts` 的 `lookAtNpc()` 方法：

**当前返回**:

```typescript
data: { action: 'look', target: 'npc', npcId: npc.id }
```

**扩展为**:

```typescript
data: {
  action: 'look',
  target: 'npc',
  npcId: npc.id,
  name: string,
  title: string,
  gender: string,
  faction: string,
  level: number,
  hpPct: number,
  attitude: string,
  short: string,
  long: string,
}
```

### 前端改动

#### 1. 新增 `NpcInfoModal` 组件

位置: `client/src/components/game/NpcList/NpcInfoModal.tsx`

水墨风 Modal 弹窗，参考现有 `GameAlert.tsx` 的设计风格：

- LinearGradient 背景 (`#F5F0E8` → `#D5CEC0`)
- 墨线边框 (`#8B7A5A40`)
- Noto Serif SC 字体

**弹窗布局**:

```
┌──────────────────────────┐
│  「裂隙镇」杂货商    ♂   │  ← 头衔 + 名字 + 性别图标
│  Lv.18  散盟  neutral   │  ← 等级 + 势力 + 态度标签
│  ─────────────────────── │  ← 渐变分隔线
│  一个精明的中年商人       │  ← short 描述
│  ─────────────────────── │
│  杂货铺老板是个精瘦的     │  ← long 详细描述（可滚动）
│  中年人，一双小眼睛...    │
│  ─────────────────────── │
│  ██████████████████ 100% │  ← 血条
│  ─────────────────────── │
│  [ 对话 ]    [ 关闭 ]    │  ← 交互按钮
└──────────────────────────┘
```

#### 2. 扩展 Zustand store

在 `useGameStore.ts` 中新增：

```typescript
// NPC 详情弹窗
npcDetail: NpcDetailData | null;
setNpcDetail: (detail: NpcDetailData | null) => void;
```

#### 3. NpcCard 点击绑定

`NpcCard.onPress` → `sendCommand("look <npcName>")`

#### 4. commandResult 消息分发

在 App.tsx 的 WebSocket 消息监听中，识别 `commandResult` 中的 NPC look 结果，写入 `store.npcDetail`。

### 交互按钮

| 按钮 | 行为                                          | 状态                 |
| ---- | --------------------------------------------- | -------------------- |
| 对话 | 执行 `ask <npcName> default` 或弹出关键词选择 | 本次实现             |
| 关闭 | 关闭弹窗                                      | 本次实现             |
| 攻击 | 执行 `kill <npcName>`                         | 待战斗系统实现后添加 |
| 交易 | 打开商店界面                                  | 待商店系统实现后添加 |

## 考虑过的替代方案

| 方案                     | 优点                   | 缺点                           | 结论 |
| ------------------------ | ---------------------- | ------------------------------ | ---- |
| A: 纯本地数据弹窗        | 无需后端改动，立即响应 | 没有 short/long 描述，信息单薄 | 放弃 |
| B: look 请求获取完整信息 | 信息丰富，结构化展示   | 需后端扩展 data 字段           | 采用 |
| A+B 混合                 | 先本地后异步           | 实现复杂，体验提升有限         | 放弃 |

## 与现有功能的关系

- **依赖**: NPC 列表（#145）、look 指令（#142）、ask 对话指令（#143）
- **影响**: `NpcCard.tsx` 添加 onPress 行为、`useGameStore.ts` 新增 npcDetail 状态
- **复用**: `GameAlert.tsx` 的水墨风弹窗样式、`HpBar` 组件、`RichText` 组件

## 边界和约束

- NPC 不在房间时（已被 GC）look 会返回 `success: false`，弹窗不弹出，显示 toast
- 弹窗 long 描述可能很长，需要 ScrollView 支持滚动
- 态度标签颜色复用 `NpcCard` 中已有的 `ATTITUDE_COLORS`

## 开放问题

- 「对话」按钮交互方式：直接 `ask default` 还是弹出关键词列表？留给 PRD 阶段确认
- 未来攻击/交易按钮的显示条件（如商人 NPC 才显示交易按钮）

## 探讨记录

1. 确认方案 B（请求后端详情），因为 NPC 的 short/long 描述是关键信息
2. 后端 `lookAtNpc` 的 data 字段需要扩展，补充完整结构化 NPC 数据
3. 交互按钮本次只实现「对话」和「关闭」，攻击/交易留给对应系统
4. 弹窗组件独立为 `NpcInfoModal`，水墨风格，复用 GameAlert 设计语言

---

> CX 工作流 | 功能探讨
