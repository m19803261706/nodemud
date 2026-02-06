# GC 重构：LPC 风格对象自治

## 背景

原 `ObjectManager.cleanUp()` 采用 GC 主动判杀模式：遍历所有对象，由 GC 检查 environment、inventory、`no_clean_up` 标记来决定是否销毁。这导致虚拟对象（房间/区域）因没有父环境而被误杀，玩家走到空房间后导航失效。

## 设计原则

借鉴 LPC（Lars Pensjö C）MUD 引擎的对象自治思想：

> **GC 只负责询问，对象自己决定生死。**

## 架构对比

### 旧版（GC 主动判杀）

```
ObjectManager.cleanUp()
  ├── 无环境? → 准备清理
  ├── no_clean_up=true? → 跳过
  ├── 有子对象? → 跳过
  ├── onCleanUp()=false? → 跳过
  └── destroy()
```

问题：GC 承担了过多的判断责任，任何新对象类型都需要修改 GC 逻辑或设置 `no_clean_up` 标记。

### 新版（对象自治）

```
ObjectManager.cleanUp()
  ├── 已销毁? → 跳过
  ├── onCleanUp()=false? → 跳过
  └── destroy()
```

GC 只做两件事：**遍历** + **调用 onCleanUp()**。所有判断逻辑下沉到各对象类型。

## 对象 onCleanUp 决策表

| 对象类型     | onCleanUp 返回值      | 理由                               |
| ------------ | --------------------- | ---------------------------------- |
| `BaseEntity` | 无环境且无子对象→true | 默认保守策略，孤立对象可回收       |
| `RoomBase`   | 始终 false            | 房间是虚拟对象，生命周期由世界管理 |
| `Area`       | 始终 false            | 区域是虚拟对象，生命周期由世界管理 |
| `PlayerBase` | 始终 false            | 玩家生命周期由 WebSocket 连接管理  |
| `NpcBase`    | 无环境→true           | NPC 是克隆对象，失去房间后可回收   |
| `ItemBase`   | 无环境→true           | 物品是克隆对象，不在容器中可回收   |

## 代码示例

### ObjectManager.cleanUp()

```typescript
private cleanUp(): void {
  let count = 0;
  for (const entity of this.objects.values()) {
    if (entity.destroyed) continue;
    try {
      if (!entity.onCleanUp()) continue;
    } catch {
      continue; // 异常保护：不清理
    }
    try {
      entity.destroy();
      count++;
    } catch (err) {
      this.logger.warn(`cleanUp: 销毁对象 "${entity.id}" 时出错: ${err}`);
    }
  }
}
```

### 各对象类型覆写

```typescript
// RoomBase / Area / PlayerBase — 永不自毁
public onCleanUp(): boolean {
  return false;
}

// NpcBase / ItemBase — 失去环境可回收
public onCleanUp(): boolean {
  if (!this.getEnvironment()) return true;
  return false;
}

// BaseEntity 默认 — 保守策略
public onCleanUp(): boolean {
  if (this.getEnvironment()) return false;
  if (this.getInventory().length > 0) return false;
  return true;
}
```

## 扩展指南

添加新的游戏对象类型时，只需在子类中覆写 `onCleanUp()` 方法：

```typescript
export class MyNewObject extends BaseEntity {
  public onCleanUp(): boolean {
    // 自定义清理策略
    // 返回 true = 请求 GC 销毁自己
    // 返回 false = 继续存活
  }
}
```

**不需要**修改 ObjectManager，不需要设置任何标记属性。

## 已移除的概念

- `no_clean_up` 属性 — 不再需要，由 `onCleanUp()` 返回 false 替代
- GC 的 environment/inventory 检查 — 已下沉到 `BaseEntity.onCleanUp()` 默认实现

## 变更记录

- **2026-02-04**: 初版，从 GC 主动判杀重构为 LPC 风格对象自治
