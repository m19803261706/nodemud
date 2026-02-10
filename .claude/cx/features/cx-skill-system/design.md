# Design Doc: 天衍技能系统

## 关联

- Scope: #222（天衍技能系统蓝图）
- PRD: #223（天衍技能系统 PRD）
- 世界观: #84（天衍世界观设定）

## 基于现有代码

| 可复用模块       | 路径                                               | 复用方式                               |
| ---------------- | -------------------------------------------------- | -------------------------------------- |
| CombatManager    | `server/src/engine/combat/combat-manager.ts`       | 改造 ATB 循环增加 AWAITING_ACTION 状态 |
| DamageEngine     | `server/src/engine/combat/damage-engine.ts`        | 扩展 calculate() 接受招式 modifiers    |
| LivingBase       | `server/src/engine/game-objects/living-base.ts`    | 增加技能查询接口（getSkillLevel 等）   |
| PlayerBase       | `server/src/engine/game-objects/player-base.ts`    | 持有 SkillManager 实例                 |
| HeartbeatManager | `server/src/engine/heartbeat/heartbeat-manager.ts` | 驱动打坐练功定时 tick                  |
| MessageFactory   | `packages/core/src/factory/MessageFactory.ts`      | 注册新消息处理器                       |
| useGameStore     | `client/src/stores/useGameStore.ts`                | 扩展 skill 切片或新建独立 store        |

## 架构概览

```
┌─ Client (React Native) ─────────────────────────────────────┐
│  useSkillStore ← skillList/skillUpdate/combatAwaitAction     │
│  SkillPanel/ ← 技能列表 + 招式详情 + 属性加成               │
│  CombatActions/ ← 战斗快捷栏（ATB 满后弹出）                │
└──────────────── WebSocket ──────────────────────────────────┘
                     │
┌─ Core (packages/core) ──────────────────────────────────────┐
│  types/messages/skill.ts ← 技能消息类型定义                  │
│  types/skill-constants.ts ← 槽位枚举/技能分类枚举            │
│  factory/handlers/skill*.ts ← 消息处理器                     │
└─────────────────────────────────────────────────────────────┘
                     │
┌─ Server (NestJS) ───────────────────────────────────────────┐
│  websocket/handlers/skill.handler.ts ← 消息路由处理          │
│  engine/skills/                                              │
│    ├── skill-base.ts ← 技能根基类                            │
│    ├── martial/ ← 武学基类（weapon/unarmed/dodge/parry）     │
│    ├── internal/ ← 内功基类（shen/qi/jing）                  │
│    ├── support/ ← 辅技基类（medical/poison/forge/appraise）  │
│    ├── cognize-skill.ts ← 武学悟性                           │
│    ├── skill-manager.ts ← 技能管理器                         │
│    ├── skill-registry.ts ← 技能注册表（所有技能类的索引）     │
│    └── practice-manager.ts ← 练功管理器                      │
│  engine/combat/combat-manager.ts ← 改造增加选招阶段          │
│  engine/combat/damage-engine.ts ← 扩展招式 modifiers         │
│  entities/player-skill.entity.ts ← 数据库实体                │
│  skill/skill.module.ts ← NestJS 模块                        │
│  skill/skill.service.ts ← 持久化服务                        │
└─────────────────────────────────────────────────────────────┘
```

### 数据流

```
[学习技能]
  Client skillLearnRequest → Gateway → SkillHandler
    → SkillManager.learnSkill(player, skillId, source)
      → 校验 validLearn + 冲突检查
      → SkillService.createPlayerSkill(character, skill)
      → player.sendToClient(skillLearn 消息)

[战斗使用招式]
  HeartbeatManager tick → CombatManager.processCombat()
    → gauge >= MAX_GAUGE && isPlayer
      → participant.state = AWAITING_ACTION
      → player.sendToClient(combatAwaitAction 消息)
  Client skillUse → Gateway → SkillHandler
    → CombatManager.executeSkillAction(combatId, player, actionIndex)
      → action.getCost() → 扣资源
      → DamageEngine.calculateWithAction(attacker, defender, action)
      → player.sendToClient(combatUpdate 消息)
      → SkillManager.onCombatSkillUse(player, skillId)  // 领悟判定

[练功]
  Client practiceStart → Gateway → SkillHandler
    → PracticeManager.startPractice(player, skillId, mode)
      → 注册 HeartbeatManager 定时 tick
      → 每 tick: SkillManager.improveSkill() + 扣资源
      → player.sendToClient(practiceUpdate 消息)
  Client practiceEnd / 资源耗尽
    → PracticeManager.stopPractice(player)
```

## 数据库设计

### 新增表: player_skills

```sql
CREATE TABLE player_skills (
  id VARCHAR(36) PRIMARY KEY COMMENT '主键 UUID',
  character_id VARCHAR(36) NOT NULL COMMENT '角色 ID，关联 characters 表',
  skill_id VARCHAR(64) NOT NULL COMMENT '技能标识，如 bagua-zhang',
  skill_type VARCHAR(32) NOT NULL COMMENT '槽位类型，如 palm/sword/force',
  level INT DEFAULT 0 COMMENT '当前技能等级',
  learned INT DEFAULT 0 COMMENT '当前积累的升级经验',
  is_mapped TINYINT(1) DEFAULT 0 COMMENT '是否已映射到槽位',
  mapped_slot VARCHAR(32) DEFAULT NULL COMMENT '映射的目标槽位类型',
  is_active_force TINYINT(1) DEFAULT 0 COMMENT '是否为当前激活的内功',
  is_locked TINYINT(1) DEFAULT 0 COMMENT '是否被锁定（叛师/叛门派）',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '学习时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新',
  UNIQUE KEY uk_char_skill (character_id, skill_id),
  KEY idx_character (character_id),
  CONSTRAINT fk_ps_character FOREIGN KEY (character_id) REFERENCES characters(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='玩家技能数据';
```

