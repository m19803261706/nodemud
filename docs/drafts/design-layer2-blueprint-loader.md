# Design Doc: Layer 2 — BlueprintLoader 蓝图加载系统

## 关联

- PRD: #55
- Scope: #54
- 关联 Epic: #49 Layer 1（closed）、#38 Layer 0（closed）
- 项目蓝图: #1

## 基于现有代码

### 可复用模块

| 模块             | 路径                                     | 复用方式                                                                      |
| ---------------- | ---------------------------------------- | ----------------------------------------------------------------------------- |
| BaseEntity       | `server/src/engine/base-entity.ts`       | 蓝图类的基类，abstract class，已有 `onHeartbeat()/onReset()/onCleanUp()` 钩子 |
| ObjectManager    | `server/src/engine/object-manager.ts`    | `nextInstanceId(blueprintId)` 生成克隆 ID，`register(entity)` 注册实例        |
| HeartbeatManager | `server/src/engine/heartbeat-manager.ts` | 蓝图 `create()` 中 `enableHeartbeat()` 注册心跳                               |
| ServiceLocator   | `server/src/engine/service-locator.ts`   | 已预留 Layer 2 注释槽位，`initialize()` 需扩展参数                            |
| EngineModule     | `server/src/engine/engine.module.ts`     | 注册 Layer 2 providers，`onModuleInit()` 扩展启动流程                         |

### 需修改的接口

- `BaseEntity` — abstract → 非 abstract（蓝图类需要直接实例化 `export default class extends BaseEntity`）；新增 `create()` 空方法
- `ServiceLocator.initialize()` — 参数类型扩展，新增 3 个 Layer 2 服务
- `ServiceLocator.reset()` — 新增 3 个服务的重置
- `EngineModule` — providers/exports 扩展，`onModuleInit()` 新增 `scanAndLoad()` 调用

## 架构概览

```
                    EngineModule.onModuleInit()
                           │
                           ▼
              ┌─────────────────────────┐
              │  BlueprintLoader        │
              │  .scanAndLoad(worldDir) │
              └────────┬────────────────┘
                       │  递归扫描 world/**/*.js
                       │  import() + 推断 ID
                       ▼
              ┌─────────────────────────┐
              │  BlueprintRegistry      │
              │  .register(meta)        │◀─── 存储 BlueprintMeta
              └────────┬────────────────┘
                       │  virtual=true 的蓝图
                       ▼
              ┌─────────────────────────┐
              │  BlueprintFactory       │
              │  .createVirtual(id)     │──→ new Class(id) → create() → ObjectManager.register()
              │  .clone(id)             │──→ new Class(nextInstanceId) → create() → ObjectManager.register()
              │  .getVirtual(id)        │──→ Registry.get(id).instance
              └─────────────────────────┘
```

**数据流**：

```
蓝图文件 (.ts) ──编译──> .js ──import()──> BlueprintClass
                                              │
                                  BlueprintLoader 提取元数据
                                              │
                                              ▼
                                    BlueprintRegistry 存储
                                              │
                              ┌────────────────┴────────────────┐
                              │                                 │
                        virtual=true                     virtual=false
                              │                                 │
                   Factory.createVirtual()            Factory.clone() (按需)
                   创建单例，保存到 meta.instance     创建新实例，ID 带 #N 后缀
```

## 后端设计

### 代码路径

```
server/src/engine/
├── base-entity.ts                    # 修改: abstract → 非abstract, 新增 create()
├── service-locator.ts                # 修改: 新增 Layer 2 服务
├── engine.module.ts                  # 修改: 注册 Layer 2 + scanAndLoad
├── blueprint-registry.ts             # 新增: 蓝图注册表
├── blueprint-loader.ts               # 新增: 蓝图扫描加载器
├── blueprint-factory.ts              # 新增: 对象创建工厂
├── types/
│   └── blueprint-meta.ts             # 新增: BlueprintMeta 接口
└── __tests__/
    ├── blueprint-registry.spec.ts    # 新增
    ├── blueprint-loader.spec.ts      # 新增
    └── blueprint-factory.spec.ts     # 新增

server/src/world/                      # 新增: 蓝图目录（本层仅结构）
├── area/                              # 房间蓝图
├── npc/                               # NPC 蓝图
└── item/                              # 物品蓝图
```

