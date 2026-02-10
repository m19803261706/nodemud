# Task 7: 单元测试

## 关联

- Part of feature: 运功（内功特殊功能）
- Phase: 5 — 测试 + 前端
- Depends on: Task 6
- Parallel with: Task 8

## 任务描述

为运功系统编写单元测试，覆盖效果框架、各效果实现、exert 命令入口和 buff 聚合。

测试应使用 mock 对象模拟 PlayerBase、SkillManager 等依赖，专注于业务逻辑验证。

## 目标文件

### 新建文件

1. `server/src/engine/__tests__/exert-effects.spec.ts` — 效果框架 + 各效果测试
2. `server/src/engine/__tests__/exert-command.spec.ts` — exert 命令入口测试

## 验收标准

- [ ] ExertEffectRegistry 测试: register/get/getAll/getUniversal
- [ ] RecoverEffect 测试: 正常恢复、内力不足、气血充足、战斗中消耗翻倍、部分恢复
- [ ] HealEffect 测试: 开始疗伤、停止条件（至少模拟一次 tick）
- [ ] RegenerateEffect 测试: 正常恢复、精力充足、非战斗限制
- [ ] ShieldEffect 测试: 正常使用、内力不足、等级不够、buff 刷新
- [ ] PowerupEffect 测试: 正常使用、内力不足、等级不够
- [ ] ExertCommand 测试: 无参数列表、stop 子命令、通用效果、特殊效果检查、战斗限制
- [ ] getSkillBonusSummary buff 聚合测试
- [ ] `cd server && pnpm test` 全部通过
- [ ] 现有测试不回归

## 测试用例设计

### exert-effects.spec.ts

```typescript
describe('ExertEffectRegistry', () => {
  it('注册和获取效果');
  it('getUniversal 只返回通用效果');
});

describe('RecoverEffect', () => {
  it('正常恢复气血');
  it('内力不足时失败');
  it('气血充足时失败');
  it('战斗中消耗翻倍');
  it('内力不足时按比例部分恢复');
});

describe('HealEffect', () => {
  it('开始疗伤设置 exert/healing');
  it('已在疗伤时失败');
  it('非战斗限制');
});

describe('RegenerateEffect', () => {
  it('正常恢复精力');
  it('内力不足时失败');
  it('精力充足时失败');
});

describe('ShieldEffect', () => {
  it('正常使用设置 buff');
  it('内力不足时失败');
  it('等级不够时失败');
  it('返回正确的 buffApplied');
});

describe('PowerupEffect', () => {
  it('正常使用设置 buff');
  it('返回正确的 buffApplied');
});
```

### exert-command.spec.ts

```typescript
describe('ExertCommand', () => {
  it('非 PlayerBase 时失败');
  it('无激活内功时失败');
  it('无参数时列出可用效果');
  it('stop 中断疗伤');
  it('通用效果直接执行');
  it('特殊效果需内功支持');
  it('战斗中限制非战斗效果');
  it('成功后概率提升内功');
});

describe('getSkillBonusSummary buff 聚合', () => {
  it('无 buff 时不影响结果');
  it('shield buff 增加 defense');
  it('powerup buff 增加 attack/dodge/parry');
});
```

## 代码参考

- 测试模式参考: `server/src/engine/__tests__/book-base.spec.ts`
- Mock PlayerBase 模式: 参考已有测试中的 mock 对象创建方式

## 相关文档

- Design Doc: `.claude/cx/features/cx-yunggong/design.md`
- PRD: 验收标准
