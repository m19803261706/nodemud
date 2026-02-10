# Task 11: SkillPanel 技能面板组件

## 关联

- Part of feature: 天衍技能系统
- Phase: 5 — 前端
- Depends on: Task 9
- Design Doc: #224
- PRD: #223

## 任务描述

创建技能面板组件，包含技能列表（按分类 Tab）、招式详情弹窗、属性加成汇总栏。从底部导航栏或游戏命令打开。

### 目标文件

**新增：**

```
client/src/components/game/SkillPanel/
├── index.tsx               # 容器: 从 skillStore 取数据，Modal 形式
├── SkillCategoryTabs.tsx   # 分类 Tab（武学/内功/辅技/悟道）
├── SkillListItem.tsx       # 技能列表项（名称+等级+进度条+映射状态）
├── SkillDetailModal.tsx    # 招式详情弹窗
├── ActionListItem.tsx      # 招式列表项（解锁/未解锁）
└── BonusSummaryBar.tsx     # 属性加成汇总栏
```

### 实现要点

1. **index.tsx（容器）**:
   - Modal 形式，从底部弹出或全屏
   - 从 `useSkillStore` 取 skills, skillMap, activeForce, bonusSummary
   - 打开时发送 `skillPanelRequest` 获取最新数据
   - 顶部: BonusSummaryBar
   - 中部: SkillCategoryTabs + 技能列表
   - 底部: 操作按钮（enable/激活内功等）

2. **SkillCategoryTabs.tsx**:
   - 4 个 Tab: 武学 / 内功 / 辅技 / 悟道
   - 每个 Tab 下按 SkillCategory 筛选 skills 列表
   - 武学 Tab 内可再按分组显示（兵刃/空手/身法）

3. **SkillListItem.tsx**:
   - 技能名称 + 等级
   - 经验进度条（learned / learnedMax）
   - 映射状态标记（已启用的显示绿色指示）
   - 点击进入 SkillDetailModal

4. **SkillDetailModal.tsx**:
   - 打开时发送 `skillPanelRequest` 带 detailSkillId
   - 显示技能描述 + 招式列表
   - 每个招式: ActionListItem

5. **ActionListItem.tsx**:
   - 招式名 + 等级要求
   - 已解锁: 显示 modifiers 详情
   - 未解锁: 灰显 + "等级不足"

6. **BonusSummaryBar.tsx**:
   - 紧凑展示: 攻击+X / 防御+X / 闪避+X / 招架+X
   - 水墨风横条样式

### 水墨风样式要点

- 背景: #F5F0E8
- 进度条: 渐变 #8B7A5A → #6B5A3A
- 分类 Tab: 激活态 #3A3530 底色 + 白字
- 列表分割: 水墨淡线 #D4C9B8

## 验收标准

- [ ] 技能面板 Modal 正常打开/关闭
- [ ] 4 个分类 Tab 正确筛选技能
- [ ] 技能列表项显示等级 + 经验进度条
- [ ] 映射状态正确标记
- [ ] 招式详情弹窗显示招式列表
- [ ] 已解锁/未解锁招式正确区分
- [ ] 属性加成汇总正确显示
- [ ] 水墨风样式一致
- [ ] 遵循 Unity3D 组件模型

## 📋 API 契约片段（来自 Design Doc）

> ⚠️ 以下契约已在 Design Doc 中锁定，实现时必须严格遵守。

### 输入数据（从 Store 取）

```typescript
// useSkillStore
{
  skills: PlayerSkillInfo[];
  skillMap: Record<string, string>;
  activeForce: string | null;
  bonusSummary: SkillBonusSummary | null;
}
```

### PlayerSkillInfo

```typescript
interface PlayerSkillInfo {
  skillId: string;
  skillName: string;
  skillType: string; // SkillSlotType 值
  category: string; // SkillCategory 值
  level: number;
  learned: number;
  learnedMax: number; // (level+1)²
  isMapped: boolean;
  mappedSlot: string | null;
  isActiveForce: boolean;
  isLocked: boolean;
}
```

### SkillBonusSummary

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

### SkillDetailInfo（招式详情）

```typescript
interface SkillDetailInfo {
  skillId: string;
  skillName: string;
  description: string;
  actions: ActionDetailInfo[];
}

interface ActionDetailInfo {
  skillName: string; // 招式名
  description: string;
  lvl: number; // 解锁等级
  unlocked: boolean;
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

### 发送消息

```typescript
// 打开面板时
WebSocketService.send({
  type: 'skillPanelRequest',
  data: {},
});

// 查看技能详情时
WebSocketService.send({
  type: 'skillPanelRequest',
  data: { detailSkillId: 'bagua-zhang' },
});
```

### 分类显示映射

| SkillCategory | Tab 名称 | 子分组                                                      |
| ------------- | -------- | ----------------------------------------------------------- |
| `martial`     | 武学     | 兵刃(weaponMartial) / 空手(unarmedMartial) / 身法(movement) |
| `internal`    | 内功     | 无                                                          |
| `support`     | 辅技     | 无                                                          |
| `cognize`     | 悟道     | 无                                                          |

## 代码参考

- 现有 Modal 组件: `client/src/components/game/QuestListModal/index.tsx`
- 现有列表项: `client/src/components/game/NpcList/ItemCard.tsx`
- 现有进度条: `client/src/components/game/QuestListModal/ObjectiveProgress.tsx`
- SKILL_SLOT_NAMES: 从 core 导入显示名

## 相关文档

- Design Doc: #224 (前端设计 — SkillPanel 组件结构)
- PRD: #223 (R6 技能面板 UI)
