# Design Doc: Layer 3 — 游戏对象子类

## 关联

- PRD: #64
- Scope: #63
- 关联 Epic: #57（Layer 2 BlueprintLoader，已完成）、#49（Layer 1 HB/OM，已完成）、#38（Layer 0 BaseEntity，已完成）

## 基于现有代码

| 模块             | 路径                                     | 复用方式                                    |
| ---------------- | ---------------------------------------- | ------------------------------------------- |
| BaseEntity       | `server/src/engine/base-entity.ts`       | 子类直接继承，复用 dbase/environment/events |
| BlueprintLoader  | `server/src/engine/blueprint-loader.ts`  | 蓝图扫描加载子类                            |
| BlueprintFactory | `server/src/engine/blueprint-factory.ts` | 子类实例创建                                |
| ObjectManager    | `server/src/engine/object-manager.ts`    | 子类实例注册/GC                             |
| HeartbeatManager | `server/src/engine/heartbeat-manager.ts` | NPC 心跳驱动                                |

Layer 3 是**纯新增**层，不修改任何已有文件。

## 架构概览

```
BaseEntity (Layer 0)
├── RoomBase    ← virtual=true, 单例房间
├── Area        ← virtual=true, 单例区域
├── NpcBase     ← virtual=false, 可克隆 NPC
└── ItemBase    ← virtual=false, 可克隆物品
```

数据流：

```
BlueprintLoader.scanAndLoad()
  → 扫描 world/ 目录
  → import 蓝图文件（继承 RoomBase/NpcBase/ItemBase/Area）
  → BlueprintRegistry.register()
  → BlueprintFactory.createVirtual()  [virtual=true 的蓝图]
  → instance.create()  [蓝图在 create() 中调用 set() 设置属性]

BlueprintFactory.clone()
  → new NpcBase/ItemBase(id)
  → ObjectManager.register()
  → instance.create()
```

## 后端设计

### 代码路径

```
server/src/engine/
├── game-objects/                    # 新增目录
│   ├── index.ts                    # 统一导出
│   ├── room-base.ts                # RoomBase
│   ├── area.ts                     # Area
│   ├── npc-base.ts                 # NpcBase
│   └── item-base.ts                # ItemBase
└── __tests__/
    ├── room-base.spec.ts           # 新增
    ├── area.spec.ts                # 新增
    ├── npc-base.spec.ts            # 新增
    └── item-base.spec.ts           # 新增
```

### RoomBase 详细设计

```typescript
// server/src/engine/game-objects/room-base.ts
import { BaseEntity } from '../base-entity';

export class RoomBase extends BaseEntity {
  /** 房间默认单例 */
  static virtual = true;

  /** 广播消息给房间内所有对象（对标 LPC tell_room） */
  broadcast(message: string, exclude?: BaseEntity): void {
    for (const entity of this.getInventory()) {
      if (entity !== exclude) {
        entity.emit('message', { message });
      }
    }
  }

  /** 获取房间简短描述 */
  getShort(): string {
    return this.get<string>('short') ?? '未知地点';
  }

  /** 获取房间详细描述 */
  getLong(): string {
    return this.get<string>('long') ?? '这里什么也没有。';
  }

  /** 获取出口列表: { direction: blueprintId } */
  getExits(): Record<string, string> {
    return this.get<Record<string, string>>('exits') ?? {};
  }

  /** 查询某方向的出口目标蓝图 ID */
  getExit(direction: string): string | undefined {
    return this.getExits()[direction];
  }

  /** 获取地图坐标 */
  getCoordinates(): { x: number; y: number; z?: number } | undefined {
    return this.get('coordinates');
  }
}
```

### Area 详细设计

```typescript
// server/src/engine/game-objects/area.ts
import { BaseEntity } from '../base-entity';

export interface SpawnRule {
  blueprintId: string;
  roomId: string;
  count: number;
  interval: number;
}

export class Area extends BaseEntity {
  /** 区域默认单例 */
  static virtual = true;

  /** 获取区域名称 */
  getName(): string {
    return this.get<string>('name') ?? '未知区域';
  }

  /** 获取区域等级范围 */
  getLevelRange(): { min: number; max: number } | undefined {
    return this.get('level_range');
  }

  /** 获取区域包含的房间蓝图 ID 列表 */
  getRoomIds(): string[] {
    return this.get<string[]>('rooms') ?? [];
  }

  /** 获取 NPC 刷新规则 */
  getSpawnRules(): SpawnRule[] {
    return this.get('spawn_rules') ?? [];
  }
}
```

### NpcBase 详细设计

