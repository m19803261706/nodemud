# PRD: 残骸系统 — 死亡掉落 + 容器指令 + 地面物品展示

## 基本信息

- **创建时间**: 2026-02-06 05:35
- **优先级**: P1（高）
- **技术栈**: TypeScript (NestJS + React Native + shared core)
- **关联 Scope**: #207

## 功能概述

生物（NPC/玩家）死亡后在房间留下"XXX的残骸"容器物品，NPC 残骸包含其装备和随身物品，玩家残骸暂为空（物品掉落后续版本再定）。残骸是可交互的容器，支持查看内容物、从中取物、放入物品、整体拾取，10 分钟后自动腐烂消失（内容物一同销毁）。同时扩展通用容器指令 `get from` / `put in`，并将地面物品升级为卡片式展示 + 弹窗交互。

## 用户场景

### 场景 1: 击杀 NPC 后搜刮残骸

1. 玩家击败 NPC（战斗系统结束，reason='victory'）
2. NPC 死亡，房间出现"北门卫兵的残骸"
3. 日志显示："北门卫兵倒下了，留下了一具残骸。"
4. 地面物品区域出现残骸卡片（特殊样式，区别于普通物品）
5. 玩家点击残骸卡片 → 弹窗展示残骸详情：
   - 描述："北门卫兵的残骸，散发着余温。"
   - 内容物列表：铁剑、皮甲、治伤药 × 1
   - 交互按钮：[拾取残骸] [鉴定]
   - 每个内容物旁有 [取出] 按钮
6. 玩家点击 [取出] 铁剑 → 发送 `get 铁剑 from 残骸` → 铁剑进入背包
7. 或玩家点击 [拾取残骸] → 发送 `get 残骸` → 整个残骸（含剩余物品）进入背包

### 场景 2: 玩家死亡留下残骸

1. 玩家被 NPC 击败（reason='defeat'）
2. 玩家原所在房间出现"泡泡的残骸"（空，不掉落物品）
3. 玩家复活传送到广场
4. 其他玩家可以看到残骸（`look` 显示为空）
5. 10 分钟后残骸消失

### 场景 3: 文本指令交互残骸/容器

1. `look 残骸` → 显示残骸描述 + 内容物列表
2. `examine 残骸` → 显示残骸详细信息 + 内容物详情
3. `get 铁剑 from 残骸` → 从残骸中取出铁剑到背包
4. `get 残骸` → 拾取整个残骸到背包
5. `put 治伤药 in 残骸` → 把背包中的治伤药放入残骸
6. 以上指令适用于所有 ContainerBase 子类，不仅限残骸

### 场景 4: 残骸腐烂

1. 残骸创建后 10 分钟（600 秒）内未被完全清空或拾取
2. 残骸自动销毁，连同内容物一起消失
3. 房间日志显示："北门卫兵的残骸化为尘土，消散了。"
4. 房间物品列表自动更新（前端移除卡片）

### 场景 5: 地面普通物品交互

1. 房间地面有物品（散落的铁剑、药品等）
2. 物品以卡片形式展示（与 NPC 卡片同一区域，样式区分）
3. 点击物品卡片 → 弹窗展示物品详情 + 交互按钮（[拾取] [鉴定]）
4. 容器类物品的弹窗额外展示内容物

## 详细需求

### R1: RemainsBase 残骸类

| 属性       | 说明                      |
| ---------- | ------------------------- |
| name       | "XXX的残骸"               |
| short      | "XXX的残骸"               |
| long       | "XXX的残骸，散发着余温。" |
| type       | `'remains'`               |
| sourceName | 来源实体名称              |
| decayTime  | 腐烂时间 600s（10 分钟）  |
| droppable  | true（可丢弃/拾取）       |
| tradeable  | false（不可交易）         |
| stackable  | false（不可堆叠）         |

