# Task 8: 前端 Store 消息订阅

## 关联

- Part of feature: 运功（内功特殊功能）
- Phase: 5 — 测试 + 前端
- Depends on: Task 1
- Parallel with: Task 7

## 任务描述

在前端 Zustand Store 的 WebSocket 消息处理中新增 `exertResult` 消息类型的订阅处理。本期仅做 GameLog 展示，不新增 UI 组件。

## 目标文件

### 修改文件

1. `client/src/stores/useGameStore.ts` — 新增 exertResult case

## 验收标准

- [ ] WebSocket 消息处理中新增 `exertResult` case
- [ ] exertResult 消息的 message 字段添加到 gameLog
- [ ] 导入 ExertResultData 类型（从 @packages/core）
- [ ] 不新增任何 UI 组件
- [ ] 不破坏现有消息处理逻辑

## 📋 契约片段（来自 Design Doc）

> ⚠️ 以下契约已在 Design Doc 中锁定，实现时必须严格遵守。

### 消息处理

```typescript
case 'exertResult': {
  const data = msg.data as ExertResultData;
  // 添加到 gameLog（展示 message 文本）
  addGameLog(data.message);
  // resourceChanged 时前端会通过 playerStats 消息自动更新
  break;
}
```

### 前端行为

| 字段                                      | 前端行为                                                        |
| ----------------------------------------- | --------------------------------------------------------------- |
| `success: true` + `resourceChanged: true` | GameLog 显示 message，PlayerStats 通过 playerStats 消息自动更新 |
| `success: false`                          | GameLog 显示失败 message                                        |
| `buffApplied`                             | GameLog 显示 buff 信息（本期不做图标）                          |
| `buffRemoved`                             | GameLog 显示 buff 移除信息                                      |
| `healingStarted: true`                    | GameLog 提示疗伤开始                                            |
| `healingStopped: true`                    | GameLog 提示疗伤结束                                            |

### ExertResultData 字段

| #   | 字段              | 类型                   | 必填 |
| --- | ----------------- | ---------------------- | ---- |
| 1   | `effectName`      | `string`               | ✅   |
| 2   | `displayName`     | `string`               | ✅   |
| 3   | `success`         | `boolean`              | ✅   |
| 4   | `message`         | `string`               | ✅   |
| 5   | `resourceChanged` | `boolean`              | ✅   |
| 6   | `buffApplied`     | `object \| undefined`  | ❌   |
| 7   | `buffRemoved`     | `string \| undefined`  | ❌   |
| 8   | `healingStarted`  | `boolean \| undefined` | ❌   |
| 9   | `healingStopped`  | `boolean \| undefined` | ❌   |

## 代码参考

- useGameStore: `client/src/stores/useGameStore.ts`
- 现有消息处理模式: 查看 store 中已有的 case（如 skillLearnResult、practiceUpdate 等）

## 相关文档

- Design Doc: `.claude/cx/features/cx-yunggong/design.md` (前端设计章节)
- PRD: R9 (exertResult 消息类型)
