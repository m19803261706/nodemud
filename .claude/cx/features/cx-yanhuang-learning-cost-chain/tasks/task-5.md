# Task 5: study/practice 消耗语义对齐炎黄

## 关联

- Part of feature: 炎黄学习消耗链路复刻
- Phase: 2 — 服务端学习链路
- Depends on: Task 1
- Parallel with: Task 4
- Scope: #239

## 任务描述

对齐 `study` 与 `practice` 的资源语义，明确“读书/练习不吃潜能”这一核心规则，并将 `study` 精力公式调整到炎黄风格可解释模型。

## 目标文件

### 修改文件

1. `server/src/engine/commands/std/study.ts`
2. `server/src/engine/commands/std/practice.ts`
3. `server/src/engine/skills/practice-manager.ts`（若涉及成本回包语义）
4. `server/src/engine/__tests__/commands/study.spec.ts`
5. `server/src/engine/__tests__/commands/practice.spec.ts`

## 验收标准

- [ ] `study` 消耗公式对齐“基础成本 + 难度 - 悟性”并设置下限
- [ ] `study` 成功不改变 `learned_points`
- [ ] `practice` 成功不改变 `learned_points`
- [ ] `practice` 继续复用技能定义成本，不新增门派特判
- [ ] 两条链路都不污染 `learn` / `research` 的潜能预算
- [ ] 回包文案与日志提示保持现有风格，不引入破坏性文案变更

## 📋 契约片段（来自 PRD + 炎黄参考）

### study 成本模型

```ts
// 对齐 study.c: (jing_cost * 20 + difficulty - int) / 20，最小值保护
悟性 = max(1, perception);
energyCost = floor((bookJingCost * 20 + bookDifficulty - 悟性) / 20);
energyCost = max(10, energyCost);
```

### practice 语义

```ts
practice:
  consume resources from skill definition
  learned_points unchanged
```

## 代码参考

- 炎黄 study 公式：`参考mud代码/mud/cmds/skill/study.c`
- 炎黄 practice 语义：`参考mud代码/mud/cmds/skill/practice.c`
- 当前项目 study：`server/src/engine/commands/std/study.ts`
- 当前项目 practice：`server/src/engine/skills/practice-manager.ts`

## 相关文档

- PRD: `.claude/cx/features/cx-yanhuang-learning-cost-chain/prd.md`（R4、R5）
