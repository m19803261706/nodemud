# Task 5: 事件集成 + CombatManager + playerStats 推送扩展

## 关联

- Part of feature: 任务系统 + 经验升级体系
- Phase: 3 — 后端集成
- Design Doc: #219
- Depends on: Task 3, Task 4

## 任务描述

将 ExpManager 和 QuestManager 接入现有的事件系统和战斗系统，修复 DEATH 事件缺失问题，扩展 playerStats 推送逻辑。

### 具体工作

1. **修改** `living-base.ts` — die() 中 `this.emit(GameEvents.DEATH, { victim: this })`
2. **修改** `combat-manager.ts` — 击杀 NPC 后调用 `expManager.gainExp()` + `questManager.onNpcDeath()`
3. **修改** `stats.utils.ts` 的 `derivePlayerStats()` — 新增 exp/expToNextLevel/potential/score/freePoints/levelTitle 字段，level 改为数值
4. **修改** `stats.utils.ts` 的 `sendPlayerStats()` — 确保新字段正确发送
5. **挂载玩家进入房间事件**：在合适位置（go 指令或 POST_MOVE）调用 `questManager.onPlayerEnterRoom()`
6. **挂载背包变更事件**：在 sendInventoryUpdate 调用时也通知 `questManager.onInventoryChange()`
7. **修改** `give.ts` — 在 onReceiveItem 成功后调用 `questManager.onItemDelivered()`

## 验收标准

- [ ] NPC die() 触发 `GameEvents.DEATH` 事件
- [ ] 击杀 NPC 后，玩家获得经验（经过等级差衰减）
- [ ] 击杀 NPC 后，capture 类任务进度更新
- [ ] playerStats 消息包含 exp/level(number)/levelTitle/expToNextLevel/potential/score/freePoints
- [ ] 玩家进入房间时，检查可接任务并推送日志提示
- [ ] 背包变更时，检查 collect 类任务进度
- [ ] give 物品给 NPC 时，检查 deliver 类任务进度
- [ ] TypeScript 编译通过

## 📋 契约片段（来自 Design Doc）

### playerStats 扩展字段

```typescript
interface PlayerStatsData {
  name: string;
  level: number; // ← 改为 number
  levelTitle: string; // ← 新增（"初入江湖"等）
  silver: number;
  hp: ResourceValue;
  mp: ResourceValue;
  energy: ResourceValue;
  attrs: CharacterAttrs;
  equipBonus: EquipmentBonus;
  combat: CombatData;
  exp: number; // ← 新增
  expToNextLevel: number; // ← 新增
  potential: number; // ← 新增
  score: number; // ← 新增
  freePoints: number; // ← 新增
}
```

### 事件挂载位置

```
NPC.die() → emit(DEATH) → CombatManager.endCombat():
  → expManager.gainExp(killer, combatExp)
  → questManager.onNpcDeath(npc, killer)

go 指令 / POST_MOVE:
  → questManager.onPlayerEnterRoom(player, room)

give 指令 → onReceiveItem accept:
  → questManager.onItemDelivered(npc, giver, item)

sendInventoryUpdate():
  → questManager.onInventoryChange(player)
```

## 代码参考

- LivingBase.die()：`living-base.ts` L243-245
- CombatManager.endCombat()：`combat-manager.ts` L270-289
- derivePlayerStats()：`stats.utils.ts` L37-72
- go 指令：`server/src/engine/commands/std/go.ts`
- give 指令：`server/src/engine/commands/std/give.ts`
- sendInventoryUpdate()：`room-utils.ts` L142-158
