# PRD: 任务系统 + 经验升级体系

## 基本信息

- **创建时间**: 2026-02-10
- **优先级**: P1（当前迭代必须完成）
- **技术栈**: TypeScript 全栈（NestJS + React Native + packages/core）
- **关联 Scope**: #217
- **关联蓝图**: #1（NodeMUD 项目蓝图）
- **前置依赖**: NPC Phase 0（已完成）、战斗系统（已完成）、残骸系统（已完成）

## 功能概述

实现两个紧密耦合的系统：**经验升级体系**（角色成长主线）和**任务系统**（固定剧情任务框架）。经验升级是基础设施，任务系统是经验的核心获取渠道之一。

---

## 一、经验升级体系

### 1.1 三层成长货币

| 货币         | 属性名      | 用途                          | 获取来源           |
| ------------ | ----------- | ----------------------------- | ------------------ |
| **经验值**   | `exp`       | 升级                          | 战斗杀敌、任务奖励 |
| **潜能**     | `potential` | 学技能消耗（第一版仅累积）    | 任务奖励           |
| **江湖阅历** | `score`     | 内容解锁/声望（第一版仅累积） | 任务完成、探索发现 |

### 1.2 升级公式

立方根曲线：

```
level = floor(cbrt(exp * K)) + 1
```

K 为系数，控制升级节奏。具体值在 Design 阶段精确调参。

**初步经验表参考**：

| 等级 | 累计 exp | 等级差 | 说明         |
| ---- | -------- | ------ | ------------ |
| 1    | 0        | 0      | 初始         |
| 5    | 1,000    | ~400   | 新手引导完成 |
| 10   | 5,000    | ~800   | 裂隙镇毕业   |
| 20   | 40,000   | ~3,000 | 中期         |

### 1.3 升级奖励

每升一级获得：

1. **自由属性点**：N 点（初步 2-3 点），手动分配到六维属性
2. **基础资源增长**：max_hp 固定增长（如 +50），max_mp 固定增长（如 +30）

**属性分配规则**：

- 六维属性：wisdom / perception / spirit / meridian / strength / vitality
- 每个属性有上限（`wisdomCap` 等，角色创建时已生成）
- 分配不能超过属性上限
- 第一版不支持洗点/重置

### 1.4 战斗经验获取

- 击杀 NPC 获得 exp，数值由 NPC 蓝图 `combat_exp` 字段决定
- 等级差衰减：玩家等级远高于 NPC 时经验打折（防刷低级怪）
- 第一版不做经验衰减上限

### 1.5 升级判定

- 每次 exp 增加时自动检查是否达到下一级阈值
- 触发升级时：增加 free_points + 增长 max_hp/max_mp + 推送前端通知
- 支持跨级升级（一次性获得大量 exp 可连升多级）

### 1.6 数据存储

**后端**：

- **运行时**：PlayerBase dbase 中存储 `exp` / `level` / `potential` / `score` / `free_points`
- **持久化**：Character 实体新增对应字段，登录时加载到 dbase，断线/定期保存到 DB

**前端**：

- PlayerData 新增 `exp: number` / `level: number`（数值型，替代当前字符串型）/ `potential: number` / `score: number` / `freePoints: number`
- 任务弹窗顶部展示经验/等级/潜能/阅历信息

---

## 二、任务系统

### 2.1 任务架构

第一版：固定任务（NPC 蓝图 / 独立文件定义）。

核心组件：

- **QuestDefinition** — 任务定义接口（id/name/type/objectives/rewards）
- **QuestManager** — 全局管理器（注册任务/检查条件/发放奖励）
- **QuestProgress** — 玩家任务进度（每个目标的当前计数）

### 2.2 四种任务类型

| 类型         | 说明                | 完成条件                                      | 触发方式 |
| ------------ | ------------------- | --------------------------------------------- | -------- |
| **deliver**  | 交付物品给指定 NPC  | give item to npc → onReceiveItem 检测         | NPC 钩子 |
| **capture**  | 击杀指定目标        | NPC 死亡事件 `GameEvents.DEATH` 匹配          | 事件监听 |
| **collect**  | 收集指定数量物品    | 背包中物品数量检查（每次 inventoryUpdate 时） | 背包变更 |
| **dialogue** | 依次与多个 NPC 对话 | ask 指令触发对话标记                          | ask 指令 |

### 2.3 任务定义结构

