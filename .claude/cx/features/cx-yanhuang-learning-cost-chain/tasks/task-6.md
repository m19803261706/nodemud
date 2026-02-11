# Task 6: 前端提示与顶部潜能展示语义切换

## 关联

- Part of feature: 炎黄学习消耗链路复刻
- Phase: 3 — 前端联动与验收
- Depends on: Task 3, Task 4, Task 5
- Parallel with: Task 7
- Scope: #239

## 任务描述

在不新增页面的前提下，完成现有 UI 的语义联动：顶部潜能展示改为可用潜能，学艺失败原因可读化覆盖到位，保证“点按钮学习”与日志提示一致且可理解。

## 目标文件

### 修改文件

1. `client/src/stores/useGameStore.ts`
2. `client/src/stores/useSkillStore.ts`
3. `client/src/utils/skillLearnReason.ts`
4. `client/src/components/game/SkillPanel/SkillDetailModal.tsx`
5. `client/src/components/game/NpcList/index.tsx`（如需联动）

## 验收标准

- [ ] 顶部 `potential` 展示值为可用潜能（服务端返回值直显，不二次歧义计算）
- [ ] `skillLearnResult.reason` 新增原因全部有中文提示
- [ ] `learn/research` 部分成功场景可见“完成次数 + 中断原因”
- [ ] 点击学习后，在弹层内可直接看到反馈（不依赖用户切回江湖日志）
- [ ] 不新增门派/技能新 Tab，不改变既有导航结构

## 📋 契约片段（来自 PRD）

### reason 映射最小集

```ts
const REASON_HINT_MAP = {
  insufficient_silver: '银两不足，补足学费后可继续学习。',
  insufficient_energy: '精力不足，请先休整再学艺。',
  insufficient_potential: '潜能已尽，先历练积累潜能再来。',
  teacher_cap_reached: '师父所授已尽，需另寻机缘。',
  cannot_improve: '当前境界受限，暂时无法继续精进此技能。',
};
```

## 代码参考

- 当前 reason 映射：`client/src/utils/skillLearnReason.ts`
- 当前状态栏字段：`client/src/stores/useGameStore.ts`
- 当前技能弹层反馈：`client/src/components/game/SkillPanel/SkillDetailModal.tsx`

## 相关文档

- PRD: `.claude/cx/features/cx-yanhuang-learning-cost-chain/prd.md`（R7、R8）
