# Task 1: Core 共享类型定义

## 关联

- Part of feature: 天衍技能系统
- Phase: 1 — 基础层
- Design Doc: #224
- PRD: #223

## 任务描述

在 `packages/core/` 中创建技能系统所需的全部共享类型：枚举、常量、消息接口定义、MessageFactory 处理器。这是所有后续任务的类型基础。

### 目标文件

**新增：**

- `packages/core/src/types/skill-constants.ts` — 枚举 + 常量 + 显示名 + 分组
- `packages/core/src/types/messages/skill.ts` — 14 条消息的 TypeScript 接口
- `packages/core/src/factory/handlers/skillList.ts` — skillList 消息处理器
- `packages/core/src/factory/handlers/skillUpdate.ts`
- `packages/core/src/factory/handlers/skillLearn.ts`
- `packages/core/src/factory/handlers/combatAwaitAction.ts`
- `packages/core/src/factory/handlers/skillUse.ts`
- `packages/core/src/factory/handlers/skillMapRequest.ts`
- `packages/core/src/factory/handlers/skillMapResult.ts`
- `packages/core/src/factory/handlers/skillPanelRequest.ts`
- `packages/core/src/factory/handlers/skillPanelData.ts`
- `packages/core/src/factory/handlers/practiceStart.ts`
- `packages/core/src/factory/handlers/practiceEnd.ts`
- `packages/core/src/factory/handlers/practiceUpdate.ts`
- `packages/core/src/factory/handlers/skillLearnRequest.ts`
- `packages/core/src/factory/handlers/skillLearnResult.ts`

**修改：**

- `packages/core/src/types/index.ts` — 导出 skill-constants
- `packages/core/src/types/messages/index.ts` — 导出 skill 消息类型
- `packages/core/src/factory/index.ts` — 导入所有技能消息处理器

### 实现要点

1. 枚举和常量严格按照契约定义
2. MessageFactory 处理器使用 `@MessageHandler(type)` 装饰器注册
3. 消息处理器参考现有 `loginSuccess.ts`、`toast.ts` 等模式
4. 完成后执行 `cd packages/core && pnpm build` 验证编译

## 验收标准

- [ ] 7 个枚举类型全部定义，值与契约完全一致
- [ ] SKILL_CONSTANTS 常量对象定义完整
- [ ] SKILL_SLOT_NAMES 和 SKILL_SLOT_GROUPS 辅助映射定义
- [ ] 14 条消息的 TypeScript 接口全部定义
- [ ] 16 个 MessageFactory 处理器注册（14 条消息，部分共用）
- [ ] `pnpm build` 编译通过

## 📋 API 契约片段（来自 Design Doc）

> ⚠️ 以下契约已在 Design Doc 中锁定，实现时必须严格遵守。

### 全部枚举定义

#### SkillSlotType（17 值）

| 枚举值 | 常量       | 传输值       | 分组           |
| ------ | ---------- | ------------ | -------------- |
| 剑法   | `SWORD`    | `"sword"`    | weaponMartial  |
| 刀法   | `BLADE`    | `"blade"`    | weaponMartial  |
| 枪法   | `SPEAR`    | `"spear"`    | weaponMartial  |
| 杖法   | `STAFF`    | `"staff"`    | weaponMartial  |
| 暗器   | `THROWING` | `"throwing"` | weaponMartial  |
| 拳法   | `FIST`     | `"fist"`     | unarmedMartial |
| 掌法   | `PALM`     | `"palm"`     | unarmedMartial |
| 指法   | `FINGER`   | `"finger"`   | unarmedMartial |
| 爪法   | `CLAW`     | `"claw"`     | unarmedMartial |
| 轻功   | `DODGE`    | `"dodge"`    | movement       |
| 招架   | `PARRY`    | `"parry"`    | movement       |
| 内功   | `FORCE`    | `"force"`    | internal       |
| 医术   | `MEDICAL`  | `"medical"`  | support        |
| 毒术   | `POISON`   | `"poison"`   | support        |
| 锻造   | `FORGE`    | `"forge"`    | support        |
| 辨识   | `APPRAISE` | `"appraise"` | support        |
| 悟性   | `COGNIZE`  | `"cognize"`  | cognize        |

#### SkillCategory（4 值）

| 常量       | 传输值       | 显示   |
| ---------- | ------------ | ------ |
| `MARTIAL`  | `"martial"`  | "武学" |
| `INTERNAL` | `"internal"` | "内功" |
| `SUPPORT`  | `"support"`  | "辅技" |
| `COGNIZE`  | `"cognize"`  | "悟道" |

