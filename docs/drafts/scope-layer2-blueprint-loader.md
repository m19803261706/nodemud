# 功能探讨: Layer 2 — BlueprintLoader 蓝图加载系统

## 基本信息

- **创建时间**: 2026-02-02
- **关联项目蓝图**: #1（NodeMUD 项目蓝图）
- **前置依赖**: Layer 0 BaseEntity (Epic #38, closed), Layer 1 HeartbeatManager + ObjectManager (Epic #49, closed)

## 功能目标

实现游戏引擎的 Layer 2 蓝图加载系统，将 TypeScript 类文件作为蓝图定义，支持虚拟对象（单例）和克隆对象（多实例），以及运行时热更新。

核心理念：**对标 LPC/FluffOS 的蓝图机制** — 每个 `.ts` 文件就是一个蓝图（类似 LPC 的 `.c` 文件），文件路径即蓝图 ID，通过 `update` 指令重新加载。

## 架构定位

```
┌─────────────────────────────────────────────────────┐
│  Layer 0: BaseEntity ✅ 已完成                       │
│  动态属性（dbase）/ 环境系统 / 事件系统              │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────┴─────────────────────────────┐
│  Layer 1: HeartbeatManager + ObjectManager ✅ 已完成  │
│  全局心跳调度 / 对象注册表 / GC 三级清理              │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────┴─────────────────────────────┐
│  Layer 2: BlueprintLoader ← 本次                     │
│  蓝图扫描加载 / 虚拟对象+克隆 / 热更新               │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────┴─────────────────────────────┐
│  Layer 3: RoomBase / NpcBase / ItemBase（后续）       │
│  具体游戏对象子类 + 示例蓝图                          │
└─────────────────────────────────────────────────────┘
```

## 方案探讨

### 方案概要

#### 蓝图定义方式

| 设计点        | 决定                          | 说明                                                           |
| ------------- | ----------------------------- | -------------------------------------------------------------- |
| 蓝图文件格式  | TypeScript 类文件             | 对标 LPC `.c` 文件，类型安全，IDE 支持完善                     |
| ID 推断       | 文件路径自动推断              | `world/npc/yangzhou/dianxiaoer.ts` → `npc/yangzhou/dianxiaoer` |
| 虚拟/克隆声明 | `static virtual = true/false` | 静态属性声明，简洁直观                                         |
| 初始化方法    | `create()`                    | BaseEntity 新增可覆写空方法，蓝图在此设置初始属性              |
| 存放位置      | `server/src/world/`           | 和引擎代码一起编译，享受 TypeScript 类型检查                   |

#### 蓝图文件示例

```typescript
// server/src/world/area/yangzhou/inn.ts — 虚拟对象（房间单例）
import { BaseEntity } from '../../engine/base-entity';

export default class extends BaseEntity {
  static virtual = true;

  create() {
    this.set('short', '扬州客栈');
    this.set('long', '一间热闘的客栈，人来人往...');
    this.set('exits', { north: 'area/yangzhou/street', south: 'area/yangzhou/gate' });
  }
}
```

```typescript
// server/src/world/npc/yangzhou/dianxiaoer.ts — 克隆对象
import { BaseEntity } from '../../engine/base-entity';

export default class extends BaseEntity {
  static virtual = false;

  create() {
    this.set('name', '店小二');
    this.set('max_hp', 100);
    this.set('hp', 100);
    this.enableHeartbeat(3000);
  }

  onHeartbeat() {
    // NPC AI 逻辑
  }
}
```

#### 目录结构

按类型分类（对标 LPC 传统）：

```
server/src/world/
├── area/                    # 房间蓝图（通常 virtual=true）
│   └── yangzhou/
│       ├── inn.ts           → "area/yangzhou/inn"
│       ├── street.ts        → "area/yangzhou/street"
│       └── gate.ts          → "area/yangzhou/gate"
├── npc/                     # NPC 蓝图（通常 virtual=false）
│   └── yangzhou/
│       └── dianxiaoer.ts    → "npc/yangzhou/dianxiaoer"
└── item/                    # 物品蓝图（通常 virtual=false）
    └── weapon/
        └── sword.ts         → "item/weapon/sword"
```

路径推断规则：`world/` 为根，去掉 `.ts` 后缀，用 `/` 连接 = 蓝图 ID。

### 核心组件

#### 1. BlueprintRegistry — 蓝图注册表

内存中的蓝图元数据存储：

```typescript
interface BlueprintMeta {
  id: string; // 蓝图 ID（路径推断）
  filePath: string; // 源文件绝对路径
  blueprintClass: typeof BaseEntity; // 蓝图类引用
  virtual: boolean; // 是否虚拟对象
  instance?: BaseEntity; // 虚拟对象的单例引用
}

@Injectable()
class BlueprintRegistry {
  private blueprints: Map<string, BlueprintMeta>;

  register(meta: BlueprintMeta): void;
  unregister(id: string): void;
  get(id: string): BlueprintMeta | undefined;
  has(id: string): boolean;
  getAll(): BlueprintMeta[];
  getCount(): number;
}
```

#### 2. BlueprintLoader — 蓝图扫描加载器

扫描 `world/` 目录，动态 import 蓝图文件：

```typescript
@Injectable()
class BlueprintLoader {
  // 扫描 world/ 目录，加载所有蓝图到 Registry
  async scanAndLoad(worldDir: string): Promise<void>;

  // 加载单个蓝图文件
  async loadBlueprint(filePath: string): Promise<BlueprintMeta>;

  // 热更新：清除缓存 + 重新加载 + 处理已有实例
  async update(blueprintId: string): Promise<void>;
}
```

**启动加载流程：**

```
EngineModule.onModuleInit()
  → BlueprintLoader.scanAndLoad('world/')
    → 递归扫描 world/ 下所有 .ts/.js 文件
    → 对每个文件：
      1. import(filePath) 获取 default export 类
      2. 从文件路径推断蓝图 ID
      3. 读取 static virtual 属性（默认 false）
      4. 注册到 BlueprintRegistry
    → 对所有 virtual=true 的蓝图：
      1. 创建实例：new BlueprintClass(blueprintId)
      2. 调用 instance.create()
      3. 注册到 ObjectManager
      4. 保存 instance 引用到 BlueprintMeta
```

#### 3. BlueprintFactory — 对象创建工厂

从蓝图创建运行时对象实例：

```typescript
@Injectable()
class BlueprintFactory {
  // 创建虚拟对象（单例，启动时自动调用）
  createVirtual(blueprintId: string): BaseEntity;

  // 克隆对象（按需调用）
  clone(blueprintId: string): BaseEntity;

  // 获取虚拟对象实例
  getVirtual(blueprintId: string): BaseEntity | undefined;
}
```

**克隆流程：**

```
BlueprintFactory.clone('npc/yangzhou/dianxiaoer')
  1. 从 Registry 获取 BlueprintMeta
  2. 检查 virtual=false（虚拟对象不可克隆）
  3. 生成 ID: ObjectManager.nextInstanceId('npc/yangzhou/dianxiaoer') → "npc/yangzhou/dianxiaoer#1"
  4. new BlueprintClass(id)
  5. ObjectManager.register(instance)
  6. instance.create()
  7. return instance
```

### 热更新机制

对标 LPC 的 `update` 命令：

#### 虚拟对象 update（reset 策略）

```
BlueprintLoader.update('area/yangzhou/inn')
  1. 清除 require.cache 中的旧模块
  2. 重新 import 蓝图文件
  3. 更新 Registry 中的类引用和元数据
  4. 找到已存在的虚拟对象实例
  5. 清除实例的 dbase（this.setDbase({})）
  6. 清除实例的 tmpDbase
  7. 用新蓝图类的 create() 重新设置属性
  8. 环境关系（inventory/environment）保持不变
  → 房间内的玩家和 NPC 不受影响，只刷新了房间描述等属性
```

#### 克隆对象 update

```
BlueprintLoader.update('npc/yangzhou/dianxiaoer')
  1. 清除 require.cache 中的旧模块
  2. 重新 import 蓝图文件
  3. 更新 Registry 中的类引用和元数据
  4. 已有克隆实例不变（旧类的实例继续运行）
  5. 后续 clone() 调用使用新类
  → 和 LPC 行为一致：update 后旧克隆保持，新克隆用新代码
```

### BaseEntity 变更

新增 `create()` 可覆写空方法：

```typescript
// base-entity.ts 新增
public create(): void {}
```

与现有钩子保持一致风格：`create()` / `onHeartbeat()` / `onReset()` / `onCleanUp()`

### ServiceLocator 变更

```typescript
export class ServiceLocator {
  static heartbeatManager: HeartbeatManager; // Layer 1 ✅
  static objectManager: ObjectManager; // Layer 1 ✅
  static blueprintRegistry: BlueprintRegistry; // Layer 2 新增
  static blueprintFactory: BlueprintFactory; // Layer 2 新增
  static blueprintLoader: BlueprintLoader; // Layer 2 新增
}
```

### EngineModule 变更

```typescript
@Module({
  providers: [
    HeartbeatManager, ObjectManager,                        // Layer 1
    BlueprintRegistry, BlueprintLoader, BlueprintFactory,   // Layer 2
  ],
  exports: [
    HeartbeatManager, ObjectManager,
    BlueprintRegistry, BlueprintLoader, BlueprintFactory,
  ],
})
export class EngineModule implements OnModuleInit {
  onModuleInit() {
    ServiceLocator.initialize({...});
    this.objectManager.startGC();
    await this.blueprintLoader.scanAndLoad(worldDir);  // 启动时加载所有蓝图
  }
}
```

### 考虑过的替代方案

| 方案                                 | 优点                        | 缺点                                     | 结论 |
| ------------------------------------ | --------------------------- | ---------------------------------------- | ---- |
| JSON/YAML 数据文件                   | 策划友好，容易热更新        | 无法定义行为逻辑（AI、心跳等）           | 放弃 |
| 混合模式（JSON 数据 + TS 行为）      | 数据和逻辑分离              | 结构复杂，两套文件映射                   | 放弃 |
| `@Blueprint` 装饰器声明 ID           | 显式，不依赖路径            | 冗余（路径已包含信息），可能和路径不一致 | 放弃 |
| 蓝图放 `server/world/`（独立于 src） | 更接近 LPC 的蓝图独立于驱动 | 需要额外 ts-node 编译，失去类型检查      | 放弃 |
| 虚拟对象 update 重建策略             | 最干净                      | 需要搬迁房间内所有对象，复杂且风险高     | 放弃 |
| 虚拟对象 update 只更蓝图引用         | 最安全                      | 已设置的属性不变，update 效果不明显      | 放弃 |

## 与现有功能的关系

- **依赖**: Layer 0 BaseEntity + Layer 1 HeartbeatManager/ObjectManager
- **影响**: 修改 BaseEntity（新增 create()）、ServiceLocator（新增蓝图服务）、EngineModule（注册蓝图服务）
- **复用**: ObjectManager.nextInstanceId() 用于克隆 ID 分配，ObjectManager.register() 用于实例注册
- **测试影响**: 现有测试不受影响（create() 默认空实现）

## 边界和约束

- **编译依赖**: 蓝图 `.ts` 文件在 `server/src/world/` 下，随 NestJS 一起编译为 `.js`，BlueprintLoader 实际加载的是编译后的 `.js` 文件
- **热更新边界**: `update` 清除的是 Node.js 的 `require.cache`，对 NestJS 的 `nest start --watch` 开发模式兼容
- **类型约束**: 蓝图类必须 `export default`，必须继承 BaseEntity（或其子类）
- **命名约束**: 蓝图 ID 由文件路径推断，不允许同 ID 注册两个蓝图
- **virtual 默认值**: `static virtual` 不声明时默认 `false`（克隆对象）

## 开放问题

- `create()` 中是否允许异步操作（`async create()`）？LPC 的 `create()` 是同步的，但 TS 可能有需求
- `world/` 下是否需要 `index.ts` 入口文件，还是完全靠 BlueprintLoader 递归扫描？
- 后续 Layer 3 的 RoomBase/NpcBase 是否需要在 `create()` 之外提供 `init()` 钩子（LPC 的 init() 在玩家进入时触发，和 create() 不同）

## 探讨记录

### 关键决策过程

1. **蓝图文件格式**: 考虑了 TypeScript 类文件、JSON/YAML 数据文件、混合模式三种方案。选择 TypeScript 类文件，因为对标 LPC `.c` 文件的理念 — 蓝图既包含数据也包含行为逻辑，同时享受 TypeScript 类型安全。

2. **ID 推断方式**: 考虑了 `@Blueprint` 装饰器显式声明和文件路径自动推断两种方案。选择路径推断，因为更简洁，且和 LPC 的"文件路径即对象标识"理念一致。

3. **虚拟对象热更新策略**: 考虑了重建（销毁+新建）、只更蓝图引用、reset（清 dbase + 重新 create）三种策略。选择 reset，平衡了更新效果和安全性 — 房间内的对象关系保持不动，只刷新属性。

4. **目录结构**: 考虑了按类型分（area/npc/item）和按区域分（yangzhou/rooms, yangzhou/npcs）两种风格。选择按类型分，对标 LPC 传统目录结构。

5. **蓝图存放位置**: 考虑了 `server/src/world/`（编译时）和 `server/world/`（运行时）两种位置。选择 `server/src/world/`，享受 TypeScript 编译时类型检查，且项目结构更统一。

6. **Layer 2 范围**: 确定 Layer 2 只做加载机制（Registry + Loader + Factory），不包含示例蓝图。具体的 RoomBase/NpcBase/ItemBase 子类和示例蓝图留给 Layer 3。

### 参考资料

- [FluffOS compile_object 文档](https://www.fluffos.info/apply/master/compile_object.html) — 虚拟对象编译机制
- [LDMud LPC Objects](https://www.ldmud.eu/lpc-objects.html) — 蓝图/克隆/load_object/clone_object
- [炎黄 MUD 源码](https://github.com/oiuv/mud) — LPC 蓝图目录结构参考
- [RanvierMUD Entity Loaders](https://ranviermud.com/extending/entity_loaders/) — DataSource 可插拔设计
- [Evennia Prototypes](https://www.evennia.com/docs/latest/Components/Prototypes.html) — 原型生成系统

---

> CX 工作流 | 功能探讨