```typescript
interface QuestDefinition {
  id: string; // 唯一 ID，如 'rift-town-001'
  name: string; // 任务名称
  description: string; // 任务描述（显示给玩家）
  type: 'deliver' | 'capture' | 'collect' | 'dialogue';

  giverNpc: string; // 发布者 NPC 蓝图 ID
  turnInNpc?: string; // 交付者 NPC（默认同 giver）

  prerequisites?: {
    level?: number; // 最低等级
    quests?: string[]; // 前置任务 ID 列表
    score?: number; // 最低阅历
  };

  objectives: QuestObjective[];

  rewards: {
    exp?: number;
    potential?: number;
    score?: number;
    items?: { blueprintId: string; count: number }[];
  };
}

interface QuestObjective {
  type: 'kill' | 'deliver' | 'collect' | 'talk';
  target: string; // NPC 蓝图 ID 或物品蓝图 ID
  count?: number; // 需要数量（默认 1）
  description: string; // 目标描述文本
}
```

### 2.4 任务状态机

```
[hidden] → canAccept() 满足 → [available] → 玩家接受 → [active]
                                                          ↓
                                                   完成所有目标
                                                          ↓
                                                    → [ready] → 交付 → [completed]
```

状态枚举：`hidden` / `available` / `active` / `ready` / `completed`

### 2.5 任务定义位置（混合方案）

- **简单任务**：NPC 蓝图 `set('quests', [...])` 内联定义
- **复杂任务链**：独立文件 `server/src/world/quest/{area}/{quest-id}.ts`，NPC 蓝图 `set('quest_refs', [...])` 引用

### 2.6 自动触发机制

- **进入房间时**：检查房间内 NPC 是否有可接任务，推送日志提示
  - 格式："你注意到老周铁匠似乎有事相求。"
- **NPC look 时**：NpcDetailData 中附带任务信息（可接/进行中/可交付）
- **前端 NpcCard**：有任务的 NPC 卡片显示任务角标

### 2.7 任务交互方式（纯 UI）

**NpcInfoModal 扩展**：

- 可接任务区域 → 任务描述 + "接受任务"按钮
- 进行中任务 → 当前进度展示
- 可交付任务 → "完成任务"按钮

**独立任务列表弹窗**（QuestListModal）：

- 触发方式：LocationHeader 中将"邮件"按钮改为"任务"按钮
- 弹窗内容分三个区域：
  1. **顶部**：经验条 + 等级 + 潜能 + 阅历数值
  2. **进行中**：任务名称 + 进度条/计数 + 目标描述 + 放弃按钮
  3. **已完成**：任务名称列表（折叠展示）

### 2.8 任务放弃与重接

- 任务弹窗中每个进行中任务有"放弃"按钮
- 放弃后：清除任务进度，任务状态回到 `available`
- 任务物品不自动回收（普通物品，丢了就丢了）
- 放弃后可立即重新接受（无冷却）

### 2.9 任务上限

不限制同时进行的任务数量。

### 2.10 任务物品

- 使用普通 ItemBase 实例，无特殊限制
- 可丢弃、可交易、可放入容器
- 如果丢失任务物品，需要放弃任务重接（NPC 重新给物品）
- 任务物品由 QuestManager 在接受任务时创建，通过 NPC 给予玩家

### 2.11 数据存储

**后端**：

- **运行时**：PlayerBase dbase 存储：
  ```typescript
  quests: {
    active: { [questId: string]: QuestProgress },
    completed: string[],
  }
  ```
- **QuestProgress**：
  ```typescript
  {
    questId: string;
    status: 'active' | 'ready';
    objectives: { [index: number]: number }; // 每个目标的当前计数
    acceptedAt: number;                       // 接受时间戳
  }
  ```
- **持久化**：Character 实体新增 `quest_data` (JSON 字段)

**前端**：

- useGameStore 新增 `quests` slice
- WebSocket 新增 `questUpdate` 消息推送任务列表/进度变更

---

## 三、示例任务（最小验证）

### 任务 1：药师的来信（deliver）

| 字段   | 值                                                                |
| ------ | ----------------------------------------------------------------- |
| ID     | `rift-town-001`                                                   |
| 名称   | 药师的来信                                                        |
| 发布者 | 老周铁匠（blacksmith）                                            |
| 前置   | 无                                                                |
| 目标   | 把铁匠的信送给白发药师（herbalist）                               |
| 流程   | 进铁匠铺→日志提示→看NPC→接受→获得信→走到药铺→give 信 to 药师→完成 |
| 奖励   | exp: 100, score: 5                                                |

### 任务 2：裂谷盗匪（capture，任务1后续）

| 字段   | 值                                                                  |
| ------ | ------------------------------------------------------------------- |
| ID     | `rift-town-002`                                                     |
| 名称   | 裂谷盗匪                                                            |
| 发布者 | 镇长（town-elder）                                                  |
| 前置   | 完成 rift-town-001                                                  |
| 目标   | 击杀裂谷北道的盗匪（需新增低级敌对 NPC）                            |
| 流程   | 完成任务1→广场日志提示→看镇长→接受→去裂谷北道→kill 盗匪→回镇长→交付 |
| 奖励   | exp: 200, potential: 50, score: 10, 物品: 短刀×1                    |

---

## 四、现有代码基础

### 可直接复用

