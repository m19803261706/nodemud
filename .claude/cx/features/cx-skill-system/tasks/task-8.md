# Task 8: WebSocket Handler + Gateway 路由

## 关联

- Part of feature: 天衍技能系统
- Phase: 4 — 后端路由
- Depends on: Task 5, Task 6, Task 7
- Design Doc: #224
- PRD: #223

## 任务描述

创建 SkillHandler 处理所有技能相关的 WebSocket 消息，在 Gateway 中添加 6 条新路由。这是前后端通信的最终连接层。

### 目标文件

**新增：**

- `server/src/websocket/handlers/skill.handler.ts` — 技能消息处理器

**修改：**

- `server/src/websocket/websocket.gateway.ts` — switch 新增 6 条路由
- `server/src/websocket/websocket.module.ts` — 注入 SkillHandler + 依赖

### 实现要点

#### SkillHandler

1. 注入依赖：SkillService, SkillRegistry, CombatManager, PracticeManager
2. 6 个处理方法，每个对应一条 C→S 消息：
   - `handleSkillUse(session, data)` → 调用 CombatManager.executeSkillAction
   - `handleSkillMapRequest(session, data)` → 调用 SkillManager.mapSkill + 推送结果
   - `handleSkillPanelRequest(session, data)` → 组装面板数据 + 推送
   - `handleSkillLearnRequest(session, data)` → 批量学习循环 + 推送结果
   - `handlePracticeStart(session, data)` → 调用 PracticeManager.startPractice
   - `handlePracticeEnd(session, data)` → 调用 PracticeManager.stopPractice

#### Gateway 新增路由

在现有 switch 语句中添加 6 个 case。

#### handleSkillLearnRequest 详细逻辑

```
1. 从 session 获取玩家实例
2. 校验 NPC 是否在当前房间
3. 校验 NPC 是否教授该技能
4. 循环 times 次：
   a. 检查资源（潜能/精力/金钱）
   b. 扣除资源
   c. 调用 SkillManager.improveSkill(skillId, 1)
   d. 如果提升失败（门槛不满足），提前结束
5. 推送 skillLearnResult
6. 如果是新学的技能，先 learnSkill 再循环
```

## 验收标准

- [ ] SkillHandler 6 个方法全部实现
- [ ] Gateway switch 新增 6 条路由正确分发
- [ ] skillUse 正确调用 CombatManager.executeSkillAction
- [ ] skillMapRequest 正确调用 mapSkill + 推送 skillMapResult
- [ ] skillPanelRequest 正确组装面板数据 + 推送 skillPanelData
- [ ] skillLearnRequest 支持批量学习 + 资源检查 + 推送结果
- [ ] practiceStart 正确启动练功
- [ ] practiceEnd 正确停止练功
- [ ] WebSocket 模块注入正确
- [ ] 服务启动不报错

## 📋 API 契约片段（来自 Design Doc）

> ⚠️ 以下契约已在 Design Doc 中锁定，实现时必须严格遵守。

### 所有 C→S 消息（Handler 需处理）

#### skillUse (C→S)

```typescript
interface SkillUseData {
  combatId: string;
  actionIndex: number;
}
```

#### skillMapRequest (C→S)

```typescript
interface SkillMapRequestData {
  slotType: string;
  skillId: string | null;
}
```

#### skillPanelRequest (C→S)

```typescript
interface SkillPanelRequestData {
  detailSkillId?: string;
}
```

#### skillLearnRequest (C→S)

```typescript
interface SkillLearnRequestData {
  npcId: string;
  skillId: string;
  times: number; // 1-100
}
```

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

### 所有 S→C 响应消息

#### skillMapResult (S→C)

```typescript
interface SkillMapResultData {
  success: boolean;
  slotType: string;
  skillId: string | null;
  skillName: string | null;
  message: string;
  updatedMap: Record<string, string>;
}
```

#### skillPanelData (S→C)

```typescript
interface SkillPanelDataResponse {
  skills: PlayerSkillInfo[];
  skillMap: Record<string, string>;
  activeForce: string | null;
  bonusSummary: SkillBonusSummary;
  detail?: SkillDetailInfo;
}
```

#### skillLearnResult (S→C)

```typescript
interface SkillLearnResultData {
  success: boolean;
  skillId: string;
  skillName: string;
  timesCompleted: number;
  timesRequested: number;
  currentLevel: number;
  learned: number;
  learnedMax: number;
  levelUp: boolean;
  message: string;
  reason?: string;
}
```

### Gateway 路由代码

```typescript
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

### SkillHandler 签名

```typescript
@Injectable()
export class SkillHandler {
  constructor(
    private readonly skillService: SkillService,
    private readonly skillRegistry: SkillRegistry,
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

## 代码参考

- 现有 Handler: `server/src/websocket/handlers/auth.handler.ts`, `command.handler.ts`
- 现有 Gateway switch: `server/src/websocket/websocket.gateway.ts`
- 现有注入方式: `server/src/websocket/websocket.module.ts`

## 相关文档

- Design Doc: #224 (WebSocket Handler + Gateway 新增路由章节)
- PRD: #223
