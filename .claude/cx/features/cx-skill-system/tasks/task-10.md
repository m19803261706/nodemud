# Task 10: CombatActions 战斗快捷栏组件

## 关联

- Part of feature: 天衍技能系统
- Phase: 5 — 前端
- Depends on: Task 9
- Design Doc: #224
- PRD: #223

## 任务描述

创建战斗招式快捷栏组件，当 ATB 满时弹出，让玩家选择招式。包含 4-6 个快捷按钮 + "更多"展开弹窗。

### 目标文件

**新增：**

```
client/src/components/game/CombatActions/
├── index.tsx               # 容器: 从 combat 切片取 awaitingAction
├── ActionButton.tsx        # 单个招式按钮
├── ActionBar.tsx           # 快捷栏横向排列
└── ActionExpandModal.tsx   # "更多"展开的全部招式弹窗
```

**修改：**

- 战斗区域布局（在合适位置集成 CombatActions）

### 实现要点

1. **index.tsx（容器）**:
   - 从 `useGameStore` 取 `awaitingAction`, `availableActions`, `actionTimeout`
   - awaitingAction=false 时不渲染
   - awaitingAction=true 时显示快捷栏 + 倒计时条

2. **ActionBar.tsx**:
   - 横向排列 4-6 个 ActionButton
   - 最后一个为"更多"按钮（如果招式 > 6 个）
   - 水墨风样式

3. **ActionButton.tsx**:
   - 显示招式名 + 资源消耗
   - canUse=false 时灰显
   - 点击发送 `skillUse` 消息（combatId + actionIndex）
   - 内功招式用不同颜色标记

4. **ActionExpandModal.tsx**:
   - 全部招式列表
   - 每个招式显示详细 modifiers
   - 点击选择后关闭弹窗并发送

5. **倒计时条**:
   - 根据 actionTimeout 显示剩余时间
   - 接近超时时变色警告

### 水墨风样式要点

- 背景: 半透明 #F5F0E8
- 边框: #8B7A5A
- 文字: #3A3530
- 禁用: opacity 0.4
- 字体: Noto Serif SC

## 验收标准

- [ ] ATB 满时正确显示快捷栏
- [ ] 显示可用招式列表（4-6 个快捷 + 更多展开）
- [ ] 资源不足的招式灰显
- [ ] 点击招式发送 skillUse 消息
- [ ] 倒计时条正确显示
- [ ] 选招后或超时后快捷栏消失
- [ ] 水墨风样式一致
- [ ] 遵循 Unity3D 组件模型（容器 + 子组件）

## 📋 API 契约片段（来自 Design Doc）

> ⚠️ 以下契约已在 Design Doc 中锁定，实现时必须严格遵守。

### 输入数据（从 Store 取）

```typescript
// useGameStore.combat
{
  awaitingAction: boolean;
  availableActions: CombatActionOption[];
  actionTimeout: number;  // 毫秒
}
```

### CombatActionOption（招式选项）

```typescript
interface CombatActionOption {
  index: number; // 用于 skillUse 回传
  skillId: string;
  skillName: string; // '八卦掌'
  actionName: string; // '怀中抱月'
  actionDesc: string;
  lvl: number;
  costs: ResourceCostInfo[];
  canUse: boolean;
  isInternal: boolean; // 内功招式标记
}

interface ResourceCostInfo {
  resource: string; // 'mp' | 'energy' | 'hp'
  amount: number;
  current: number;
}
```

### 发送消息（skillUse C→S）

```typescript
// 点击招式时发送
WebSocketService.send({
  type: 'skillUse',
  data: {
    combatId: string, // 从 combat state 取
    actionIndex: number, // 对应 CombatActionOption.index
  },
});
```

## 代码参考

- 现有组件模式: `client/src/components/game/NpcList/`（容器 + 子组件）
- 现有弹窗: `client/src/components/game/NpcList/ItemInfoModal.tsx`
- 水墨风配色: `#F5F0E8`/`#8B7A5A`/`#3A3530`
- WebSocket 发送: `WebSocketService.send()`

## 相关文档

- Design Doc: #224 (前端设计 — CombatActions 组件结构)
- PRD: #223 (R7 战斗快捷栏 UI)
