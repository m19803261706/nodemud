# Task 3: learn 双入口统一（命令 + WebSocket）

## 关联

- Part of feature: 炎黄学习消耗链路复刻
- Phase: 2 — 服务端学习链路
- Depends on: Task 1, Task 2
- Parallel with: 无
- Scope: #239

## 任务描述

统一 `learn` 指令与 `handleSkillLearnRequest` 的判定和扣费逻辑，彻底消除“命令可学、按钮不可学”或“提示 reason 不一致”的分叉问题。

本任务要求抽取共享学习判定函数，双入口复用。

## 目标文件

### 修改文件

1. `server/src/engine/commands/std/learn.ts`
2. `server/src/websocket/handlers/skill.handler.ts`
3. `server/src/engine/skills/skill-manager.ts`（仅必要时）
4. `server/src/engine/__tests__/commands/sect.spec.ts`（或对应 learn 测试）
5. `server/src/websocket/handlers/__tests__/skill.handler.spec.ts`

### 可选新增文件

6. `server/src/engine/skills/learning/learn-policy.ts`

## 验收标准

- [ ] 双入口都执行同一套前置校验：银两、精力、潜能预算、师父上限、canImprove
- [ ] 双入口都支持批量学习并允许“部分成功后中断”
- [ ] `teacher_cap_reached` 来自 `teach_skill_levels[skillId]` 严格限制
- [ ] 保留 `teach_cost` 强制学费规则（银两不足立即失败）
- [ ] 精力消耗改为炎黄风格动态公式（首学翻倍），不再固定每次 5 点
- [ ] 扣费顺序一致：前置校验通过后扣费，若本次未发生成长可回滚该次扣费
- [ ] `timesCompleted / timesRequested` 在两条路径保持一致语义

## 📋 契约片段（来自 PRD + 炎黄参考）

### learn 成本模型

```ts
// 对齐 learn.c: jing_cost = (100 + my_skill * 2) / int; 首学翻倍
悟性 = max(1, perception);
energyCost = floor((100 + currentSkillLevel * 2) / 悟性);
if (currentSkillLevel === 0) energyCost *= 2;
energyCost = max(5, energyCost); // 防止极端值为 0
```

### 潜能预算

```ts
if (potential - learned_points < 1) {
  return reason = 'insufficient_potential';
}
```

### 师父上限

```ts
cap = npc.teach_skill_levels?.[skillId];
if (!cap || currentLevel >= cap) {
  return reason = 'teacher_cap_reached';
}
```

## 代码参考

- 炎黄 learn 公式：`参考mud代码/mud/cmds/skill/learn.c`
- 炎黄 can_improve 约束：`参考mud代码/mud/feature/skill.c`
- 当前命令入口：`server/src/engine/commands/std/learn.ts`
- 当前 WS 入口：`server/src/websocket/handlers/skill.handler.ts`

## 相关文档

- PRD: `.claude/cx/features/cx-yanhuang-learning-cost-chain/prd.md`（R2、R3、R7）
