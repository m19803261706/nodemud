# Task 3: ExpManager 经验管理器

## 关联

- Part of feature: 任务系统 + 经验升级体系
- Phase: 2 — 后端核心引擎
- Design Doc: #219
- Depends on: Task 1, Task 2
- Parallel with: Task 4

## 任务描述

实现 ExpManager 全局单例，负责经验获取、升级检查、等级称号、属性加点和战斗经验衰减。注册到 ServiceLocator。

### 具体工作

1. **新建** `server/src/engine/quest/exp-manager.ts`
2. 实现升级公式：`level = floor(cbrt(exp * K)) + 1`
3. 实现 gainExp() — 增加经验 + 自动检查升级（支持跨级）
4. 实现 gainPotential() / gainScore()
5. 实现 checkLevelUp() — 升级时给 free_points + max_hp/max_mp 增长
6. 实现 allocatePoints() — 校验属性上限和点数
7. 实现 calculateCombatExp() — 等级差衰减
8. 实现 getLevelTitle() — 等级中文称号
9. 注册到 ServiceLocator（与 ObjectManager/CombatManager 同级）

## 验收标准

- [ ] ExpManager 注册到 ServiceLocator
- [ ] gainExp() 正确增加经验并自动触发升级
- [ ] 支持跨级升级（一次获得大量 exp 可连升多级）
- [ ] 每级获得 3 个 free_points + max_hp +50 + max_mp +30
- [ ] allocatePoints() 校验点数和属性上限
- [ ] calculateCombatExp() 按等级差返回正确的衰减后经验
- [ ] getLevelTitle() 返回正确的中文等级称号
- [ ] 升级后调用 sendPlayerStats() 推送前端
- [ ] TypeScript 编译通过

## 📋 契约片段（来自 Design Doc）

### 升级公式

```typescript
// K 系数待调参，初始值
private readonly K = 0.01;

getExpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.ceil(Math.pow(level - 1, 3) / this.K);
}

getLevelForExp(exp: number): number {
  return Math.floor(Math.cbrt(exp * this.K)) + 1;
}
```

### 升级奖励常量

```typescript
const POINTS_PER_LEVEL = 3; // 每级 3 个属性点
const HP_PER_LEVEL = 50; // 每级 max_hp +50
const MP_PER_LEVEL = 30; // 每级 max_mp +30
```

### 等级差衰减

```typescript
calculateCombatExp(playerLevel: number, npcLevel: number, baseExp: number): number {
  const diff = playerLevel - npcLevel;
  if (diff <= 3) return baseExp;                         // 同级或高 1-3 级，全额
  if (diff <= 5) return Math.floor(baseExp * 0.5);      // 高 4-5 级，50%
  if (diff <= 10) return Math.floor(baseExp * 0.2);     // 高 6-10 级，20%
  return 0;                                              // 高 10+ 级，无经验
}
```

### 等级称号表

| 等级范围 | 称号     |
| -------- | -------- |
| 1-4      | 初入江湖 |
| 5-9      | 小有名气 |
| 10-14    | 江湖新秀 |
| 15-19    | 侠名远播 |
| 20+      | 一代宗师 |

### allocatePoints 消息

```typescript
interface AllocatePointsData {
  allocations: {
    wisdom?: number;
    perception?: number;
    spirit?: number;
    meridian?: number;
    strength?: number;
    vitality?: number;
  };
}
```

成功 → sendPlayerStats()（属性更新 + freePoints 减少）
失败 → commandResult `success: false`（"属性点不足"或"超过属性上限"）

## 代码参考

- ServiceLocator：`server/src/engine/service-locator.ts`
- CombatManager 注册模式：参考 combat-manager 的单例注册方式
- sendPlayerStats：`server/src/websocket/handlers/stats.utils.ts` L104-110
- 六维属性上限：Character 实体中 wisdomCap/perceptionCap 等字段
- 当前 level 加载位置：`stats.utils.ts` L87 `player.set('level', 1)`
