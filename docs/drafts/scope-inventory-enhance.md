# 功能探讨: 背包系统细化 -- 全屏背包页 + 日志重构 + 装备入口

## 基本信息

- **创建时间**: 2026-02-05
- **关联项目蓝图**: #1 (NodeMUD 项目蓝图)
- **关联 Scope**: #153 (物品系统 Phase 1-2 前置探讨)
- **前置 Epic**: #156 (物品系统 Phase 1, 已完成)
- **参考**: 炎黄 MUD、北大侠客行、Discworld MUD、Dead Souls Mudlib

## 功能目标

将当前简易的右侧背包面板升级为全屏独立页面，支持物品分类浏览、装备栏入口、服务端驱动的物品操作菜单。同时重构日志系统，解决性能瓶颈，支持无限历史滚动和智能自动定位。

## 当前现状 (Phase 1 已完成)

| 模块 | 内容 | 问题 |
|------|------|------|
| 前端背包 | 右侧小面板，纯列表展示名称+类型+数量 | 信息密度低，无分类，无操作 |
| 前端日志 | ScrollView + map 全量渲染 | 几千条日志时严重卡顿 |
| 后端指令 | get/inventory/look | 无 drop/wear/wield/use |
| 物品协议 | InventoryItem 7 字段 | 缺少 actions 字段 |
| 物品蓝图 | 7 个裂隙镇物品 | 无 getActions() 方法 |

## 方案设计

### 1. 背包全屏页面 (上下布局)

点击底部"背包" tab 后，整个主内容区替换为背包页面，PlayerStats 和 BottomNavBar 保留。

```
+------------------------------------------------+
| [PlayerStats]                                  |  顶部状态栏不变
+------------------------------------------------+
| [装备] [全部] [武器] [防具] [药品] [杂物]       |  分类 tab 栏
+------------- 物品列表 (flex: 3) ----------------+
|                                                |
|  铁剑           武器          重量:3            |
|  布衣           防具          重量:2            |
|  金疮药         药品          重量:1   x3       |
|                                                |
|  负重: 6/50   3件                               |
+------------- 日志区域 (flex: 2) ----------------+
|                                                |
|  你捡起了铁剑。                                 |
|  铁匠说: 这把剑不错...                          |
|  你向北离去。                                   |
|                           [ 新消息 v ]          |
+------------------------------------------------+
| [人物] [技能] [江湖] [门派] [背包]              |
+------------------------------------------------+
```

- 物品区域 : 日志区域 = 3 : 2
- 日志区域复用主页面的日志数据 (Zustand store)，保持信息同步

### 2. 物品分类 Tab

| Tab | 过滤类型 | 说明 |
|-----|---------|------|
| 装备 | -- | 独立页面: 当前穿戴的装备槽位展示 |
| 全部 | 所有 | 不过滤，显示背包全部物品 |
| 武器 | weapon | 剑/刀/枪/杖等 |
| 防具 | armor | 穿戴类装备 |
| 药品 | medicine, food | 消耗品合并 |
| 杂物 | book, container, key, misc | 其余合并 |

"装备" tab 为第一个 tab，进入后展示装备槽位页面（文字列表，每行一个部位 + 当前装备名），与物品列表平级切换。

### 3. 物品操作 -- 服务端驱动

核心原则: 前端不做任何业务判断，操作按钮完全由后端返回。

**后端设计:**

- ItemBase 新增 `getActions(): string[]` 方法
- 每个子类/蓝图可 override 定义不同操作
- 示例:
  - 铁剑: `["装备", "丢弃", "查看"]`
  - 诅咒之剑: `["查看"]` (不可装备不可丢弃)
  - 金疮药: `["使用", "丢弃", "查看"]`
  - 任务信物: `["使用", "查看"]` (不可丢弃)
  - 基础剑法: `["研读", "丢弃", "查看"]`

**消息协议扩展:**

InventoryItem 新增 actions 字段:

```json
{
  "id": "item/rift-town/iron-sword#1",
  "name": "铁剑",
  "short": "一把普通的铁剑",
  "type": "weapon",
  "weight": 3,
  "value": 50,
  "count": 1,
  "actions": ["装备", "丢弃", "查看"]
}
```

**前端设计:**

- 点击物品行 -> 弹出水墨风操作菜单
- 菜单按钮直接渲染 `item.actions` 数组
- 后端加新操作，前端零改动
- 未来扩展: NPC 商店物品返回 `["购买", "查看"]`，地面物品返回 `["捡起", "查看"]`

