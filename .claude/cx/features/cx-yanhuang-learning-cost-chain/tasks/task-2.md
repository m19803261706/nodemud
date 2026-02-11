# Task 2: learnedPoints 持久化与登录初始化全链路

## 关联

- Part of feature: 炎黄学习消耗链路复刻
- Phase: 1 — 契约与数据层基础
- Depends on: 无
- Parallel with: Task 1
- Scope: #239

## 任务描述

打通 `learnedPoints <-> learned_points` 的实体、登录初始化、存档写回链路，满足“登录即完整初始化”原则，避免学习潜能预算在重登后丢失。

## 目标文件

### 修改文件

1. `server/src/character/character.entity.ts`
2. `server/src/websocket/handlers/stats.utils.ts`
3. `server/src/character/character.service.ts`
4. `server/src/websocket/handlers/__tests__/stats.utils.spec.ts`

## 验收标准

- [ ] `Character` 增加 `learnedPoints` 字段（默认 0，非负整数）
- [ ] `loadCharacterToPlayer` 将 `learnedPoints` 映射到 `player.learned_points`
- [ ] `savePlayerData` 将 `player.learned_points` 写回 `character.learnedPoints`
- [ ] 历史角色（无 learnedPoints）加载时自动兜底为 0
- [ ] `playerStats.potential` 输出可用潜能（`potential - learned_points`，最小为 0）
- [ ] 存档链路继续复用 `CharacterService.savePlayerDataToDB`，不新增分叉入口

## 📋 契约片段（来自 PRD）

### 持久化映射

```ts
Character.learnedPoints: number;
PlayerRuntime.learned_points: number;

load:  player.learned_points = character.learnedPoints ?? 0;
save:  character.learnedPoints = max(0, floor(player.learned_points ?? 0));
```

### 对外展示

```ts
playerStats.potential = max(0, potential - learned_points);
```

## 代码参考

- 炎黄潜能预算基准：`参考mud代码/mud/cmds/skill/learn.c`
- 当前项目初始化链路：`server/src/websocket/handlers/stats.utils.ts`
- 当前项目存档链路：`server/src/character/character.service.ts`

## 相关文档

- PRD: `.claude/cx/features/cx-yanhuang-learning-cost-chain/prd.md`（R1、R8）
