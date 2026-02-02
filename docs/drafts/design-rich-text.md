# Design Doc: 富文本协议实现

## 关联

- PRD: #87
- Scope: #86（[Scope] 富文本标记协议）
- 关联 Epic: #75（Layer 4 指令系统，已完成）— 复用 CommandResult、look/say/go 指令
- 关联 Design Doc: #74（Layer 4 设计）— 继承指令接口和 CommandResult 格式

## 基于现有代码

| 模块                | 路径                                    | 复用/修改方式                                  |
| ------------------- | --------------------------------------- | ---------------------------------------------- |
| packages/core index | `packages/core/src/index.ts`            | 修改: 新增 `rich-text` 导出                    |
| packages/core types | `packages/core/src/types/`              | 复用: 参考目录结构（不修改）                   |
| LookCommand         | `engine/commands/std/look.ts`           | 修改: 文本输出增加标记                         |
| SayCommand          | `engine/commands/std/say.ts`            | 修改: 文本输出增加标记                         |
| GoCommand           | `engine/commands/std/go.ts`             | 修改: 文本输出增加标记                         |
| RoomBase            | `engine/game-objects/room-base.ts`      | 复用: broadcast 方法不变                       |
| CommandResult       | `engine/types/command.ts`               | 复用: message 字段承载富文本标记（不修改接口） |
| CommandHandler      | `websocket/handlers/command.handler.ts` | 不修改: 透传 CommandResult                     |
| GameHomeScreen      | `client/src/screens/GameHomeScreen.tsx` | 修改: 消息日志区域使用 RichText                |
| components/index    | `client/src/components/index.ts`        | 修改: 导出 RichText                            |

## 架构概览

```
后端蓝图/指令代码                    packages/core                    前端 React Native
                                    (共享层)

look.ts / say.ts / go.ts    →    rich-text/tags.ts           ←    parseRichText.ts
使用 rt() + bold() 拼装             SEMANTIC_TAGS                    解析 BBCode 标记
带标记的 message 字符串              STYLE_TAGS                       返回 RichTextNode[]
                                    THEME_COLORS                            ↓
         ↓                          (light/dark 色值)                 RichText.tsx
CommandResult.message                                                渲染 <Text> 嵌套片段
(带 [tag]...[/tag] 标记)       →    builder.ts                       color + fontWeight + ...
         ↓                          rt(tag, text)
WebSocket 透传                      bold(text)
(CommandHandler 不修改)              italic(text)
                                    underline(text)
```

**关键设计**: 富文本标记完全在 `CommandResult.message` 字符串内部，不修改 WebSocket 协议、不修改 `CommandResult` 接口、不修改 `CommandHandler` 透传逻辑。前端收到 message 后用解析器提取标记渲染。

## 数据库设计

无。富文本是纯展示层协议，不涉及数据持久化。

## API 设计

无新增 API。富文本标记嵌入在现有 `commandResult` 消息的 `data.message` 字段中：

```json
{
  "type": "commandResult",
  "data": {
    "success": true,
    "message": "[rn][b]裂隙镇·镇中广场[/b][/rn]\n[rd]青石广场...[/rd]\n[exit]出口: 北 南 东 西[/exit]"
  },
  "timestamp": 1738500000000
}
```

前端 WebSocket 收到后，将 `data.message` 传给 `<RichText text={message} />` 渲染。

## packages/core 设计

### 目录结构

```
packages/core/src/
├── rich-text/
│   ├── tags.ts         # 标记常量 + 色值表
│   ├── builder.ts      # 后端拼装工具函数
│   ├── types.ts        # 类型定义
│   └── index.ts        # 统一导出
├── types/              # 已有（不修改）
├── factory/            # 已有（不修改）
└── index.ts            # 修改：增加 export * from './rich-text'
```

### rich-text/types.ts

