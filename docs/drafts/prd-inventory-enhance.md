# PRD: 背包系统细化 -- 全屏背包页 + 日志重构 + 装备入口

## 基本信息

- **创建时间**: 2026-02-05
- **优先级**: P0 紧急
- **技术栈**: TypeScript, React Native, NestJS, WebSocket, Zustand
- **关联 Scope**: #163 (背包系统细化 -- 全屏背包页 + 日志重构 + 装备入口)
- **前置 Epic**: #156 (物品系统 Phase 1, 已完成)
- **参考**: 炎黄 MUD、北大侠客行、Discworld MUD、Dead Souls Mudlib

## 功能概述

将当前简易的右侧背包面板升级为全屏独立页面，支持物品分类浏览、装备栏入口、服务端驱动的物品操作菜单。同时重构日志系统，解决性能瓶颈（ScrollView 全量渲染导致几千条日志时严重卡顿），支持无限历史滚动和智能自动定位。新增 drop/wear/wield/remove/eq/use 六个经典 MUD 后端指令，完成装备穿戴的核心闭环。

## 用户场景

### 场景 1: 物品分类浏览

玩家通过底部导航栏切换到"背包"页面，进入全屏背包视图。顶部有分类 tab 栏（装备/全部/武器/防具/药品/杂物），可快速过滤查看特定类型的物品。页面下方保留日志区域，玩家不会因切换页面而断开信息流。

### 场景 2: 物品操作交互

玩家点击背包中的某件物品，弹出水墨风操作菜单。菜单中的操作按钮完全由后端返回（如铁剑显示"装备/丢弃/查看"，金疮药显示"使用/丢弃/查看"），玩家选择操作后发送对应指令到服务端。

### 场景 3: 装备穿戴管理

玩家通过"装备"分类 tab 查看当前所有装备槽位及已穿戴的装备。可通过物品操作菜单穿戴/脱下装备，装备变更后界面实时更新。

### 场景 4: 日志历史浏览

玩家在任何页面（主页面或背包页面）都能查看日志。日志支持无限历史滚动，当玩家向上查看历史消息时，不会被新消息强制拉回底部。出现新消息时显示"新消息"浮标，点击即可回到最新位置。

### 场景 5: 物品丢弃/使用

玩家可通过操作菜单或直接输入指令丢弃物品到地面、使用消耗品（药品/食物），物品效果由后端计算并通过日志反馈。

## 详细需求

### 需求 1: 背包全屏页面

- 点击底部"背包" tab，整个主内容区替换为背包页面
- PlayerStats（顶部状态栏）和 BottomNavBar（底部导航）保留不变
- 页面采用上下布局: 物品区域 (flex: 3) + 日志区域 (flex: 2)
- 物品区域顶部有分类 tab 栏
- 日志区域复用主页面的日志数据（Zustand store 共享）

页面布局:

