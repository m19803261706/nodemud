# 功能探讨: 任务系统 + 经验升级体系

## 基本信息

- **创建时间**: 2026-02-10
- **关联项目蓝图**: #1（NodeMUD 项目蓝图）
- **关联 Scope**: #134（NPC 系统细化）、#84（天衍世界观）
- **前置依赖**: NPC Phase 0（已完成）、战斗系统（已完成）、残骸系统（已完成）
- **参考**: 炎黄 MUD（`参考mud代码/mud/`）的 quest 系统和经验体系

## 功能目标

实现两个紧密耦合的系统：

1. **经验升级体系** — 为角色提供成长主线（exp/level/潜能/阅历），支撑任务奖励和后续技能系统
2. **任务系统** — 固定剧情任务框架，NPC 自动推送可接任务，四种任务类型，支持任务链

两者关系：经验升级是前置基础设施，任务系统是经验的核心获取渠道之一。

## 一、经验升级体系

### 三层成长货币

| 货币         | 属性名      | 用途                         | 获取来源           |
| ------------ | ----------- | ---------------------------- | ------------------ |
| **经验值**   | `exp`       | 升级，代表江湖历练深度       | 战斗杀敌、任务奖励 |
| **潜能**     | `potential` | 学技能消耗（预留给技能系统） | 任务奖励、修炼     |
| **江湖阅历** | `score`     | 解锁内容、声望、NPC 态度     | 任务完成、探索发现 |

**世界观呼应**：当世纪武学断层，功法失传。角色成长代表在断层时代重新摸索武学的过程——等级越高，越接近中古纪武学的残存智慧。

### 升级公式

采用炎黄 MUD 风格的**立方根曲线**：

```
level = floor(cbrt(exp * K)) + 1
```

其中 K 为系数，控制升级节奏。前期升级快，后期极慢，适合长线运营。

**参考经验表（初步）**：

| 等级 | 所需累计 exp | 等级差 exp | 说明            |
| ---- | ------------ | ---------- | --------------- |
| 1    | 0            | 0          | 初始            |
| 2    | 100          | 100        | 杀 1-2 个低级怪 |
| 3    | 300          | 200        |                 |
| 4    | 600          | 300        |                 |
| 5    | 1,000        | 400        | 新手引导完成    |
| 10   | 5,000        | ~800       | 裂隙镇毕业      |
| 15   | 15,000       | ~1,500     |                 |
| 20   | 40,000       | ~3,000     | 中期            |

> 具体系数 K 和经验表在 PRD/Design 阶段精确调参。

### 升级加点

- 每升级获得 **N 个自由属性点**（初步设为 2-3 点）
- 玩家手动分配到六维属性（wisdom/perception/spirit/meridian/strength/vitality）
- 每个属性有上限（`wisdomCap` 等，创建角色时已生成），分配不能超过上限
- 属性上限可通过特殊途径提升（丹药、功法、任务奖励等，后续扩展）

### 战斗经验获取

- 击杀 NPC 获得 exp，数值由 NPC 的 `combat_exp` 蓝图字段决定
- 考虑等级差衰减：玩家等级远高于 NPC 时经验打折（防止刷低级怪）
- 考虑经验上限衰减：高等级玩家整体获取效率下降（参考炎黄 ÷2/÷4/÷8 机制）

### 数据存储

- **运行时**：PlayerBase dbase 中存储 `exp`/`level`/`potential`/`score`/`free_points`
- **持久化**：Character 实体扩展对应字段，登录时加载，断线时保存
- **升级判定**：每次 exp 增加时检查是否达到下一级阈值，自动升级并推送前端

## 二、任务系统

### 任务架构

**第一版：固定任务**（NPC 蓝图/独立文件定义），验证流程后第二版加动态随机任务。

借鉴炎黄 MUD 的分层架构：

- 炎黄的 `QUEST_OB`（任务基类）→ 我们的 `QuestDefinition`（任务定义接口）
- 炎黄的 `preCondition/postCondition` → 我们的 `canAccept()/isComplete()`
- 炎黄的 `QUEST_D`（任务守护进程）→ 我们的 `QuestManager`（全局管理器）

### 任务类型

| 类型         | 说明                | 完成条件                    | 示例                     |
| ------------ | ------------------- | --------------------------- | ------------------------ |
| **deliver**  | 交付物品给指定 NPC  | `give <item> to <npc>` 触发 | 铁匠让你送信给药师       |
| **capture**  | 击杀指定目标        | NPC 死亡事件触发            | 清除裂谷里的盗匪         |
| **collect**  | 收集指定数量物品    | 背包中物品数量检查          | 采集 5 株草药            |
| **dialogue** | 依次与多个 NPC 对话 | 对话完成标记                | 向镇长→酒保→旅人打听消息 |

