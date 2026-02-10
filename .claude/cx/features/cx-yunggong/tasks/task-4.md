# Task 4: heal 持续疗伤效果

## 关联

- Part of feature: 运功（内功特殊功能）
- Phase: 3 — 效果实现
- Depends on: Task 2
- Parallel with: Task 3, Task 5

## 任务描述

实现持续型运功效果 **heal（运功疗伤）** — 非战斗中持续消耗内力恢复气血，使用 callOut 注册 tick 循环，支持多种停止条件和收功逻辑。

这是最复杂的效果实现，涉及状态管理、定时器循环和消息推送。

## 目标文件

### 新建文件

1. `server/src/engine/exert/effects/heal.ts` — HealEffect

## 验收标准

- [ ] HealEffect: isUniversal=true, canUseInCombat=false
- [ ] 前置检查 — 内力 >= 50, 气血缺失 >= maxHp/5, 非战斗, 非已在疗伤
- [ ] 设置 `exert/healing` 临时状态为 true
- [ ] 使用 callOut 注册 tick 循环，间隔 3 秒
- [ ] 每 tick 消耗 50 内力，恢复 `10 + floor(forceLevel / 3)` 气血
- [ ] 每 tick 推送 exertResult 消息（effectName='heal', resourceChanged=true）
- [ ] 停止条件：气血满 / 内力 < 50 / 进入战斗 / exert/healing 被清除
- [ ] 停止时清除 `exert/healing`，额外消耗 `min(100, 当前内力)` 收功
- [ ] 停止时推送 exertResult 消息（healingStopped=true）
- [ ] 开始时返回 healingStarted=true
- [ ] 使用 @ExertEffect 装饰器注册

## 📋 契约片段（来自 Design Doc）

> ⚠️ 以下契约已在 Design Doc 中锁定，实现时必须严格遵守。

### heal — 运功疗伤 (PRD R4)

```typescript
@ExertEffect()
export class HealEffect extends ExertEffectBase {
  name = 'heal';
  displayName = '运功疗伤';
  isUniversal = true;
  canUseInCombat = false;

  execute(player, forceSkillId, forceLevel): ExertExecuteResult {
    // 已在疗伤: return fail
    if (player.getTemp<boolean>('exert/healing')) return fail('已在运功疗伤中');

    // 前置: 内力 >= 50, 缺失 >= maxHp/5
    // 设置疗伤状态
    player.setTemp('exert/healing', true);

    // tick 循环
    const tickFn = () => {
      // 停止条件检查
      if (hp >= maxHp || mp < 50 || player.isInCombat() || !player.getTemp('exert/healing')) {
        this.stopHealing(player);
        return;
      }
      // 消耗 50 内力
      player.set('mp', mp - 50);
      // 恢复 10 + floor(forceLevel / 3) 气血
      const healAmt = 10 + Math.floor(forceLevel / 3);
      player.recoverHp(healAmt);
      // 推送 tick 消息
      // 注册下一 tick
      player.callOut(tickFn, 3000);
    };

    player.callOut(tickFn, 3000);
    return { success: true, healingStarted: true, ... };
  }

  stopHealing(player): void {
    player.delTemp('exert/healing');
    const finalCost = Math.min(100, mp);
    player.set('mp', mp - finalCost);
    // 推送 healingStopped 消息
  }
}
```

### Buff tmpDbase 键

| buff 名 | tmpDbase 路径   | 值类型    | 说明                 |
| ------- | --------------- | --------- | -------------------- |
| healing | `exert/healing` | `boolean` | 是否处于持续疗伤状态 |

### heal tick 消息示例

```json
{
  "type": "exertResult",
  "data": {
    "effectName": "heal",
    "displayName": "运功疗伤",
    "success": true,
    "message": "你运功疗伤，恢复了 43 点气血。",
    "resourceChanged": true
  }
}
```

### heal 停止消息示例

```json
{
  "type": "exertResult",
  "data": {
    "effectName": "heal",
    "displayName": "运功疗伤",
    "success": true,
    "message": "你收起内力，运功疗伤结束。",
    "resourceChanged": true,
    "healingStopped": true
  }
}
```

## 代码参考

- BaseEntity.callOut(): `server/src/engine/base-entity.ts:319` — 返回 callOut ID (string)
- BaseEntity.removeCallOut(): `server/src/engine/base-entity.ts:330`
- BaseEntity.setTemp/getTemp/delTemp: `server/src/engine/base-entity.ts:99-124`
- PlayerBase.sendToClient(): 推送消息
- MessageFactory.create/serialize: 创建和序列化消息

## 相关文档

- Design Doc: `.claude/cx/features/cx-yunggong/design.md` (heal 章节)
- PRD: R4 (heal) + R10 (exert stop)
