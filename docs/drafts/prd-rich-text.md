# PRD: 富文本协议实现

## 基本信息

- **创建时间**: 2026-02-02
- **优先级**: P1（高优先级，当前迭代必须完成）
- **技术栈**: TypeScript 全栈（packages/core + NestJS server + React Native client）
- **前置功能探讨**: #86（[Scope] 富文本标记协议）

## 功能概述

实现"人在江湖"MUD 游戏的富文本标记协议，使游戏文本具备多颜色、多样式的组合式显示能力。协议采用语义化 BBCode 语法（`[tag]...[/tag]`），定义在 packages/core 中前后端共享，后端蓝图/指令代码使用工具函数拼装标记，前端解析渲染为带颜色和样式的 `<Text>` 组件。

核心价值：

- MUD 游戏最重要的视觉特色——彩色文本
- 一段消息中混合多种颜色和样式（战斗描述、物品获取等）
- 语义化标记支持主题切换，暗色模式预留零成本

## 用户场景

### 场景 1: 玩家查看房间（look 指令）

玩家输入 `look`，看到房间名（深松绿+粗体）、描述（深棕）、出口方向（靛蓝）、NPC 列表（暗金）——多种颜色区分不同信息。

### 场景 2: 战斗描述

战斗中文本包含：动作描述（鞍褐）、技能名（暗紫+粗体）、NPC 名（暗金）、伤害数值（暗红+粗体）——组合式富文本。

### 场景 3: 玩家聊天（say 指令）

玩家名（紫蓝）+ 聊天内容（深色），区分"谁说了什么"。

### 场景 4: 系统消息

物品获取、经验值变化等系统消息，关键数值和名称用不同颜色高亮。

## 详细需求

### 需求 1: packages/core 富文本定义

在 `packages/core/src/rich-text/` 目录新增：

1. **tags.ts** — 14 个语义颜色标记常量 + 3 个样式标记常量
   - `SEMANTIC_TAGS`: rn/rd/exit/npc/player/item/damage/heal/sys/combat/skill/chat/emote/imp
   - `STYLE_TAGS`: b/i/u
   - `THEME_COLORS`: light + dark 两套色值表
   - `ALL_TAGS`: 合并集合，供解析器使用

2. **builder.ts** — 后端拼装工具函数
   - `rt(tag, text)` — 包裹语义标记：`rt('npc', '老镇长')` → `[npc]老镇长[/npc]`
   - `bold(text)` — 加粗：`bold('128')` → `[b]128[/b]`
   - `italic(text)` — 斜体
   - `underline(text)` — 下划线
   - 支持链式嵌套：`rt('damage', \`受到 ${bold('128')} 点伤害\`)`→`[damage]受到 [b]128[/b] 点伤害[/damage]`

3. **types.ts** — 类型定义
   - `SemanticTag` — 语义标记联合类型
   - `StyleTag` — 样式标记联合类型
   - `ThemeMode` — `'light' | 'dark'`
   - `RichTextNode` — 解析后的节点接口

4. **index.ts** — 统一导出

5. 在 `packages/core/src/index.ts` 增加 `export * from './rich-text'`

### 需求 2: 前端解析器

在 `client/src/utils/` 新增：

1. **parseRichText.ts** — 解析器
   - 输入：带标记的原始文本字符串 + 主题模式
   - 输出：`RichTextNode[]`（扁平节点数组）
   - 处理规则：
     - 正确解析嵌套标记（语义 + 样式组合）
     - 未闭合标记视为纯文本（容错）
     - 嵌套层级上限 3 层
     - 无标记的普通文本正常输出

### 需求 3: 前端 RichText 组件

在 `client/src/components/` 新增：

1. **RichText.tsx** — 富文本渲染组件
   - Props: `text: string`, `theme?: 'light' | 'dark'`（默认 light）
   - 使用 `parseRichText` 解析，映射为嵌套 `<Text>` 元素
   - 样式应用：color（语义标记映射色值）、fontWeight（bold）、fontStyle（italic）、textDecorationLine（underline）
   - 导出到 `client/src/components/index.ts`

### 需求 4: 后端指令改造

改造现有指令，使输出携带富文本标记：

