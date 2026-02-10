# Task 6: CombatManager 改造 + DamageEngine 扩展

## 关联

- Part of feature: 天衍技能系统
- Phase: 3 — 引擎扩展
- Depends on: Task 4
- Design Doc: #224
- PRD: #223

## 任务描述

改造现有 CombatManager 的 ATB 循环，增加 AWAITING_ACTION 状态让玩家选择招式。扩展 DamageEngine 支持招式 modifiers。

### 目标文件

**修改：**

- `server/src/engine/combat/combat-manager.ts` — ATB 循环增加选招阶段
- `server/src/engine/combat/damage-engine.ts` — 新增 calculateWithAction 方法

### 实现要点

#### CombatManager 改造

1. **CombatParticipant 新增字段**:
   - `state: CombatParticipantState`（默认 CHARGING）
   - `actionTimeout?: NodeJS.Timeout`

2. **processCombat() 修改**:
   - 如果 `state === AWAITING_ACTION`，跳过该参与者的 gauge 累积
   - gauge >= MAX_GAUGE 时：
     - **玩家**: state → AWAITING_ACTION，推送 `combatAwaitAction` 消息，设置超时定时器
     - **NPC**: 直接执行 AI 攻击（现有逻辑不变）

3. **新增 executeSkillAction()**:
   - 验证参与者 state === AWAITING_ACTION
   - 取消超时定时器
   - 从 SkillManager.getAvailableCombatActions() 获取招式
   - 校验 actionIndex 有效性和资源消耗
   - 调用 DamageEngine.calculateWithAction()
   - 扣除资源、推送战斗日志
   - state → CHARGING, gauge = 0
   - 调用 SkillManager.onCombatSkillUse()（战斗领悟判定）

4. **新增 handleActionTimeout()**:
   - 超时后自动使用普攻（getAutoAction）
   - state → CHARGING, gauge = 0

5. **武器匹配检查**:
   - 使用兵刃武学时检查玩家当前装备武器类型
   - 不匹配: damage \*= WEAPON_MISMATCH_FACTOR (0.6)

#### DamageEngine 扩展

1. **新增 calculateWithAction() 静态方法**:
   - 在现有公式基础上叠加招式 modifiers
   - `effectiveAttack = getAttack() + (action.modifiers.attack ?? 0)`
   - `baseDamage 计算后: actualDamage += (action.modifiers.damage ?? 0)`
   - `weaponMismatch: actualDamage *= WEAPON_MISMATCH_FACTOR`
   - 返回 AttackResult 带招式描述文本

## 验收标准

- [ ] CombatParticipant 新增 state 和 actionTimeout 字段
- [ ] 玩家 ATB 满时进入 AWAITING_ACTION 状态而非自动攻击
- [ ] AWAITING_ACTION 期间该参与者 gauge 不再累积
- [ ] 推送 combatAwaitAction 消息包含可用招式列表
- [ ] executeSkillAction 正确执行招式 + 扣资源 + 推送战斗日志
- [ ] 超时 10 秒后自动使用普攻
- [ ] 武器不匹配时伤害 ×0.6
- [ ] DamageEngine.calculateWithAction 正确叠加招式 modifiers
- [ ] 现有 NPC 战斗逻辑不受影响
- [ ] 现有测试不被破坏（兼容无技能的战斗）

## 📋 API 契约片段（来自 Design Doc）

> ⚠️ 以下契约已在 Design Doc 中锁定，实现时必须严格遵守。

### 关联消息

#### combatAwaitAction (S→C)

```typescript
interface CombatAwaitActionData {
  combatId: string;
  timeoutMs: number;
  availableActions: CombatActionOption[];
}

interface CombatActionOption {
  index: number;
  skillId: string;
  skillName: string;
  actionName: string;
  actionDesc: string;
  lvl: number;
  costs: ResourceCostInfo[];
  canUse: boolean;
  isInternal: boolean;
}

interface ResourceCostInfo {
  resource: string;
  amount: number;
  current: number;
}
```

#### skillUse (C→S)

```typescript
interface SkillUseData {
  combatId: string;
  actionIndex: number;
}
```

### 关联枚举

#### CombatParticipantState

| 值                | 说明             |
| ----------------- | ---------------- |
| `CHARGING`        | gauge 累积中     |
| `AWAITING_ACTION` | ATB 满，等待选招 |
| `EXECUTING`       | 执行招式中       |

### 关联常量

```
ACTION_TIMEOUT_MS = 10000       // 选招超时
WEAPON_MISMATCH_FACTOR = 0.6   // 武器不匹配伤害系数
COMBAT_INSIGHT_RANGE = 120      // 战斗领悟判定范围
```

### CombatManager 改造点

```typescript
// processCombat() 中的修改
if (participant.state === CombatParticipantState.AWAITING_ACTION) {
  continue; // 跳过 gauge 累积
}
// gauge >= MAX_GAUGE 时:
if (isPlayer) {
  participant.state = CombatParticipantState.AWAITING_ACTION;
  // 推送 combatAwaitAction, 设超时
} else {
  // NPC: 现有 AI 攻击逻辑
}

// 新增方法
executeSkillAction(combatId: string, player: PlayerBase, actionIndex: number): boolean;
handleActionTimeout(combatId: string, playerId: string): void;
```

### DamageEngine 扩展

```typescript
interface SkillAttackOptions {
  action?: SkillAction;
  weaponMismatch?: boolean;
}

static calculateWithAction(
  attacker: LivingBase,
  defender: LivingBase,
  options?: SkillAttackOptions,
): AttackResult;
```

## 代码参考

- 现有 CombatManager: `server/src/engine/combat/combat-manager.ts`（ATB 循环在 processCombat）
- 现有 DamageEngine: `server/src/engine/combat/damage-engine.ts`（Phase 0 公式）
- COMBAT_CONSTANTS: MAX_GAUGE=1000, SPEED_FACTOR=5

## 相关文档

- Design Doc: #224 (CombatManager 改造点 + DamageEngine 扩展 + 数据流 [战斗使用招式])
- PRD: #223 (R1 战斗技能 — ATB 暂停等待选招)