- 继承 ContainerBase（继承 ItemBase）
- 创建时注册心跳，每 tick 递减腐烂倒计时
- 倒计时归零 → 广播腐烂消息 → `destroy()`
- `destroy()` 时内容物一并销毁（覆写 `handleInventoryOnDestroy` 为空操作）
- `onCleanUp()` 返回 true（无环境时可被 GC 回收）

### R2: NPC 死亡改造

- `NpcBase.die()` 流程改为：
  1. 调用 `super.die()` 标记死亡状态
  2. 创建 RemainsBase 实例，name = "XXX的残骸"
  3. 遍历 NPC 装备槽 → `unequip()` → 物品移入残骸
  4. 遍历 NPC 背包物品 → 移入残骸
  5. 残骸 `moveTo` 当前房间
  6. 广播死亡消息 + 残骸出现消息
  7. `destroy()` NPC 本体（此时 inventory 已清空）
- SpawnManager 无需改动（仍然 scheduleRespawn）

### R3: 玩家死亡改造

- `PlayerBase.die()` 增加创建空残骸：
  1. 调用 `super.die()` 标记死亡状态
  2. 创建空 RemainsBase，name = "XXX的残骸"
  3. 残骸 `moveTo` 当前房间（在 revive 传送之前）
- 不转移任何物品（后续版本再定）

### R4: ContainerBase 完善

- 当前 ContainerBase 只有属性定义，需完善：
  - `canAccept(item)` — 检查容量/重量是否允许放入
  - `getContents()` — 获取内容物列表（语义化 API）
  - `getContentsBrief()` — 返回 ItemBrief[] 用于网络传输
  - 默认 capacity: 20，weightLimit: 无限制

### R5: `get [item] from [container]` 指令扩展

- 扩展现有 `get` 指令，在 args 中检测 `from` 关键词
- 解析: `get {itemName} from {containerName}` → itemName + containerName
- 查找容器：先搜房间地面，再搜玩家背包
- 查找物品：在容器 inventory 中按名称匹配
- 物品从容器移到玩家背包（`item.moveTo(player)`）
- 返回结果: `{ action: 'get_from', itemName, containerName }`
- 中文别名: `从` 可作为 `from` 的别名

### R6: `put [item] in [container]` 新增指令

- 新建 `put` 指令，注册 name='put'，aliases=['放', '放入']
- 解析: `put {itemName} in {containerName}` → itemName + containerName
- 查找物品：在玩家背包中按名称匹配
- 查找容器：先搜房间地面，再搜玩家背包
- 检查容器 `canAccept(item)` → 容量/重量校验
- 物品从玩家背包移到容器（`item.moveTo(container)`）
- 返回结果: `{ action: 'put', itemName, containerName }`
- 中文别名: `进` / `里` 可作为 `in` 的别名

### R7: look/examine 容器支持

- `look [容器]` — 显示容器描述 + 内容物名称列表
- `examine [容器]` — 显示容器详情 + 内容物详细信息（含品质、类型）
- 利用现有 look/examine 指令的目标匹配逻辑，增加容器内容物展示

### R8: ItemBrief 扩展（core 包）

- `ItemBrief` 增加字段：
  - `isContainer?: boolean` — 是否为容器
  - `contents?: ItemBrief[]` — 内容物摘要（仅容器类有值）
  - `isRemains?: boolean` — 是否为残骸（前端特殊样式）
- roomInfo 消息的 items 数组中包含容器的内容物信息

### R9: 地面物品卡片展示（前端）

- 地面物品在 NPC 列表区域以卡片形式展示
- 样式与 NPC 卡片区分：
  - 普通物品：物品图标 + 名称 + 类型标签
  - 残骸：特殊底色/图标 + "XXX的残骸" + 内容物数量标签
- 点击卡片触发物品弹窗
- roomInfo 更新时自动刷新（残骸腐烂后自动消失）

### R10: ItemInfoModal 物品弹窗（前端）

- 新增 ItemInfoModal 组件（参考 NpcInfoModal 结构）
- 普通物品弹窗：
  - 物品名称、描述、类型、品质
  - 按钮：[拾取]（get）、[鉴定]（examine）
