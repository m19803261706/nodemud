# PRD: Layer 2 — BlueprintLoader 蓝图加载系统

## 基本信息

- **创建时间**: 2026-02-02
- **优先级**: P0（阻塞 Layer 3 游戏对象子类，核心引擎功能）
- **技术栈**: TypeScript + NestJS
- **代码位置**: `server/src/engine/`（加载系统）、`server/src/world/`（蓝图文件）
- **关联文档**: Scope #54（方案探讨定稿）、Epic #49 Layer 1（前置依赖，已完成）、Epic #38 Layer 0（前置依赖，已完成）

## 功能概述

BlueprintLoader 是游戏引擎的 Layer 2 蓝图加载系统，实现 **LPC/FluffOS 风格的蓝图机制**：

- 每个 TypeScript 类文件就是一个蓝图（对标 LPC 的 `.c` 文件）
- 文件路径即蓝图 ID（`world/npc/yangzhou/dianxiaoer.ts` → `npc/yangzhou/dianxiaoer`）
- 支持**虚拟对象**（单例，如房间）和**克隆对象**（多实例，如 NPC、物品）
- 支持运行时**热更新**（`update` 指令重新加载蓝图）

本层只实现加载机制（Registry + Loader + Factory），不包含具体游戏对象子类和示例蓝图（留给 Layer 3）。

## 用户场景

BlueprintLoader 不直接面向终端用户，而是为后续游戏系统提供蓝图加载和对象创建能力：

| 场景                   | 依赖的能力                                       | 示例                                                    |
| ---------------------- | ------------------------------------------------ | ------------------------------------------------------- |
| 服务启动加载游戏世界   | `BlueprintLoader.scanAndLoad()` 扫描 world/ 目录 | 启动时自动加载所有蓝图，创建虚拟对象                    |
| 创建 NPC 实例          | `BlueprintFactory.clone()` 克隆对象              | `clone('npc/yangzhou/dianxiaoer')` → NPC #1             |
| 获取房间单例           | `BlueprintFactory.getVirtual()` 获取虚拟对象     | `getVirtual('area/yangzhou/inn')` → 扬州客栈            |
| 开发者修改蓝图后热更新 | `BlueprintLoader.update()` 清缓存+重加载         | 修改房间描述 → `update('area/yangzhou/inn')` → 立即生效 |
| 查询蓝图信息           | `BlueprintRegistry.get()` 查元数据               | 查看某蓝图是虚拟对象还是克隆对象                        |

## 详细需求

### 1. BlueprintRegistry — 蓝图注册表

内存中的蓝图元数据存储，管理所有已加载蓝图的信息。

**功能点：**

- `register(meta)` — 注册蓝图元数据，ID 重复时抛出错误
- `unregister(id)` — 注销蓝图，不存在时静默忽略
- `get(id)` — 按 ID 查询蓝图元数据
- `has(id)` — 判断蓝图是否已注册
- `getAll()` — 获取所有蓝图元数据列表
- `getCount()` — 获取已注册蓝图数量

**元数据结构：**

```typescript
interface BlueprintMeta {
  id: string; // 蓝图 ID（路径推断）
  filePath: string; // 源文件绝对路径
  blueprintClass: typeof BaseEntity; // 蓝图类引用
  virtual: boolean; // 是否虚拟对象
  instance?: BaseEntity; // 虚拟对象的单例引用
}
```

### 2. BlueprintLoader — 蓝图扫描加载器

扫描 `world/` 目录，动态 import 蓝图文件，注册到 Registry。

**功能点：**

- `scanAndLoad(worldDir)` — 递归扫描目录下所有 `.js` 文件，加载并注册蓝图
  - 对每个文件：`import()` → 推断蓝图 ID → 读取 `static virtual` → 注册到 Registry
  - 对 `virtual=true` 的蓝图：创建单例实例 → 调用 `create()` → 注册到 ObjectManager
- `loadBlueprint(filePath)` — 加载单个蓝图文件
- `update(blueprintId)` — 热更新蓝图（清缓存 + 重加载 + 处理已有实例）

**路径推断规则：** `world/` 为根，去掉文件后缀，用 `/` 连接 = 蓝图 ID

**启动流程：** `EngineModule.onModuleInit()` → `BlueprintLoader.scanAndLoad(worldDir)`

### 3. BlueprintFactory — 对象创建工厂

从蓝图创建运行时对象实例。

**功能点：**

- `createVirtual(blueprintId)` — 创建虚拟对象（单例，启动时自动调用）
- `clone(blueprintId)` — 克隆对象（按需调用），虚拟对象不可克隆
- `getVirtual(blueprintId)` — 获取虚拟对象实例

**克隆流程：**

1. 从 Registry 获取 BlueprintMeta
2. 检查 `virtual=false`（虚拟对象不可克隆）
3. 生成 ID：`ObjectManager.nextInstanceId()` → `"blueprintId#N"`
4. `new BlueprintClass(id)` → `ObjectManager.register()` → `instance.create()`

### 4. 热更新机制

对标 LPC 的 `update` 命令：

**虚拟对象 update（reset 策略）：**

1. 清除 `require.cache` 中的旧模块
2. 重新 import 蓝图文件
3. 更新 Registry 中的类引用和元数据
4. 清除实例的 dbase 和 tmpDbase
5. 用新蓝图类的 `create()` 重新设置属性
6. 环境关系（inventory/environment）保持不变

**克隆对象 update：**

1. 清除 `require.cache` 中的旧模块
2. 重新 import 蓝图文件
3. 更新 Registry 中的类引用和元数据
4. 已有克隆实例不变（旧类继续运行）
5. 后续 `clone()` 调用使用新类