### 字段说明

| 字段            | 类型        | 说明         | 前端对应      |
| --------------- | ----------- | ------------ | ------------- |
| id              | VARCHAR(36) | UUID 主键    | id            |
| character_id    | VARCHAR(36) | 角色外键     | -             |
| skill_id        | VARCHAR(64) | 技能唯一标识 | skillId       |
| skill_type      | VARCHAR(32) | 所属槽位类型 | skillType     |
| level           | INT         | 当前等级     | level         |
| learned         | INT         | 升级经验积累 | learned       |
| is_mapped       | TINYINT(1)  | 是否启用映射 | isMapped      |
| mapped_slot     | VARCHAR(32) | 映射到的槽位 | mappedSlot    |
| is_active_force | TINYINT(1)  | 是否激活内功 | isActiveForce |
| is_locked       | TINYINT(1)  | 是否被锁定   | isLocked      |

---

## ⚡ 消息契约（强制章节）

> **此章节是前后端的对齐合同。exec 阶段必须严格遵守。**
> 本项目使用 WebSocket 通信，消息格式遵循 `{ type, data, timestamp }` 模式。

### 消息总览

| #   | type                | 方向 | 说明             | 触发条件                |
| --- | ------------------- | ---- | ---------------- | ----------------------- |
| 1   | `skillList`         | S→C  | 玩家全部技能列表 | 登录加载 / 学习新技能后 |
| 2   | `skillUpdate`       | S→C  | 单技能状态更新   | 升级/映射变化/死亡惩罚  |
| 3   | `skillLearn`        | S→C  | 学到新技能通知   | 拜师/秘籍/任务奖励      |
| 4   | `combatAwaitAction` | S→C  | ATB 满等待选招   | 玩家 ATB gauge 满       |
| 5   | `skillUse`          | C→S  | 玩家选择招式     | 点击招式按钮            |
| 6   | `skillMapRequest`   | C→S  | enable 映射请求  | enable 指令             |
| 7   | `skillMapResult`    | S→C  | 映射操作结果     | mapRequest 响应         |
| 8   | `skillPanelRequest` | C→S  | 请求技能面板数据 | 打开技能面板            |
| 9   | `skillPanelData`    | S→C  | 技能面板完整数据 | panelRequest 响应       |
| 10  | `practiceStart`     | C→S  | 开始练功         | practice/dazuo/jingzuo  |
| 11  | `practiceEnd`       | C→S  | 停止练功         | stop 指令 / 资源耗尽    |
| 12  | `practiceUpdate`    | S→C  | 练功进度更新     | 练功 tick               |
| 13  | `skillLearnRequest` | C→S  | 请求学习技能     | 拜师对话确认            |
| 14  | `skillLearnResult`  | S→C  | 学习结果         | 含成功/失败原因         |

### 消息详情

#### 1. skillList (S→C)

玩家登录后推送完整技能列表，学习新技能后也推送。

```typescript
// Server → Client
interface SkillListData {
  skills: PlayerSkillInfo[];
  skillMap: Record<string, string>; // { slotType: skillId }
  activeForce: string | null; // 当前激活内功 skillId
}

interface PlayerSkillInfo {
  skillId: string; // 'bagua-zhang'
  skillName: string; // '八卦掌'
  skillType: string; // 'palm'
  category: string; // 'martial'
  level: number; // 45
  learned: number; // 当前积累经验
  learnedMax: number; // (level+1)² 升级所需
  isMapped: boolean;
  mappedSlot: string | null;
  isActiveForce: boolean;
  isLocked: boolean;
}
```

#### 2. skillUpdate (S→C)

单个技能状态变化时推送（升级、映射变化、锁定等）。

```typescript
interface SkillUpdateData {
  skillId: string;
  changes: Partial<PlayerSkillInfo>;
  reason:
    | 'levelUp'
    | 'mapped'
    | 'unmapped'
    | 'forceActivated'
    | 'deathPenalty'
    | 'locked'
    | 'unlocked';
}
```

#### 3. skillLearn (S→C)

学到新技能时的通知消息。

```typescript
interface SkillLearnData {
  skillId: string;
  skillName: string;
  skillType: string;
  category: string;
  source: 'npc' | 'scroll' | 'quest';
  message: string; // '你学会了「八卦掌」！'
}
```

#### 4. combatAwaitAction (S→C)

玩家 ATB 满时推送，附带可用招式列表。

```typescript
interface CombatAwaitActionData {
  combatId: string;
  timeoutMs: number; // 选招超时时间（毫秒）
  availableActions: CombatActionOption[];
}

interface CombatActionOption {
  index: number; // 招式索引（用于 skillUse 回传）
  skillId: string; // 所属技能 ID
  skillName: string; // '八卦掌'
  actionName: string; // '怀中抱月'
  actionDesc: string; // 招式简要说明
  lvl: number; // 招式等级要求
  costs: ResourceCostInfo[]; // 消耗资源列表
  canUse: boolean; // 是否有足够资源使用
  isInternal: boolean; // 是否为内功招式
}

interface ResourceCostInfo {
  resource: string; // 'mp' | 'energy' | 'hp'
  amount: number;
  current: number; // 当前剩余（前端用于灰显判断）
}
```

#### 5. skillUse (C→S)

玩家在战斗中选择招式。

