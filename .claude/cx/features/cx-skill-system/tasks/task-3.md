# Task 3: 技能基类体系 + SkillRegistry

## 关联

- Part of feature: 天衍技能系统
- Phase: 2 — 引擎核心
- Depends on: Task 1
- Design Doc: #224
- PRD: #223

## 任务描述

创建完整的技能类继承体系（25 个基类文件）和全局技能注册表 SkillRegistry。这是所有具体武学内容的基础框架，本任务只实现基类（abstract），不填充任何具体武功。

### 目标文件

**新增：**

```
server/src/engine/skills/
├── skill-base.ts                    # 技能根基类
├── skill-registry.ts                # 技能注册表（全局单例）
├── types.ts                         # 内部类型（SkillAction, ResourceCost 等）
├── martial/
│   ├── martial-skill-base.ts        # 武学基类
│   ├── weapon/
│   │   ├── weapon-skill-base.ts     # 兵刃武学基类
│   │   ├── sword-skill-base.ts      # 剑法基类
│   │   ├── blade-skill-base.ts      # 刀法基类
│   │   ├── spear-skill-base.ts      # 枪法基类
│   │   ├── staff-skill-base.ts      # 杖法基类
│   │   └── throwing-skill-base.ts   # 暗器基类
│   ├── unarmed/
│   │   ├── unarmed-skill-base.ts    # 空手武学基类
│   │   ├── fist-skill-base.ts       # 拳法基类
│   │   ├── palm-skill-base.ts       # 掌法基类
│   │   ├── finger-skill-base.ts     # 指法基类
│   │   └── claw-skill-base.ts       # 爪法基类
│   ├── dodge-skill-base.ts          # 轻功基类
│   └── parry-skill-base.ts          # 招架基类
├── internal/
│   ├── internal-skill-base.ts       # 内功基类
│   ├── shen-internal-base.ts        # 上丹田·神系
│   ├── qi-internal-base.ts          # 中丹田·气系
│   └── jing-internal-base.ts        # 下丹田·精系
├── support/
│   ├── support-skill-base.ts        # 辅技基类
│   ├── medical-skill-base.ts        # 医术基类
│   ├── poison-skill-base.ts         # 毒术基类
│   ├── forge-skill-base.ts          # 锻造基类
│   └── appraise-skill-base.ts       # 辨识基类
└── cognize-skill.ts                 # 武学悟性（直接实现，非 abstract）
```

### 实现要点

1. **SkillBase** 是根基类，定义通用接口（validLearn, canImprove, onDeathPenalty 等）
2. **MartialSkillBase** 定义武学特有的 actions, validEnable, getAvailableActions, getAutoAction, canImprove(战斗经验门槛)
3. **InternalSkillBase** 定义内功特有的 dantianType, getAttributeBonus, getResourceBonus
4. **SupportSkillBase** 定义辅技特有接口
5. 每个具体槽位基类（如 SwordSkillBase）固定 skillType 但保持 abstract
6. **CognizeSkill** 是唯一直接实现的类（武学悟性只有一种）
7. **SkillRegistry** 使用 NestJS @Injectable() 全局单例，Map 存储所有注册的技能
8. `types.ts` 定义内部接口：SkillAction, ResourceCost, CharacterAttrs(部分)

### 类继承关系

```
SkillBase (abstract)
├── MartialSkillBase (abstract)
│   ├── WeaponSkillBase (abstract)
│   │   ├── SwordSkillBase (abstract)
│   │   ├── BladeSkillBase (abstract)
│   │   ├── SpearSkillBase (abstract)
│   │   ├── StaffSkillBase (abstract)
│   │   └── ThrowingSkillBase (abstract)
│   ├── UnarmedSkillBase (abstract)
│   │   ├── FistSkillBase (abstract)
│   │   ├── PalmSkillBase (abstract)
│   │   ├── FingerSkillBase (abstract)
│   │   └── ClawSkillBase (abstract)
│   ├── DodgeSkillBase (abstract)
│   └── ParrySkillBase (abstract)
├── InternalSkillBase (abstract)
│   ├── ShenInternalBase (abstract)
│   ├── QiInternalBase (abstract)
│   └── JingInternalBase (abstract)
├── SupportSkillBase (abstract)
│   ├── MedicalSkillBase (abstract)
│   ├── PoisonSkillBase (abstract)
│   ├── ForgeSkillBase (abstract)
│   └── AppraiseSkillBase (abstract)
└── CognizeSkill (concrete)
```

