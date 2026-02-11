# PRD: 炎黄学习消耗链路复刻

## 基本信息

- **创建时间**: 2026-02-11
- **优先级**: P0
- **关联 Scope**: #239（炎黄学习消耗链路复刻）
- **关联世界观**: #84（天衍世界观设定）
- **范围决策**: `1A 2A 3C 4A 5A 6A`

## 功能概述

在当前技能系统上复刻炎黄 MUD 的学习消耗机制，统一 `learn/study/practice/research` 四条路径，使学习成本、门槛和反馈可解释、可预测、可持久化。

本期重点是“消耗链路复刻”，不是重写整个 `SkillManager` 升级体系。

## 目标与非目标

### 目标

1. 学艺链路支持潜能预算：`availablePotential = potential - learned_points`。
2. `learn` 强制执行师父上限（`teach_skill_levels`）。
3. `learn/study/practice/research` 四条路径各自资源语义稳定且明确。
4. 学习失败原因标准化，前端可直接提示。
5. `learned_points` 持久化并在断线重连后不丢失。

### 非目标

1. 不新增独立 `jing/max_jing` 字段。
2. 不改造技能大类、门派大框架、任务面板结构。
3. 不重构 `SkillManager.improveSkill()` 核心数学模型。
4. 不实现二期“研究相关技能加权”复杂算法。

## 用户场景

### 场景 A：玩家向师父请教

1. 玩家在 NPC 面板选择“学习技能”。
2. 系统先校验银两、精力、潜能、师父可教上限。
3. 满足条件后按次数循环学习。
4. 若中途资源不足，则返回“已完成次数 + 中断原因”。
5. 顶部潜能显示实时体现可用潜能下降效果（复用现有潜能字段展示）。

### 场景 B：玩家读书研习

1. 玩家执行 `study`。
2. 系统按秘籍难度与悟性计算精力消耗。
3. 不消耗潜能，仅消耗精力并提升技能进度。

### 场景 C：玩家练习与研究

1. `practice`：按技能定义成本消耗资源，不消耗潜能。
2. `research`：达到门槛后可执行，消耗精力 + 潜能。

## 功能需求

### R1. 数据模型与持久化

1. 在 `Character` 增加 `learnedPoints` 字段（默认 `0`）。
2. 登录时将 `learnedPoints` 加载到玩家运行时 `learned_points`。
3. 存档时将运行时 `learned_points` 写回 `learnedPoints`。
4. 保持与现有 `potential` 字段并存。

### R2. learn 消耗链路

1. 保留银两强制规则（`teach_cost` 必须满足）。
2. 精力采用动态消耗公式（炎黄风格，首学翻倍）。
3. 每次成功学习消耗 `1` 点潜能预算（`learned_points += 1`）。
4. 学习前必须满足 `potential - learned_points >= 1`。
5. 支持批量次数，允许部分成功后中断。

### R3. learn 师父上限

1. 必须读取 `npc.teach_skill_levels[skillId]`。
2. 当玩家技能等级 `>=` 该上限时，拒绝继续学习。
3. 对缺失上限数据的 NPC，回退为不可学习该技能，避免越权。

### R4. study 消耗链路

1. 维持当前 `study` 命令入口与行为。
2. 精力成本使用“基础成本 + 难度 - 悟性”模型并有最小值。
3. `study` 不消耗潜能，不增加 `learned_points`。

### R5. practice 消耗链路

1. 维持 `practice` 当前入口与模式（单次/持续）。
2. 消耗来自技能定义，`practice` 不消耗潜能。
3. 不新增门派特判。

### R6. research 指令补齐

1. 新增 `research` 命令与路由。
2. 研究前置要求：技能等级达到最低门槛，且满足提升条件。
3. 每次研究消耗精力与潜能（`learned_points += 1`）。
4. 支持次数参数与部分成功中断。

### R7. 错误码与前端提示

统一输出并在现有前端映射中可读：

- `insufficient_silver`
- `insufficient_energy`
- `insufficient_potential`
- `teacher_cap_reached`
- `cannot_improve`

### R8. 顶部潜能展示语义

1. 继续使用现有顶部潜能显示位，不新增组件。
2. 展示值语义调整为“可用潜能”，即 `potential - learned_points`。
3. 原始 `potential` 仍用于存档与奖励累计。

## 接口与命令变更

### 命令层

1. 新增：`research <skill> [times]`。
2. 既有：`learn/study/practice` 行为增强，不改命令名称。

### 消息层

1. `skillLearnResult.reason` 新增并规范化潜能与师父上限原因码。
2. `playerStats.potential` 语义按“可用潜能”输出。

## 验收标准

1. `potential=10, learned_points=10` 时，`learn/research` 必然失败并返回 `insufficient_potential`。
2. 学习 3 次成功后，`learned_points` 增加 3，重登后保持不变。
3. 玩家技能达到师父上限后，继续学习返回 `teacher_cap_reached`。
4. `study` 执行不增加 `learned_points`。
5. `practice` 执行不增加 `learned_points`。
6. `research` 命令可执行并正确消耗精力与潜能。

## 测试要求

### 单元测试

1. `stats.utils`：`learnedPoints` 加载与保存。
2. `skill.handler`：潜能不足、师父上限、部分成功中断。
3. `learn` 指令：与 WebSocket 路径一致的资源判定。
4. `research` 指令：次数循环、资源扣减、失败回包。

### 回归测试

1. 门派授艺按钮与技能详情展示不回归。
2. 商人、任务、战斗链路不受影响。
3. 顶部状态栏潜能数值刷新正常。

## 里程碑拆分

### 里程碑 1：数据层

1. `Character` 增加 `learnedPoints`。
2. 登录/保存链路贯通。

### 里程碑 2：learn/research 核心

1. `learn` 消耗链路与师父上限。
2. `research` 新命令落地。

### 里程碑 3：前端与回归

1. 顶部潜能语义切换为可用潜能。
2. reason 提示覆盖与回归测试。

## 风险与缓解

1. **风险**：前后端对“潜能”语义理解不一致。  
   **缓解**：统一定义“显示值=可用潜能，存储值=总潜能”。
2. **风险**：命令入口与 WS 入口逻辑分叉。  
   **缓解**：抽取共享判定函数，双入口共用。
3. **风险**：历史角色缺少 `learnedPoints`。  
   **缓解**：默认值 `0`，加载时兜底。