```typescript
interface SkillUseData {
  combatId: string;
  actionIndex: number; // 对应 combatAwaitAction 中的 index
}
```

#### 6. skillMapRequest (C→S)

enable 映射操作请求。

```typescript
interface SkillMapRequestData {
  slotType: string; // 'sword' | 'force' | 'parry' | ...
  skillId: string | null; // null = 取消映射（enable xxx none）
}
```

#### 7. skillMapResult (S→C)

映射操作结果。

```typescript
interface SkillMapResultData {
  success: boolean;
  slotType: string;
  skillId: string | null;
  skillName: string | null;
  message: string; // '你从现在起用「八卦掌」作为掌法的特殊技能。'
  updatedMap: Record<string, string>; // 完整最新映射
}
```

#### 8. skillPanelRequest (C→S)

请求技能面板完整数据。

```typescript
interface SkillPanelRequestData {
  detailSkillId?: string; // 可选，请求某个技能的招式详情
}
```

#### 9. skillPanelData (S→C)

技能面板完整数据响应。

```typescript
interface SkillPanelDataResponse {
  skills: PlayerSkillInfo[];
  skillMap: Record<string, string>;
  activeForce: string | null;
  bonusSummary: SkillBonusSummary;
  detail?: SkillDetailInfo; // 若请求了某个技能的详情
}

interface SkillBonusSummary {
  attack: number; // 当前启用技能提供的总攻击加成
  defense: number;
  dodge: number;
  parry: number;
  maxHp: number;
  maxMp: number;
  critRate: number;
  hitRate: number;
}

interface SkillDetailInfo {
  skillId: string;
  skillName: string;
  description: string; // 武学描述
  actions: ActionDetailInfo[];
}

interface ActionDetailInfo {
  skillName: string; // '怀中抱月'
  description: string; // 招式描述文本
  lvl: number; // 解锁等级
  unlocked: boolean; // 当前是否已解锁
  costs: ResourceCostInfo[];
  modifiers: {
    attack: number;
    damage: number;
    dodge: number;
    parry: number;
    damageType: string;
  };
}
```

#### 10. practiceStart (C→S)

```typescript
interface PracticeStartData {
  skillId: string;
  mode: 'practice' | 'dazuo' | 'jingzuo';
}
```

#### 11. practiceEnd (C→S)

```typescript
interface PracticeEndData {
  reason: 'manual' | 'exhausted'; // 手动停止 / 资源耗尽
}
```

#### 12. practiceUpdate (S→C)

```typescript
interface PracticeUpdateData {
  skillId: string;
  skillName: string;
  mode: 'practice' | 'dazuo' | 'jingzuo';
  currentLevel: number;
  learned: number;
  learnedMax: number;
  levelUp: boolean; // 本次 tick 是否升级了
  message: string; // '你的「八卦掌」进步了！' 或 '你静静地修炼内功...'
  resourceCost: ResourceCostInfo; // 本次消耗
  stopped: boolean; // 是否已停止（资源耗尽）
}
```

#### 13. skillLearnRequest (C→S)

```typescript
interface SkillLearnRequestData {
  npcId: string; // 师父 NPC 的 entity ID
  skillId: string; // 要学习的技能 ID
  times: number; // 学习次数（1-100）
}
```

#### 14. skillLearnResult (S→C)

```typescript
interface SkillLearnResultData {
  success: boolean;
  skillId: string;
  skillName: string;
  timesCompleted: number; // 实际完成次数（可能因资源不足提前结束）
  timesRequested: number;
  currentLevel: number;
  learned: number;
  learnedMax: number;
  levelUp: boolean; // 学习过程中是否升级了
  message: string; // 描述文本
  reason?: string; // 失败原因
}
```

---

## ⚡ 状态枚举对照表（强制章节）

> **前后端必须使用完全一致的枚举值。此处定义后，exec 阶段不允许修改。**

### 技能槽位类型 (SkillSlotType)

| 枚举值 | 后端常量   | API 传输值   | 前端常量     | 显示文本   | 分组           |
| ------ | ---------- | ------------ | ------------ | ---------- | -------------- |
| 剑法   | `SWORD`    | `"sword"`    | `'sword'`    | "剑法"     | weaponMartial  |
| 刀法   | `BLADE`    | `"blade"`    | `'blade'`    | "刀法"     | weaponMartial  |
| 枪法   | `SPEAR`    | `"spear"`    | `'spear'`    | "枪法"     | weaponMartial  |
| 杖法   | `STAFF`    | `"staff"`    | `'staff'`    | "杖法"     | weaponMartial  |
| 暗器   | `THROWING` | `"throwing"` | `'throwing'` | "暗器"     | weaponMartial  |
| 拳法   | `FIST`     | `"fist"`     | `'fist'`     | "拳法"     | unarmedMartial |
| 掌法   | `PALM`     | `"palm"`     | `'palm'`     | "掌法"     | unarmedMartial |
| 指法   | `FINGER`   | `"finger"`   | `'finger'`   | "指法"     | unarmedMartial |
| 爪法   | `CLAW`     | `"claw"`     | `'claw'`     | "爪法"     | unarmedMartial |
| 轻功   | `DODGE`    | `"dodge"`    | `'dodge'`    | "轻功"     | movement       |
| 招架   | `PARRY`    | `"parry"`    | `'parry'`    | "招架"     | movement       |
| 内功   | `FORCE`    | `"force"`    | `'force'`    | "内功"     | internal       |
| 医术   | `MEDICAL`  | `"medical"`  | `'medical'`  | "医术"     | support        |
| 毒术   | `POISON`   | `"poison"`   | `'poison'`   | "毒术"     | support        |
| 锻造   | `FORGE`    | `"forge"`    | `'forge'`    | "锻造"     | support        |
| 辨识   | `APPRAISE` | `"appraise"` | `'appraise'` | "辨识"     | support        |
| 悟性   | `COGNIZE`  | `"cognize"`  | `'cognize'`  | "武学悟性" | cognize        |