```typescript
/** 语义标记类型 */
export type SemanticTag =
  | 'rn'
  | 'rd'
  | 'exit'
  | 'npc'
  | 'player'
  | 'item'
  | 'damage'
  | 'heal'
  | 'sys'
  | 'combat'
  | 'skill'
  | 'chat'
  | 'emote'
  | 'imp';

/** 样式标记类型 */
export type StyleTag = 'b' | 'i' | 'u';

/** 所有标记类型 */
export type RichTag = SemanticTag | StyleTag;

/** 主题模式 */
export type ThemeMode = 'light' | 'dark';

/** 解析后的富文本节点 */
export interface RichTextNode {
  text: string;
  color?: string; // 语义标记映射的色值
  bold?: boolean; // [b] 标记
  italic?: boolean; // [i] 标记
  underline?: boolean; // [u] 标记
}
```

### rich-text/tags.ts

```typescript
import type { SemanticTag, StyleTag, ThemeMode } from './types';

/** 语义颜色标记（14 个） */
export const SEMANTIC_TAGS: Record<SemanticTag, SemanticTag> = {
  rn: 'rn', // 房间名称
  rd: 'rd', // 房间描述
  exit: 'exit', // 出口方向
  npc: 'npc', // NPC 名称
  player: 'player', // 玩家名称
  item: 'item', // 物品名称
  damage: 'damage', // 伤害
  heal: 'heal', // 恢复
  sys: 'sys', // 系统消息
  combat: 'combat', // 战斗动作
  skill: 'skill', // 技能名称
  chat: 'chat', // 聊天内容
  emote: 'emote', // 表情/动作
  imp: 'imp', // 重要提示
} as const;

/** 样式标记（3 个） */
export const STYLE_TAGS: Record<StyleTag, StyleTag> = {
  b: 'b', // 加粗
  i: 'i', // 斜体
  u: 'u', // 下划线
} as const;

/** 所有标记名称集合（供解析器使用） */
export const ALL_TAGS = new Set<string>([
  ...Object.keys(SEMANTIC_TAGS),
  ...Object.keys(STYLE_TAGS),
]);

/** 主题色值表 */
export const THEME_COLORS: Record<ThemeMode, Record<SemanticTag, string>> = {
  light: {
    rn: '#2B5B3C', // 深松绿
    rd: '#3A3530', // 深棕
    exit: '#2E6B8A', // 靛蓝
    npc: '#8B6914', // 暗金
    player: '#5B4FA0', // 紫蓝
    item: '#7A5C2E', // 棕铜
    damage: '#A03030', // 暗红
    heal: '#2F7A3F', // 翠绿
    sys: '#8B7A5A', // 土金
    combat: '#8B4513', // 鞍褐
    skill: '#6B2F8A', // 暗紫
    chat: '#3A3530', // 深色
    emote: '#6B5D4D', // 棕灰
    imp: '#C04020', // 朱红
  },
  dark: {
    rn: '#7BC89C',
    rd: '#D5CEC0',
    exit: '#6CB8D8',
    npc: '#D4A843',
    player: '#9B8FD0',
    item: '#C49A5C',
    damage: '#E06060',
    heal: '#5FBA6F',
    sys: '#A09580',
    combat: '#C07040',
    skill: '#A06FCA',
    chat: '#D5CEC0',
    emote: '#B0A090',
    imp: '#FF6040',
  },
} as const;
```

### rich-text/builder.ts

```typescript
import type { SemanticTag, StyleTag } from './types';

/**
 * 包裹语义标记
 * @example rt('npc', '老镇长') → "[npc]老镇长[/npc]"
 * @example rt('damage', `受到 ${bold('128')} 点伤害`) → "[damage]受到 [b]128[/b] 点伤害[/damage]"
 */
export function rt(tag: SemanticTag, text: string): string {
  return `[${tag}]${text}[/${tag}]`;
}

/** 加粗 */
export function bold(text: string): string {
  return `[b]${text}[/b]`;
}

/** 斜体 */
export function italic(text: string): string {
  return `[i]${text}[/i]`;
}

/** 下划线 */
export function underline(text: string): string {
  return `[u]${text}[/u]`;
}
```

### rich-text/index.ts

```typescript
export * from './types';
export * from './tags';
export * from './builder';
```

## 前端设计

### 目录结构