### 关键类型定义

```typescript
// server/src/engine/types/blueprint-meta.ts

import type { BaseEntity } from '../base-entity';

/** 蓝图元数据 */
export interface BlueprintMeta {
  /** 蓝图 ID（路径推断，如 "area/yangzhou/inn"） */
  id: string;

  /** 编译后的 .js 文件绝对路径 */
  filePath: string;

  /** 蓝图类引用（BaseEntity 的子类构造函数） */
  blueprintClass: new (id: string) => BaseEntity;

  /** 是否虚拟对象（true=单例，false=可克隆） */
  virtual: boolean;

  /** 虚拟对象的单例实例引用（仅 virtual=true 时有值） */
  instance?: BaseEntity;
}
```

### 关键类/模块

#### 1. BlueprintRegistry

```typescript
// server/src/engine/blueprint-registry.ts

@Injectable()
export class BlueprintRegistry {
  private readonly blueprints: Map<string, BlueprintMeta> = new Map();

  /** 注册蓝图，ID 重复时抛出错误 */
  register(meta: BlueprintMeta): void;

  /** 注销蓝图 */
  unregister(id: string): void;

  /** 按 ID 查询 */
  get(id: string): BlueprintMeta | undefined;

  /** 是否已注册 */
  has(id: string): boolean;

  /** 获取所有蓝图 */
  getAll(): BlueprintMeta[];

  /** 已注册数量 */
  getCount(): number;

  /** 清空注册表 */
  clear(): void;
}
```

#### 2. BlueprintLoader

```typescript
// server/src/engine/blueprint-loader.ts

/** 蓝图加载器配置注入 token */
export const BLUEPRINT_LOADER_CONFIG = 'BLUEPRINT_LOADER_CONFIG';

export interface BlueprintLoaderConfig {
  /** world 目录相对于 dist 的路径，默认 'world' */
  worldDir?: string;
}

@Injectable()
export class BlueprintLoader {
  private readonly logger = new Logger(BlueprintLoader.name);
  private worldBasePath: string; // 运行时 world/ 的绝对路径

  constructor(
    private readonly registry: BlueprintRegistry,
    private readonly factory: BlueprintFactory,
    @Optional() @Inject(BLUEPRINT_LOADER_CONFIG) config?: BlueprintLoaderConfig,
  ) {}

  /**
   * 扫描并加载所有蓝图
   * @param worldDir world 目录绝对路径（编译后的 dist/world/）
   */
  async scanAndLoad(worldDir: string): Promise<void>;

  /**
   * 加载单个蓝图文件
   * @param filePath .js 文件绝对路径
   * @returns 蓝图元数据
   */
  async loadBlueprint(filePath: string): Promise<BlueprintMeta>;

  /**
   * 热更新蓝图
   * @param blueprintId 蓝图 ID
   */
  async update(blueprintId: string): Promise<void>;

  /**
   * 从文件路径推断蓝图 ID
   * 规则: 相对于 worldBasePath，去掉后缀
   * 例: /abs/dist/world/area/yangzhou/inn.js → "area/yangzhou/inn"
   */
  private inferBlueprintId(filePath: string): string;

  /**
   * 递归扫描目录下所有 .js 文件
   */
  private async scanDirectory(dir: string): Promise<string[]>;
}
```

**scanAndLoad 流程**：

```
async scanAndLoad(worldDir):
  1. this.worldBasePath = worldDir
  2. filePaths = await scanDirectory(worldDir)  // 递归扫描 .js 文件
  3. for filePath of filePaths:
     a. meta = await loadBlueprint(filePath)
     b. if meta.virtual:
        - instance = factory.createVirtual(meta.id)
        - meta.instance = instance
     c. logger.log(`已加载蓝图: ${meta.id} (${meta.virtual ? '虚拟' : '克隆'})`)
  4. logger.log(`蓝图加载完成: ${registry.getCount()} 个蓝图`)
```