### 技能分类 (SkillCategory)

| 枚举值 | 后端常量   | API 传输值   | 前端常量     | 显示文本 | 说明                   |
| ------ | ---------- | ------------ | ------------ | -------- | ---------------------- |
| 武学   | `MARTIAL`  | `"martial"`  | `'martial'`  | "武学"   | 外功（兵刃+空手+身法） |
| 内功   | `INTERNAL` | `"internal"` | `'internal'` | "内功"   | 内功心法               |
| 辅技   | `SUPPORT`  | `"support"`  | `'support'`  | "辅技"   | 百艺（医毒锻辨）       |
| 悟道   | `COGNIZE`  | `"cognize"`  | `'cognize'`  | "悟道"   | 武学悟性               |

### 内功丹田类型 (DantianType)

| 枚举值    | 后端常量 | API 传输值 | 前端常量 | 显示文本    | 关联属性            |
| --------- | -------- | ---------- | -------- | ----------- | ------------------- |
| 上丹田·神 | `SHEN`   | `"shen"`   | `'shen'` | "上丹田·神" | wisdom / perception |
| 中丹田·气 | `QI`     | `"qi"`     | `'qi'`   | "中丹田·气" | spirit / meridian   |
| 下丹田·精 | `JING`   | `"jing"`   | `'jing'` | "下丹田·精" | strength / vitality |

### 战斗参与者状态 (CombatParticipantState)

| 枚举值       | 后端常量          | API 传输值          | 说明                          |
| ------------ | ----------------- | ------------------- | ----------------------------- |
| 读条中       | `CHARGING`        | `"charging"`        | ATB gauge 累积中              |
| **等待选招** | `AWAITING_ACTION` | `"awaiting_action"` | **新增** ATB 满，等待玩家操作 |
| 执行中       | `EXECUTING`       | `"executing"`       | 正在执行招式                  |

### 练功模式 (PracticeMode)

| 枚举值   | 后端常量   | API 传输值   | 前端常量     | 显示文本 | 说明             |
| -------- | ---------- | ------------ | ------------ | -------- | ---------------- |
| 即时练功 | `PRACTICE` | `"practice"` | `'practice'` | "练功"   | 单次消耗资源     |
| 打坐     | `DAZUO`    | `"dazuo"`    | `'dazuo'`    | "打坐"   | 连续练功（内功） |
| 静坐     | `JINGZUO`  | `"jingzuo"`  | `'jingzuo'`  | "静坐"   | 连续练功（外功） |

### 技能学习来源 (SkillLearnSource)

| 枚举值   | 后端常量 | API 传输值 | 显示文本   |
| -------- | -------- | ---------- | ---------- |
| NPC 拜师 | `NPC`    | `"npc"`    | "师父传授" |
| 秘籍     | `SCROLL` | `"scroll"` | "秘籍领悟" |
| 任务奖励 | `QUEST`  | `"quest"`  | "任务奖励" |
| 天赋     | `INNATE` | `"innate"` | "与生俱来" |

### skillUpdate 原因 (SkillUpdateReason)

| 枚举值   | 后端常量          | API 传输值         | 说明            |
| -------- | ----------------- | ------------------ | --------------- |
| 升级     | `LEVEL_UP`        | `"levelUp"`        | 技能等级提升    |
| 映射     | `MAPPED`          | `"mapped"`         | enable 到某槽位 |
| 取消映射 | `UNMAPPED`        | `"unmapped"`       | 取消 enable     |
| 激活内功 | `FORCE_ACTIVATED` | `"forceActivated"` | 切换激活的内功  |
| 死亡惩罚 | `DEATH_PENALTY`   | `"deathPenalty"`   | 死亡扣技能      |
| 锁定     | `LOCKED`          | `"locked"`         | 叛师/叛门派     |
| 解锁     | `UNLOCKED`        | `"unlocked"`       | 重新加入        |

---

## ⚡ VO/DTO 字段映射表（强制章节）

> **此表定义从数据库到前端的完整字段映射链。exec 阶段创建实体和 interface 时必须严格遵循。**

### PlayerSkill 实体映射

| #   | 功能     | 数据库字段      | TypeORM 实体  | API JSON      | TypeScript 前端 | 类型          | 必填 | 说明             |
| --- | -------- | --------------- | ------------- | ------------- | --------------- | ------------- | ---- | ---------------- |
| 1   | 主键     | id              | id            | id            | id              | string (UUID) | ✅   | 自动生成         |
| 2   | 角色     | character_id    | character     | -             | -               | FK            | ✅   | 关联 Character   |
| 3   | 技能 ID  | skill_id        | skillId       | skillId       | skillId         | string        | ✅   | 如 'bagua-zhang' |
| 4   | 槽位类型 | skill_type      | skillType     | skillType     | skillType       | SkillSlotType | ✅   | 如 'palm'        |
| 5   | 等级     | level           | level         | level         | level           | number        | ✅   | 默认 0           |
| 6   | 经验     | learned         | learned       | learned       | learned         | number        | ✅   | 默认 0           |
| 7   | 是否映射 | is_mapped       | isMapped      | isMapped      | isMapped        | boolean       | ✅   | 默认 false       |
| 8   | 映射槽位 | mapped_slot     | mappedSlot    | mappedSlot    | mappedSlot      | string?       | ❌   | 映射目标         |
| 9   | 激活内功 | is_active_force | isActiveForce | isActiveForce | isActiveForce   | boolean       | ✅   | 默认 false       |
| 10  | 锁定     | is_locked       | isLocked      | isLocked      | isLocked        | boolean       | ✅   | 默认 false       |