```
client/src/
├── utils/
│   └── parseRichText.ts    # 新增：富文本解析器
├── components/
│   ├── RichText.tsx         # 新增：富文本渲染组件
│   └── index.ts             # 修改：导出 RichText
└── screens/
    └── GameHomeScreen.tsx   # 修改：消息日志区域使用 RichText
```

### parseRichText 解析器算法

采用**正则状态机**方式，顺序扫描文本，遇到 `[tag]` 压栈当前样式，遇到 `[/tag]` 弹栈恢复，纯文本生成节点。

```typescript
// client/src/utils/parseRichText.ts

import {
  ALL_TAGS,
  SEMANTIC_TAGS,
  STYLE_TAGS,
  THEME_COLORS,
  type RichTextNode,
  type ThemeMode,
  type SemanticTag,
} from '@packages/core';

/** 最大嵌套层级 */
const MAX_DEPTH = 3;

/** 匹配 BBCode 标记的正则 */
const TAG_REGEX = /\[(\/?)([\w]+)\]/g;

interface StyleState {
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

/**
 * 解析富文本标记为节点数组
 * @param raw 带标记的原始文本
 * @param theme 当前主题 'light' | 'dark'
 * @returns 扁平节点数组
 */
export function parseRichText(raw: string, theme: ThemeMode = 'light'): RichTextNode[] {
  const nodes: RichTextNode[] = [];
  const colors = THEME_COLORS[theme];
  const stack: StyleState[] = [];
  let currentStyle: StyleState = {};
  let lastIndex = 0;

  TAG_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = TAG_REGEX.exec(raw)) !== null) {
    const [fullMatch, isClose, tagName] = match;

    // 非预定义标记 → 当作纯文本
    if (!ALL_TAGS.has(tagName)) continue;

    // 输出标记前的纯文本
    if (match.index > lastIndex) {
      const text = raw.slice(lastIndex, match.index);
      if (text) nodes.push({ text, ...currentStyle });
    }
    lastIndex = match.index + fullMatch.length;

    if (isClose === '/') {
      // 关闭标记 → 弹栈
      if (stack.length > 0) {
        currentStyle = stack.pop()!;
      }
    } else {
      // 开启标记 → 压栈（超过最大深度忽略）
      if (stack.length >= MAX_DEPTH) continue;
      stack.push({ ...currentStyle });

      if (tagName in SEMANTIC_TAGS) {
        currentStyle = { ...currentStyle, color: colors[tagName as SemanticTag] };
      } else if (tagName === 'b') {
        currentStyle = { ...currentStyle, bold: true };
      } else if (tagName === 'i') {
        currentStyle = { ...currentStyle, italic: true };
      } else if (tagName === 'u') {
        currentStyle = { ...currentStyle, underline: true };
      }
    }
  }

  // 输出剩余纯文本
  if (lastIndex < raw.length) {
    const text = raw.slice(lastIndex);
    if (text) nodes.push({ text, ...currentStyle });
  }

  return nodes;
}
```

**解析器设计要点**：

1. **正则状态机**：用 `TAG_REGEX` 全局匹配所有 `[tag]` 和 `[/tag]`，顺序扫描
2. **样式栈**：`[tag]` 时压栈当前样式并更新，`[/tag]` 时弹栈恢复
3. **容错**：未闭合标记不会导致崩溃，只是样式会延续到文本结束
4. **非预定义标记**：直接跳过，当作普通文字的一部分
5. **嵌套上限**：超过 3 层忽略标记
6. **输出扁平数组**：每个节点包含 text + 当时的样式快照，前端直接映射 `<Text>`

### RichText 组件