**loadBlueprint 流程**：

```
async loadBlueprint(filePath):
  1. module = await import(filePath)
  2. BlueprintClass = module.default
  3. 验证: BlueprintClass 必须存在且是函数
  4. 验证: BlueprintClass.prototype instanceof BaseEntity（或通过鸭子类型检查）
  5. id = inferBlueprintId(filePath)
  6. virtual = BlueprintClass.virtual ?? false
  7. meta = { id, filePath, blueprintClass: BlueprintClass, virtual }
  8. registry.register(meta)
  9. return meta
```

**update 流程（虚拟对象）**：

```
async update(blueprintId):
  1. oldMeta = registry.get(blueprintId)
  2. if !oldMeta: throw Error
  3. // 清除 require.cache
  4. delete require.cache[require.resolve(oldMeta.filePath)]
  5. // 重新加载
  6. module = await import(oldMeta.filePath)
  7. NewClass = module.default
  8. // 更新 registry
  9. newMeta = { ...oldMeta, blueprintClass: NewClass }
  10. if oldMeta.virtual && oldMeta.instance:
      a. instance = oldMeta.instance
      b. instance.setDbase({})       // 清 dbase
      c. instance.setTemp 全部清除    // 清 tmpDbase（需要 clearTmpDbase 方法）
      d. NewClass.prototype.create.call(instance)  // 用新类的 create() 重设属性
      e. newMeta.instance = instance  // 保持同一实例引用
  11. registry.unregister(blueprintId)
  12. registry.register(newMeta)
  13. logger.log(`蓝图已更新: ${blueprintId}`)
```

**update 流程（克隆对象）**：

```
async update(blueprintId):
  // 步骤 1-8 同上
  // 步骤 9: 不处理已有克隆实例（旧实例继续运行）
  // 后续 clone() 使用新类
```

#### 3. BlueprintFactory

```typescript
// server/src/engine/blueprint-factory.ts

@Injectable()
export class BlueprintFactory {
  constructor(
    private readonly registry: BlueprintRegistry,
    private readonly objectManager: ObjectManager,
  ) {}

  /**
   * 创建虚拟对象（单例）
   * 由 BlueprintLoader.scanAndLoad 在启动时调用
   */
  createVirtual(blueprintId: string): BaseEntity;

  /**
   * 克隆对象（多实例）
   * 蓝图必须 virtual=false，否则抛错
   */
  clone(blueprintId: string): BaseEntity;

  /**
   * 获取虚拟对象实例
   */
  getVirtual(blueprintId: string): BaseEntity | undefined;
}
```

**createVirtual 流程**：

```
createVirtual(blueprintId):
  1. meta = registry.get(blueprintId)
  2. if !meta: throw Error('蓝图不存在')
  3. if !meta.virtual: throw Error('非虚拟蓝图不能创建虚拟对象')
  4. instance = new meta.blueprintClass(blueprintId)
  5. objectManager.register(instance)
  6. instance.create()
  7. return instance
```

**clone 流程**：

```
clone(blueprintId):
  1. meta = registry.get(blueprintId)
  2. if !meta: throw Error('蓝图不存在')
  3. if meta.virtual: throw Error('虚拟蓝图不可克隆')
  4. instanceId = objectManager.nextInstanceId(blueprintId)
  5. instance = new meta.blueprintClass(instanceId)
  6. objectManager.register(instance)
  7. instance.create()
  8. return instance
```

### BaseEntity 变更

```typescript
// base-entity.ts 修改

// 1. 移除 abstract 关键字
-export abstract class BaseEntity extends EventEmitter {
+export class BaseEntity extends EventEmitter {

// 2. 新增 create() 方法（在 onHeartbeat 附近）
  /** 蓝图初始化钩子（蓝图子类覆写设置初始属性） */
  public create(): void {}

// 3. 新增 clearTmpDbase() 方法（热更新需要）
  /** 清空临时属性（热更新用） */
  clearTmpDbase(): void {
    this.tmpDbase.clear();
  }
```