### 命名规范确认

- 数据库: snake_case（`skill_id`, `is_mapped`）
- TypeORM 实体: camelCase（`skillId`, `isMapped`），使用 `@Column({ name: 'skill_id' })`
- API JSON: camelCase（与实体一致，TypeORM 序列化自动转换）
- TypeScript 前端: camelCase（`skillId`, `isMapped`）

### TypeORM 实体定义

```typescript
// server/src/entities/player-skill.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { Character } from './character.entity';

@Entity('player_skills')
@Unique(['character', 'skillId'])
export class PlayerSkill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Character, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'character_id' })
  character: Character;

  @Column({ name: 'skill_id', length: 64, comment: '技能标识' })
  skillId: string;

  @Column({ name: 'skill_type', length: 32, comment: '槽位类型' })
  skillType: string;

  @Column({ default: 0, comment: '当前等级' })
  level: number;

  @Column({ default: 0, comment: '当前积累经验' })
  learned: number;

  @Column({ name: 'is_mapped', default: false, comment: '是否映射到槽位' })
  isMapped: boolean;

  @Column({ name: 'mapped_slot', length: 32, nullable: true, comment: '映射的槽位类型' })
  mappedSlot: string | null;

  @Column({ name: 'is_active_force', default: false, comment: '是否激活的内功' })
  isActiveForce: boolean;

  @Column({ name: 'is_locked', default: false, comment: '是否锁定' })
  isLocked: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

### core 共享类型定义

```typescript
// packages/core/src/types/skill-constants.ts

/** 技能槽位类型 */
export enum SkillSlotType {
  // 外功·兵刃
  SWORD = 'sword',
  BLADE = 'blade',
  SPEAR = 'spear',
  STAFF = 'staff',
  THROWING = 'throwing',
  // 外功·空手
  FIST = 'fist',
  PALM = 'palm',
  FINGER = 'finger',
  CLAW = 'claw',
  // 身法
  DODGE = 'dodge',
  PARRY = 'parry',
  // 内功
  FORCE = 'force',
  // 辅技
  MEDICAL = 'medical',
  POISON = 'poison',
  FORGE = 'forge',
  APPRAISE = 'appraise',
  // 悟道
  COGNIZE = 'cognize',
}

/** 技能分类 */
export enum SkillCategory {
  MARTIAL = 'martial',
  INTERNAL = 'internal',
  SUPPORT = 'support',
  COGNIZE = 'cognize',
}

/** 内功丹田类型 */
export enum DantianType {
  SHEN = 'shen', // 上丹田·神
  QI = 'qi', // 中丹田·气
  JING = 'jing', // 下丹田·精
}

/** 练功模式 */
export enum PracticeMode {
  PRACTICE = 'practice',
  DAZUO = 'dazuo',
  JINGZUO = 'jingzuo',
}

/** 技能学习来源 */
export enum SkillLearnSource {
  NPC = 'npc',
  SCROLL = 'scroll',
  QUEST = 'quest',
  INNATE = 'innate',
}

/** 战斗参与者状态（扩展现有） */
export enum CombatParticipantState {
  CHARGING = 'charging',
  AWAITING_ACTION = 'awaiting_action',
  EXECUTING = 'executing',
}

/** 技能更新原因 */
export enum SkillUpdateReason {
  LEVEL_UP = 'levelUp',
  MAPPED = 'mapped',
  UNMAPPED = 'unmapped',
  FORCE_ACTIVATED = 'forceActivated',
  DEATH_PENALTY = 'deathPenalty',
  LOCKED = 'locked',
  UNLOCKED = 'unlocked',
}

/** 技能常量 */
export const SKILL_CONSTANTS = {
  /** 悟性加成系数（amount += amount * cognize / COGNIZE_FACTOR） */
  COGNIZE_FACTOR: 500,
  /** 属性加成公式分母（amount = 1 + amount * 100 / (level + ATTR_FACTOR)） */
  ATTR_FACTOR: 100,
  /** 武学技能升级所需战斗经验门槛: level³ / EXP_THRESHOLD_DIVISOR > combat_exp */
  EXP_THRESHOLD_DIVISOR: 10,
  /** 战斗领悟判定: random(COMBAT_INSIGHT_RANGE) < skillLevel */
  COMBAT_INSIGHT_RANGE: 120,
  /** 装备不匹配时的伤害系数 */
  WEAPON_MISMATCH_FACTOR: 0.6,
  /** 选招超时（毫秒） */
  ACTION_TIMEOUT_MS: 10000,
  /** 打坐/静坐练功间隔（毫秒） */
  PRACTICE_TICK_MS: 5000,
  /** 学习单次最大次数 */
  MAX_LEARN_TIMES: 100,
};

/** 槽位类型的中文显示名 */
export const SKILL_SLOT_NAMES: Record<SkillSlotType, string> = {
  [SkillSlotType.SWORD]: '剑法',
  [SkillSlotType.BLADE]: '刀法',
  [SkillSlotType.SPEAR]: '枪法',
  [SkillSlotType.STAFF]: '杖法',
  [SkillSlotType.THROWING]: '暗器',
  [SkillSlotType.FIST]: '拳法',
  [SkillSlotType.PALM]: '掌法',
  [SkillSlotType.FINGER]: '指法',
  [SkillSlotType.CLAW]: '爪法',
  [SkillSlotType.DODGE]: '轻功',
  [SkillSlotType.PARRY]: '招架',
  [SkillSlotType.FORCE]: '内功',
  [SkillSlotType.MEDICAL]: '医术',
  [SkillSlotType.POISON]: '毒术',
  [SkillSlotType.FORGE]: '锻造',
  [SkillSlotType.APPRAISE]: '辨识',
  [SkillSlotType.COGNIZE]: '武学悟性',
};

