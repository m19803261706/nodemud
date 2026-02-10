# Task 6: exert 命令入口 + SkillManager buff 聚合

## 关联

- Part of feature: 运功（内功特殊功能）
- Phase: 4 — 命令集成
- Depends on: Task 3, Task 4, Task 5

## 任务描述

创建 `exert` 命令入口，负责参数解析、前置校验、效果查找、执行和结果推送。同时修改 `SkillManager.getSkillBonusSummary()` 读取 buff tmpDbase 加成。

exert 命令是运功系统对玩家的唯一入口，需要正确处理所有边界情况。

## 目标文件

### 新建文件

1. `server/src/engine/commands/std/exert.ts` — ExertCommand

### 修改文件

2. `server/src/engine/skills/skill-manager.ts` — getSkillBonusSummary() 追加 buff 读取

## 验收标准

- [ ] 命令名 `exert`，别名 `运功`、`yunggong`
- [ ] 前置校验: executor instanceof PlayerBase
- [ ] 前置校验: activeForce 非空（未激活内功则提示）
- [ ] 无参数时列出当前可用运功效果列表（通用 + 当前内功支持的特殊效果）
- [ ] `exert stop` 中断持续运功（清除 exert/healing）
- [ ] 从 ExertEffectRegistry 查找效果
- [ ] 通用效果直接执行
- [ ] 特殊效果检查 getExertEffects() 是否包含
- [ ] 战斗限制: canUseInCombat=false 时检查 isInCombat()
- [ ] 执行成功后推送 exertResult 消息
- [ ] 执行成功后概率提升内功: `max(1, 10 - floor(level/50))%`，weakMode
- [ ] getSkillBonusSummary() 正确读取 exert/shield 加到 defense
- [ ] getSkillBonusSummary() 正确读取 exert/powerup 加到 attack/dodge/parry
- [ ] 显式导入所有效果文件确保装饰器执行
- [ ] 现有测试不回归

## 📋 契约片段（来自 Design Doc）

> ⚠️ 以下契约已在 Design Doc 中锁定，实现时必须严格遵守。

### exert 命令 (PRD R1)

```typescript
@Command({
  name: 'exert',
  aliases: ['运功', 'yunggong'],
  description: '运功 — 使用内力施展特殊效果',
})
export class ExertCommand implements ICommand {
  name = 'exert';
  aliases = ['运功', 'yunggong'];
  description = '运功 — 使用内力施展特殊效果';
  directory = 'std';

  execute(executor: LivingBase, args: string[]): CommandResult {
    // 1. 类型守卫: executor instanceof PlayerBase
    // 2. 获取 activeForce，无则提示"你没有激活内功"
    // 3. 获取内功等级: skillManager.getSkillLevel(forceId)
    // 4. 无参数: 列出可用效果
    // 5. args[0] === 'stop' → 中断持续运功
    // 6. ExertEffectRegistry.getInstance().get(effectName)
    // 7. 通用效果直接执行; 特殊效果检查 getExertEffects()
    // 8. !effect.canUseInCombat && player.isInCombat() → 拒绝
    // 9. effect.execute(player, forceId, level, target)
    // 10. 推送 exertResult 消息: MessageFactory.create('exertResult', { effectName, displayName, ...result })
    // 11. 概率提升: max(1, 10 - floor(level/50))%, improveSkill(forceId, 1, true)
  }
}
```

### SkillManager.getSkillBonusSummary() 追加 (PRD R6/R7)

在 `return summary` 之前追加:

```typescript
// 读取运功 buff 加成
const shieldBonus = this.player.getTemp<number>('exert/shield');
if (shieldBonus) {
  summary.defense += shieldBonus;
}

const powerupBonus = this.player.getTemp<{ attack: number; dodge: number; parry: number }>(
  'exert/powerup',
);
if (powerupBonus) {
  summary.attack += powerupBonus.attack;
  summary.dodge += powerupBonus.dodge;
  summary.parry += powerupBonus.parry;
}
```

### exert stop 逻辑 (PRD R10)

```typescript
if (args[0] === 'stop') {
  if (!player.getTemp<boolean>('exert/healing')) {
    return { success: false, message: '你当前没有在运功。' };
  }
  // 找到 HealEffect 实例调用 stopHealing
  // 或者直接清除 exert/healing（heal tick 下次检查时自然停止）
  player.delTemp('exert/healing');
  // 推送停止消息
}
```

### 运功技能提升 (PRD R8)

```typescript
const improveChance = Math.max(1, 10 - Math.floor(forceLevel / 50));
if (Math.random() * 100 < improveChance) {
  player.skillManager.improveSkill(forceSkillId, 1, true); // weakMode
}
```

### 效果导入（确保装饰器注册）

```typescript
// exert.ts 顶部导入效果文件
import '../exert/effects/recover';
import '../exert/effects/heal';
import '../exert/effects/regenerate';
import '../exert/effects/shield';
import '../exert/effects/powerup';
```

## 代码参考

- 命令模式: `server/src/engine/commands/std/learn.ts`
- @Command 装饰器: `server/src/engine/types/command.ts`
- SkillManager.getSkillBonusSummary(): `server/src/engine/skills/skill-manager.ts:592-648`
- SkillManager.getActiveForce(): `server/src/engine/skills/skill-manager.ts:889`
- SkillManager.improveSkill(): `server/src/engine/skills/skill-manager.ts:256`
- MessageFactory.create/serialize: `packages/core/src/factory/MessageFactory.ts`
- ServiceLocator.skillRegistry: `server/src/engine/service-locator.ts`

## 相关文档

- Design Doc: `.claude/cx/features/cx-yunggong/design.md` (exert 命令 + SkillManager 章节)
- PRD: R1 (命令入口) + R8 (技能提升) + R10 (exert stop) + R11 (战斗限制)