```typescript
// server/src/engine/game-objects/npc-base.ts
import { BaseEntity } from '../base-entity';

export class NpcBase extends BaseEntity {
  /** NPC 可克隆 */
  static virtual = false;

  /** 获取 NPC 名字 */
  getName(): string {
    return this.get<string>('name') ?? '无名';
  }

  /** 获取简短描述（房间内显示） */
  getShort(): string {
    return this.get<string>('short') ?? this.getName();
  }

  /** 获取详细描述（look 查看） */
  getLong(): string {
    return this.get<string>('long') ?? `你看到了${this.getName()}。`;
  }

  /** 心跳回调（HeartbeatManager 调用），默认触发 onAI */
  public onHeartbeat(): void {
    this.onAI();
  }

  /** AI 行为钩子（蓝图覆写定义行为） */
  protected onAI(): void {}

  /** 对话接口（蓝图覆写） */
  onChat(speaker: BaseEntity, message: string): void {}
}
```

### ItemBase 详细设计

```typescript
// server/src/engine/game-objects/item-base.ts
import { BaseEntity } from '../base-entity';

export class ItemBase extends BaseEntity {
  /** 物品可克隆 */
  static virtual = false;

  /** 获取物品名字 */
  getName(): string {
    return this.get<string>('name') ?? '未知物品';
  }

  /** 获取简短描述 */
  getShort(): string {
    return this.get<string>('short') ?? this.getName();
  }

  /** 获取详细描述 */
  getLong(): string {
    return this.get<string>('long') ?? `这是一个${this.getName()}。`;
  }

  /** 获取物品类型 */
  getType(): string {
    return this.get<string>('type') ?? 'misc';
  }

  /** 获取重量 */
  getWeight(): number {
    return this.get<number>('weight') ?? 0;
  }

  /** 获取价值 */
  getValue(): number {
    return this.get<number>('value') ?? 0;
  }

  /** 是否可堆叠 */
  isStackable(): boolean {
    return this.get<boolean>('stackable') ?? false;
  }
}
```

### index.ts 统一导出

```typescript
// server/src/engine/game-objects/index.ts
export { RoomBase } from './room-base';
export { Area, SpawnRule } from './area';
export { NpcBase } from './npc-base';
export { ItemBase } from './item-base';
```

## 测试策略

每个子类的测试覆盖：

### RoomBase 测试用例

| 测试                             | 描述                         |
| -------------------------------- | ---------------------------- |
| `static virtual = true`          | 验证房间默认单例             |
| `getShort()` 有值/无值           | 验证从 dbase 读取和默认值    |
| `getLong()` 有值/无值            | 验证从 dbase 读取和默认值    |
| `getExits()` 有值/无值           | 验证出口映射读取和空对象默认 |
| `getExit(direction)` 存在/不存在 | 验证方向查询和 undefined     |
| `getCoordinates()` 有值/无值     | 验证坐标读取                 |
| `broadcast()` 基本广播           | 验证遍历 inventory 发送消息  |
| `broadcast()` 带 exclude         | 验证排除指定对象             |
| `broadcast()` 空房间             | 验证空 inventory 不报错      |

### Area 测试用例

| 测试                        | 描述                     |
| --------------------------- | ------------------------ |
| `static virtual = true`     | 验证区域默认单例         |
| `getName()` 有值/无值       | 验证名称读取和默认值     |
| `getLevelRange()` 有值/无值 | 验证等级范围             |
| `getRoomIds()` 有值/无值    | 验证房间列表和空数组默认 |
| `getSpawnRules()` 有值/无值 | 验证刷新规则和空数组默认 |

### NpcBase 测试用例

| 测试                            | 描述                              |
| ------------------------------- | --------------------------------- |
| `static virtual = false`        | 验证 NPC 可克隆                   |
| `getName()` 有值/无值           | 验证名字读取和默认值              |
| `getShort()` 有值/无值/fallback | 验证简短描述和 getName() fallback |
| `getLong()` 有值/无值           | 验证详细描述和默认格式            |
| `onHeartbeat()`                 | 验证调用 onAI()                   |
| `onAI()` 子类覆写               | 验证蓝图可覆写行为                |
| `onChat()`                      | 验证对话接口参数传递              |

### ItemBase 测试用例

| 测试                            | 描述                              |
| ------------------------------- | --------------------------------- |
| `static virtual = false`        | 验证物品可克隆                    |
| `getName()` 有值/无值           | 验证名字读取和默认值              |
| `getShort()` 有值/无值/fallback | 验证简短描述和 getName() fallback |
| `getLong()` 有值/无值           | 验证详细描述和默认格式            |
| `getType()` 有值/无值           | 验证类型和 'misc' 默认            |
| `getWeight()` 有值/无值         | 验证重量和 0 默认                 |
| `getValue()` 有值/无值          | 验证价值和 0 默认                 |
| `isStackable()` 有值/无值       | 验证堆叠和 false 默认             |

## 影响范围

- **修改的已有文件**: 无
- **新增的文件**: 9 个（4 子类 + 1 导出 + 4 测试）
- **潜在冲突**: 无（纯新增目录和文件）

## 风险点

- **风险 1**: 子类方法签名不稳定 → 应对：Layer 3 只定义最基础的便捷方法，保持最小 API 表面
- **风险 2**: 后续 Layer 4 发现子类缺少方法 → 应对：子类可随时扩展方法，不影响已有蓝图

---

> CX 工作流 | Design Doc | PRD #64
