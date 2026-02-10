# Task 7: PlayerBase 集成

## 关联

- Part of feature: 天衍技能系统
- Phase: 3 — 引擎扩展
- Depends on: Task 4
- Design Doc: #224
- PRD: #223

## 任务描述

将 SkillManager 挂载到 PlayerBase，在玩家登录时从数据库加载技能，死亡时调用惩罚，断线时保存。同时在 LivingBase 中增加技能查询接口。

### 目标文件

**修改：**

- `server/src/engine/game-objects/player-base.ts` — 持有 SkillManager、生命周期集成
- `server/src/engine/game-objects/living-base.ts` — 增加技能查询方法接口

### 实现要点

#### PlayerBase 修改

1. **新增属性**: `skillManager: SkillManager`
2. **初始化流程**（在角色进入游戏时）:
   - 创建 SkillManager 实例
   - 调用 `skillManager.loadFromDatabase(characterId)`
   - 推送 `skillList` 消息给客户端
3. **死亡流程**（在现有 die() 方法中）:
   - 调用 `skillManager.applyDeathPenalty()`
   - 所有变化已由 SkillManager 内部推送 skillUpdate
4. **断线/退出**:
   - 调用 `skillManager.saveToDatabase()`
5. **属性加成集成**:
   - 在 getAttack/getDefense 等方法中加入 skillBonusSummary 的加成

#### LivingBase 修改

1. 增加可选方法（NPC 不需要完整 SkillManager）:
   - `getSkillLevel(skillId: string): number` — 默认返回 0
   - `getEffectiveLevel(slotType: SkillSlotType): number` — 默认返回 0
2. PlayerBase 重写这些方法，委托给 SkillManager

## 验收标准

- [ ] PlayerBase 持有 SkillManager 实例
- [ ] 角色进入游戏时自动加载技能并推送 skillList
- [ ] 死亡时调用 applyDeathPenalty
- [ ] 断线时调用 saveToDatabase
- [ ] LivingBase 定义 getSkillLevel / getEffectiveLevel 默认实现
- [ ] PlayerBase 重写技能查询方法委托给 SkillManager
- [ ] 属性加成（attack/defense/dodge/parry）包含技能加成
- [ ] 现有功能不被破坏（无技能时加成为 0）

## 📋 API 契约片段（来自 Design Doc）

> ⚠️ 以下契约已在 Design Doc 中锁定，实现时必须严格遵守。

### 关联消息

#### skillList (S→C) — 登录时推送

```typescript
interface SkillListData {
  skills: PlayerSkillInfo[];
  skillMap: Record<string, string>;
  activeForce: string | null;
}
```

#### skillUpdate (S→C) — 死亡惩罚时推送

```typescript
interface SkillUpdateData {
  skillId: string;
  changes: Partial<PlayerSkillInfo>;
  reason: 'deathPenalty';
}
```

### 关联枚举

- SkillUpdateReason.DEATH_PENALTY: `'deathPenalty'`

### SkillBonusSummary 用于属性加成

```typescript
interface SkillBonusSummary {
  attack: number;
  defense: number;
  dodge: number;
  parry: number;
  maxHp: number;
  maxMp: number;
  critRate: number;
  hitRate: number;
}
```

## 代码参考

- 现有 PlayerBase: `server/src/engine/game-objects/player-base.ts`（die, getAttack, sendToClient）
- 现有 LivingBase: `server/src/engine/game-objects/living-base.ts`（属性方法）
- 现有登录流程: 搜索 PlayerBase 初始化位置

## 相关文档

- Design Doc: #224 (影响范围 — player-base.ts, living-base.ts)
- PRD: #223 (R5 死亡惩罚, R3 技能属性加成)
