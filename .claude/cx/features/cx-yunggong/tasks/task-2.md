# Task 2: 效果基类 + 注册表 + InternalSkillBase 扩展

## 关联

- Part of feature: 运功（内功特殊功能）
- Phase: 2 — Engine 效果框架
- Depends on: Task 1

## 任务描述

创建运功效果的核心框架：抽象基类 `ExertEffectBase`、`@ExertEffect` 装饰器和 `ExertEffectRegistry` 单例注册表。同时修改 `InternalSkillBase` 新增 `getExertEffects()` 虚方法。

这个框架是所有具体效果实现（Task 3-5）的基础。

## 目标文件

### 新建文件

1. `server/src/engine/exert/exert-effect-base.ts` — ExertEffectBase 抽象基类 + ExertExecuteResult 接口 + @ExertEffect 装饰器
2. `server/src/engine/exert/exert-effect-registry.ts` — ExertEffectRegistry 单例

### 修改文件

3. `server/src/engine/skills/internal/internal-skill-base.ts` — 新增 `getExertEffects(): string[]` 方法

## 验收标准

- [ ] ExertEffectBase 抽象类包含: name, displayName, isUniversal, canUseInCombat, execute(), getDescription()
- [ ] ExertExecuteResult 接口与 ExertResultData 字段对齐（除 effectName/displayName 外）
- [ ] @ExertEffect 装饰器自动实例化并注册到 ExertEffectRegistry
- [ ] ExertEffectRegistry 提供 get(name), getAll(), getUniversal() 方法
- [ ] InternalSkillBase 新增 getExertEffects() 方法，默认返回空数组
- [ ] 现有测试不回归

## 📋 契约片段（来自 Design Doc）

> ⚠️ 以下契约已在 Design Doc 中锁定，实现时必须严格遵守。

### ExertExecuteResult 接口

```typescript
export interface ExertExecuteResult {
  success: boolean;
  message: string; // 富文本
  resourceChanged: boolean;
  buffApplied?: { name: string; duration: number; bonuses: Record<string, number> };
  buffRemoved?: string;
  healingStarted?: boolean;
  healingStopped?: boolean;
}
```

### ExertEffectBase 抽象类

```typescript
export abstract class ExertEffectBase {
  abstract readonly name: string;
  abstract readonly displayName: string;
  abstract readonly isUniversal: boolean;
  abstract readonly canUseInCombat: boolean;

  abstract execute(
    player: PlayerBase,
    forceSkillId: string,
    forceLevel: number,
    target?: string,
  ): ExertExecuteResult;

  abstract getDescription(): string;
}
```

### @ExertEffect 装饰器

```typescript
export function ExertEffect() {
  return function <T extends { new (...args: any[]): ExertEffectBase }>(constructor: T) {
    const instance = new constructor();
    ExertEffectRegistry.getInstance().register(instance);
    return constructor;
  };
}
```

### ExertEffectRegistry

```typescript
export class ExertEffectRegistry {
  private static instance: ExertEffectRegistry;
  private effects: Map<string, ExertEffectBase> = new Map();

  static getInstance(): ExertEffectRegistry { ... }
  register(effect: ExertEffectBase): void { ... }
  get(name: string): ExertEffectBase | undefined { ... }
  getAll(): ExertEffectBase[] { ... }
  getUniversal(): ExertEffectBase[] { ... }
}
```

### InternalSkillBase 新增

```typescript
getExertEffects(): string[] {
  return [];
}
```

## 代码参考

- InternalSkillBase 当前实现: `server/src/engine/skills/internal/internal-skill-base.ts`
- 类似装饰器模式: `packages/core/src/factory/MessageFactory.ts` 的 @MessageHandler
- BaseEntity tmpDbase API: `server/src/engine/base-entity.ts:99-124`

## 相关文档

- Design Doc: `.claude/cx/features/cx-yunggong/design.md`
- PRD R2: 效果注册框架