### ServiceLocator 变更

```typescript
// service-locator.ts 修改

import type { HeartbeatManager } from './heartbeat-manager';
import type { ObjectManager } from './object-manager';
+import type { BlueprintRegistry } from './blueprint-registry';
+import type { BlueprintLoader } from './blueprint-loader';
+import type { BlueprintFactory } from './blueprint-factory';

export class ServiceLocator {
  // Layer 1 服务
  static heartbeatManager: HeartbeatManager;
  static objectManager: ObjectManager;

- // Layer 2 服务（后续添加）
- // static blueprintLoader: BlueprintLoader;
+ // Layer 2 服务
+ static blueprintRegistry: BlueprintRegistry;
+ static blueprintLoader: BlueprintLoader;
+ static blueprintFactory: BlueprintFactory;

  static initialize(providers: {
    heartbeatManager: HeartbeatManager;
    objectManager: ObjectManager;
+   blueprintRegistry: BlueprintRegistry;
+   blueprintLoader: BlueprintLoader;
+   blueprintFactory: BlueprintFactory;
  }): void {
    this.heartbeatManager = providers.heartbeatManager;
    this.objectManager = providers.objectManager;
+   this.blueprintRegistry = providers.blueprintRegistry;
+   this.blueprintLoader = providers.blueprintLoader;
+   this.blueprintFactory = providers.blueprintFactory;
    this._initialized = true;
  }

  static reset(): void {
    this._initialized = false;
    this.heartbeatManager = undefined as any;
    this.objectManager = undefined as any;
+   this.blueprintRegistry = undefined as any;
+   this.blueprintLoader = undefined as any;
+   this.blueprintFactory = undefined as any;
  }
}
```

### EngineModule 变更

```typescript
// engine.module.ts 修改

+import { BlueprintRegistry } from './blueprint-registry';
+import { BlueprintLoader } from './blueprint-loader';
+import { BlueprintFactory } from './blueprint-factory';
+import * as path from 'path';

@Module({
- providers: [HeartbeatManager, ObjectManager],
- exports: [HeartbeatManager, ObjectManager],
+ providers: [HeartbeatManager, ObjectManager, BlueprintRegistry, BlueprintLoader, BlueprintFactory],
+ exports: [HeartbeatManager, ObjectManager, BlueprintRegistry, BlueprintLoader, BlueprintFactory],
})
export class EngineModule implements OnModuleInit {
  constructor(
    private readonly heartbeatManager: HeartbeatManager,
    private readonly objectManager: ObjectManager,
+   private readonly blueprintRegistry: BlueprintRegistry,
+   private readonly blueprintLoader: BlueprintLoader,
+   private readonly blueprintFactory: BlueprintFactory,
  ) {}

- onModuleInit() {
+ async onModuleInit() {
    ServiceLocator.initialize({
      heartbeatManager: this.heartbeatManager,
      objectManager: this.objectManager,
+     blueprintRegistry: this.blueprintRegistry,
+     blueprintLoader: this.blueprintLoader,
+     blueprintFactory: this.blueprintFactory,
    });
    this.objectManager.startGC();
+
+   // 扫描加载蓝图（world/ 目录在编译后的 dist/ 下）
+   const worldDir = path.join(__dirname, '..', 'world');
+   await this.blueprintLoader.scanAndLoad(worldDir);
+
-   this.logger.log('游戏引擎初始化完成（HeartbeatManager + ObjectManager + GC）');
+   this.logger.log('游戏引擎初始化完成（Layer 0-2: BaseEntity + HB/OM + Blueprint）');
  }
}
```

## 测试策略

### BlueprintRegistry 测试

| 测试场景            | 验证点         |
| ------------------- | -------------- |
| register + get      | 注册后能查到   |
| register 重复 ID    | 抛出错误       |
| unregister          | 注销后查不到   |
| has/getAll/getCount | 基础查询       |
| clear               | 清空后 count=0 |

### BlueprintLoader 测试