### 任务定义结构

```typescript
interface QuestDefinition {
  id: string; // 唯一 ID，如 'rift-town-001'
  name: string; // 任务名称
  description: string; // 任务描述
  type: 'deliver' | 'capture' | 'collect' | 'dialogue';

  // 发布与完成
  giverNpc: string; // 发布者 NPC 蓝图 ID
  turnInNpc?: string; // 交付者 NPC（默认同 giver）

  // 前置条件
  prerequisites?: {
    level?: number; // 最低等级
    quests?: string[]; // 前置任务 ID 列表
    score?: number; // 最低阅历
  };

  // 完成条件（按类型）
  objectives: QuestObjective[];

  // 奖励
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

### 任务状态机

```
[未发现] → canAccept() 满足 → [可接受] → 玩家接受 → [进行中]
    ↓                                                    ↓
  条件不满足                                    完成所有目标
    ↓                                                    ↓
  [隐藏]                                      → [待交付] → 交付 → [已完成]
```

状态枚举：`hidden` / `available` / `active` / `ready` / `completed`

### 任务定义位置（混合方案）

- **简单任务**：写在 NPC 蓝图的 `quests` 字段中（内联定义）
- **复杂任务链**：独立文件 `server/src/world/quest/{area}/{quest-id}.ts`，NPC 蓝图引用 quest ID

```typescript
// NPC 蓝图内联示例
set('quests', [
  {
    id: 'rift-town-001',
    name: '药师的来信',
    type: 'deliver',
    // ...
  },
]);

