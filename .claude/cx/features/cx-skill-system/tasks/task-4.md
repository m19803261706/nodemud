# Task 4: SkillManager 技能管理器

## 关联

- Part of feature: 天衍技能系统
- Phase: 2 — 引擎核心
- Depends on: Task 2, Task 3
- Design Doc: #224
- PRD: #223

## 任务描述

创建 SkillManager 类，挂载于每个 PlayerBase 实例，负责技能的学习、提升、映射、查询、死亡惩罚和属性加成计算。

### 目标文件

**新增：**

- `server/src/engine/skills/skill-manager.ts` — 技能管理器

### 实现要点

1. SkillManager 在构造时接收 PlayerBase 和 SkillService 引用
2. `loadFromDatabase()` 从 PlayerSkill 表加载玩家所有技能到内存 Map
3. `learnSkill()` 校验 validLearn + 冲突检查 + 持久化
4. `improveSkill()` 实现方块沉淀公式 `learned >= (level+1)²` + 悟性加成 + 属性加成
5. `mapSkill()` 实现 enable 映射逻辑（校验 validEnable + 同槽位替换）
6. `applyDeathPenalty()` 遍历所有技能，等级-1（有 learned 保护），清除所有映射
7. `getSkillBonusSummary()` 聚合所有已映射技能和激活内功的属性加成
8. `getAvailableCombatActions()` 收集当前映射的外功招式 + 激活内功招式
9. `saveToDatabase()` 批量更新到数据库
10. 内部维护三个 Map: skills, skillMap, activeForce

### 升级公式

```
// 方块沉淀
升级条件: learned >= (level + 1)²

// 悟性加成
effectiveAmount = amount * (1 + cognizeLevel / COGNIZE_FACTOR)

// 属性影响（对应槽位属性）
attrBonus = 1 + attrValue * 100 / (currentLevel + ATTR_FACTOR)
finalAmount = effectiveAmount * attrBonus
```

### 死亡惩罚

```
1. 遍历所有技能，调用 skill.onDeathPenalty() → level = max(0, level - 1)
2. learned 保护: if learned >= (newLevel+1)², 保留 learned
3. 清除所有映射（skillMap.clear(), 所有 isMapped = false）
4. 保持 activeForce 不变（内功激活不因死亡清除）
5. 推送所有变化的 skillUpdate 消息
```

## 验收标准

- [ ] SkillManager 构造函数接收 PlayerBase + SkillService
- [ ] loadFromDatabase 正确加载并填充内存 Map
- [ ] learnSkill 校验 validLearn、冲突检查（getConflicts）、门派检查
- [ ] improveSkill 实现方块沉淀 + 悟性加成 + 属性加成公式
- [ ] mapSkill 校验 validEnable、处理同槽位替换
- [ ] applyDeathPenalty 正确执行等级-1 + 清映射
- [ ] getSkillBonusSummary 聚合已映射技能和激活内功的加成
- [ ] getAvailableCombatActions 收集可用战斗招式
- [ ] saveToDatabase 批量持久化
- [ ] TypeScript 编译通过

## 📋 API 契约片段（来自 Design Doc）

> ⚠️ 以下契约已在 Design Doc 中锁定，实现时必须严格遵守。

### SkillManager 完整 API

```typescript
export class SkillManager {
  constructor(player: PlayerBase, skillService: SkillService) {}

  // --- 数据 ---
  private skills: Map<string, PlayerSkillData> = new Map();
  private skillMap: Map<SkillSlotType, string> = new Map();
  private activeForce: string | null = null;

  // --- 初始化 ---
  async loadFromDatabase(characterId: string): Promise<void>;

  // --- 学习 ---
  learnSkill(skillId: string, source: SkillLearnSource): true | string;

  // --- 提升 ---
  improveSkill(skillId: string, amount: number, weakMode?: boolean): boolean;

  // --- 映射 ---
  mapSkill(slotType: SkillSlotType, skillId: string | null): true | string;

  // --- 查询 ---
  getSkillLevel(skillId: string, raw?: boolean): number;
  getEffectiveLevel(slotType: SkillSlotType): number;
  getSkillMap(): Record<string, string>;
  getAllSkills(): PlayerSkillData[];
  getActiveForce(): string | null;
  getMappedSkill(slotType: SkillSlotType): SkillBase | null;

  // --- 战斗集成 ---
  getAvailableCombatActions(): CombatActionOption[];
  onCombatSkillUse(skillId: string): void;

  // --- 死亡惩罚 ---
  applyDeathPenalty(): void;

  // --- 属性加成 ---
  getSkillBonusSummary(): SkillBonusSummary;

  // --- 持久化 ---
  async saveToDatabase(): Promise<void>;
}
```

### 关联消息（SkillManager 内部推送）

#### skillList (S→C)

```typescript
interface SkillListData {
  skills: PlayerSkillInfo[];
  skillMap: Record<string, string>;
  activeForce: string | null;
}
```

#### skillUpdate (S→C)

```typescript
interface SkillUpdateData {
  skillId: string;
  changes: Partial<PlayerSkillInfo>;
  reason: SkillUpdateReason;
}
```

#### skillLearn (S→C)

```typescript
interface SkillLearnData {
  skillId: string;
  skillName: string;
  skillType: string;
  category: string;
  source: SkillLearnSource;
  message: string;
}
```

### 关联常量

```typescript
SKILL_CONSTANTS = {
  COGNIZE_FACTOR: 500,
  ATTR_FACTOR: 100,
  EXP_THRESHOLD_DIVISOR: 10,
  COMBAT_INSIGHT_RANGE: 120,
  MAX_LEARN_TIMES: 100,
};
```

### 关联枚举

- SkillUpdateReason: 用于 skillUpdate 消息的 reason 字段
- SkillLearnSource: 用于 learnSkill 参数

## 代码参考

- 炎黄 MUD skill.c: `map_skill()`, `improve_skill()` (learned >= (level+1)²)
- 炎黄 MUD enable.c: 映射系统
- 现有 ExpManager: `server/src/engine/quest/exp-manager.ts`（类似管理器模式）

## 相关文档

- Design Doc: #224 (核心类 API 签名 — SkillManager 章节)
- PRD: #223 (R2 学习提升, R5 死亡惩罚)