| 测试场景                         | 验证点                           |
| -------------------------------- | -------------------------------- |
| inferBlueprintId                 | 路径推断正确                     |
| loadBlueprint 正常文件           | 元数据正确（id、virtual、class） |
| loadBlueprint 无 default export  | 跳过并记录警告                   |
| loadBlueprint 非 BaseEntity 子类 | 跳过并记录警告                   |
| scanAndLoad 空目录               | 无报错，count=0                  |
| scanAndLoad 有蓝图               | 全部加载，虚拟对象自动创建       |
| update 虚拟对象                  | dbase 清空，create() 重新执行    |
| update 克隆对象                  | Registry 更新，旧实例不变        |
| update 不存在的蓝图              | 抛出错误                         |

测试需要在 `__tests__/fixtures/world/` 下创建测试用蓝图文件。

### BlueprintFactory 测试

| 测试场景                 | 验证点                                        |
| ------------------------ | --------------------------------------------- |
| createVirtual            | 创建单例，注册到 ObjectManager，调用 create() |
| createVirtual 非虚拟蓝图 | 抛错                                          |
| clone                    | 创建实例，ID 带 #N，注册到 ObjectManager      |
| clone 虚拟蓝图           | 抛错                                          |
| clone 多次               | ID 递增（#1, #2, #3）                         |
| getVirtual               | 返回单例引用                                  |
| 蓝图不存在               | 抛错                                          |

### BaseEntity 变更测试

| 测试场景            | 验证点        |
| ------------------- | ------------- |
| create() 默认空实现 | 调用不报错    |
| clearTmpDbase()     | tmpDbase 清空 |
| 现有 148 个测试     | 全部通过      |

## 影响范围

- **修改的已有文件**:
  - `server/src/engine/base-entity.ts` — 移除 abstract + 新增 create() + clearTmpDbase()
  - `server/src/engine/service-locator.ts` — 新增 Layer 2 服务
  - `server/src/engine/engine.module.ts` — 注册 Layer 2 + scanAndLoad

- **新增的文件**:
  - `server/src/engine/blueprint-registry.ts`
  - `server/src/engine/blueprint-loader.ts`
  - `server/src/engine/blueprint-factory.ts`
  - `server/src/engine/types/blueprint-meta.ts`
  - `server/src/engine/__tests__/blueprint-registry.spec.ts`
  - `server/src/engine/__tests__/blueprint-loader.spec.ts`
  - `server/src/engine/__tests__/blueprint-factory.spec.ts`
  - `server/src/engine/__tests__/fixtures/world/` — 测试用蓝图
  - `server/src/world/` — 蓝图目录结构

- **潜在冲突**: 修改 BaseEntity 从 abstract → 非 abstract 可能影响已有测试中的子类实现（现有测试使用 `class TestEntity extends BaseEntity`，移除 abstract 不影响子类化，反而更灵活）

## 风险点

- **NestJS DI 循环依赖**: BlueprintLoader 注入 BlueprintFactory，BlueprintFactory 注入 BlueprintRegistry，BlueprintLoader 也注入 BlueprintRegistry。需确认 NestJS 能正确解析（单向依赖链，无循环）
  - 应对: Loader → Registry + Factory，Factory → Registry + ObjectManager，无循环

- **require.cache 清除兼容性**: `delete require.cache[path]` 在 ESM 模块下可能不生效
  - 应对: NestJS 编译为 CJS（`tsconfig.json` 中 `module: commonjs`），`require.cache` 可用

- **编译路径差异**: TypeScript 源文件在 `src/world/`，编译后在 `dist/world/`，路径推断需基于 `dist/`
  - 应对: `EngineModule.onModuleInit()` 中使用 `path.join(__dirname, '..', 'world')` 获取 dist 下的绝对路径

- **空 world 目录**: Layer 2 不含示例蓝图，`scanAndLoad` 需要正确处理空目录或目录不存在的情况
  - 应对: 目录不存在时记录 warning 并跳过，不抛错

---

> CX 工作流 | Design Doc | PRD #55
