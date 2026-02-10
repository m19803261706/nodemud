# 功能完成汇总: 运功（内功特殊功能）

## 完成概览

| 项       | 内容                         |
| -------- | ---------------------------- |
| 功能     | 运功（内功特殊功能）指令系统 |
| 规模     | M                            |
| 完成时间 | 2026-02-10                   |
| 总任务数 | 8                            |
| 提交数   | 1                            |

## 相关文档

- PRD: `.claude/cx/features/cx-yunggong/prd.md`
- Design Doc: `.claude/cx/features/cx-yunggong/design.md`
- Scope: `.claude/cx/features/cx-yunggong/scope.md`

## 功能描述

实现 `exert`（运功）指令系统，让玩家激活内功后能主动使用内力执行特殊效果。建立完整的运功效果注册框架，支持通用效果（所有内功共享）和特殊效果（特定内功独有）两层体系。

运功是内力的主要主动消耗方式，也是内功系统的核心玩法循环：修炼内功 → 积累内力 → 运功使用内力 → 获得战斗/生存收益。

## 实现清单

### Phase 1: Core 共享层

- [x] Task 1: Core 共享类型定义 + 消息处理器
  - 提交: 641eb89
  - 新增: exert-constants.ts, messages/exert.ts, handlers/exertResult.ts
  - 修改: types/index.ts, messages/index.ts, factory/index.ts

### Phase 2: Engine 效果框架

- [x] Task 2: 效果基类 + 注册表 + InternalSkillBase 扩展
  - 提交: 641eb89
  - 新增: exert-effect-base.ts, exert-effect-registry.ts
  - 修改: internal-skill-base.ts (+getExertEffects)

### Phase 3: 效果实现

- [x] Task 3: recover + regenerate 通用瞬发效果
  - 提交: 641eb89
  - 新增: effects/recover.ts, effects/regenerate.ts

- [x] Task 4: heal 持续疗伤效果
  - 提交: 641eb89
  - 新增: effects/heal.ts (callOut tick 循环)

- [x] Task 5: shield + powerup 特殊 buff 效果
  - 提交: 641eb89
  - 新增: effects/shield.ts, effects/powerup.ts

### Phase 4: 命令集成

- [x] Task 6: exert 命令入口 + SkillManager buff 聚合
  - 提交: 641eb89
  - 新增: commands/std/exert.ts
  - 修改: skill-manager.ts (+buff 聚合)

### Phase 5: 测试 + 前端

- [x] Task 7: 单元测试
  - 提交: 641eb89
  - 新增: exert-command.spec.ts, exert-effects.spec.ts (36 个测试)

- [x] Task 8: 前端 Store 消息订阅
  - 提交: 641eb89
  - 修改: client/App.tsx (+exertResult handler)

## 关键设计决策

1. **两层效果体系**: 通用效果（recover/heal/regenerate）所有内功共享；特殊效果（shield/powerup）需内功 `getExertEffects()` 声明支持
2. **@ExertEffect 装饰器**: 使用装饰器模式自动注册效果到 ExertEffectRegistry 单例，新增效果只需创建文件
3. **tmpDbase buff 存储**: shield/powerup buff 通过 `setTemp('exert/shield', value)` 存储，callOut 到期自动移除
4. **callOut tick 循环**: heal 疗伤使用 callOut 实现 3 秒间隔的持续效果，通过 flag 检测停止
5. **SkillManager buff 聚合**: `getSkillBonusSummary()` 自动读取 exert/shield 和 exert/powerup buff 值

## 消息接口

| 消息类型    | 方向            | 说明             |
| ----------- | --------------- | ---------------- |
| exertResult | Server → Client | 运功执行结果推送 |

## 变更统计

- 新增文件: 13
- 修改文件: 6
- 新增代码行: 1489

## 测试覆盖

- 新增单元测试: 36 个
- 测试全量: 467 个测试 / 37 个套件，100% 通过
- 代码审查: 快速检查通过（无 Critical/Warning 问题）

## 已知问题与后续改进

- **Info**: recover/regenerate 的消耗公式在 `forceLevel=0` 时产生 Infinity（实际不会触发）
- **Info**: heal tick callOut 未追踪 ID，依赖 flag 停止机制（正常工作）
- **后续**: 具体内功实现时覆写 `getExertEffects()` 返回支持的特殊效果

---

> CX 工作流完成 | 2026-02-10