```
+------------------------------------------------+
| [PlayerStats]                                  |
+------------------------------------------------+
| [装备] [全部] [武器] [防具] [药品] [杂物]       |
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

### 需求 2: 物品分类 Tab

| Tab  | 过滤类型                   | 说明                                          |
| ---- | -------------------------- | --------------------------------------------- |
| 装备 | --                         | 独立页面: 装备槽位展示（每行一个部位+装备名） |
| 全部 | 所有                       | 不过滤，显示背包全部物品                      |
| 武器 | weapon                     | 剑/刀/枪/杖等                                 |
| 防具 | armor                      | 穿戴类装备                                    |
| 药品 | medicine, food             | 消耗品合并                                    |
| 杂物 | book, container, key, misc | 其余合并                                      |

### 需求 3: 物品操作 -- 服务端驱动

- 前端不做任何业务判断，操作按钮完全由后端 `getActions()` 返回
- 点击物品行弹出水墨风操作菜单，菜单按钮直接渲染 `item.actions` 数组
- 后端新增操作类型时，前端零改动
- InventoryItem 协议扩展 `actions: string[]` 字段

示例:

| 物品     | 返回的 actions           | 说明             |
| -------- | ------------------------ | ---------------- |
| 铁剑     | ["装备", "丢弃", "查看"] | 标准武器         |
| 诅咒之剑 | ["查看"]                 | 不可装备不可丢弃 |
| 金疮药   | ["使用", "丢弃", "查看"] | 消耗品           |
| 任务信物 | ["使用", "查看"]         | 不可丢弃         |
| 基础剑法 | ["研读", "丢弃", "查看"] | 书籍类           |

### 需求 4: 日志系统重构

#### 4a. 组件拆分

从 GameLog 中抽出纯日志滚动组件 `LogScrollView`，主页面和背包页面共用:

```
components/game/
  GameLog/
    index.tsx            <- 主页面: 地图描述 + LogScrollView + 动作按钮
    LogEntry.tsx         <- 不变
    ActionButton.tsx     <- 不变
    MapDescription.tsx   <- 不变
  shared/
    LogScrollView.tsx    <- 新增: 纯日志虚拟滚动 (FlatList + 智能滚动)
```

#### 4b. FlatList 虚拟化

| 当前问题                     | 重构方案                                 |
| ---------------------------- | ---------------------------------------- |
| ScrollView 全量渲染          | FlatList 虚拟化，只渲染可见区域 + 缓冲区 |
| `[...array, entry]` 全量拷贝 | 保持追加，不设上限                       |
| `key={i}` index 做 key       | 自增 id 做稳定 key                       |
| 无行高提示                   | getItemLayout 固定行高，跳过布局计算     |

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
  id: number; // 自增计数器，FlatList 稳定 key
  text: string;
  color: string;
  timestamp: number; // 时间戳，未来可用于时间分隔
}
```

### 需求 5: 新增后端指令

| 指令   | 别名    | 说明                   | 优先级                  |
| ------ | ------- | ---------------------- | ----------------------- |
| drop   | 丢/丢弃 | 丢弃物品到地面         | 高 (与 get 成对)        |
| wear   | 穿/穿戴 | 穿戴防具到身体部位     | 高 (装备核心)           |
| wield  | 持/装备 | 装备武器到主手         | 高 (装备核心)           |
| remove | 脱/卸下 | 脱下防具 / 放下武器    | 高 (与 wear/wield 成对) |
| eq     | 装备栏  | 查看当前穿戴装备列表   | 高 (装备可视化)         |
| use    | 使用    | 使用消耗品 (药品/食物) | 中                      |

### 需求 6: 装备系统基础

- 玩家角色新增装备槽位数据结构（使用已有的 WearPositions 常量: head/body/hands/feet/waist/weapon/offhand/neck/finger/wrist）
- wear/wield 指令将物品从背包移到装备槽位
- remove 指令将物品从装备槽位移回背包
- eq 指令查看当前所有槽位及已装备物品
- 装备变更触发 inventoryUpdate + equipmentUpdate 推送
- 本期不涉及属性加成计算（留给战斗系统）

## 关联文档

- Scope: #163 -- 完整的方案讨论和共识
- 前置 Epic: #156 (物品系统 Phase 1) -- ItemBase/子类/蓝图/get/inventory 已完成
- 项目蓝图: #1 (NodeMUD 项目蓝图)

## 现有代码基础