```tsx
// client/src/components/RichText.tsx

import React from 'react';
import { Text, type TextStyle } from 'react-native';
import { parseRichText } from '../utils/parseRichText';
import type { ThemeMode } from '@packages/core';

interface RichTextProps {
  text: string;
  theme?: ThemeMode;
  style?: TextStyle; // 外层 Text 基础样式
}

/**
 * 富文本渲染组件
 * 将带 BBCode 标记的文本解析为多色多样式 <Text> 片段
 */
export const RichText: React.FC<RichTextProps> = ({ text, theme = 'light', style }) => {
  const nodes = parseRichText(text, theme);

  return (
    <Text style={style}>
      {nodes.map((node, i) => (
        <Text
          key={i}
          style={{
            color: node.color,
            fontWeight: node.bold ? 'bold' : 'normal',
            fontStyle: node.italic ? 'italic' : 'normal',
            textDecorationLine: node.underline ? 'underline' : 'none',
          }}
        >
          {node.text}
        </Text>
      ))}
    </Text>
  );
};
```

**组件设计要点**：

1. 外层 `<Text style={style}>` 承载基础样式（字号、行高、字体等）
2. 内层 `<Text>` 仅设置差异样式（color、fontWeight 等）
3. React Native 的 `<Text>` 嵌套天然支持样式继承，外层字体/字号传递给内层
4. `theme` 参数默认 `'light'`，暗色模式只需传 `'dark'` 即可

## 后端设计

### 指令改造方案

后端指令文件引入 `rt`、`bold` 等工具函数，将纯文本输出改为带标记的富文本。

#### look.ts 改造

```typescript
// 引入工具函数
import { rt, bold } from '@packages/core';

// lookAtRoom 方法改造
private lookAtRoom(executor: LivingBase, env: BaseEntity): CommandResult {
  const isRoom = env instanceof RoomBase;
  const short = isRoom ? (env as RoomBase).getShort() : env.id;
  const long = isRoom ? (env as RoomBase).getLong() : '';
  const exits = isRoom ? (env as RoomBase).getExits() : {};
  const exitNames = Object.keys(exits);

  // 获取房间内其他对象（带类型判断）
  const items = env
    .getInventory()
    .filter((e) => e !== executor)
    .map((e) => {
      const name = typeof (e as any).getShort === 'function'
        ? (e as any).getShort() as string
        : e.id;
      // 根据类型包裹标记
      if (e instanceof LivingBase) return rt('npc', name);
      // 后续 ItemBase 判断可在此扩展
      return rt('item', name);
    });

  const lines: string[] = [];
  lines.push(rt('rn', bold(short)));
  if (long) lines.push(rt('rd', long));
  if (exitNames.length > 0) {
    lines.push(rt('exit', `出口: ${exitNames.join('、')}`));
  } else {
    lines.push(rt('sys', '这里没有出口。'));
  }
  if (items.length > 0) {
    lines.push(`${rt('sys', '这里有: ')}${items.join('、')}`);
  }

  return {
    success: true,
    message: lines.join('\n'),
    data: { short, long, exits: exitNames, items },
  };
}

// lookAtTarget 方法 — 查看对象的长描述也加标记
private lookAtTarget(executor: LivingBase, env: BaseEntity, target: string): CommandResult {
  // ...查找逻辑不变...
  const long = typeof (found as any).getLong === 'function'
    ? (found as any).getLong()
    : `你看到了 ${found.id}。`;

  return {
    success: true,
    message: rt('rd', long),
    data: { target: found.id, long },
  };
}
```

#### say.ts 改造

```typescript
import { rt } from '@packages/core';

execute(executor: LivingBase, args: string[]): CommandResult {
  // ...参数和房间检查不变...

  const message = args.join(' ');
  const name = executor.getName();

  // 广播给他人（带标记）
  env.broadcast(
    `${rt('player', name)}${rt('sys', '说道: 「')}${rt('chat', message)}${rt('sys', '」')}`,
    executor,
  );

  // 返回给自己
  return {
    success: true,
    message: `${rt('sys', '你说道: 「')}${rt('chat', message)}${rt('sys', '」')}`,
  };
}
```

#### go.ts 改造

```typescript
import { rt } from '@packages/core';

// 成功返回时
return {
  success: true,
  message: `${rt('sys', '你向')}${rt('exit', direction)}${rt('sys', '走去。')}`,
  data: { direction, targetId },
};
```

### broadcast 不需要修改

`RoomBase.broadcast(message)` 透传 message 字符串给 `entity.emit('message', { message })`。标记在 message 字符串中，broadcast 不感知标记内容。

