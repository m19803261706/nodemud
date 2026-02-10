# Task 9: 前端 Store + 消息订阅

## 关联

- Part of feature: 天衍技能系统
- Phase: 5 — 前端
- Depends on: Task 1
- Design Doc: #224
- PRD: #223

## 任务描述

创建独立的 useSkillStore（Zustand）管理技能状态，扩展 gameStore 的 combat 切片增加 awaitingAction 字段，在消息处理中注册所有技能消息的订阅。

### 目标文件

**新增：**

- `client/src/stores/useSkillStore.ts` — 技能独立 store

**修改：**

- `client/src/stores/useGameStore.ts` — combat 切片扩展
- 消息处理入口（App.tsx 或 WebSocketService）— 注册技能消息订阅

### 实现要点

#### useSkillStore

1. 独立 store（不混入 gameStore，避免影响其他组件渲染）
2. State: skills, skillMap, activeForce, bonusSummary
3. Actions: setSkillList, updateSkill, addSkill, setSkillMap, setBonusSummary
4. 参考现有 useGameStore 的模式

#### gameStore combat 切片扩展

1. 新增字段: awaitingAction, availableActions, actionTimeout
2. 新增 actions: setCombatAwaitAction, clearCombatAwaitAction

#### 消息订阅注册

在 WebSocket 消息处理 switch 中新增 8 个 case：

- `skillList` → useSkillStore.setSkillList
- `skillUpdate` → useSkillStore.updateSkill
- `skillLearn` → useSkillStore.addSkill + 显示 toast
- `combatAwaitAction` → useGameStore.setCombatAwaitAction
- `skillMapResult` → useSkillStore.setSkillMap + toast
- `skillPanelData` → 更新面板数据
- `practiceUpdate` → 更新练功进度
- `skillLearnResult` → 显示学习结果

## 验收标准

- [ ] useSkillStore 创建成功，State 和 Actions 完整
- [ ] gameStore combat 切片新增 awaitingAction 相关字段
- [ ] 8 条 S→C 消息订阅全部注册
- [ ] skillList 正确填充 store
- [ ] skillUpdate 正确更新单技能
- [ ] skillLearn 正确添加新技能 + toast
- [ ] combatAwaitAction 正确设置战斗选招状态
- [ ] TypeScript 编译通过

## 📋 API 契约片段（来自 Design Doc）

> ⚠️ 以下契约已在 Design Doc 中锁定，实现时必须严格遵守。

### useSkillStore State

```typescript
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
```

### Combat 切片扩展

```typescript
interface CombatSkillState {
  awaitingAction: boolean;
  availableActions: CombatActionOption[];
  actionTimeout: number;
  setCombatAwaitAction: (data: CombatAwaitActionData) => void;
  clearCombatAwaitAction: () => void;
}
```

### 消息订阅映射

```typescript
case 'skillList':
  useSkillStore.getState().setSkillList(message.data);
  break;
case 'skillUpdate':
  useSkillStore.getState().updateSkill(message.data);
  break;
case 'skillLearn':
  useSkillStore.getState().addSkill(message.data);
  break;
case 'combatAwaitAction':
  useGameStore.getState().setCombatAwaitAction(message.data);
  break;
case 'skillMapResult':
  // 更新 skillStore 映射 + toast
  break;
case 'skillPanelData':
  // 更新面板数据
  break;
case 'practiceUpdate':
  // 更新练功进度
  break;
case 'skillLearnResult':
  // 显示学习结果
  break;
```

### 关联接口（消息 Data 类型）

- PlayerSkillInfo: `{ skillId, skillName, skillType, category, level, learned, learnedMax, isMapped, mappedSlot, isActiveForce, isLocked }`
- CombatActionOption: `{ index, skillId, skillName, actionName, actionDesc, lvl, costs, canUse, isInternal }`
- SkillBonusSummary: `{ attack, defense, dodge, parry, maxHp, maxMp, critRate, hitRate }`

## 代码参考

- 现有 store: `client/src/stores/useGameStore.ts`
- 现有消息订阅: 搜索 WebSocket message handler switch

## 相关文档

- Design Doc: #224 (前端设计 — Store + 消息订阅)
- PRD: #223
