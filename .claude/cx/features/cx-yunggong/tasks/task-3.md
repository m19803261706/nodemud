# Task 3: recover + regenerate 通用瞬发效果

## 关联

- Part of feature: 运功（内功特殊功能）
- Phase: 3 — 效果实现
- Depends on: Task 2
- Parallel with: Task 4, Task 5

## 任务描述

实现两个通用瞬发运功效果：

1. **recover（调匀气息）** — 消耗内力恢复气血，战斗中可用但消耗翻倍
2. **regenerate（提振精神）** — 消耗内力恢复精力，非战斗使用

两个效果都是瞬发型（一次性执行），共享类似的实现模式。

## 目标文件

### 新建文件

1. `server/src/engine/exert/effects/recover.ts` — RecoverEffect
2. `server/src/engine/exert/effects/regenerate.ts` — RegenerateEffect

## 验收标准

- [ ] RecoverEffect: isUniversal=true, canUseInCombat=true
- [ ] RecoverEffect: 前置检查 — 内力 >= 20, 气血缺失 >= 10
- [ ] RecoverEffect: 消耗公式 — `cost = max(20, floor(100 * (maxHp - hp) / forceLevel))`
- [ ] RecoverEffect: 战斗中消耗翻倍 — `cost *= 2`
- [ ] RecoverEffect: 内力不足时按比例部分恢复
- [ ] RegenerateEffect: isUniversal=true, canUseInCombat=false
- [ ] RegenerateEffect: 前置检查 — 内力 >= 20, 精力缺失 >= 10
- [ ] RegenerateEffect: 消耗公式 — `cost = max(20, floor(缺失精力 * 60 / forceLevel))`
- [ ] 两个效果都使用 @ExertEffect 装饰器注册
- [ ] 返回的 ExertExecuteResult 格式正确
- [ ] 使用 rt()/bold() 生成富文本 message

## 📋 契约片段（来自 Design Doc）

> ⚠️ 以下契约已在 Design Doc 中锁定，实现时必须严格遵守。

### recover — 调匀气息 (PRD R3)

```typescript
@ExertEffect()
export class RecoverEffect extends ExertEffectBase {
  name = 'recover';
  displayName = '调匀气息';
  isUniversal = true;
  canUseInCombat = true;

  execute(player, forceSkillId, forceLevel): ExertExecuteResult {
    // 前置: 内力 >= 20, 缺失 >= 10
    // 消耗公式: cost = max(20, floor(100 * missing / forceLevel))
    // 战斗中: cost *= 2
    // 实际消耗 = min(cost, 当前内力)
    // 按比例恢复: healAmount = floor(missing * actualCost / cost)
    // player.set('mp', mp - actualCost)
    // player.recoverHp(healAmount)
  }
}
```

### regenerate — 提振精神 (PRD R5)

```typescript
@ExertEffect()
export class RegenerateEffect extends ExertEffectBase {
  name = 'regenerate';
  displayName = '提振精神';
  isUniversal = true;
  canUseInCombat = false;

  execute(player, forceSkillId, forceLevel): ExertExecuteResult {
    // 前置: 内力 >= 20, 精力缺失 >= 10
    // 消耗: cost = max(20, floor(缺失精力 * 60 / forceLevel))
    // 实际消耗 = min(cost, 当前内力)
    // 按比例恢复精力
    // player.set('mp', mp - actualCost)
    // player.recoverEnergy(amount)
  }
}
```

### 关联 Buff tmpDbase 键

无（瞬发效果不涉及 buff）

## 代码参考

- LivingBase.recoverHp(): `server/src/engine/game-objects/living-base.ts:224`
- LivingBase.recoverEnergy(): `server/src/engine/game-objects/living-base.ts:234`
- LivingBase.isInCombat(): `server/src/engine/game-objects/living-base.ts:276`
- LivingBase.getMaxHp(): `server/src/engine/game-objects/living-base.ts:156`
- LivingBase.getMaxEnergy(): `server/src/engine/game-objects/living-base.ts:174`
- rt()/bold(): `server/src/engine/utils/rich-text.ts`

## 相关文档

- Design Doc: `.claude/cx/features/cx-yunggong/design.md` (recover + regenerate 章节)
- PRD: R3 (recover) + R5 (regenerate)