- 容器类物品弹窗：
  - 物品名称、描述
  - 内容物列表（每项可 [取出]）
  - 按钮：[拾取整个]（get）、[鉴定]（examine）
- 按钮点击 → 发送对应指令 → 刷新弹窗数据

## 关联文档

- **Scope**: #207 — 残骸系统功能探讨
- **相关 Epic**: #199（战斗系统）、#156（物品系统 Phase 1）、#150（NPC 信息弹窗）
- **相关 Scope**: #153（物品系统）、#134（NPC 系统）

## 现有代码基础

| 模块                      | 文件                                                    | 可复用点                               |
| ------------------------- | ------------------------------------------------------- | -------------------------------------- |
| ContainerBase             | `server/src/engine/game-objects/container-base.ts`      | 已有基类，需完善                       |
| BaseEntity inventory      | `server/src/engine/base-entity.ts`                      | `_inventory` Set + moveTo/getInventory |
| ItemBase                  | `server/src/engine/game-objects/item-base.ts`           | 物品属性体系                           |
| NpcBase.die()             | `server/src/engine/game-objects/npc-base.ts`            | 当前死亡流程                           |
| PlayerBase.die()/revive() | `server/src/engine/game-objects/player-base.ts`         | 当前死亡+复活                          |
| SpawnManager              | `server/src/engine/spawn-manager.ts`                    | NPC 重生调度                           |
| HeartbeatManager          | `server/src/engine/heartbeat-manager.ts`                | 心跳注册                               |
| get 指令                  | `server/src/engine/commands/std/get.ts`                 | 扩展 from 语法                         |
| look/examine              | `server/src/engine/commands/std/look.ts` / `examine.ts` | 容器内容展示                           |
| NpcInfoModal              | `client/src/components/game/NpcList/NpcInfoModal.tsx`   | 弹窗模板                               |
| NpcList                   | `client/src/components/game/NpcList/`                   | 卡片列表模板                           |
| ItemBrief 类型            | `packages/core/src/types/`                              | 扩展字段                               |

## 代码影响范围

| 层级     | 影响模块                                                                                                              |
| -------- | --------------------------------------------------------------------------------------------------------------------- |
| core     | ItemBrief 类型扩展、新增容器相关消息类型                                                                              |
| backend  | RemainsBase 新类、ContainerBase 完善、NpcBase/PlayerBase 死亡改造、get/put 指令、look/examine 容器支持、roomInfo 适配 |
| frontend | 地面物品卡片组件、ItemInfoModal 弹窗、store 物品交互 action                                                           |

## 任务拆分（初步）

- [ ] ContainerBase 完善 + RemainsBase 新类
- [ ] NPC 死亡创建残骸 + 装备/物品转移
- [ ] 玩家死亡创建空残骸
- [ ] `get [item] from [container]` 指令扩展
- [ ] `put [item] in [container]` 新增指令
- [ ] look/examine 容器内容展示
- [ ] core 包 ItemBrief 扩展 + roomInfo 适配
- [ ] 前端地面物品卡片 + ItemInfoModal 弹窗

## 验收标准

- [ ] NPC 死亡后房间出现"XXX的残骸"，内含 NPC 的装备和物品
- [ ] 玩家死亡后房间出现空残骸，玩家正常复活传送
- [ ] `get 铁剑 from 残骸` 能从残骸中取出物品到背包
- [ ] `put 治伤药 in 残骸` 能把物品放入残骸
- [ ] `get 残骸` 能拾取整个残骸（含内容物）到背包
- [ ] `look 残骸` 显示内容物列表
- [ ] 残骸 10 分钟后自动消失，广播腐烂消息
- [ ] 地面物品以卡片形式展示，点击弹窗交互
- [ ] 容器弹窗展示内容物列表 + 取出按钮
- [ ] 所有容器指令适用于任意 ContainerBase 子类

---

> CX 工作流 | PRD