#### DantianType（3 值）

| 常量   | 传输值   | 关联属性            |
| ------ | -------- | ------------------- |
| `SHEN` | `"shen"` | wisdom / perception |
| `QI`   | `"qi"`   | spirit / meridian   |
| `JING` | `"jing"` | strength / vitality |

#### CombatParticipantState（3 值）

`CHARGING = 'charging'`, `AWAITING_ACTION = 'awaiting_action'`, `EXECUTING = 'executing'`

#### PracticeMode（3 值）

`PRACTICE = 'practice'`, `DAZUO = 'dazuo'`, `JINGZUO = 'jingzuo'`

#### SkillLearnSource（4 值）

`NPC = 'npc'`, `SCROLL = 'scroll'`, `QUEST = 'quest'`, `INNATE = 'innate'`

#### SkillUpdateReason（7 值）

`LEVEL_UP = 'levelUp'`, `MAPPED = 'mapped'`, `UNMAPPED = 'unmapped'`, `FORCE_ACTIVATED = 'forceActivated'`, `DEATH_PENALTY = 'deathPenalty'`, `LOCKED = 'locked'`, `UNLOCKED = 'unlocked'`

### SKILL_CONSTANTS

```typescript
export const SKILL_CONSTANTS = {
  COGNIZE_FACTOR: 500,
  ATTR_FACTOR: 100,
  EXP_THRESHOLD_DIVISOR: 10,
  COMBAT_INSIGHT_RANGE: 120,
  WEAPON_MISMATCH_FACTOR: 0.6,
  ACTION_TIMEOUT_MS: 10000,
  PRACTICE_TICK_MS: 5000,
  MAX_LEARN_TIMES: 100,
};
```

### 全部消息接口

参见 Design Doc #224 消息详情章节，14 条消息接口完整定义。

关键接口汇总：

- `SkillListData` → `{ skills: PlayerSkillInfo[], skillMap: Record<string, string>, activeForce: string | null }`
- `SkillUpdateData` → `{ skillId, changes: Partial<PlayerSkillInfo>, reason: SkillUpdateReason }`
- `SkillLearnData` → `{ skillId, skillName, skillType, category, source, message }`
- `CombatAwaitActionData` → `{ combatId, timeoutMs, availableActions: CombatActionOption[] }`
- `SkillUseData` → `{ combatId, actionIndex }`
- `SkillMapRequestData` → `{ slotType, skillId: string | null }`
- `SkillMapResultData` → `{ success, slotType, skillId, skillName, message, updatedMap }`
- `SkillPanelRequestData` → `{ detailSkillId? }`
- `SkillPanelDataResponse` → `{ skills, skillMap, activeForce, bonusSummary, detail? }`
- `PracticeStartData` → `{ skillId, mode: PracticeMode }`
- `PracticeEndData` → `{ reason: 'manual' | 'exhausted' }`
- `PracticeUpdateData` → `{ skillId, skillName, mode, currentLevel, learned, learnedMax, levelUp, message, resourceCost, stopped }`
- `SkillLearnRequestData` → `{ npcId, skillId, times }`
- `SkillLearnResultData` → `{ success, skillId, skillName, timesCompleted, timesRequested, currentLevel, learned, learnedMax, levelUp, message, reason? }`

子接口：

- `PlayerSkillInfo` → `{ skillId, skillName, skillType, category, level, learned, learnedMax, isMapped, mappedSlot, isActiveForce, isLocked }`
- `CombatActionOption` → `{ index, skillId, skillName, actionName, actionDesc, lvl, costs, canUse, isInternal }`
- `ResourceCostInfo` → `{ resource, amount, current }`
- `SkillBonusSummary` → `{ attack, defense, dodge, parry, maxHp, maxMp, critRate, hitRate }`
- `SkillDetailInfo` → `{ skillId, skillName, description, actions: ActionDetailInfo[] }`
- `ActionDetailInfo` → `{ skillName, description, lvl, unlocked, costs, modifiers: { attack, damage, dodge, parry, damageType } }`

## 代码参考

- 现有消息类型示例: `packages/core/src/types/messages/auth.ts`
- 现有 MessageFactory handler: `packages/core/src/factory/handlers/loginSuccess.ts`
- 现有枚举定义方式: 参考 `packages/core/src/types/base.ts`

## 相关文档

- Design Doc: #224 (消息契约 + 状态枚举 + core 共享类型定义章节)
- PRD: #223
