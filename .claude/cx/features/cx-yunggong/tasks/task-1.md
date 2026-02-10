# Task 1: Core 共享类型定义 + 消息处理器

## 关联

- Part of feature: 运功（内功特殊功能）
- Phase: 1 — Core 共享层

## 任务描述

在 `packages/core` 中创建运功系统所需的共享类型定义、枚举常量和消息处理器。这是整个运功系统的基础，后续所有后端和前端任务都依赖此任务的产出。

完成后需执行 `pnpm build`（在 packages/core 目录下）确保编译通过。

## 目标文件

### 新建文件

1. `packages/core/src/types/exert-constants.ts` — ExertEffectType 枚举 + EXERT_EFFECT_META 元信息
2. `packages/core/src/types/messages/exert.ts` — ExertResultData 接口 + ExertResultMessage 类型
3. `packages/core/src/factory/handlers/exertResult.ts` — @MessageHandler('exertResult') 处理器

### 修改文件

4. `packages/core/src/types/index.ts` — 添加 `export * from './exert-constants'`
5. `packages/core/src/types/messages/index.ts` — 添加 `export * from './exert'`
6. `packages/core/src/factory/index.ts` — 添加 `import './handlers/exertResult'`

## 验收标准

- [ ] ExertEffectType 枚举包含 5 个值：RECOVER, HEAL, REGENERATE, SHIELD, POWERUP
- [ ] EXERT_EFFECT_META 常量包含每个效果的 displayName、isUniversal、canUseInCombat
- [ ] ExertResultData 接口包含全部 9 个字段（5 必填 + 4 可选）
- [ ] ExertResultMessage extends ServerMessage，type 为 'exertResult'
- [ ] exertResult 消息处理器使用 @MessageHandler 装饰器注册
- [ ] 处理器 validate 方法校验全部 5 个必填字段
- [ ] `cd packages/core && pnpm build` 编译通过
- [ ] ✅ 枚举值与状态枚举对照表一致
- [ ] ✅ 字段名与数据字段映射表一致

## 📋 契约片段（来自 Design Doc）

> ⚠️ 以下契约已在 Design Doc 中锁定，实现时必须严格遵守。

### 状态枚举

```typescript
export enum ExertEffectType {
  RECOVER = 'recover', // 调匀气息
  HEAL = 'heal', // 运功疗伤
  REGENERATE = 'regenerate', // 提振精神
  SHIELD = 'shield', // 护体
  POWERUP = 'powerup', // 强化
}

export const EXERT_EFFECT_META: Record<
  ExertEffectType,
  {
    displayName: string;
    isUniversal: boolean;
    canUseInCombat: boolean;
  }
> = {
  [ExertEffectType.RECOVER]: { displayName: '调匀气息', isUniversal: true, canUseInCombat: true },
  [ExertEffectType.HEAL]: { displayName: '运功疗伤', isUniversal: true, canUseInCombat: false },
  [ExertEffectType.REGENERATE]: {
    displayName: '提振精神',
    isUniversal: true,
    canUseInCombat: false,
  },
  [ExertEffectType.SHIELD]: { displayName: '护体', isUniversal: false, canUseInCombat: false },
  [ExertEffectType.POWERUP]: { displayName: '强化', isUniversal: false, canUseInCombat: false },
};
```

### 字段映射

| #   | 字段              | 类型                                                                               | 必填 | 说明             |
| --- | ----------------- | ---------------------------------------------------------------------------------- | ---- | ---------------- |
| 1   | `effectName`      | `string`                                                                           | ✅   | 效果标识         |
| 2   | `displayName`     | `string`                                                                           | ✅   | 中文名           |
| 3   | `success`         | `boolean`                                                                          | ✅   | 是否成功         |
| 4   | `message`         | `string`                                                                           | ✅   | 富文本结果描述   |
| 5   | `resourceChanged` | `boolean`                                                                          | ✅   | 是否引发资源变化 |
| 6   | `buffApplied`     | `{ name: string; duration: number; bonuses: Record<string, number> } \| undefined` | ❌   | buff 信息        |
| 7   | `buffRemoved`     | `string \| undefined`                                                              | ❌   | 移除的 buff 名   |
| 8   | `healingStarted`  | `boolean \| undefined`                                                             | ❌   | 开始持续疗伤     |
| 9   | `healingStopped`  | `boolean \| undefined`                                                             | ❌   | 停止持续疗伤     |

### 消息处理器参考

参考 `packages/core/src/factory/handlers/skillLearnResult.ts` 的模式：

- `@MessageHandler('exertResult')` 装饰器
- `create(data)` 返回 `{ type: 'exertResult', data, timestamp: Date.now() }`
- `validate(data)` 校验 5 个必填字段类型

## 代码参考

- 消息处理器模式: `packages/core/src/factory/handlers/skillLearnResult.ts`
- 消息类型模式: `packages/core/src/types/messages/skill.ts`
- 枚举常量模式: `packages/core/src/types/skill-constants.ts`
- 工厂导入入口: `packages/core/src/factory/index.ts`

## 相关文档

- Design Doc: `.claude/cx/features/cx-yunggong/design.md`
- PRD: `.claude/cx/features/cx-yunggong/prd.md`
