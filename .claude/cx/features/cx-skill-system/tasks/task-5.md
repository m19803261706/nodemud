# Task 5: PracticeManager 练功管理器

## 关联

- Part of feature: 天衍技能系统
- Phase: 3 — 引擎扩展
- Depends on: Task 4
- Design Doc: #224
- PRD: #223

## 任务描述

创建 PracticeManager 管理打坐（dazuo）和静坐（jingzuo）连续练功，以及即时练功（practice）。利用现有 HeartbeatManager 驱动定时 tick。

### 目标文件

**新增：**

- `server/src/engine/skills/practice-manager.ts` — 练功管理器

### 实现要点

1. PracticeManager 使用 NestJS @Injectable()，注入 SkillRegistry
2. 维护 `activeSessions: Map<string, PracticeSession>` 按玩家 ID 索引
3. `startPractice()`:
   - 校验玩家是否在战斗中（互斥）
   - 校验技能是否存在、是否已在练功
   - mode=practice: 单次执行 improveSkill + 扣资源 + 返回
   - mode=dazuo/jingzuo: 注册 HeartbeatManager 回调，每 PRACTICE_TICK_MS 执行一次
4. `onPracticeTick()`:
   - 检查资源是否足够
   - 调用 SkillManager.improveSkill(skillId, 1, weakMode)
   - 扣除资源（getPracticeCost）
   - 推送 practiceUpdate 消息
   - 资源不足时自动停止并推送 stopped=true
5. `stopPractice()`: 清除定时回调，移除 session
6. 战斗开始时自动调用 stopPractice（由 CombatManager 集成）

### PracticeSession 结构

```typescript
interface PracticeSession {
  playerId: string;
  skillId: string;
  mode: PracticeMode;
  startedAt: number;
  tickCount: number;
}
```

## 验收标准

- [ ] startPractice 支持三种模式：practice, dazuo, jingzuo
- [ ] practice 模式单次执行后返回
- [ ] dazuo/jingzuo 模式注册持续 tick
- [ ] 每 tick 正确调用 improveSkill + 扣资源
- [ ] 资源不足时自动停止并通知客户端
- [ ] stopPractice 正确清理 session 和定时器
- [ ] 战斗互斥：练功中不能进入战斗，战斗中不能练功
- [ ] TypeScript 编译通过

## 📋 API 契约片段（来自 Design Doc）

> ⚠️ 以下契约已在 Design Doc 中锁定，实现时必须严格遵守。

### PracticeManager API

```typescript
@Injectable()
export class PracticeManager {
  private activeSessions: Map<string, PracticeSession> = new Map();

  startPractice(player: PlayerBase, skillId: string, mode: PracticeMode): true | string;
  stopPractice(player: PlayerBase): void;
  isInPractice(player: PlayerBase): boolean;
  onPracticeTick(player: PlayerBase): void;
}
```

### 关联消息

#### practiceStart (C→S)

```typescript
interface PracticeStartData {
  skillId: string;
  mode: 'practice' | 'dazuo' | 'jingzuo';
}
```

#### practiceEnd (C→S)

```typescript
interface PracticeEndData {
  reason: 'manual' | 'exhausted';
}
```

#### practiceUpdate (S→C)

```typescript
interface PracticeUpdateData {
  skillId: string;
  skillName: string;
  mode: 'practice' | 'dazuo' | 'jingzuo';
  currentLevel: number;
  learned: number;
  learnedMax: number;
  levelUp: boolean;
  message: string;
  resourceCost: ResourceCostInfo;
  stopped: boolean;
}
```

### 关联枚举

| 枚举                  | 值           |
| --------------------- | ------------ |
| PracticeMode.PRACTICE | `'practice'` |
| PracticeMode.DAZUO    | `'dazuo'`    |
| PracticeMode.JINGZUO  | `'jingzuo'`  |

### 关联常量

```
PRACTICE_TICK_MS = 5000  // 打坐/静坐间隔
```

## 代码参考

- HeartbeatManager: `server/src/engine/heartbeat/heartbeat-manager.ts`（定时 tick 注册方式）
- CombatManager 的定时循环参考

## 相关文档

- Design Doc: #224 (核心类 API 签名 — PracticeManager + 数据流 [练功])
- PRD: #223 (R2.3 自行练功 — practice/dazuo/jingzuo)
