# 功能探讨: 炎黄学习消耗链路复刻

## 基本信息

- **创建时间**: 2026-02-11
- **模式**: 功能级 Scope
- **关联世界观**: #84（天衍世界观设定）
- **参考实现**: `参考mud代码/mud/cmds/skill/learn.c`、`study.c`、`practice.c`、`research.c`、`feature/skill.c`
- **本仓库现状基线**:
  - 已有 `learn/study/practice`，缺少 `research`
  - `learn` 当前为银两 + 固定精力，尚未实现 `learned_points` 潜能预算链

## 功能目标

在不重构整套技能引擎的前提下，按炎黄 MUD 的成熟范式复刻学习消耗闭环，使“请教/读书/练习/研究”四条成长路径的资源成本、门槛与反馈统一可预期。

## 已锁定决策

| 决策项 | 选择 | 结论 |
|---|---|---|
| 1. 复刻范围 | A | 完整覆盖 `learn/study/practice/research` |
| 2. jing 资源映射 | A | 不新增 `jing` 字段，使用现有 `energy` 承载 jing 消耗 |
| 3. 银两规则 | C | 保留当前强制银两学费（`teach_cost`） |
| 4. 师父上限 | A | 严格按 `teach_skill_levels` 限制可学上限 |
| 5. 潜能展示 | A | 复用现有顶部潜能显示，不新增独立面板 |
| 6. Scope 名称 | A | 「炎黄学习消耗链路复刻」 |

## 方案概要

### 1) learn（向 NPC 请教）

- 资源消耗:
  - 银两：每次学习扣 `teach_cost`（保留现有规则）
  - 精力：引入炎黄风格动态公式（首学翻倍）
  - 潜能：新增预算链 `availablePotential = potential - learned_points`
- 成长限制:
  - 必须满足 `availablePotential >= 次数`
  - 必须满足师父上限：`playerSkillLevel < teach_skill_levels[skillId]`
  - 维持现有技能 `canImprove` 门槛
- 循环语义:
  - 按次执行，允许“部分成功后中断”
  - 首次失败返回明确 reason，部分成功返回完成次数

### 2) study（研读秘籍）

- 维持书籍研读路径与现有指令结构
- 对齐炎黄风格成本：
  - 使用 `jing_cost + difficulty - 悟性` 类公式计算 `energy` 消耗
  - 设置最小消耗下限
- 不引入潜能消耗（与炎黄 study 语义一致）

### 3) practice（练习）

- 保持“练习仅消耗资源，不消耗潜能”的语义
- 复用当前技能定义中的练习成本接口
- 维持现有经验门槛判定，不在本期引入额外门派特判

### 4) research（研究）

- 新增 `research` 指令（当前仓库缺失）
- 语义对齐炎黄：
  - 研究需技能达到最低等级门槛
  - 每次研究消耗精力 + 潜能（`learned_points` 递增）
  - 允许批量次数执行与中途中断
- 第一版优先落地消耗链与门槛链，复杂“相关技能加权”作为后续增强

## 数据与接口改动

### 持久化

- `Character` 增加 `learnedPoints` 字段（对齐 `learned_points`）
- 登录加载、断线保存补齐该字段

### 运行时

- Player dbase 新增/统一使用：
  - `potential`
  - `learned_points`
  - `available_potential`（可选派生，不强制持久化）

### 消息协议

- `skillLearnResult.reason` 增补/统一：
  - `insufficient_potential`
  - `teacher_cap_reached`
  - `insufficient_energy`
  - `insufficient_silver`
- 前端继续通过既有 reason 映射提示文案

## 与现有功能关系

- **依赖**:
  - 现有 SkillManager 提升逻辑
  - `teach_skill_levels` 门派 NPC 数据
  - 现有顶部状态栏潜能展示
- **影响**:
  - `learn` 指令与 WebSocket 学艺处理将统一策略
  - 新增 `research` 后，技能成长路径更完整
- **复用**:
  - 复用当前 `study/practice` 入口和 skillLearnResult 回包机制

## 边界与约束

- 本期不新增独立 `jing/max_jing` 资源字段
- 本期不改造底部 Tab 与任务面板结构
- 本期不扩展新的学习 UI 页面，只增强已有反馈
- 本期不触碰与学习链路无关模块

## 验收标准

1. 玩家请教技能时，若 `potential - learned_points <= 0`，可稳定返回“潜能不足”并拒绝学习。
2. 学习过程中 `learned_points` 递增并持久化，断线重登后保持一致。
3. 同一技能达到师父 `teach_skill_levels` 后，继续请教会被拒绝。
4. `study` 不消耗潜能，仅消耗精力并受难度/悟性影响。
5. `practice` 不消耗潜能，沿用练习资源消耗。
6. `research` 指令可用，且按“精力 + 潜能”执行。

## 开放问题（留待 PRD/Design）

1. `learn` 的悟性取值映射细节（`wisdom` 单字段或复合属性）最终常量。
2. `research` 第一版是否引入“相关技能加权”成长项，或延后到二期。
3. 银两学费是否按 NPC 身份分段（当前锁定为保留 `teach_cost` 强制扣费）。

