# 功能探讨: 残骸系统 — 死亡掉落 + 容器指令 + 地面物品展示

## 基本信息

- **创建时间**: 2026-02-06 05:30
- **关联项目蓝图**: #1
- **关联 Scope**: #196（战斗系统）、#153（物品系统）、#134（NPC 系统）

## 功能目标

生物死亡后在房间留下"XXX的残骸"容器物品，保存死亡时掉落的物品，供其他玩家搜刮（摸尸）。残骸可被捡起，10 分钟后自动腐烂消失。同时扩展容器交互指令（`get from` / `put in`）并升级地面物品的前端展示。

## 用户流程

### 战斗击杀 NPC
1. 玩家击败 NPC → NPC 死亡
2. 房间出现"北门卫兵的残骸" → 日志提示"北门卫兵倒下了，留下了一具残骸。"
3. 玩家 `look 残骸` 或点击残骸卡片 → 弹窗展示残骸内容物（铁剑、皮甲等）
4. 玩家 `get 铁剑 from 残骸` → 从残骸中取出铁剑
5. 或 `get 残骸` → 把整个残骸（含内容物）捡进背包
6. 10 分钟后未被拾取的残骸自动消失（连同内容物）

### 玩家死亡
1. 玩家被 NPC 击败 → 死亡
2. 原地留下"泡泡的残骸"（当前为空，不掉落物品）
3. 玩家复活后传送到广场
4. 残骸 10 分钟后消失
5. （后续版本再讨论是否掉落物品）

### 容器通用交互
1. `get [物品] from [容器]` — 从任意容器中取出物品
2. `put [物品] in [容器]` — 把物品放入任意容器
3. 适用于残骸、未来的箱子/背包等所有 ContainerBase 子类

## 方案探讨

### 方案概要

#### 后端：RemainsBase + 死亡改造

**RemainsBase 类**（新建）：
- 继承 ContainerBase（已有，继承 ItemBase）
- 属性：来源名称、创建时间、腐烂倒计时
- 心跳驱动衰腐（10 分钟 = 600s），到期自动 `destroy()`
- `destroy()` 时不执行 `handleInventoryOnDestroy()`（内容物一起消失）
- 物品类型: `'remains'`
- 可拾取（droppable=true）、不可交易（tradeable=false）、不可堆叠

**NpcBase.die() 改造**：
- 不再立即 `destroy()`
- 创建 RemainsBase → 转移 NPC 装备和背包物品到残骸 → 残骸放入房间
- 然后 `destroy()` NPC 本体（此时 inventory 已清空，不会散落）

**PlayerBase.die() 改造**：
- 创建空 RemainsBase（不转移物品）
- 残骸放在当前房间
- 然后执行现有复活逻辑（传送广场）

#### 后端：容器指令扩展

**`get` 指令扩展**：
- 现有: `get [物品]` — 从房间地面拾取
- 新增: `get [物品] from [容器]` — 从容器中取出
- 容器来源：房间地面的容器 或 背包中的容器
- 中文别名支持: `从...中取出` 或保持英文 `from` 关键词

**`put` 指令（新增）**：
- `put [物品] in [容器]` — 把背包中的物品放入容器
- 容器目标：房间地面的容器 或 背包中的容器
- 检查容器容量限制（capacity / weightLimit）

**命令解析**：
- 在 args 数组中检测 `from` / `in` 关键词，分割为 [物品名, 容器名]
- 对 `get` 命令: `args.indexOf('from')` 分割
- 对 `put` 命令: `args.indexOf('in')` 分割

#### 前端：地面物品展示升级

**物品卡片**：
- 地面物品在 NPC 列表区域以卡片形式展示
- 样式与 NPC 卡片区分（不同底色/图标）
- 残骸类容器有特殊标识