### 5. BaseEntity 变更

新增 `create()` 可覆写空方法：

```typescript
public create(): void {}
```

与现有钩子保持一致风格：`create()` / `onHeartbeat()` / `onReset()` / `onCleanUp()`

### 6. ServiceLocator 变更

新增 Layer 2 服务引用：

- `blueprintRegistry: BlueprintRegistry`
- `blueprintFactory: BlueprintFactory`
- `blueprintLoader: BlueprintLoader`

### 7. EngineModule 变更

- 注册 BlueprintRegistry、BlueprintLoader、BlueprintFactory 为 providers 和 exports
- `onModuleInit()` 中调用 `blueprintLoader.scanAndLoad(worldDir)` 启动加载

## 关联文档

| 文档          | Issue | 状态   | 关键继承点                       |
| ------------- | ----- | ------ | -------------------------------- |
| Scope Layer 2 | #54   | open   | 全部方案决策来源                 |
| Epic Layer 1  | #49   | closed | HeartbeatManager + ObjectManager |
| Epic Layer 0  | #38   | closed | BaseEntity 基类                  |
| 项目蓝图      | #1    | open   | Layer 架构规划                   |

## 现有代码基础

### 可复用

| 模块             | 路径                                     | 复用方式                                              |
| ---------------- | ---------------------------------------- | ----------------------------------------------------- |
| BaseEntity       | `server/src/engine/base-entity.ts`       | 蓝图类继承基类，新增 `create()` 方法                  |
| ObjectManager    | `server/src/engine/object-manager.ts`    | `nextInstanceId()` 分配克隆 ID，`register()` 注册实例 |
| HeartbeatManager | `server/src/engine/heartbeat-manager.ts` | 蓝图 `create()` 中通过 `enableHeartbeat()` 注册       |
| ServiceLocator   | `server/src/engine/service-locator.ts`   | 新增 Layer 2 服务引用                                 |
| EngineModule     | `server/src/engine/engine.module.ts`     | 注册 Layer 2 providers                                |

### 需修改

- `base-entity.ts` — 新增 `create()` 空方法
- `service-locator.ts` — 新增 3 个 Layer 2 服务引用
- `engine.module.ts` — 注册 Layer 2 providers，`onModuleInit` 调用 `scanAndLoad`

### 需新建

- `server/src/engine/blueprint-registry.ts` — 蓝图注册表
- `server/src/engine/blueprint-loader.ts` — 蓝图扫描加载器
- `server/src/engine/blueprint-factory.ts` — 对象创建工厂
- `server/src/engine/__tests__/blueprint-registry.spec.ts` — 注册表测试
- `server/src/engine/__tests__/blueprint-loader.spec.ts` — 加载器测试
- `server/src/engine/__tests__/blueprint-factory.spec.ts` — 工厂测试
- `server/src/world/` — 蓝图目录（Layer 2 阶段仅创建目录结构，不含示例蓝图）

## 代码影响范围

- **后端服务**: `server/src/engine/` — 新增 3 个核心类 + 修改 3 个已有文件
- **目录结构**: 新建 `server/src/world/` 蓝图目录
- **前端界面**: 无影响
- **数据层**: 无影响

## 任务拆分（初步）

- [ ] 新增 `BaseEntity.create()` 空方法
- [ ] 实现 BlueprintRegistry 蓝图注册表 + 测试
- [ ] 实现 BlueprintLoader 扫描加载器 + 测试
- [ ] 实现 BlueprintFactory 对象创建工厂 + 测试
- [ ] 实现热更新机制（虚拟对象 reset + 克隆对象蓝图替换）
- [ ] ServiceLocator + EngineModule 集成
- [ ] 创建 `server/src/world/` 目录结构

## 验收标准

- [ ] BlueprintRegistry 能注册/注销/查询蓝图元数据
- [ ] BlueprintLoader 能递归扫描目录并加载所有蓝图文件
- [ ] 虚拟对象在启动时自动创建单例并注册到 ObjectManager
- [ ] BlueprintFactory.clone() 能从蓝图创建新实例，ID 格式 `blueprintId#N`
- [ ] 虚拟对象不可克隆（clone 时抛错或返回错误）
- [ ] 热更新：虚拟对象 update 后 dbase 被重置，环境关系保持不变
- [ ] 热更新：克隆对象 update 后旧实例不变，新 clone 使用新类
- [ ] 蓝图 ID 由文件路径正确推断
- [ ] 蓝图类必须 export default 且继承 BaseEntity（否则加载时报错跳过）
- [ ] 所有新代码有完整单元测试，现有 148 个测试不受影响
- [ ] 后端能正常启动（NestJS DI 无报错）

## 边界和约束

- 蓝图 `.ts` 文件在 `server/src/world/` 下，随 NestJS 一起编译为 `.js`
- BlueprintLoader 实际加载的是编译后的 `.js` 文件
- 热更新清除的是 Node.js 的 `require.cache`，对 `nest start --watch` 开发模式兼容
- 蓝图类必须 `export default`，必须继承 BaseEntity（或其子类）
- 蓝图 ID 由文件路径推断，不允许同 ID 注册两个蓝图
- `static virtual` 不声明时默认 `false`（克隆对象）
- `create()` 为同步方法（对标 LPC 的同步 `create()`）

## 开放问题

- `world/` 下是否需要 `.gitkeep` 或 `README.md` 占位？
- 后续 Layer 3 的 `init()` 钩子是否需要在本层预留？

---

> CX 工作流 | PRD | Scope #54