/** 槽位分组 */
export const SKILL_SLOT_GROUPS = {
  weaponMartial: [
    SkillSlotType.SWORD,
    SkillSlotType.BLADE,
    SkillSlotType.SPEAR,
    SkillSlotType.STAFF,
    SkillSlotType.THROWING,
  ],
  unarmedMartial: [
    SkillSlotType.FIST,
    SkillSlotType.PALM,
    SkillSlotType.FINGER,
    SkillSlotType.CLAW,
  ],
  movement: [SkillSlotType.DODGE, SkillSlotType.PARRY],
  internal: [SkillSlotType.FORCE],
  support: [
    SkillSlotType.MEDICAL,
    SkillSlotType.POISON,
    SkillSlotType.FORGE,
    SkillSlotType.APPRAISE,
  ],
  cognize: [SkillSlotType.COGNIZE],
};
```

### 前端 TypeScript 接口

```typescript
// client/src/types/skill.ts（或由 core 导出）

/** 前端技能面板用的完整 Store State */
interface SkillState {
  skills: PlayerSkillInfo[];
  skillMap: Record<string, string>;
  activeForce: string | null;
  bonusSummary: SkillBonusSummary | null;
  // actions
  setSkillList: (data: SkillListData) => void;
  updateSkill: (data: SkillUpdateData) => void;
  addSkill: (data: SkillLearnData) => void;
}

/** 战斗快捷栏 State（扩展现有 combat 切片） */
interface CombatSkillState {
  awaitingAction: boolean;
  availableActions: CombatActionOption[];
  actionTimeout: number;
  setAwaitAction: (data: CombatAwaitActionData) => void;
  clearAwaitAction: () => void;
}
```

---

## 后端设计

### 技能类继承体系

```
server/src/engine/skills/
├── skill-base.ts                    # 技能根基类
├── skill-registry.ts                # 技能注册表
├── skill-manager.ts                 # 技能管理器（挂载于 PlayerBase）
├── practice-manager.ts              # 练功管理器
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
└── cognize-skill.ts                 # 武学悟性（直接实现）
```

### 核心类 API 签名

#### SkillBase

```typescript
export abstract class SkillBase {
  abstract get skillId(): string;
  abstract get skillName(): string;
  abstract get skillType(): SkillSlotType;
  abstract get category(): SkillCategory;

  /** 学习前置条件校验，返回 true 或拒绝原因字符串 */
  validLearn(player: LivingBase): true | string {
    return true;
  }

  /** 从师父处可学的最高等级 */
  validLearnLevel(): number {
    return this.category === SkillCategory.MARTIAL ? 200 : 999;
  }

  /** 是否可以继续提升（战斗经验门槛等） */
  canImprove(player: LivingBase, currentLevel: number): boolean {
    return true;
  }

  /** 技能升级时的回调 */
  onSkillImproved(player: LivingBase, newLevel: number): void {}

  /** 死亡惩罚回调 */
  onDeathPenalty(player: LivingBase, currentLevel: number): number {
    return Math.max(0, currentLevel - 1);
  }

  /** 组合技能前置条件 */
  getSubSkills(): Record<string, number> | null {
    return null;
  }

  /** 技能冲突列表 */
  getConflicts(): string[] {
    return [];
  }

  /** 门派要求 */
  get factionRequired(): string | null {
    return null;
  }
}
```

#### MartialSkillBase

```typescript
export abstract class MartialSkillBase extends SkillBase {
  category = SkillCategory.MARTIAL;

  /** 招式列表（由子类定义） */
  abstract get actions(): SkillAction[];

  /** 可启用到哪些槽位 */
  abstract validEnable(usage: SkillSlotType): boolean;

  /** 获取指定等级可用的招式 */
  getAvailableActions(level: number): SkillAction[] {
    return this.actions.filter((a) => a.lvl <= level);
  }

  /** 普攻时自动选择的招式 */
  getAutoAction(level: number): SkillAction {
    const available = this.getAvailableActions(level);
    return available[Math.floor(Math.random() * available.length)] ?? this.actions[0];
  }

  /** 练习消耗 */
  getPracticeCost(player: LivingBase): ResourceCost {
    return { resource: 'energy', amount: 80 };
  }

  /** 武学类技能的 canImprove 检查战斗经验门槛 */
  canImprove(player: LivingBase, currentLevel: number): boolean {
    const combatExp = player.get('combat_exp') ?? 0;
    return currentLevel ** 3 / SKILL_CONSTANTS.EXP_THRESHOLD_DIVISOR <= combatExp;
  }
}
```

#### InternalSkillBase

```typescript
export abstract class InternalSkillBase extends SkillBase {
  category = SkillCategory.INTERNAL;
  skillType = SkillSlotType.FORCE;

  /** 丹田类型 */
  abstract get dantianType(): DantianType;

  /** 内功提供的属性加成（基于等级） */
  abstract getAttributeBonus(level: number): Partial<CharacterAttrs>;

  /** 内功提供的资源加成 */
  abstract getResourceBonus(level: number): { maxHp?: number; maxMp?: number };

  /** 内功招式（增益/恢复类） */
  abstract get actions(): SkillAction[];

