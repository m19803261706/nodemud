# 功能探讨: Layer 3 — 游戏对象子类

## 基本信息

- **创建时间**: 2026-02-02
- **关联项目蓝图**: #1（NodeMUD 项目蓝图）
- **前置依赖**: Layer 0 BaseEntity (Epic #38, closed), Layer 1 HB/OM (Epic #49, closed), Layer 2 BlueprintLoader (Epic #57, closed)

## 功能目标

实现游戏引擎的 Layer 3 游戏对象子类，定义 RoomBase、Area、NpcBase、ItemBase 四个继承 BaseEntity 的具体子类。每个子类封装特定类型游戏对象的属性和行为。

**核心理念**：子类只提供**行为框架和便捷方法**，具体属性由蓝图在 `create()` 中通过 dbase `set()` 设置。对标 LPC 的 `ROOM`、`NPC`、`OB` 基类。

## 架构定位

```
┌─────────────────────────────────────────────────────┐
│  Layer 0: BaseEntity ✅                              │
│  Dbase / Environment / Events / 心跳 / 延迟调用      │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────┴─────────────────────────────┐
│  Layer 1: HeartbeatManager + ObjectManager ✅         │
│  全局调度 / 对象注册 / GC                             │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────┴─────────────────────────────┐
│  Layer 2: BlueprintLoader ✅                          │
│  蓝图注册表 / 扫描加载 / 工厂 / 热更新               │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────┴─────────────────────────────┐
│  Layer 3: 游戏对象子类 ← 本次                        │
│  RoomBase / Area / NpcBase / ItemBase                │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────┴─────────────────────────────┐
│  Layer 4: CommandManager 指令系统（后续）             │
│  命令注册 / 基础指令 / 权限控制                       │
└─────────────────────────────────────────────────────┘
```

## 方案探讨

### 子类总览

| 子类     | 继承       | 核心能力                         | 默认 virtual     | 对标 LPC |
| -------- | ---------- | -------------------------------- | ---------------- | -------- |
| RoomBase | BaseEntity | 出口、描述、坐标、广播           | true（单例房间） | `ROOM`   |
| Area     | BaseEntity | 房间分组、NPC 刷新规则、等级范围 | true（单例区域） | `D_AREA` |
| NpcBase  | BaseEntity | 名字/描述、AI 行为钩子、心跳驱动 | false（可克隆）  | `NPC`    |
| ItemBase | BaseEntity | 名字/描述/重量、type 字段        | false（可克隆）  | `OB`     |

### RoomBase — 房间基类

```typescript
// server/src/engine/game-objects/room-base.ts

export class RoomBase extends BaseEntity {
  static virtual = true; // 房间默认单例

  /**
   * 广播消息给房间内所有对象
   * 对标 LPC tell_room()
   * @param message 消息内容
   * @param exclude 排除的对象（如消息发送者）
   */
  broadcast(message: string, exclude?: BaseEntity): void {
    for (const entity of this.getInventory()) {
      if (entity !== exclude) {
        entity.emit('message', { message });
      }
    }
  }

  /**
   * 获取房间简短描述
   */
  getShort(): string {
    return this.get<string>('short') ?? '未知地点';
  }

  /**
   * 获取房间详细描述
   */
  getLong(): string {
    return this.get<string>('long') ?? '这里什么也没有。';
  }

  /**
   * 获取出口列表
   * exits 存储格式: { direction: blueprintId }
   * 例: { north: 'area/yangzhou/street', south: 'area/yangzhou/gate' }
   */
  getExits(): Record<string, string> {
    return this.get<Record<string, string>>('exits') ?? {};
  }

  /**
   * 查询某方向的出口
   * @returns 目标房间蓝图 ID，不存在返回 undefined
   */
  getExit(direction: string): string | undefined {
    const exits = this.getExits();
    return exits[direction];
  }

  /**
   * 获取坐标（地图定位用）
   */
  getCoordinates(): { x: number; y: number; z?: number } | undefined {
    return this.get('coordinates');
  }
}
```

**出口设计**：exits 是 dbase 属性，简单的 `{ direction: blueprintId }` 映射。复杂出口（锁门、隐藏、条件通行）可以在值中扩展为对象：

```typescript
// 简单出口
this.set('exits', { north: 'area/yangzhou/street' });

// 复杂出口（后续扩展）
this.set('exits', {
  north: 'area/yangzhou/street',
  south: { target: 'area/yangzhou/secret', hidden: true, condition: 'has_key' },
});
```

### Area — 区域管理器

```typescript
// server/src/engine/game-objects/area.ts

export class Area extends BaseEntity {
  static virtual = true; // 区域单例

  /**
   * 获取区域名称
   */
  getName(): string {
    return this.get<string>('name') ?? '未知区域';
  }

  /**
   * 获取区域等级范围
   */
  getLevelRange(): { min: number; max: number } | undefined {
    return this.get('level_range');
  }

  /**
   * 获取区域包含的房间蓝图 ID 列表
   */
  getRoomIds(): string[] {
    return this.get<string[]>('rooms') ?? [];
  }

  /**
   * 获取 NPC 刷新规则
   */
  getSpawnRules(): Array<{ blueprintId: string; roomId: string; count: number; interval: number }> {
    return this.get('spawn_rules') ?? [];
  }
}
```

### NpcBase — NPC 基类

```typescript
// server/src/engine/game-objects/npc-base.ts

export class NpcBase extends BaseEntity {
  static virtual = false; // NPC 可克隆

  /**
   * 获取 NPC 名字
   */
  getName(): string {
    return this.get<string>('name') ?? '无名';
  }

  /**
   * 获取 NPC 简短描述（用于房间内显示）
   */
  getShort(): string {
    return this.get<string>('short') ?? this.getName();
  }

  /**
   * 获取 NPC 详细描述（用于 look 查看）
   */
  getLong(): string {
    return this.get<string>('long') ?? `你看到了${this.getName()}。`;
  }

  /**
   * AI 行为钩子（子类覆写）
   * 由心跳触发
   */
  onHeartbeat(): void {
    this.onAI();
  }

  /**
   * AI 行为（蓝图覆写此方法定义 NPC 行为）
   */
  protected onAI(): void {}

  /**
   * NPC 对话接口
   * @param speaker 对话发起者
   * @param message 对话内容
   */
  onChat(speaker: BaseEntity, message: string): void {
    // 默认无反应，蓝图覆写
  }
}
```

**注意**：战斗属性（hp/max_hp/attack/defense）不在 Layer 3 定义，留给 Phase 2 战斗系统。

### ItemBase — 物品基类

```typescript
// server/src/engine/game-objects/item-base.ts

export class ItemBase extends BaseEntity {
  static virtual = false; // 物品可克隆

  /**
   * 获取物品名字
   */
  getName(): string {
    return this.get<string>('name') ?? '未知物品';
  }

  /**
   * 获取物品简短描述
   */
  getShort(): string {
    return this.get<string>('short') ?? this.getName();
  }

  /**
   * 获取物品详细描述
   */
  getLong(): string {
    return this.get<string>('long') ?? `这是一个${this.getName()}。`;
  }

  /**
   * 获取物品类型
   */
  getType(): string {
    return this.get<string>('type') ?? 'misc';
  }

  /**
   * 获取重量
   */
  getWeight(): number {
    return this.get<number>('weight') ?? 0;
  }

  /**
   * 获取价值
   */
  getValue(): number {
    return this.get<number>('value') ?? 0;
  }

  /**
   * 是否可堆叠
   */
  isStackable(): boolean {
    return this.get<boolean>('stackable') ?? false;
  }
}
```

**子类继承体系**：ItemBase 是基础类，后续根据需要扩展 WeaponBase、PotionBase 等子类（不在 Layer 3 范围内，留给后续探讨）。

### 目录结构

```
server/src/engine/
├── game-objects/                    # 新增: 游戏对象子类目录
│   ├── index.ts                    # 统一导出
│   ├── room-base.ts                # RoomBase 房间基类
│   ├── area.ts                     # Area 区域管理器
│   ├── npc-base.ts                 # NpcBase NPC 基类
│   └── item-base.ts                # ItemBase 物品基类
└── __tests__/
    ├── room-base.spec.ts           # 新增
    ├── area.spec.ts                # 新增
    ├── npc-base.spec.ts            # 新增
    └── item-base.spec.ts           # 新增
```

### 考虑过的替代方案

| 方案               | 优点             | 缺点                                  | 结论                     |
| ------------------ | ---------------- | ------------------------------------- | ------------------------ |
| Exit 独立对象      | 支持复杂出口逻辑 | 增加系统复杂度，大多数出口很简单      | 放弃，用 dbase 属性      |
| Area 纯配置文件    | 更轻量           | 不能利用 BaseEntity 的事件/dbase 能力 | 放弃，继承 BaseEntity    |
| NpcBase 含战斗属性 | 一步到位         | 战斗系统还未设计，耦合风险            | 延后到 Phase 2           |
| ItemBase 多子类    | 类型安全         | 需要先确定子类体系，过早设计          | 先做基础类，后续探讨子类 |
| 示例蓝图一起做     | 端到端验证       | Layer 3 范围膨胀                      | 示例蓝图留给后续         |

## 与现有功能的关系

- **依赖**: Layer 0 BaseEntity（继承）、Layer 2 BlueprintLoader（蓝图加载机制）
- **影响**: 不修改任何已有文件（纯新增）
- **复用**: BaseEntity 的 dbase/environment/events 全部能力、ServiceLocator
- **后续依赖者**: Layer 4 指令系统（look/go 等指令需要 RoomBase 的方法）、示例蓝图

## 边界和约束

- 子类只提供**行为框架和便捷方法**，不硬编码属性值
- 蓝图在 `create()` 中通过 `set()` 设置具体属性
- 战斗相关属性不在本层定义
- ItemBase 子类体系（WeaponBase 等）不在本层定义
- 不包含示例蓝图文件

## 开放问题

- RoomBase 的复杂出口格式是否需要在 Layer 3 就定义接口？还是后续按需扩展？
- Area 的 NPC 刷新逻辑是否需要 onHeartbeat 驱动？还是由外部调度？
- ItemBase 后续子类体系何时探讨？

## 探讨记录

### 关键决策过程

1. **Exit 设计**: 考虑了独立对象和 Room 属性两种方案。选择 Room 属性（dbase 中的 exits map），因为大多数出口是简单的方向→房间映射，复杂出口可以通过扩展值格式支持。

2. **Area 设计**: 考虑了继承 BaseEntity 和纯配置两种方案。选择继承 BaseEntity，因为 Area 可以利用 dbase 存储区域属性、事件系统监听区域事件。

3. **NPC 战斗属性**: 确认完全延后到 Phase 2 战斗系统。NpcBase 在 Layer 3 只包含名字/描述/AI 钩子/对话接口。

4. **ItemBase 类型体系**: 确认 Layer 3 只做基础 ItemBase 类，通过 dbase 的 `type` 字段区分类型。多子类继承（WeaponBase/PotionBase）留给后续单独探讨。

5. **Layer 3 范围**: 确认只做子类定义 + 测试，不含示例蓝图。指令系统是 Layer 4。

---

> CX 工作流 | 功能探讨