**物品弹窗（ItemInfoModal）**：
- 类似 NpcInfoModal，点击物品卡片触发
- 展示物品详情（名称、描述、类型、品质等）
- 交互按钮：get（拾取）、examine（鉴定）
- 容器类物品额外展示内容物列表 + `get from` 按钮

**roomInfo 协议适配**：
- 当前 `roomInfo.items` 已包含地面物品的 `ItemBrief`
- 需扩展 `ItemBrief` 增加 `isContainer` / `contents` 字段（容器内容物摘要）

### 考虑过的替代方案

| 方案 | 优点 | 缺点 | 结论 |
|------|------|------|------|
| 残骸继承 ContainerBase | 复用已有容器框架，扩展性好 | ContainerBase 目前较简陋需完善 | **采用** |
| 残骸作为特殊 NPC（死亡状态） | 不需要新类 | 语义不对，NPC 和物品混淆 | 放弃 |
| 物品直接散落地面（无残骸） | 简单 | 失去 MUD 摸尸趣味，物品散乱 | 放弃 |

## 与现有功能的关系

- **依赖**:
  - ContainerBase（已有，需完善容纳逻辑）
  - BaseEntity inventory 系统（已有）
  - HeartbeatManager 心跳定时器（已有）
  - CombatManager 战斗结束流程（已有）
  - SpawnManager NPC 重生（已有，die() 改造后需适配）
  - NpcInfoModal 弹窗模式（已有，物品弹窗参考）
- **影响**:
  - `NpcBase.die()` — 改造为创建残骸后再销毁
  - `PlayerBase.die()` — 增加创建空残骸
  - `get` 指令 — 扩展 `from` 语法
  - 新增 `put` 指令
  - `roomInfo` 消息 — ItemBrief 扩展容器字段
  - NpcList 组件 — 增加物品卡片展示
  - 新增 ItemInfoModal 组件
- **复用**:
  - NpcInfoModal 弹窗结构和交互模式
  - NPC 卡片组件的布局逻辑
  - 现有 `get` / `examine` / `look` 指令的目标匹配逻辑

## 边界和约束

- 残骸内容物 10 分钟后一起消失，不散落
- 玩家残骸当前不掉落物品（后续版本再定）
- 容器容量限制：残骸容量足够容纳死亡 NPC 的所有物品
- `get from` / `put in` 适用于所有 ContainerBase 子类，不仅限残骸
- 残骸可被 `get` 捡进背包，背包中的残骸也可 `get from`

## 预估任务拆分

| # | 任务 | 类型 | 依赖 |
|---|------|------|------|
| 1 | ContainerBase 完善 + RemainsBase 类 | backend | — |
| 2 | NPC 死亡创建残骸 + SpawnManager 适配 | backend | #1 |
| 3 | 玩家死亡创建空残骸 | backend | #1 |
| 4 | `get [item] from [container]` 指令扩展 | backend | #1 |
| 5 | `put [item] in [container]` 新增指令 | backend | #1 |
| 6 | ItemBrief 扩展 + roomInfo 容器字段 | core+backend | #1 |
| 7 | 地面物品卡片 + ItemInfoModal 弹窗 | frontend | #6 |

## 开放问题

- 玩家死亡是否掉落物品 → 留给后续版本讨论
- 容器嵌套是否允许（残骸里放背包，背包里还有物品）→ 暂不限制，BaseEntity 天然支持
- 是否需要 `search` / `loot` 快捷指令（一键搜刮全部）→ 留给后续

## 探讨记录

1. **残骸命名**: 不叫"尸体"，叫"XXX的残骸"
2. **玩家残骸**: 确认产生残骸但暂不掉落物品，NPC 掉落全部装备/物品
3. **腐烂时间**: 10 分钟，内容物一起消失
4. **容器指令**: `get from` + `put in` 都做，适用所有容器
5. **地面物品展示**: 与 NPC 卡片同一列表区域，样式区分，点击弹窗交互（类似 NpcInfoModal）

---
> CX 工作流 | 功能探讨
