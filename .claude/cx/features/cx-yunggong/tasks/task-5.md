# Task 5: shield + powerup 特殊 buff 效果

## 关联

- Part of feature: 运功（内功特殊功能）
- Phase: 3 — 效果实现
- Depends on: Task 2
- Parallel with: Task 3, Task 4

## 任务描述

实现两个特殊 buff 运功效果：

1. **shield（护体）** — 消耗内力获得临时防御加成，到期自动移除
2. **powerup（强化）** — 消耗内力获得临时攻击/闪避/格挡加成，到期自动移除

两个效果都是特殊效果（`isUniversal: false`），需要内功的 `getExertEffects()` 声明支持才能使用。使用 tmpDbase 存储 buff 状态，callOut 设置到期移除。

## 目标文件

### 新建文件

1. `server/src/engine/exert/effects/shield.ts` — ShieldEffect
2. `server/src/engine/exert/effects/powerup.ts` — PowerupEffect

## 验收标准

- [ ] ShieldEffect: isUniversal=false, canUseInCombat=false
- [ ] ShieldEffect: 前置 — 内力 >= 100, 内功等级 >= 50
- [ ] ShieldEffect: 消耗 100 内力
- [ ] ShieldEffect: 防御加成 = floor(forceLevel / 2)
- [ ] ShieldEffect: 持续时间 = forceLevel 秒
- [ ] ShieldEffect: 设置 `exert/shield` = 防御加成值
- [ ] ShieldEffect: 重复使用时先移除旧 buff + 旧 callOut
- [ ] ShieldEffect: callOut 到期移除 buff 并推送 buffRemoved 消息
- [ ] PowerupEffect: isUniversal=false, canUseInCombat=false
- [ ] PowerupEffect: 前置 — 内力 >= 150, 内功等级 >= 40
- [ ] PowerupEffect: 消耗 150 内力
- [ ] PowerupEffect: 攻击/闪避/格挡加成 = floor(forceLevel \* 2 / 5)
- [ ] PowerupEffect: 持续时间 = forceLevel 秒
- [ ] PowerupEffect: 设置 `exert/powerup` = { attack, dodge, parry }
- [ ] 两个效果都使用 @ExertEffect 装饰器注册
- [ ] 两个效果的 buffApplied 返回正确

## 📋 契约片段（来自 Design Doc）

> ⚠️ 以下契约已在 Design Doc 中锁定，实现时必须严格遵守。

### shield — 护体 (PRD R6)

```typescript
@ExertEffect()
export class ShieldEffect extends ExertEffectBase {
  name = 'shield';
  displayName = '护体';
  isUniversal = false;
  canUseInCombat = false;

  execute(player, forceSkillId, forceLevel): ExertExecuteResult {
    // 前置: 内力 >= 100, 等级 >= 50
    const bonus = Math.floor(forceLevel / 2);
    const duration = forceLevel; // 秒

    // 消耗 100 内力
    player.set('mp', mp - 100);

    // 重复使用: 移除旧 callOut
    const oldCallOutId = player.getTemp<string>('exert/shield_callout');
    if (oldCallOutId) player.removeCallOut(oldCallOutId);

    // 设置 buff
    player.setTemp('exert/shield', bonus);

    // callOut 到期移除
    const callOutId = player.callOut(() => {
      player.delTemp('exert/shield');
      player.delTemp('exert/shield_callout');
      // 推送 buffRemoved: 'shield'
    }, duration * 1000);
    player.setTemp('exert/shield_callout', callOutId);

    return {
      success: true,
      resourceChanged: true,
      buffApplied: { name: 'shield', duration, bonuses: { defense: bonus } },
    };
  }
}
```

### powerup — 强化 (PRD R7)

```typescript
@ExertEffect()
export class PowerupEffect extends ExertEffectBase {
  name = 'powerup';
  displayName = '强化';
  isUniversal = false;
  canUseInCombat = false;

  execute(player, forceSkillId, forceLevel): ExertExecuteResult {
    // 前置: 内力 >= 150, 等级 >= 40
    const bonus = Math.floor((forceLevel * 2) / 5);
    const duration = forceLevel;

    // 消耗 150 内力
    // 设置 exert/powerup = { attack: bonus, dodge: bonus, parry: bonus }
    // callOut 到期移除 + exert/powerup_callout

    return {
      success: true,
      resourceChanged: true,
      buffApplied: {
        name: 'powerup',
        duration,
        bonuses: { attack: bonus, dodge: bonus, parry: bonus },
      },
    };
  }
}
```

### Buff tmpDbase 键

| buff 名         | tmpDbase 路径           | 值类型                                             | 说明                 |
| --------------- | ----------------------- | -------------------------------------------------- | -------------------- |
| shield          | `exert/shield`          | `number`                                           | 防御加成值           |
| shield callout  | `exert/shield_callout`  | `string`                                           | callOut ID（刷新用） |
| powerup         | `exert/powerup`         | `{ attack: number; dodge: number; parry: number }` | 属性加成对象         |
| powerup callout | `exert/powerup_callout` | `string`                                           | callOut ID（刷新用） |

### buffRemoved 消息示例

```json
{
  "type": "exertResult",
  "data": {
    "effectName": "shield",
    "displayName": "护体",
    "success": true,
    "message": "护体之力逐渐消散。",
    "resourceChanged": false,
    "buffRemoved": "shield"
  }
}
```

## 代码参考

- BaseEntity.callOut(): `server/src/engine/base-entity.ts:319` — 返回 callOut ID
- BaseEntity.removeCallOut(): `server/src/engine/base-entity.ts:330`
- BaseEntity.setTemp/getTemp/delTemp: `server/src/engine/base-entity.ts:99-124`
- PlayerBase.sendToClient(): 推送消息
- MessageFactory.create/serialize: 创建和序列化消息

## 相关文档

- Design Doc: `.claude/cx/features/cx-yunggong/design.md` (shield + powerup 章节)
- PRD: R6 (shield) + R7 (powerup)