  /** 内功总是启用到 force 槽位 */
  validEnable(usage: SkillSlotType): boolean {
    return usage === SkillSlotType.FORCE;
  }

  /** 打坐消耗 */
  getPracticeCost(player: LivingBase): ResourceCost {
    return { resource: 'mp', amount: 50 };
  }
}
```

#### SkillManager（挂载于每个 PlayerBase）

```typescript
export class SkillManager {
  constructor(
    private player: PlayerBase,
    private skillService: SkillService,
  ) {}

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

#### SkillRegistry（全局单例）

```typescript
@Injectable()
export class SkillRegistry {
  private skills: Map<string, SkillBase> = new Map();

  register(skill: SkillBase): void;
  get(skillId: string): SkillBase | undefined;
  getBySlotType(slotType: SkillSlotType): SkillBase[];
  getAll(): SkillBase[];
}
```

#### PracticeManager

```typescript
@Injectable()
export class PracticeManager {
  private activeSessions: Map<string, PracticeSession> = new Map();

  startPractice(player: PlayerBase, skillId: string, mode: PracticeMode): true | string;
  stopPractice(player: PlayerBase): void;
  isInPractice(player: PlayerBase): boolean;

  // HeartbeatManager 驱动
  onPracticeTick(player: PlayerBase): void;
}
```

### CombatManager 改造点

```typescript
// combat-manager.ts 需要修改的部分

interface CombatParticipant {
  entity: LivingBase;
  side: 'player' | 'enemy';
  gauge: number;
  target: LivingBase;
  state: CombatParticipantState;       // 新增：状态字段
  actionTimeout?: NodeJS.Timeout;      // 新增：选招超时定时器
}

// processCombat() 中的修改
private processCombat(combat: CombatInstance): void {
  // 原有逻辑: gauge += speed * SPEED_FACTOR
  // 新增: 如果 state === AWAITING_ACTION，跳过 gauge 累积
  // 新增: gauge >= MAX_GAUGE 时:
  //   if (isPlayer) → state = AWAITING_ACTION, 推送 combatAwaitAction, 设超时
  //   if (isNPC) → 直接执行 AI 攻击（现有逻辑）
}

// 新增方法
executeSkillAction(combatId: string, player: PlayerBase, actionIndex: number): boolean;
handleActionTimeout(combatId: string, playerId: string): void;
```

### DamageEngine 扩展

```typescript
// damage-engine.ts 新增重载

interface SkillAttackOptions {
  action?: SkillAction;                // 使用的招式
  weaponMismatch?: boolean;            // 装备不匹配
}

static calculateWithAction(
  attacker: LivingBase,
  defender: LivingBase,
  options?: SkillAttackOptions,
): AttackResult {
  // 在现有公式基础上:
  // effectiveAttack = getAttack() + (action?.modifiers.attack ?? 0)
  // baseDamage 计算后: actualDamage += (action?.modifiers.damage ?? 0)
  // weaponMismatch: actualDamage *= WEAPON_MISMATCH_FACTOR
  // 返回 AttackResult 带招式描述文本
}
```

### WebSocket Handler

```typescript
// server/src/websocket/handlers/skill.handler.ts

@Injectable()
export class SkillHandler {
  constructor(
    private readonly skillService: SkillService,
    private readonly combatManager: CombatManager,
    private readonly practiceManager: PracticeManager,
  ) {}

  async handleSkillUse(session: Session, data: SkillUseData): Promise<void>;
  async handleSkillMapRequest(session: Session, data: SkillMapRequestData): Promise<void>;
  async handleSkillPanelRequest(session: Session, data: SkillPanelRequestData): Promise<void>;
  async handleSkillLearnRequest(session: Session, data: SkillLearnRequestData): Promise<void>;
  async handlePracticeStart(session: Session, data: PracticeStartData): Promise<void>;
  async handlePracticeEnd(session: Session, data: PracticeEndData): Promise<void>;
}
```

### Gateway 新增路由

```typescript
// websocket.gateway.ts switch 中新增
case 'skillUse':
  await this.skillHandler.handleSkillUse(session, message.data);
  break;
case 'skillMapRequest':
  await this.skillHandler.handleSkillMapRequest(session, message.data);
  break;
case 'skillPanelRequest':
  await this.skillHandler.handleSkillPanelRequest(session, message.data);
  break;
case 'skillLearnRequest':
  await this.skillHandler.handleSkillLearnRequest(session, message.data);
  break;
case 'practiceStart':
  await this.skillHandler.handlePracticeStart(session, message.data);
  break;
case 'practiceEnd':
  await this.skillHandler.handlePracticeEnd(session, message.data);
  break;
```

## 前端设计

### 新增 Store

```typescript
// client/src/stores/useSkillStore.ts
// 独立 skill store，不混入 gameStore（数据量大，避免影响其他组件渲染）

export const useSkillStore = create<SkillState>((set, get) => ({
  skills: [],
  skillMap: {},
  activeForce: null,
  bonusSummary: null,

  setSkillList: (data) =>
    set({ skills: data.skills, skillMap: data.skillMap, activeForce: data.activeForce }),
  updateSkill: (data) =>
    set((state) => ({
      skills: state.skills.map((s) => (s.skillId === data.skillId ? { ...s, ...data.changes } : s)),
    })),
  addSkill: (data) =>
    set((state) => ({
      skills: [...state.skills, { skillId: data.skillId, skillName: data.skillName /* ... */ }],
    })),
}));
```

### 扩展 gameStore combat 切片

```typescript
// 在现有 combat 切片中新增字段
combat: {
  // ...existing fields...
  awaitingAction: boolean;
  availableActions: CombatActionOption[];
  actionTimeout: number;
};

setCombatAwaitAction: (data: CombatAwaitActionData) => void;
clearCombatAwaitAction: () => void;
```

### 新增组件

```
client/src/components/game/
├── CombatActions/              # 战斗招式快捷栏
│   ├── index.tsx               # 容器: 从 combat 切片取 awaitingAction
│   ├── ActionButton.tsx        # 单个招式按钮
│   ├── ActionBar.tsx           # 快捷栏横向排列
│   └── ActionExpandModal.tsx   # "更多"展开的全部招式弹窗
├── SkillPanel/                 # 技能面板
│   ├── index.tsx               # 容器: 从 skillStore 取数据
│   ├── SkillCategoryTabs.tsx   # 分类 Tab（武学/内功/辅技/悟道）
│   ├── SkillListItem.tsx       # 技能列表项（名称+等级+进度条+启用状态）
│   ├── SkillDetailModal.tsx    # 招式详情弹窗
│   ├── ActionListItem.tsx      # 招式列表项（解锁/未解锁）
│   └── BonusSummaryBar.tsx     # 属性加成汇总栏
```

### 消息订阅

在 WebSocketService 或 App.tsx 的消息处理中注册：

```typescript
case 'skillList':
  useSkillStore.getState().setSkillList(message.data);
  break;
case 'skillUpdate':
  useSkillStore.getState().updateSkill(message.data);
  break;
case 'skillLearn':
  useSkillStore.getState().addSkill(message.data);
  // 同时显示 toast
  break;
case 'combatAwaitAction':
  useGameStore.getState().setCombatAwaitAction(message.data);
  break;
case 'skillMapResult':
  // 更新 skillStore 映射 + 显示结果 toast
  break;
case 'skillPanelData':
  // 更新面板数据
  break;
case 'practiceUpdate':
  // 更新练功进度 UI
  break;
case 'skillLearnResult':
  // 显示学习结果
  break;
```

## 影响范围

### 修改的已有文件

| 文件                                            | 改动                                                    |
| ----------------------------------------------- | ------------------------------------------------------- |
| `server/src/engine/combat/combat-manager.ts`    | 增加 AWAITING_ACTION 状态、选招超时、executeSkillAction |
| `server/src/engine/combat/damage-engine.ts`     | 新增 calculateWithAction 方法                           |
| `server/src/engine/game-objects/living-base.ts` | 增加 getSkillLevel 等技能查询方法                       |
| `server/src/engine/game-objects/player-base.ts` | 持有 SkillManager、死亡时调用惩罚、登录时加载技能       |
| `server/src/websocket/websocket.gateway.ts`     | switch 增加 6 个技能消息路由                            |
| `server/src/websocket/websocket.module.ts`      | 注入 SkillHandler、SkillService                         |
| `server/src/app.module.ts`                      | 导入 SkillModule                                        |
| `packages/core/src/types/messages/index.ts`     | 导出技能消息类型                                        |
| `packages/core/src/types/index.ts`              | 导出 skill-constants                                    |
| `packages/core/src/factory/index.ts`            | 导入技能消息处理器                                      |
| `client/src/stores/useGameStore.ts`             | combat 切片增加 awaitingAction 字段                     |
| `client/src/components/game/Combat/index.tsx`   | 集成 CombatActions 快捷栏                               |

### 新增文件

| 文件                                             | 内容                         |
| ------------------------------------------------ | ---------------------------- |
| `server/src/engine/skills/**/*.ts`               | 技能基类体系（约 25 个文件） |
| `server/src/engine/skills/skill-manager.ts`      | 技能管理器                   |
| `server/src/engine/skills/skill-registry.ts`     | 技能注册表                   |
| `server/src/engine/skills/practice-manager.ts`   | 练功管理器                   |
| `server/src/entities/player-skill.entity.ts`     | 数据库实体                   |
| `server/src/skill/skill.module.ts`               | NestJS 模块                  |
| `server/src/skill/skill.service.ts`              | 持久化服务                   |
| `server/src/websocket/handlers/skill.handler.ts` | 消息处理器                   |
| `packages/core/src/types/skill-constants.ts`     | 枚举和常量                   |
| `packages/core/src/types/messages/skill.ts`      | 消息类型定义                 |
| `packages/core/src/factory/handlers/skill*.ts`   | 消息工厂处理器               |
| `client/src/stores/useSkillStore.ts`             | 技能状态管理                 |
| `client/src/components/game/CombatActions/**`    | 战斗快捷栏（4 个文件）       |
| `client/src/components/game/SkillPanel/**`       | 技能面板（6 个文件）         |

## 风险点

| 风险                     | 影响                           | 应对方案                                                     |
| ------------------------ | ------------------------------ | ------------------------------------------------------------ |
| CombatManager 改造复杂度 | ATB 循环增加状态后逻辑分支增多 | 充分测试现有战斗流程不受影响，增量改造                       |
| 选招超时竞态             | 超时触发和玩家操作可能同时到达 | 使用状态锁，只有 AWAITING_ACTION 状态才接受 skillUse         |
| 技能数据加载时机         | 登录时需从数据库加载技能到内存 | 在 PlayerBase 初始化流程中增加 skillManager.loadFromDatabase |
| 练功状态与其他操作互斥   | 练功中收到移动/战斗指令        | PracticeManager 检查，战斗开始时自动停止练功                 |
| core 包编译              | 新增大量类型需要重新编译       | 使用 pnpm dev（core watch 模式）自动编译                     |

---

> CX 工作流 | Design Doc
> 创建时间: 2026-02-10
