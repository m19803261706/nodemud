# 功能探讨: 富文本标记协议

## 基本信息

- **创建时间**: 2026-02-02
- **关联项目蓝图**: #1（NodeMUD 项目蓝图）
- **关联出生点地图**: #85（裂隙镇）
- **前置依赖**: packages/core 消息体系、前端水墨风 UI

## 功能目标

为"人在江湖"设计一套**语义化富文本标记协议**，实现 MUD 游戏的核心特色——一段文本中混合多种颜色和样式。

核心要求：
1. **组合式富文本** — 一段消息中混合多种语义颜色和样式（加粗/斜体），支持嵌套
2. **语义化标记** — 后端传语义标记而非颜色码，前端根据主题映射色值
3. **双主题支持** — 浅色模式立即可用，暗色模式预留色值零成本切换
4. **前后端共享** — 协议定义放 packages/core，后端拼装、前端解析

## 设计背景

### 传统 MUD 的做法

传统 MUD（如[炎黄 MUD](https://github.com/oiuv/mud)）基于终端 ANSI 转义码，在 [mudcore/ansi.h](https://github.com/oiuv/mudcore/blob/master/include/ansi.h) 中定义了颜色宏：

- `HIR`（高亮红）、`HIG`（高亮绿）、`HIY`（高亮黄）等 16 色
- `NOR`（重置）、`BOLD`（粗体）、`U`（下划线）等效果
- 使用方式：`"施出" HIR "血穹苍" NOR "之「" HIR "苍穹无悔" NOR "」"`

**局限**：ANSI 只有 16 色，且与终端耦合，不支持主题切换。

### 我们的优势

React Native 前端可以使用任意颜色码和文字样式，不受终端限制。但需要**约束和体系化**：
- 不能随意用色，要有统一的色彩语言
- 颜色不能硬编码在后端，要支持主题切换
- 标记协议要简洁，蓝图代码中频繁使用不能太啰嗦

## 标记协议设计

### 语法格式：BBCode 风格

采用 `[tag]...[/tag]` 格式。

**选择理由**：
- 简洁，MUD 社区熟悉
- 支持嵌套：`[damage][b]128[/b][/damage]`
- 易解析：正则匹配即可
- 不与 JSON 冲突（不用 `{}` 和 `<>`）
- 比 XML 风格 `{color:npc}` 更短，蓝图代码中写起来更快

### 语义颜色标记（14 个）

| 标记 | 全称 | 用途 | 浅色模式 | 暗色模式（预留） |
|------|------|------|---------|----------------|
| `[rn]` | room name | 房间/地点名称 | `#2B5B3C` 深松绿 | `#7BC89C` |
| `[rd]` | room description | 房间描述正文 | `#3A3530` 深棕 | `#D5CEC0` |
| `[exit]` | exit | 出口方向 | `#2E6B8A` 靛蓝 | `#6CB8D8` |
| `[npc]` | npc | NPC 名称 | `#8B6914` 暗金 | `#D4A843` |
| `[player]` | player | 玩家名称 | `#5B4FA0` 紫蓝 | `#9B8FD0` |
| `[item]` | item | 物品名称 | `#7A5C2E` 棕铜 | `#C49A5C` |
| `[damage]` | damage | 伤害数值/描述 | `#A03030` 暗红 | `#E06060` |
| `[heal]` | heal | 恢复/治疗 | `#2F7A3F` 翠绿 | `#5FBA6F` |
| `[sys]` | system | 系统消息 | `#8B7A5A` 土金 | `#A09580` |
| `[combat]` | combat | 战斗动作描述 | `#8B4513` 鞍褐 | `#C07040` |
| `[skill]` | skill | 技能名称 | `#6B2F8A` 暗紫 | `#A06FCA` |
| `[chat]` | chat | 聊天内容 | `#3A3530` 深色 | `#D5CEC0` |
| `[emote]` | emote | 表情/动作 | `#6B5D4D` 棕灰 | `#B0A090` |
| `[imp]` | important | 重要提示 | `#C04020` 朱红 | `#FF6040` |

### 样式标记（3 个）

| 标记 | 效果 | 典型用途 |
|------|------|---------|
| `[b]...[/b]` | **加粗** | 伤害数字、重要名称、技能招式名 |
| `[i]...[/i]` | *斜体* | 内心独白、旁白描述、环境氛围 |
| `[u]...[/u]` | 下划线 | 可点击的元素（NPC 名、物品名，后续交互用） |

### 色值设计原则

1. **WCAG AA 对比度**：浅色模式所有色值在 `#F5F0E8`（水墨米色背景）上对比度 ≥ 4.5:1
2. **暗色模式对称**：每个语义色都预留暗色模式亮色版本，在深色背景上同样保证对比度
3. **色系分区**：
   - 绿色系 → 地点/环境/恢复（`rn`、`heal`）
   - 蓝色系 → 可交互元素（`exit`）
   - 金色/紫色系 → 人物（`npc`金色、`player`紫色）
   - 红色/橙色系 → 伤害/战斗/警告（`damage`、`combat`、`imp`）
   - 棕色系 → 物品/物件（`item`）
   - 紫色系 → 技能/神秘（`skill`）
4. **水墨风融合**：所有颜色偏低饱和度，不用纯色（如纯红 `#FF0000`），保持水墨质感

### 现有水墨风主题色参考

| 用途 | 色值 | 说明 |
|------|------|------|
| 主背景 | `#F5F0E8` → `#D5CEC0` | 渐变米色 |
| 文字深色 | `#3A3530` | 近黑棕 |
| 文字中色 | `#6B5D4D` | 棕灰 |
| 文字浅色 | `#8B7A5A` | 土金 |
| 成功色 | `#2F5D3A` | 墨绿 |
| 错误色 | `#8B3A3A` | 暗红 |

富文本色值延续了水墨风低饱和度原则，同时增加了色相范围以区分不同语义。

## 组合式富文本示例

### 战斗描述

后端发送：
```
[combat]你凝聚内力，施展[/combat][skill][b]降龙十八掌[/b][/skill][combat]第三式——[/combat][skill]见龙在田[/skill][combat]！
一掌轰出，劲气激荡，[/combat][npc]悍匪头目[/npc][combat]被震退三步，[/combat][damage]受到 [b]128[/b] 点伤害[/damage][combat]！[/combat]
```

前端渲染效果（颜色标注）：
```
你凝聚内力，施展（鞍褐）降龙十八掌（暗紫+粗体）第三式——（鞍褐）见龙在田（暗紫）！
一掌轰出，劲气激荡，（鞍褐）悍匪头目（暗金）被震退三步，（鞍褐）受到 128（暗红+粗体） 点伤害（暗红）！（鞍褐）
```

### 获得物品

```
[sys]你打败了[/sys][npc][b]悍匪头目[/b][/npc][sys]！[/sys]
[player]张三[/player][sys]获得了[/sys][item][b]玄铁剑[/b][/item][sys]。[/sys]
[sys]经验值 +[/sys][imp][b]250[/b][/imp]
```

### 房间描述（look 指令输出）

```
[rn][b]裂隙镇·镇中广场[/b][/rn]
[rd]裂隙镇的中心是一片不大的青石广场。四周断崖高耸，只在头顶留出一线天光。广场中央立着一块残碑，上面的字迹已被风雨侵蚀得模糊不清，只依稀可辨"天衍"二字。[/rd]
[exit]出口: 北 南 东 西 下[/exit]
[sys]这里有: [/sys][npc]老镇长[/npc]
```

### 聊天

```
[player]张三[/player][chat]说道：「今天天气不错。」[/chat]
```

### 系统公告

```
[imp][b]【天裂异动】[/b][/imp][sys]西域荒原发现[/sys][imp]天衍碑碎片[/imp][sys]，各路高手闻风而动。[/sys]
```

### 恢复/治疗

```
[heal]你运功疗伤，恢复了 [b]50[/b] 点气血。[/heal]
[sys]当前气血: [/sys][heal][b]180[/b][/heal][sys]/200[/sys]
```

## 技术架构

### 解析流程

```
后端（蓝图/指令代码）          packages/core            前端（React Native）
                              (共享定义)

拼装带标记的文本        →    标记常量定义          ←    解析器 parseRichText()
"[npc]老镇长[/npc]"         SEMANTIC_TAGS              → RichTextNode[]
                             STYLE_TAGS                 → <Text> 嵌套片段
                             THEME_COLORS               → StyleSheet 映射
                             (light/dark 色值表)
```

### packages/core 中定义

```typescript
// packages/core/src/rich-text/tags.ts

/** 语义颜色标记 */
export const SEMANTIC_TAGS = {
  rn: 'rn',           // 房间名称
  rd: 'rd',           // 房间描述
  exit: 'exit',       // 出口方向
  npc: 'npc',         // NPC 名称
  player: 'player',   // 玩家名称
  item: 'item',       // 物品名称
  damage: 'damage',   // 伤害
  heal: 'heal',       // 恢复
  sys: 'sys',         // 系统消息
  combat: 'combat',   // 战斗动作
  skill: 'skill',     // 技能名称
  chat: 'chat',       // 聊天内容
  emote: 'emote',     // 表情/动作
  imp: 'imp',         // 重要提示
} as const;

/** 样式标记 */
export const STYLE_TAGS = {
  b: 'b',   // 加粗
  i: 'i',   // 斜体
  u: 'u',   // 下划线
} as const;

/** 主题色值表 */
export const THEME_COLORS = {
  light: {
    rn:     '#2B5B3C',  // 深松绿
    rd:     '#3A3530',  // 深棕
    exit:   '#2E6B8A',  // 靛蓝
    npc:    '#8B6914',  // 暗金
    player: '#5B4FA0',  // 紫蓝
    item:   '#7A5C2E',  // 棕铜
    damage: '#A03030',  // 暗红
    heal:   '#2F7A3F',  // 翠绿
    sys:    '#8B7A5A',  // 土金
    combat: '#8B4513',  // 鞍褐
    skill:  '#6B2F8A',  // 暗紫
    chat:   '#3A3530',  // 深色
    emote:  '#6B5D4D',  // 棕灰
    imp:    '#C04020',  // 朱红
  },
  dark: {
    rn:     '#7BC89C',
    rd:     '#D5CEC0',
    exit:   '#6CB8D8',
    npc:    '#D4A843',
    player: '#9B8FD0',
    item:   '#C49A5C',
    damage: '#E06060',
    heal:   '#5FBA6F',
    sys:    '#A09580',
    combat: '#C07040',
    skill:  '#A06FCA',
    chat:   '#D5CEC0',
    emote:  '#B0A090',
    imp:    '#FF6040',
  },
} as const;
```

### 后端拼装工具（可选）

```typescript
// packages/core/src/rich-text/builder.ts

/** 便捷函数：包裹语义标记 */
export function rt(tag: string, text: string): string {
  return `[${tag}]${text}[/${tag}]`;
}

/** 便捷函数：加粗 */
export function bold(text: string): string {
  return `[b]${text}[/b]`;
}

// 使用示例（后端蓝图/指令代码中）:
// rt('npc', bold('悍匪头目'))  → "[npc][b]悍匪头目[/b][/npc]"
// rt('damage', `受到 ${bold(String(dmg))} 点伤害`) → "[damage]受到 [b]128[/b] 点伤害[/damage]"
```

### 前端解析器

```typescript
// client/src/utils/parseRichText.ts

interface RichTextNode {
  text: string;
  color?: string;       // 语义标记对应的色值
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

/**
 * 解析富文本标记为节点数组
 * @param raw 带标记的原始文本
 * @param theme 当前主题 'light' | 'dark'
 * @returns 节点数组，前端映射为 <Text> 嵌套
 */
function parseRichText(raw: string, theme: 'light' | 'dark'): RichTextNode[];
```

前端渲染：

```tsx
// client/src/components/RichText.tsx

const RichText: React.FC<{ text: string; theme: 'light' | 'dark' }> = ({ text, theme }) => {
  const nodes = parseRichText(text, theme);
  return (
    <Text>
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

## 与现有系统的关系

### 依赖

- **packages/core**: 标记定义、色值表、工具函数放在此处，前后端共享
- **前端 UI**: 需要新增 `RichText` 组件和 `parseRichText` 解析器
- **look 指令**: 当前 look 输出纯文本，改造为带标记的富文本
- **say 指令**: 聊天消息包裹 `[player]` 和 `[chat]` 标记
- **go 指令**: 移动消息包裹语义标记

### 需要改动

- **look.ts**: 输出文本增加 `[rn]`、`[rd]`、`[exit]`、`[npc]` 等标记
- **say.ts**: 聊天消息增加 `[player]`、`[chat]` 标记
- **go.ts**: 移动消息增加标记
- **packages/core**: 新增 `rich-text/` 目录（tags、builder、类型定义）
- **前端**: 新增 `RichText` 组件，消息日志组件使用 `RichText` 渲染

### 不需要改动

- RoomBase、NpcBase、BaseEntity 等引擎基类不受影响
- WebSocket 协议不变（富文本标记是消息 content 内的字符串格式）
- 现有登录/注册/创建角色流程不受影响

## 考虑过的替代方案

| 方案 | 优点 | 缺点 | 结论 |
|------|------|------|------|
| 后端传 hex 颜色码 | 简单直接 | 暗色模式适配困难，颜色散布在蓝图代码中 | 放弃 |
| 后端传 ANSI 码 | 传统 MUD 做法 | 16 色太少，前端还要转换 | 放弃 |
| 后端传语义标记（采用） | 主题切换零成本，颜色集中管理 | 需定义协议 | 采用 |
| XML 风格 `<npc>` | 标准化 | 与 JSX/HTML 混淆，解析复杂 | 放弃 |
| `{color:npc}` 风格 | 明确 | 太啰嗦，蓝图中写起来长 | 放弃 |
| BBCode `[npc]`（采用） | 简洁，支持嵌套，MUD 社区熟悉 | 无 | 采用 |
| 更多样式标记（字号/背景色等） | 更丰富 | 复杂度高，水墨风不需要花哨 | 放弃，只保留 b/i/u |

## 边界和约束

- 标记不支持属性参数（如 `[color=#FF0000]`），只有预定义的语义标记
- 嵌套层级不超过 3 层（如 `[combat][skill][b]...[/b][/skill][/combat]`）
- 未闭合的标记视为纯文本输出（容错处理）
- 不支持背景色标记、字号标记、闪烁等效果——保持水墨风简洁
- 暗色模式色值为预留，当前仅实现浅色模式

## 开放问题（留给 PRD/Design 阶段）

- `parseRichText` 解析器的具体实现算法（递归下降 vs 正则状态机）
- `RichText` 组件的性能优化（长文本消息日志的虚拟化渲染）
- look 指令输出格式的具体改造方案
- 是否需要后端的 `rt()` 工具函数，还是直接在蓝图代码中手写标记
- `[u]` 下划线标记的点击交互——点击 NPC 名字是否触发 `look <npc>` 指令
- 消息日志组件的滚动和历史消息管理

## 探讨记录

### 关键决策过程

1. **语义标记 vs 颜色码**：选择语义化标记而非直接传颜色码。理由：支持主题切换（浅色/暗色模式）零成本；颜色集中在 `THEME_COLORS` 中管理，不散布在蓝图代码里；语义化让代码可读性更好（`[npc]` 比 `#8B6914` 直观）。

2. **BBCode 语法**：选择 `[tag]...[/tag]` 格式。比 XML 风格简洁，不与 JSON/JSX 冲突，MUD 社区熟悉，支持嵌套。

3. **组合式富文本**：确认一段文本中可以混合多种语义标记和样式标记，支持嵌套（如 `[damage][b]128[/b][/damage]`）。这是 MUD 的核心特色，战斗描述、物品获取、系统公告等都需要。

4. **样式标记精简**：只保留 `[b]`（加粗）、`[i]`（斜体）、`[u]`（下划线）三种。不加字号、背景色、闪烁等效果，保持水墨风简洁。

5. **色值风格**：所有颜色偏低饱和度，不用纯色（如纯红 `#FF0000`），与水墨风主题融合。浅色模式在 `#F5F0E8` 背景上保证 WCAG AA 对比度，暗色模式预留对应亮色版本。

6. **协议位置**：定义放 `packages/core` 的 `rich-text/` 目录，前后端共享。后端用工具函数拼装，前端用解析器解析渲染。

### 参考资料

- [炎黄 MUD ansi.h](https://github.com/oiuv/mudcore/blob/master/include/ansi.h) — LPC ANSI 颜色宏定义
- [Evennia TextTags](https://github.com/evennia/evennia/wiki/TextTags) — Python MUD 框架的文本标记系统
- WCAG 2.1 AA 对比度标准 — 4.5:1 最低要求

---

> CX 工作流 | 功能探讨