// 独立文件引用示例
set('quest_refs', ['rift-town-chain-01']); // 引用 world/quest/ 下的定义
```

### 自动触发机制

- **进入房间时**：检查房间内 NPC 是否有可接任务（`canAccept()` 满足），推送提示到日志
- **与 NPC 交互时**（ask/look）：在 NPC 详情中标注"有任务可接"
- **前端表现**：NpcCard 上显示任务标记，NpcInfoModal 增加"接受任务"按钮

### 数据存储

- **运行时**：PlayerBase dbase 存储 `quests` mapping
  ```typescript
  quests: {
    active: { [questId: string]: QuestProgress },   // 进行中
    completed: string[],                              // 已完成 ID 列表
  }
  ```
- **持久化**：Character 实体新增 `quests_json` (JSON 字段)，断线时序列化保存
- **QuestProgress**：记录每个目标的当前进度（如 killed: 2/3）

### 前端交互

- **日志提示**：进入房间时 "你注意到老周铁匠似乎有事相求。"
- **NpcCard 标记**：有任务的 NPC 卡片显示任务图标/角标
- **NpcInfoModal**：增加任务区域
  - 可接任务 → "接受任务"按钮 + 任务描述
  - 进行中任务 → 当前进度展示
  - 可交付任务 → "完成任务"按钮
- 不新增独立任务页面，所有交互在现有 NPC 弹窗中完成

## 三、示例任务设计（最小验证）

### 任务 1：药师的来信（deliver 类型）

- **发布者**：老周铁匠（blacksmith）
- **目标**：把铁匠的信送给白发药师（herbalist）
- **流程**：
  1. 玩家走到铁匠铺，自动提示铁匠有任务
  2. 与铁匠交互 → 弹窗显示任务 → 接受
  3. 铁匠给玩家一封信（临时物品）
  4. 玩家走到药铺 → give 信 to 药师
  5. 药师接受信 → 任务完成 → 奖励 exp + score
- **前置**：无
- **奖励**：exp 100, score 5

### 任务 2：裂谷盗匪（capture 类型，任务 1 后续）

- **发布者**：镇长（town-elder）
- **前置**：完成"药师的来信"
- **目标**：击杀裂谷北道的盗匪（需新增一个低级敌对 NPC）
- **流程**：
  1. 完成任务 1 后，走到广场自动提示镇长有任务
  2. 接受任务 → 去裂谷北道 → kill 盗匪
  3. 盗匪死亡 → 自动标记完成 → 回镇长交付
  4. 奖励 exp + potential + 物品（短刀或药品）
- **奖励**：exp 200, potential 50, score 10, 物品 1 个

## 四、与现有系统的关系

### 依赖

| 模块               | 依赖方式                               |
| ------------------ | -------------------------------------- |
| NpcBase + 蓝图系统 | 任务定义挂载在 NPC 上                  |
| ask/give 指令      | 任务触发和交付的核心交互               |
| 战斗系统           | capture 类任务依赖 kill 指令和死亡事件 |
| BaseEntity 事件    | 监听 NPC 死亡、物品转移等事件          |
| SpawnManager       | 任务相关临时 NPC 的刷新管理            |
| Character 实体     | 持久化经验值和任务进度                 |

### 影响（需修改的模块）

| 模块                                        | 修改内容                                                      |
| ------------------------------------------- | ------------------------------------------------------------- |
| `packages/core`                             | 新增 exp/level/quest 相关消息类型                             |
| `server/character`                          | Character 实体新增 exp/level/potential/score/quests_json 字段 |
| `server/engine/game-objects/living-base.ts` | 新增 exp 相关方法（gainExp/levelUp）                          |
| `server/engine/game-objects/player-base.ts` | 升级加点逻辑、任务进度追踪                                    |
| `server/engine/game-objects/npc-base.ts`    | 新增 quest 相关钩子                                           |
| `server/websocket/handlers`                 | 任务消息处理、经验推送                                        |
| `client/stores/useGameStore.ts`             | 新增 quest/exp 状态                                           |
| `client/components/game/NpcList`            | NpcCard 任务标记、NpcInfoModal 任务区域                       |

### 复用

- `NpcBase.onReceiveItem()` — deliver 任务的交付检测
- `ask` 指令 + `inquiry` — dialogue 任务的对话触发
- `BaseEntity.emit()` — 事件驱动的任务进度更新
- `HeartbeatManager` — 任务超时检测（如有需要）
- 前端 NpcInfoModal — 扩展任务 UI 区域

## 五、边界和约束

- 第一版仅固定任务，不做动态随机任务
- 不做任务日志/历史记录页面，仅通过日志和 NPC 弹窗交互
- 潜能（potential）第一版只累积不消耗，等技能系统上线后再开放使用
- 阅历（score）第一版仅作为数值累积，后续可关联 NPC 态度和内容解锁
- 升级加点时不支持洗点/重置，后续可加丹药洗点机制
- 不做经验衰减（第一版等级上限不高，暂不需要）
- 不做转世系统（远期目标）

## 六、开放问题（留给 PRD/Design 阶段）

- 立方根公式的具体系数 K 和经验表精确数值
- 每级获得的自由属性点数量（2 还是 3？）
- 经验衰减的触发等级阈值（何时开始打折？）
- 升级时是否有 max_hp/max_mp 等基础值自动增长
- collect 类任务的物品来源（战斗掉落？房间搜索？NPC 购买？）
- 任务物品（如"铁匠的信"）是否为特殊不可交易物品
- dialogue 任务的对话标记如何与现有 inquiry 系统整合
- 自动触发推送的频率控制（每次进房间都提示？还是只提示一次？）

## 探讨记录

### 关键决策

1. **初始范围**：先固定后动态。第一版验证任务框架的完整流程，第二版加 QUEST_D 风格的随机任务生成器。

2. **成长体系复杂度**：选择三层（exp+潜能+阅历），参考炎黄但简化。不做体会（experience）和贡献（gongxian），降低认知负担。

3. **升级曲线**：采用立方根曲线（level = cbrt(exp\*K)+1），炎黄验证过的成熟方案，前期快后期慢。

4. **属性成长**：升级加点而非自动成长。保留玩家对角色成长方向的控制权，与创建角色时的属性分配体验一致。

5. **数据存储**：运行时 PlayerBase dbase + 断线写 DB（炎黄风格）。不用独立任务表，JSON 字段足够第一版使用。

6. **触发方式**：自动触发而非手动询问。降低操作门槛，进房间/交互时自动检测并推送可接任务。

7. **前端交互**：日志提示 + NPC 弹窗，不加独立任务页面。保持 MUD 的沉浸感，避免过度 UI 化。

8. **任务定义位置**：混合方案。简单任务写 NPC 蓝图，复杂链独立文件。兼顾开发效率和可维护性。

### 炎黄 MUD 参考要点

- **两层任务架构**（动态+固定）→ 我们第一版只做固定层
- **preCondition/postCondition 分离** → 借鉴，`canAccept()` 和 `isComplete()` 独立
- **任务状态机**（created→ready→finish）→ 简化为 hidden→available→active→ready→completed
- **立方根升级公式** → 直接采用
- **经验衰减机制** → 预留接口，第一版不启用
- **谣言系统** → 不做，用 inquiry 对话替代
- **任务自清理** → 借鉴，任务物品在完成/放弃时自动回收

---

> CX 工作流 | 功能探讨