### 4. 日志系统重构

#### 4a. 组件拆分 (方案 B)

从 GameLog 中抽出纯日志滚动组件，主页面和背包页面共用:

```
components/game/
  GameLog/
    index.tsx            <- 主页面用: 地图描述 + LogScrollView + 动作按钮
    LogEntry.tsx         <- 不变
    ActionButton.tsx     <- 不变
    MapDescription.tsx   <- 不变
  shared/
    LogScrollView.tsx    <- 新增: 纯日志虚拟滚动 (FlatList + 智能滚动)
```

#### 4b. 性能优化 (FlatList 虚拟化)

| 当前问题 | 重构方案 |
|---------|---------|
| ScrollView 全量渲染 | FlatList 虚拟化，只渲染可见区域 + 缓冲区 |
| `[...array, entry]` 全量拷贝 | 保持追加，不设上限 |
| `key={i}` index 做 key | 自增 id 做稳定 key |
| 无行高提示 | getItemLayout 固定行高，跳过布局计算 |

#### 4c. 智能自动滚动

```
状态: isAtBottom (默认 true)

行为:
  用户在底部 + 新消息到达 -> 自动滚动到最新
  用户手动上滑查看历史   -> isAtBottom = false -> 停止自动滚动
  新消息到达但用户在上方  -> 显示"新消息"浮标
  用户点击浮标 / 滑到底部 -> isAtBottom = true -> 恢复自动滚动

判定: onScroll 事件检查 contentOffset 是否接近底部 (容差 50px)
```

#### 4d. 日志条目结构升级

```typescript
interface LogEntry {
  id: number;        // 自增计数器，FlatList 稳定 key
  text: string;
  color: string;
  timestamp: number; // 时间戳，未来可用于时间分隔
}
```

### 5. 新增后端指令

| 指令 | 别名 | 说明 | 优先级 |
|------|------|------|--------|
| drop | 丢/丢弃 | 丢弃物品到地面 | 高 (与 get 成对) |
| wear | 穿/穿戴 | 穿戴防具到身体部位 | 高 (装备核心) |
| wield | 持/装备 | 装备武器到主手 | 高 (装备核心) |
| remove | 脱/卸下 | 脱下防具 / 放下武器 | 高 (与 wear/wield 成对) |
| eq | 装备栏 | 查看当前穿戴装备列表 | 高 (装备可视化) |
| use | 使用 | 使用消耗品 (药品/食物) | 中 |

## 与现有功能的关系

- **依赖**: 物品系统 Phase 1 (#156, 已完成) -- ItemBase/子类/蓝图/get/inventory
- **影响**: GameHomeScreen 页面切换逻辑、GameLog 组件拆分、InventoryItem 协议扩展
- **复用**: Zustand gameLog store、水墨风 Modal 组件 (参考 NpcInfoModal)、WearPositions 常量

## 边界和约束

- 装备系统暂不涉及属性加成计算 (留给战斗系统)
- 不做物品图标/图片 (保持文字 MUD 风格)
- 负重系统本期只做展示 (显示当前负重/上限)，不做超重惩罚
- 容器交互 (put ... in ...) 和 give 指令留给后续

## 开放问题

- 装备 tab 的装备槽位展示样式待 Design Doc 阶段确定
- 负重上限的数值设计 (固定值 vs 力量属性关联)
- 物品操作弹窗的动画效果

## 探讨记录

1. 最初方案是左右布局 (物品左/日志右)，讨论后改为上下布局，对移动端更友好
2. 日志区域是 MUD 游戏的信息命脉，任何页面都不能断开，因此背包页面必须包含日志
3. 日志组件拆分选择方案 B (纯 LogScrollView 共享组件)，不含动作按钮
4. 物品操作按钮由后端 getActions() 驱动，前端不做类型判断，实现最大灵活性
5. 日志性能采用 FlatList 虚拟化 + 智能自动滚动，支持无限历史消息浏览

## 参考资料

- [炎黄 MUD (GitHub)](https://github.com/oiuv/mud)
- [北大侠客行](https://pkuxkx.net/)
- [Discworld MUD Equipment](http://discworld.atuin.net/lpc/playing/documentation.c?path=/concepts/equipment)
- [Dead Souls Mudlib (GitHub)](https://github.com/quixadhal/deadsouls)
- [Genesis MUD Guide](https://www.genesismud.org/guide.php)
- [Game UI Database - Inventory](https://www.gameuidatabase.com/index.php?scrn=71)

---
> CX 工作流 | 功能探讨