## 前后端字段映射

本功能不涉及数据库和新 API 字段，唯一的"映射"是标记解析：

| 后端输出                      | WebSocket 字段               | 前端处理                                                          | 说明     |
| ----------------------------- | ---------------------------- | ----------------------------------------------------------------- | -------- |
| `[rn][b]裂隙镇[/b][/rn]`      | `commandResult.data.message` | `parseRichText()` → `{text:'裂隙镇', color:'#2B5B3C', bold:true}` | 房间名   |
| `[exit]出口: 北 南[/exit]`    | 同上                         | → `{text:'出口: 北 南', color:'#2E6B8A'}`                         | 出口     |
| `[npc]老镇长[/npc]`           | 同上                         | → `{text:'老镇长', color:'#8B6914'}`                              | NPC      |
| `[player]张三[/player]`       | 同上                         | → `{text:'张三', color:'#5B4FA0'}`                                | 玩家     |
| `[damage][b]128[/b][/damage]` | 同上                         | → `{text:'128', color:'#A03030', bold:true}`                      | 伤害数值 |

## 影响范围

### 新增文件（6 个）

| 文件                                     | 说明              |
| ---------------------------------------- | ----------------- |
| `packages/core/src/rich-text/types.ts`   | 类型定义          |
| `packages/core/src/rich-text/tags.ts`    | 标记常量 + 色值表 |
| `packages/core/src/rich-text/builder.ts` | 拼装工具函数      |
| `packages/core/src/rich-text/index.ts`   | 统一导出          |
| `client/src/utils/parseRichText.ts`      | 解析器            |
| `client/src/components/RichText.tsx`     | 渲染组件          |

### 修改文件（5 个）

| 文件                                     | 修改内容                           |
| ---------------------------------------- | ---------------------------------- |
| `packages/core/src/index.ts`             | 增加 `export * from './rich-text'` |
| `server/src/engine/commands/std/look.ts` | 引入 rt/bold，改造输出             |
| `server/src/engine/commands/std/say.ts`  | 引入 rt，改造输出                  |
| `server/src/engine/commands/std/go.ts`   | 引入 rt，改造输出                  |
| `client/src/components/index.ts`         | 导出 RichText                      |

### 不修改

- BaseEntity / RoomBase / LivingBase / NpcBase / PlayerBase
- CommandResult 接口、CommandManager、CommandLoader
- CommandHandler（透传）
- WebSocket 协议、MessageFactory
- 登录/注册/创建角色流程
- GameAlert / GameToast / TypewriterText

## 测试策略

### packages/core 测试

| 测试文件                    | 覆盖内容                                         |
| --------------------------- | ------------------------------------------------ |
| `rich-text/builder.spec.ts` | rt/bold/italic/underline 输出格式，嵌套组合      |
| `rich-text/tags.spec.ts`    | ALL_TAGS 包含所有标记，THEME_COLORS 两套色值完整 |

### 前端测试

| 测试文件                | 覆盖内容                                                 |
| ----------------------- | -------------------------------------------------------- |
| `parseRichText.spec.ts` | 单标记、嵌套标记、未闭合容错、纯文本、空字符串、嵌套超限 |

### 后端测试

现有 `look.spec.ts`、`say.spec.ts`、`go.spec.ts` 需更新断言，验证输出包含富文本标记。

## 风险点

| 风险                | 影响                                             | 应对方案                                            |
| ------------------- | ------------------------------------------------ | --------------------------------------------------- |
| 解析器性能          | 长文本（如战斗日志）正则匹配可能慢               | 单条消息通常 < 500 字，正则足够；后续可做 benchmark |
| 嵌套标记格式错误    | 开发者写错标记导致显示异常                       | 容错设计 + builder 工具函数封装常用模式             |
| core 包修改后未构建 | server/client 引用旧产物                         | 使用 `pnpm dev` 自动 watch；CI 中加 build 步骤      |
| 现有测试断言        | look/say/go 测试断言纯文本，改为富文本后断言失败 | 同步更新测试断言                                    |

---

> CX 工作流 | Design Doc | PRD #87
