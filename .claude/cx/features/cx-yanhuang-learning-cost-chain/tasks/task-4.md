# Task 4: research 命令补齐与资源结算

## 关联

- Part of feature: 炎黄学习消耗链路复刻
- Phase: 2 — 服务端学习链路
- Depends on: Task 1, Task 2
- Parallel with: Task 5
- Scope: #239

## 任务描述

补齐 `research` 命令，形成“请教不足时可自研”的成长支路。第一期只实现核心链路：门槛校验、精力/潜能扣减、批量执行、部分成功中断和统一回包。

## 目标文件

### 新建文件

1. `server/src/engine/commands/std/research.ts`

### 修改文件

2. `server/src/engine/command-loader.ts`（若需显式注册）
3. `server/src/websocket/handlers/command.handler.ts`
4. `server/src/engine/__tests__/commands/research.spec.ts`（新增）
5. `server/src/engine/__tests__/command-loader.spec.ts`（补命令可见性）

## 验收标准

- [ ] 支持命令：`research <技能名> [次数]`
- [ ] 次数范围和 learn 对齐（1-100）
- [ ] 校验技能已学会且达到研究门槛（默认 `>= 180`）
- [ ] 校验 `potential - learned_points >= 1`，否则返回 `insufficient_potential`
- [ ] 每次研究消耗精力并递增 `learned_points`
- [ ] 支持部分成功并给出 `timesCompleted`
- [ ] `skillLearnResult` 回包字段完整，reason 语义与 learn 一致

## 📋 契约片段（来自 PRD + 炎黄参考）

### 命令契约

```text
research <技能名> [次数]
```

### 研究门槛与成本

```ts
require currentSkillLevel >= 180;
悟性 = max(1, perception);
energyCost = max(10, floor(1000 / 悟性)); // 对齐 research.c 主体公式并加下限保护

for each time:
  check potential budget
  check energy
  improve skill
  learned_points += 1
```

## 代码参考

- 炎黄 research 参考：`参考mud代码/mud/cmds/skill/research.c`
- 当前命令链路：`server/src/websocket/handlers/command.handler.ts`
- 当前学习回包类型：`packages/core/src/types/messages/skill.ts`

## 相关文档

- PRD: `.claude/cx/features/cx-yanhuang-learning-cost-chain/prd.md`（R6、R7）
