# Task 7: 测试矩阵与验收证据固化

## 关联

- Part of feature: 炎黄学习消耗链路复刻
- Phase: 3 — 前端联动与验收
- Depends on: Task 3, Task 4, Task 5, Task 6
- Parallel with: 无
- Scope: #239

## 任务描述

补齐并执行本 feature 的测试矩阵，沉淀“可复验”的验收证据。若验收通过，输出到对应 issue 评论，包含任务完成清单、关键提交和测试结果摘要。

## 目标文件

### 修改文件

1. `server/src/websocket/handlers/__tests__/stats.utils.spec.ts`
2. `server/src/websocket/handlers/__tests__/skill.handler.spec.ts`
3. `server/src/engine/__tests__/commands/learn.spec.ts`（若不存在则新增）
4. `server/src/engine/__tests__/commands/research.spec.ts`
5. `server/src/engine/__tests__/commands/study.spec.ts`
6. `server/src/engine/__tests__/commands/practice.spec.ts`
7. `client` 端对应测试文件（若仓库已有测试框架）

## 验收标准

- [ ] 覆盖 `insufficient_potential` 失败分支（learn + research）
- [ ] 覆盖 `teacher_cap_reached` 分支
- [ ] 覆盖 learn 批量部分成功中断分支（资源中途不足）
- [ ] 覆盖 study/practice 不增加 `learned_points`
- [ ] 覆盖登录加载与保存 `learnedPoints` 不丢失
- [ ] 执行目标测试与构建命令通过
- [ ] 验收证据写入对应 issue 评论（清单 + commit + 测试摘要）

## 📋 验收命令（默认）

```bash
pnpm --filter server build
pnpm --filter server test -- \
  server/src/websocket/handlers/__tests__/stats.utils.spec.ts \
  server/src/websocket/handlers/__tests__/skill.handler.spec.ts \
  server/src/engine/__tests__/commands/learn.spec.ts \
  server/src/engine/__tests__/commands/research.spec.ts \
  server/src/engine/__tests__/commands/study.spec.ts \
  server/src/engine/__tests__/commands/practice.spec.ts
```

## 代码参考

- 参考测试风格：`server/src/engine/__tests__/commands/look.spec.ts`
- 技能消息测试：`server/src/websocket/handlers/__tests__/skill.handler.spec.ts`

## 相关文档

- PRD: `.claude/cx/features/cx-yanhuang-learning-cost-chain/prd.md`（验收标准与测试要求）