1. **look.ts** — 查看房间
   - 房间名：`[rn][b]{short}[/b][/rn]`
   - 房间描述：`[rd]{long}[/rd]`
   - 出口列表：`[exit]出口: {dirs}[/exit]`
   - 房间内对象：`[sys]这里有: [/sys]` + 每个对象根据类型包裹对应标记（`[npc]`/`[item]`/`[player]`）

2. **say.ts** — 说话
   - 自己：`[sys]你说道: 「[/sys][chat]{message}[/chat][sys]」[/sys]`
   - 他人：`[player]{name}[/player][sys]说道: 「[/sys][chat]{message}[/chat][sys]」[/sys]`

3. **go.ts** — 移动
   - 成功：`[sys]你向[/sys][exit]{direction}[/exit][sys]走去。[/sys]`

### 需求 5: 消息日志区域使用 RichText

前端游戏主页（GameHomeScreen）中，消息日志区域使用 `RichText` 组件渲染消息内容，替代纯 `<Text>`。

## 关联文档

- Scope: #86（[Scope] 富文本标记协议）
- 项目蓝图: #1（NodeMUD 项目蓝图）
- 出生点地图: #85（裂隙镇）— 将使用富文本输出房间描述
- 世界观: #84（天衍世界观）

## 现有代码基础

### 可复用

- `packages/core/src/` — 已有 types 和 factory 目录结构，新增 rich-text 目录即可
- `client/src/components/` — 已有 GameAlert/GameToast/TypewriterText/UIProvider 组件体系
- `server/src/engine/commands/std/` — look/say/go 三个指令已实现纯文本输出

### 需要修改

- `packages/core/src/index.ts` — 增加 rich-text 导出
- `server/src/engine/commands/std/look.ts` — 文本输出增加标记
- `server/src/engine/commands/std/say.ts` — 文本输出增加标记
- `server/src/engine/commands/std/go.ts` — 文本输出增加标记
- `client/src/components/index.ts` — 导出 RichText 组件

### 不受影响

- RoomBase、NpcBase、LivingBase 等引擎基类
- WebSocket 协议和 MessageFactory
- 登录/注册/创建角色流程
- GameAlert、GameToast 组件

## 代码影响范围

- **packages/core**: 新增 `src/rich-text/` 目录（4 个文件），修改 `src/index.ts`
- **server**: 修改 3 个指令文件（look.ts、say.ts、go.ts）
- **client**: 新增 2 个文件（parseRichText.ts、RichText.tsx），修改 `components/index.ts`

## 任务拆分（初步）

### Phase 1: Core 协议定义

- [ ] packages/core 新增 rich-text 目录（tags/builder/types/index）

### Phase 2: 前端解析与渲染

- [ ] 前端 parseRichText 解析器
- [ ] 前端 RichText 组件

### Phase 3: 后端指令改造

- [ ] look.ts 富文本标记输出
- [ ] say.ts 富文本标记输出
- [ ] go.ts 富文本标记输出

### Phase 4: 集成

- [ ] 前端消息日志区域使用 RichText 渲染

## 验收标准

- [ ] packages/core 导出所有富文本常量、工具函数和类型，`pnpm build` 编译通过
- [ ] `rt('npc', bold('老镇长'))` 正确输出 `[npc][b]老镇长[/b][/npc]`
- [ ] `parseRichText` 正确解析嵌套标记，返回带 color/bold/italic/underline 属性的节点数组
- [ ] `parseRichText` 对未闭合标记容错，输出为纯文本
- [ ] `RichText` 组件渲染多色多样式文本，颜色与 `THEME_COLORS.light` 一致
- [ ] look 指令输出包含 `[rn]`、`[rd]`、`[exit]`、`[npc]` 等语义标记
- [ ] say 指令输出包含 `[player]`、`[chat]` 标记
- [ ] go 指令输出包含 `[exit]` 标记
- [ ] 前端消息日志区域正确渲染富文本（房间描述多色，战斗信息多色+粗体）
- [ ] 现有功能不受影响（登录/注册/心跳/指令基本功能）

## 边界与约束

- 只实现浅色模式（暗色模式色值预留但不实现切换逻辑）
- 标记不支持属性参数（只有预定义语义标记）
- 嵌套层级不超过 3 层
- 不实现 `[u]` 点击交互（留给后续）
- 不实现消息日志虚拟化滚动（留给后续）

---

> CX 工作流 | PRD | Scope #86
