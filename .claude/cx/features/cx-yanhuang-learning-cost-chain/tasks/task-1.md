# Task 1: 学习链路契约收口（reason/可用潜能语义）

## 关联

- Part of feature: 炎黄学习消耗链路复刻
- Phase: 1 — 契约与数据层基础
- Depends on: 无
- Parallel with: Task 2
- Scope: #239

## 任务描述

先把“学艺失败原因 + 潜能语义 + 命令契约”统一下来，作为后续实现的硬约束，避免 `learn` 命令、`skillLearnRequest` 和前端提示三套逻辑分叉。

本任务不做重逻辑改造，只做契约与类型收口。

## 目标文件

### 修改文件

1. `packages/core/src/types/messages/skill.ts`
2. `client/src/utils/skillLearnReason.ts`
3. `client/src/stores/useGameStore.ts`
4. `server/src/websocket/handlers/skill.handler.ts`
5. `server/src/engine/commands/std/learn.ts`

### 可选新增文件

6. `server/src/engine/skills/learning/learn-reason.ts`（失败原因常量，供命令与 WS 共用）

## 验收标准

- [ ] `SkillLearnResultData.reason` 形成受控取值（至少覆盖：`insufficient_silver` / `insufficient_energy` / `insufficient_potential` / `teacher_cap_reached` / `cannot_improve`）
- [ ] `learn` 命令路径与 `skillLearnRequest` 路径返回同一套 reason 语义
- [ ] `playerStats.potential` 语义在文档和代码中统一为“可用潜能”，不再混用“总潜能”
- [ ] 前端 reason 映射覆盖新增 reason，不出现“未知原因”裸文案
- [ ] 失败 reason 在成功场景下不透传（success=true 时 reason 可为空）

## 📋 契约片段（来自 PRD）

> ⚠️ 以下契约在 PRD 已锁定，实现必须一致。

### 命令契约

```text
learn <技能名> from <NPC名> [次数]
```

### 消息契约

```ts
type SkillLearnFailureReason =
  | 'insufficient_silver'
  | 'insufficient_energy'
  | 'insufficient_potential'
  | 'teacher_cap_reached'
  | 'cannot_improve';

interface SkillLearnResultData {
  success: boolean;
  skillId: string;
  skillName: string;
  timesCompleted: number;
  timesRequested: number;
  currentLevel: number;
  learned: number;
  learnedMax: number;
  levelUp: boolean;
  message: string;
  reason?: SkillLearnFailureReason;
}
```

### 潜能展示契约

```ts
availablePotential = potential - learned_points;
// playerStats.potential 对外发送 availablePotential
```

## 代码参考

- 炎黄 learn 失败与潜能预算：`参考mud代码/mud/cmds/skill/learn.c`
- 炎黄 research 潜能预算：`参考mud代码/mud/cmds/skill/research.c`
- 当前项目消息类型：`packages/core/src/types/messages/skill.ts`
- 当前项目前端提示映射：`client/src/utils/skillLearnReason.ts`

## 相关文档

- PRD: `.claude/cx/features/cx-yanhuang-learning-cost-chain/prd.md`（R7、R8）
- Scope: `.claude/cx/features/cx-yanhuang-learning-cost-chain/scope.md`