| 模块                      | 复用方式                      |
| ------------------------- | ----------------------------- |
| `NpcBase.onReceiveItem()` | deliver 任务的交付检测        |
| `ask` 指令 + `inquiry`    | dialogue 任务的对话触发       |
| `GameEvents.DEATH`        | capture 任务的击杀检测        |
| `BaseEntity.emit()`       | 事件驱动的任务进度更新        |
| `HeartbeatManager`        | 可选：任务超时检测            |
| `NpcInfoModal`            | 扩展任务 UI 区域              |
| `LocationHeader`          | "邮件"按钮改为"任务"按钮      |
| `loadCharacterToPlayer()` | 扩展加载 exp/level/quest 数据 |

### 需要修改的模块

| 模块                       | 修改内容                                                           |
| -------------------------- | ------------------------------------------------------------------ |
| `packages/core`            | 新增 questUpdate/questAccept/questAbandon/expGain/levelUp 消息类型 |
| `character.entity.ts`      | 新增 exp/level/potential/score/free_points/quest_data 字段         |
| `character.service.ts`     | 新增 saveQuestData/saveExpData 方法                                |
| `living-base.ts`           | 新增 gainExp()/checkLevelUp() 方法                                 |
| `player-base.ts`           | 任务进度追踪、属性加点方法                                         |
| `npc-base.ts`              | 任务相关数据查询（getAvailableQuests）                             |
| `stats.utils.ts`           | loadCharacterToPlayer 扩展加载 exp/quest                           |
| `useGameStore.ts`          | 新增 quests/exp slice，PlayerData 类型扩展                         |
| `App.tsx`                  | 新增 questUpdate 消息监听                                          |
| `NpcList/NpcInfoModal.tsx` | 添加任务接受/进度/完成区域                                         |
| `NpcList/NpcCard.tsx`      | 添加任务角标                                                       |
| `LocationHeader/index.tsx` | "邮件"→"任务"按钮                                                  |

### 需要新增的模块

| 模块                                                               | 说明                                     |
| ------------------------------------------------------------------ | ---------------------------------------- |
| `server/src/engine/quest/quest-manager.ts`                         | QuestManager 全局管理器                  |
| `server/src/engine/quest/quest-definition.ts`                      | QuestDefinition 接口和类型               |
| `server/src/engine/quest/quest-progress.ts`                        | QuestProgress 类型                       |
| `server/src/engine/commands/std/quest.ts`                          | quest 指令（列出当前任务，后端推送数据） |
| `server/src/world/quest/rift-town/rift-town-001.ts`                | 示例任务定义（可选独立文件）             |
| `client/src/components/game/QuestListModal/`                       | 任务列表弹窗组件目录                     |
| `client/src/components/game/QuestListModal/index.tsx`              | 弹窗容器                                 |
| `client/src/components/game/QuestListModal/ExpInfoBar.tsx`         | 经验/等级信息栏                          |
| `client/src/components/game/QuestListModal/ActiveQuestCard.tsx`    | 进行中任务卡片                           |
| `client/src/components/game/QuestListModal/CompletedQuestList.tsx` | 已完成任务列表                           |
| `packages/core/src/types/messages/quest.ts`                        | 任务相关消息类型                         |
| `packages/core/src/factory/handlers/quest*.ts`                     | 任务消息处理器                           |

---

## 五、验收标准

### 经验升级体系

- [ ] Character 实体包含 exp/level/potential/score/free_points 字段
- [ ] 击杀 NPC 获得 combat_exp 指定的经验值
- [ ] 经验达到阈值时自动升级，获得自由属性点 + max_hp/max_mp 增长
- [ ] 支持跨级升级
- [ ] 升级时推送前端通知（日志 + playerStats 更新）
- [ ] 前端显示数值型等级和经验值
- [ ] 断线时 exp/level/potential/score/free_points 保存到 DB

### 任务系统

- [ ] QuestManager 支持注册任务定义、检查前置条件、发放奖励
- [ ] 四种任务类型（deliver/capture/collect/dialogue）均可正常完成
- [ ] 进入房间时自动检测可接任务并推送日志提示
- [ ] NpcInfoModal 显示可接/进行中/可交付任务区域
- [ ] 独立任务列表弹窗（QuestListModal）：经验信息 + 进行中 + 已完成
- [ ] LocationHeader "邮件"按钮改为"任务"按钮，打开 QuestListModal
- [ ] 任务可放弃并重新接受
- [ ] 任务物品为普通物品，丢失后需放弃重接
- [ ] 断线时任务进度保存到 DB

### 最小验证

- [ ] "药师的来信"（deliver）任务完整流程可走通
- [ ] "裂谷盗匪"（capture）任务完整流程可走通（含前置条件检查）
- [ ] 两个任务的奖励正确发放（exp/potential/score/物品）

---

> CX 工作流 | PRD