## 验收标准

- [ ] SkillBase 根基类包含所有契约定义的方法签名
- [ ] MartialSkillBase 包含 actions, validEnable, getAvailableActions, getAutoAction, getPracticeCost, canImprove
- [ ] InternalSkillBase 包含 dantianType, getAttributeBonus, getResourceBonus, actions
- [ ] 每个槽位基类固定对应的 skillType 枚举值
- [ ] CognizeSkill 直接实现，skillId='cognize', skillType=COGNIZE
- [ ] SkillRegistry 提供 register, get, getBySlotType, getAll
- [ ] types.ts 定义 SkillAction, ResourceCost 接口
- [ ] TypeScript 编译通过

## 📋 API 契约片段（来自 Design Doc）

> ⚠️ 以下契约已在 Design Doc 中锁定，实现时必须严格遵守。

### 关联枚举

| 枚举             | 用途                   |
| ---------------- | ---------------------- |
| SkillSlotType    | 每个基类固定对应的槽位 |
| SkillCategory    | 四大分类               |
| DantianType      | 内功三系               |
| SkillLearnSource | validLearn 参数        |

### 核心类 API 签名

#### SkillBase

```typescript
export abstract class SkillBase {
  abstract get skillId(): string;
  abstract get skillName(): string;
  abstract get skillType(): SkillSlotType;
  abstract get category(): SkillCategory;

  validLearn(player: LivingBase): true | string {
    return true;
  }
  validLearnLevel(): number {
    return 999;
  }
  canImprove(player: LivingBase, currentLevel: number): boolean {
    return true;
  }
  onSkillImproved(player: LivingBase, newLevel: number): void {}
  onDeathPenalty(player: LivingBase, currentLevel: number): number {
    return Math.max(0, currentLevel - 1);
  }
  getSubSkills(): Record<string, number> | null {
    return null;
  }
  getConflicts(): string[] {
    return [];
  }
  get factionRequired(): string | null {
    return null;
  }
}
```

#### MartialSkillBase

```typescript
export abstract class MartialSkillBase extends SkillBase {
  category = SkillCategory.MARTIAL;
  abstract get actions(): SkillAction[];
  abstract validEnable(usage: SkillSlotType): boolean;

  getAvailableActions(level: number): SkillAction[];
  getAutoAction(level: number): SkillAction;
  getPracticeCost(player: LivingBase): ResourceCost;
  canImprove(player: LivingBase, currentLevel: number): boolean;
  // canImprove: currentLevel³ / EXP_THRESHOLD_DIVISOR <= combat_exp
}
```

#### InternalSkillBase

```typescript
export abstract class InternalSkillBase extends SkillBase {
  category = SkillCategory.INTERNAL;
  skillType = SkillSlotType.FORCE;
  abstract get dantianType(): DantianType;
  abstract getAttributeBonus(level: number): Partial<CharacterAttrs>;
  abstract getResourceBonus(level: number): { maxHp?: number; maxMp?: number };
  abstract get actions(): SkillAction[];
  validEnable(usage: SkillSlotType): boolean; // only FORCE
  getPracticeCost(player: LivingBase): ResourceCost;
}
```

#### SkillRegistry

```typescript
@Injectable()
export class SkillRegistry {
  register(skill: SkillBase): void;
  get(skillId: string): SkillBase | undefined;
  getBySlotType(slotType: SkillSlotType): SkillBase[];
  getAll(): SkillBase[];
}
```

### SkillAction 接口

```typescript
interface SkillAction {
  name: string; // '怀中抱月'
  description: string; // 招式描述
  lvl: number; // 解锁等级
  costs: ResourceCost[];
  modifiers: {
    attack: number;
    damage: number;
    dodge: number;
    parry: number;
    damageType: string; // 'physical' | 'internal' | ...
  };
}

interface ResourceCost {
  resource: string; // 'mp' | 'energy' | 'hp'
  amount: number;
}
```

## 代码参考

- 现有 game-objects 基类: `server/src/engine/game-objects/living-base.ts`
- 现有 combat 类型: `server/src/engine/combat/combat-manager.ts`
- 炎黄 MUD 技能结构: `参考mud代码/mud/inherit/skill/skill.c`（type, validLearn, exert_function）

## 相关文档

- Design Doc: #224 (后端设计 — 技能类继承体系 + 核心类 API 签名)
- PRD: #223