| 模块       | 路径                                                  | 可复用内容                                 |
| ---------- | ----------------------------------------------------- | ------------------------------------------ |
| 物品基类   | `server/src/engine/game-objects/item-base.ts`         | 扩展 getActions() 方法                     |
| 物品常量   | `packages/core/src/constants/items.ts`                | ItemTypes/WeaponTypes/WearPositions 已定义 |
| 物品协议   | `packages/core/src/types/messages/inventory.ts`       | InventoryItem 扩展 actions 字段            |
| 背包面板   | `client/src/components/game/Inventory/`               | 升级为全屏页面                             |
| 日志组件   | `client/src/components/game/GameLog/`                 | 拆分 LogScrollView                         |
| 状态管理   | `client/src/stores/useGameStore.ts`                   | 扩展 equipment 状态                        |
| 水墨风弹窗 | `client/src/components/game/NpcList/NpcInfoModal.tsx` | 参考物品操作菜单样式                       |
| 已有指令   | `server/src/engine/commands/std/get.ts`               | 参考指令实现模式                           |
| 页面切换   | `client/src/screens/GameHomeScreen.tsx`               | 扩展背包全屏页面切换                       |

## 代码影响范围

### 前端

- `client/src/screens/GameHomeScreen.tsx` -- 背包页面切换逻辑
- `client/src/components/game/Inventory/` -- 重构为全屏页面
- `client/src/components/game/GameLog/` -- 拆分 LogScrollView
- `client/src/components/game/shared/LogScrollView.tsx` -- 新增
- `client/src/stores/useGameStore.ts` -- 新增 equipment 状态、日志结构升级

### 后端

- `server/src/engine/game-objects/item-base.ts` -- 新增 getActions()
- `server/src/engine/commands/std/` -- 新增 drop/wear/wield/remove/eq/use 指令文件
- `server/src/engine/command-loader.ts` -- 注册新指令
- `server/src/websocket/handlers/` -- 装备推送逻辑

### 共享包

- `packages/core/src/types/messages/inventory.ts` -- InventoryItem 扩展 actions 字段
- `packages/core/src/types/messages/` -- 可能新增 equipmentUpdate 消息类型

## 任务拆分（初步）

- [ ] [core] InventoryItem 协议扩展 actions 字段 + LogEntry 结构升级 + equipmentUpdate 消息类型
- [ ] [backend] ItemBase.getActions() + 7 个物品蓝图 actions 定义
- [ ] [backend] 玩家装备槽位数据结构 + wear/wield/remove/eq 指令
- [ ] [backend] drop 指令 + use 指令
- [ ] [backend] inventoryUpdate/equipmentUpdate 推送集成（含 actions 字段）
- [ ] [frontend] 日志系统重构: LogScrollView 共享组件 + FlatList 虚拟化 + 智能自动滚动
- [ ] [frontend] 背包全屏页面 + 分类 Tab + 装备槽位展示
- [ ] [frontend] 物品操作菜单弹窗 + 服务端驱动按钮 + 指令发送

## 验收标准

- [ ] 点击底部"背包" tab 进入全屏背包页面，PlayerStats 和 BottomNavBar 保留
- [ ] 背包页面上下布局: 物品区域 (flex: 3) + 日志区域 (flex: 2)
- [ ] 6 个分类 tab 正常切换过滤物品
- [ ] "装备" tab 展示 10 个装备槽位及当前穿戴装备
- [ ] 点击物品弹出操作菜单，按钮由后端 actions 字段驱动
- [ ] drop/wear/wield/remove/eq/use 六个指令正常工作
- [ ] 穿戴装备后 eq 指令显示正确
- [ ] 日志使用 FlatList 虚拟化，几千条消息无卡顿
- [ ] 智能自动滚动: 底部自动滚动，上滑停止，浮标提示新消息
- [ ] 日志在主页面和背包页面数据同步
- [ ] 物品操作后日志区域实时显示反馈信息

## 边界和约束

- 装备系统暂不涉及属性加成计算（留给战斗系统）
- 不做物品图标/图片（保持文字 MUD 风格）
- 负重系统本期只做展示（显示当前负重/上限），不做超重惩罚
- 容器交互（put ... in ...）和 give 指令留给后续
- 不做物品堆叠合并逻辑变更（沿用 Phase 1 的 count 字段）

---

> CX 工作流 | PRD
