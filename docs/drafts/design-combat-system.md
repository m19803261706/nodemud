# Design Doc: 战斗系统（ATB 读条出手机制）

## 关联

- PRD: #197
- Scope: #196
- 装备系统 Design: #180（复用 EquipmentBonus / combat.attack / combat.defense）
- 项目蓝图: #1

## 基于现有代码

### 可直接复用

| 模块             | 文件                                            | 说明                                   |
| ---------------- | ----------------------------------------------- | -------------------------------------- |
| HeartbeatManager | `server/src/engine/heartbeat-manager.ts`        | 1s tick 累积器模式，完美匹配 ATB gauge |
| LivingBase       | `server/src/engine/game-objects/living-base.ts` | 装备系统/getEquipment()                |
| PlayerBase       | `server/src/engine/game-objects/player-base.ts` | getEquipmentBonus() / sendToClient()   |
| NpcBase          | `server/src/engine/game-objects/npc-base.ts`    | onHeartbeat→onAI() 框架                |
| WeaponBase       | `server/src/engine/game-objects/weapon-base.ts` | getDamage() / getWeaponType()          |
| ArmorBase        | `server/src/engine/game-objects/armor-base.ts`  | getDefense()                           |
| EquipmentBonus   | `packages/core/src/types/equipment-bonus.ts`    | combat.attack / combat.defense         |
| CommandManager   | `server/src/engine/command-loader.ts`           | 注册新指令                             |
| GameEvents       | `server/src/engine/types/events.ts`             | 事件系统扩展                           |
| SpawnManager     | `server/src/engine/spawn-manager.ts`            | NPC 刷新 + SpawnRule.interval          |
| SemanticTag      | `packages/core/src/rich-text/tags.ts`           | 已有 damage/heal/combat/skill 标签     |
| MessageFactory   | `packages/core/src/factory/MessageFactory.ts`   | @MessageHandler 注册消息               |
| WebSocketService | `client/src/services/WebSocketService.ts`       | on(type, callback) 监听模式            |
| useGameStore     | `client/src/stores/useGameStore.ts`             | Zustand store + wsService 监听         |

### 关键发现

1. **SemanticTag 已预定义战斗标签**：`damage`/`heal`/`combat`/`skill` 已存在于 `tags.ts`，含 light/dark 双主题色值，无需新增
2. **消息模式**：后端通过 `player.sendToClient(data)` 推送，前端 `wsService.on(type, cb)` 监听并写入 store
3. **指令结果模式**：`commandResult` 消息通过 `{ type, data, timestamp }` 格式推送，前端在 App.tsx 全局监听
4. **路由模式**：`@react-navigation/native-stack`，在 `App.tsx` 的 `Stack.Navigator` 中注册
5. **PlayerBase 已有 combat 字段**：`PlayerStatsMessage.data.combat` 包含 `{ attack, defense }`

## 架构概览

```
                         ┌──────────────┐
                         │ HeartbeatMgr │
                         │  (1s tick)   │
                         └──────┬───────┘
                                │ tick
                         ┌──────▼───────┐
                         │ CombatManager │ (新增)
                         │ - combats Map │
                         │ - ATB 轮转    │
                         └──────┬───────┘
                                │ 攻击事件
                    ┌───────────┼───────────┐
              ┌─────▼─────┐          ┌─────▼─────┐
              │DamageEngine│          │LivingBase │
              │(新增)      │          │扩展:      │
              │- 攻防计算  │          │receiveDmg │
              │- 命中判定  │          │die()      │
              │- 暴击判定  │          │战斗状态   │
              └───────────┘          └───────────┘
                                          │
                                   player.sendToClient()
                                          │
                          ┌───────────────▼───────────────┐
                          │      WebSocket 消息推送        │
                          │ combatStart/Update/End        │
                          └───────────────┬───────────────┘
                                          │
                          ┌───────────────▼───────────────┐
                          │    Client: CombatScreen       │
                          │ ATB Gauge + HP Bar + Log      │
                          └───────────────────────────────┘
```

### 数据流

```
1. 玩家输入 "kill 守卫"
   → CommandHandler.handleCommand()
   → kill 指令执行
   → CombatManager.startCombat(player, npc)
   → player.sendToClient({ type: 'combatStart', data: {...} })

2. 心跳循环
   → HeartbeatManager.tick()
   → CombatManager.onHeartbeat()
   → 遍历 combats → ATB gauge 累积 → 满条触发攻击
   → DamageEngine.calculate(attacker, defender)
   → defender.receiveDamage(amount)
   → player.sendToClient({ type: 'combatUpdate', data: {...} })

3. 战斗结束
   → HP <= 0 → CombatManager.endCombat(id, reason)
   → player.sendToClient({ type: 'combatEnd', data: {...} })
   → NPC: destroy + scheduleRespawn
   → Player: 复活到广场
```

---

## ⚡ API 契约（WebSocket 消息协议）

> **此章节定义前后端的消息对齐合同。exec 阶段必须严格遵守。**

### 消息总览

| #   | 消息类型       | 方向            | 说明                     |
| --- | -------------- | --------------- | ------------------------ |
| 1   | `combatStart`  | Server → Client | 战斗开始，前端跳转战斗页 |
| 2   | `combatUpdate` | Server → Client | 每次攻击/闪避/暴击推送   |
| 3   | `combatEnd`    | Server → Client | 战斗结束，前端返回主页   |

### 消息详情

#### 1. combatStart（战斗开始）

**触发时机**：`kill` 指令成功创建战斗后推送

```json
{
  "type": "combatStart",
  "data": {
    "combatId": "combat_1707200000_001",
    "player": {
      "name": "令狐冲",
      "level": 5,
      "hp": 120,
      "maxHp": 150,
      "atbPct": 0
    },
    "enemy": {
      "name": "北门守卫",
      "level": 8,
      "hp": 200,
      "maxHp": 200,
      "atbPct": 0
    }
  },
  "timestamp": 1707200000000
}
```

#### 2. combatUpdate（战斗更新）

**触发时机**：每次攻击/闪避/暴击/逃跑失败后推送

```json
{
  "type": "combatUpdate",
  "data": {
    "combatId": "combat_1707200000_001",
    "actions": [
      {
        "attacker": "player",
        "type": "attack",
        "damage": 23,
        "isCrit": false,
        "description": "你挥动[eqweapon]铁剑[/eqweapon]砍向[npc]北门守卫[/npc]，造成 [damage]23[/damage] 点伤害。"
      }
    ],
    "player": {
      "hp": 120,
      "maxHp": 150,
      "atbPct": 35
    },
    "enemy": {
      "hp": 177,
      "maxHp": 200,
      "atbPct": 72
    }
  },
  "timestamp": 1707200001000
}
```

**actions 数组**：同一 tick 内可能有多个 action（快速角色连续出手）

**action.type 枚举**：

| type        | 说明              | damage 字段 |
| ----------- | ----------------- | ----------- |
| `attack`    | 普通攻击          | 有          |
| `crit`      | 暴击（Phase 1）   | 有          |
| `miss`      | 未命中（Phase 1） | 无          |
| `flee_fail` | 逃跑失败          | 无          |

**action.attacker 枚举**：

| attacker | 说明     |
| -------- | -------- |
| `player` | 玩家出手 |
| `enemy`  | 敌方出手 |

#### 3. combatEnd（战斗结束）

**触发时机**：一方死亡、逃跑成功

```json
{
  "type": "combatEnd",
  "data": {
    "combatId": "combat_1707200000_001",
    "reason": "victory",
    "message": "你击败了[npc]北门守卫[/npc]！"
  },
  "timestamp": 1707200015000
}
```

**reason 枚举**：

| reason    | 说明     | 后续处理             |
| --------- | -------- | -------------------- |
| `victory` | 玩家胜利 | NPC 销毁 + 定时刷新  |
| `defeat`  | 玩家战败 | 玩家复活到广场       |
| `flee`    | 逃跑成功 | 战斗双方恢复正常状态 |

---

## ⚡ 状态枚举对照表

### 战斗状态（CombatState）

| 枚举值 | 后端 TS 常量 | 消息传输值 | 前端 TS 常量 | 说明       |
| ------ | ------------ | ---------- | ------------ | ---------- |
| 空闲   | `'idle'`     | 不传输     | `'idle'`     | 非战斗状态 |
| 战斗中 | `'fighting'` | 不传输     | `'fighting'` | 战斗进行中 |
| 死亡   | `'dead'`     | 不传输     | `'dead'`     | HP 归零    |

**说明**：战斗状态存储在 `tmpDbase('combat/state')`（后端）和 Zustand store（前端），不通过专门消息传输。前端通过 `combatStart` → `fighting`、`combatEnd` → `idle` 推断状态。

### 战斗结束原因（CombatEndReason）

| 枚举值 | 后端 TS     | 消息传输值  | 前端 TS     | 显示文本   |
| ------ | ----------- | ----------- | ----------- | ---------- |
| 胜利   | `'victory'` | `"victory"` | `'victory'` | "胜利"     |
| 战败   | `'defeat'`  | `"defeat"`  | `'defeat'`  | "战败"     |
| 逃跑   | `'flee'`    | `"flee"`    | `'flee'`    | "逃离战斗" |

### 攻击动作类型（CombatActionType）

| 枚举值   | 后端 TS       | 消息传输值    | 前端 TS       | 说明                |
| -------- | ------------- | ------------- | ------------- | ------------------- |
| 攻击     | `'attack'`    | `"attack"`    | `'attack'`    | 普通攻击命中        |
| 暴击     | `'crit'`      | `"crit"`      | `'crit'`      | 暴击命中（Phase 1） |
| 未命中   | `'miss'`      | `"miss"`      | `'miss'`      | 攻击闪避（Phase 1） |
| 逃跑失败 | `'flee_fail'` | `"flee_fail"` | `'flee_fail'` | 逃跑判定失败        |

### 攻击方标识（CombatSide）

| 枚举值 | 后端 TS    | 消息传输值 | 前端 TS    |
| ------ | ---------- | ---------- | ---------- |
| 玩家   | `'player'` | `"player"` | `'player'` |
| 敌方   | `'enemy'`  | `"enemy"`  | `'enemy'`  |

---

## ⚡ 字段映射表

### combatStart 字段映射

| #   | 功能        | 后端变量             | 消息 JSON 字段 | 前端 TS 字段  | 类型   | 必填 |
| --- | ----------- | -------------------- | -------------- | ------------- | ------ | ---- |
| 1   | 战斗 ID     | combatId             | combatId       | combatId      | string | Y    |
| 2   | 玩家名      | player.getName()     | player.name    | player.name   | string | Y    |
| 3   | 玩家等级    | player.get('level')  | player.level   | player.level  | number | Y    |
| 4   | 玩家当前 HP | player.get('hp')     | player.hp      | player.hp     | number | Y    |
| 5   | 玩家最大 HP | player.get('max_hp') | player.maxHp   | player.maxHp  | number | Y    |
| 6   | 玩家 ATB%   | 0                    | player.atbPct  | player.atbPct | number | Y    |
| 7   | 敌方名      | enemy.getName()      | enemy.name     | enemy.name    | string | Y    |
| 8   | 敌方等级    | enemy.get('level')   | enemy.level    | enemy.level   | number | Y    |
| 9   | 敌方当前 HP | enemy.get('hp')      | enemy.hp       | enemy.hp      | number | Y    |
| 10  | 敌方最大 HP | enemy.get('max_hp')  | enemy.maxHp    | enemy.maxHp   | number | Y    |
| 11  | 敌方 ATB%   | 0                    | enemy.atbPct   | enemy.atbPct  | number | Y    |

### combatUpdate 字段映射

| #   | 功能       | 后端变量             | 消息 JSON 字段        | 前端 TS 字段          | 类型             | 必填 |
| --- | ---------- | -------------------- | --------------------- | --------------------- | ---------------- | ---- |
| 1   | 战斗 ID    | combatId             | combatId              | combatId              | string           | Y    |
| 2   | 动作列表   | actions[]            | actions               | actions               | CombatAction[]   | Y    |
| 3   | 攻击方     | action.attacker      | actions[].attacker    | actions[].attacker    | CombatSide       | Y    |
| 4   | 动作类型   | action.type          | actions[].type        | actions[].type        | CombatActionType | Y    |
| 5   | 伤害值     | action.damage        | actions[].damage      | actions[].damage      | number?          | N    |
| 6   | 是否暴击   | action.isCrit        | actions[].isCrit      | actions[].isCrit      | boolean          | Y    |
| 7   | 描述文本   | action.description   | actions[].description | actions[].description | string           | Y    |
| 8   | 玩家 HP    | player.get('hp')     | player.hp             | player.hp             | number           | Y    |
| 9   | 玩家 maxHP | player.get('max_hp') | player.maxHp          | player.maxHp          | number           | Y    |
| 10  | 玩家 ATB%  | Math.floor(gauge/10) | player.atbPct         | player.atbPct         | number           | Y    |
| 11  | 敌方 HP    | enemy.get('hp')      | enemy.hp              | enemy.hp              | number           | Y    |
| 12  | 敌方 maxHP | enemy.get('max_hp')  | enemy.maxHp           | enemy.maxHp           | number           | Y    |
| 13  | 敌方 ATB%  | Math.floor(gauge/10) | enemy.atbPct          | enemy.atbPct          | number           | Y    |

### combatEnd 字段映射

| #   | 功能     | 后端变量 | 消息 JSON 字段 | 前端 TS 字段 | 类型            | 必填 |
| --- | -------- | -------- | -------------- | ------------ | --------------- | ---- |
| 1   | 战斗 ID  | combatId | combatId       | combatId     | string          | Y    |
| 2   | 结束原因 | reason   | reason         | reason       | CombatEndReason | Y    |
| 3   | 结算消息 | message  | message        | message      | string          | Y    |

### 命名规范确认

- **后端 dbase**: snake_case（`max_hp`, `combat/state`）
- **后端代码**: camelCase（`combatId`, `getCombatSpeed()`）
- **消息 JSON**: camelCase（`combatId`, `maxHp`, `atbPct`）
- **前端 TS**: camelCase（`combatId`, `maxHp`, `atbPct`）

---

## 前端 TypeScript 类型定义

```typescript
/** 战斗参与者信息 */
interface CombatFighter {
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  atbPct: number; // 0-100 读条百分比
}

/** 战斗动作 */
interface CombatAction {
  attacker: 'player' | 'enemy';
  type: 'attack' | 'crit' | 'miss' | 'flee_fail';
  damage?: number;
  isCrit: boolean;
  description: string; // 富文本战斗描述
}

/** combatStart 消息 */
interface CombatStartData {
  combatId: string;
  player: CombatFighter;
  enemy: CombatFighter;
}

/** combatUpdate 消息 */
interface CombatUpdateData {
  combatId: string;
  actions: CombatAction[];
  player: Pick<CombatFighter, 'hp' | 'maxHp' | 'atbPct'>;
  enemy: Pick<CombatFighter, 'hp' | 'maxHp' | 'atbPct'>;
}

/** combatEnd 消息 */
interface CombatEndData {
  combatId: string;
  reason: 'victory' | 'defeat' | 'flee';
  message: string;
}
```

---

## 前端设计

### 页面/组件结构

```
client/src/
├── screens/
│   └── CombatScreen.tsx           # 战斗页面（路由容器，< 50 行）
├── components/game/
│   └── Combat/                    # 战斗组件目录
│       ├── index.tsx              # 战斗区域容器（从 store 取数据）
│       ├── CombatHeader.tsx       # 双方名字 + 等级
│       ├── FighterPanel.tsx       # 单个战斗者面板（HP + ATB）
│       ├── AtbGauge.tsx           # ATB 读条进度条
│       ├── CombatLog.tsx          # 战斗日志（复用 LogScrollView）
│       └── FleeButton.tsx         # 逃跑按钮
└── stores/
    └── useGameStore.ts            # 新增 combat 切片
```

### 状态管理

在 `useGameStore` 中新增 combat 切片：

```typescript
// useGameStore 新增切片
interface GameState {
  // ... 现有字段 ...

  // 战斗
  combat: {
    active: boolean; // 是否在战斗中
    combatId: string | null;
    player: CombatFighter | null;
    enemy: CombatFighter | null;
    log: CombatAction[]; // 战斗日志
    result: CombatEndData | null; // 战斗结果（展示用）
  };
  setCombatStart: (data: CombatStartData) => void;
  setCombatUpdate: (data: CombatUpdateData) => void;
  setCombatEnd: (data: CombatEndData) => void;
  clearCombat: () => void;
}
```

### 路由注册

```typescript
// App.tsx Stack.Navigator 新增
<Stack.Screen name="Combat" component={CombatScreen} />
```

### WebSocket 消息监听

```typescript
// App.tsx 新增全局监听
const handleCombatStart = (data: CombatStartData) => {
  useGameStore.getState().setCombatStart(data);
  // 跳转到战斗页面（需要 navigation ref）
  navigationRef.navigate('Combat');
};

const handleCombatUpdate = (data: CombatUpdateData) => {
  useGameStore.getState().setCombatUpdate(data);
};

const handleCombatEnd = (data: CombatEndData) => {
  useGameStore.getState().setCombatEnd(data);
  // 延迟返回主页（展示结算信息）
  setTimeout(() => {
    navigationRef.navigate('GameHome');
    useGameStore.getState().clearCombat();
  }, 2000);
};

wsService.on('combatStart', handleCombatStart);
wsService.on('combatUpdate', handleCombatUpdate);
wsService.on('combatEnd', handleCombatEnd);
```

---

## 后端设计

### 代码路径

```
server/src/engine/
├── combat/                        # 新增：战斗模块
│   ├── combat-manager.ts         # CombatManager — 战斗调度器
│   ├── damage-engine.ts          # DamageEngine — 伤害计算引擎
│   └── types.ts                  # 战斗相关类型定义
├── game-objects/
│   ├── living-base.ts            # 修改：新增战斗属性/HP管理
│   ├── npc-base.ts               # 修改：扩展战斗AI
│   └── player-base.ts            # 修改：getAttack/getDefense/getCombatSpeed
├── commands/std/
│   ├── kill.ts                   # 新增：kill 指令
│   ├── flee.ts                   # 新增：flee 指令
│   └── go.ts                     # 修改：战斗状态检查
├── types/
│   └── events.ts                 # 修改：新增战斗事件
├── spawn-manager.ts              # 修改：新增 scheduleRespawn
└── command-loader.ts             # 修改：注册 kill/flee

packages/core/src/
├── types/messages/
│   └── combat.ts                 # 新增：战斗消息类型
├── factory/handlers/
│   ├── combatStart.ts            # 新增
│   ├── combatUpdate.ts           # 新增
│   └── combatEnd.ts              # 新增
├── factory/index.ts              # 修改：导入新 handler
├── types/
│   └── combat-constants.ts       # 新增：战斗常量
└── index.ts                      # 修改：导出新类型
```

### 关键类/模块

#### CombatManager（战斗调度器）

```typescript
class CombatManager extends BaseEntity {
  private combats: Map<string, CombatInstance>;

  /** 创建战斗 */
  startCombat(attacker: LivingBase, defender: LivingBase): string;

  /** 心跳处理所有战斗 */
  onHeartbeat(): void;

  /** 处理单场战斗（ATB 累积 + 攻击触发） */
  private processCombat(combat: CombatInstance): void;

  /** 结束战斗 */
  endCombat(combatId: string, reason: CombatEndReason): void;

  /** 查询实体是否在战斗中 */
  isInCombat(entity: LivingBase): boolean;

  /** 处理逃跑 */
  attemptFlee(combatId: string, fleer: LivingBase): boolean;
}
```

#### DamageEngine（伤害计算）

```typescript
class DamageEngine {
  /** 计算一次攻击 */
  static calculate(
    attacker: LivingBase,
    defender: LivingBase,
  ): {
    type: CombatActionType;
    damage: number;
    isCrit: boolean;
    description: string;
  };

  /** 命中判定（Phase 1） */
  private static rollHit(attacker: LivingBase, defender: LivingBase): boolean;

  /** 暴击判定（Phase 1） */
  private static rollCrit(attacker: LivingBase): boolean;

  /** 伤害公式 */
  private static calculateDamage(attack: number, defense: number): number;

  /** 生成战斗描述 */
  private static generateDescription(
    attacker: LivingBase,
    defender: LivingBase,
    damage: number,
    isCrit: boolean,
    defenderMaxHp: number,
  ): string;
}
```

#### LivingBase 扩展

```typescript
class LivingBase extends BaseEntity {
  // 新增方法:
  getAttack(): number; // 力量×2 + 装备攻击
  getDefense(): number; // 体质×1.5 + 装备防御
  getCombatSpeed(): number; // perception×3 + spirit×2 + strength×1 + meridian×1
  receiveDamage(amount: number): void; // 扣血 + 检查死亡
  die(): void; // 死亡处理（子类覆写）
  isInCombat(): boolean; // 检查 tmpDbase combat/state
  getCombatState(): string; // idle | fighting | dead
}
```

#### SpawnManager 扩展

```typescript
class SpawnManager {
  // 新增方法:
  scheduleRespawn(rule: SpawnRule): void; // callOut 定时重生
}
```

### ATB 核心算法（伪代码）

```typescript
// CombatManager.processCombat()
processCombat(combat: CombatInstance): void {
  const actions: CombatAction[] = [];

  for (const participant of combat.participants.values()) {
    const entity = participant.entity;
    const speed = entity.getCombatSpeed();
    const fillRate = speed * SPEED_FACTOR; // SPEED_FACTOR = 5

    participant.gauge += fillRate;

    // while 循环：允许同一 tick 多次出手
    while (participant.gauge >= MAX_GAUGE) { // MAX_GAUGE = 1000
      participant.gauge -= MAX_GAUGE;

      const target = participant.target;
      const result = DamageEngine.calculate(entity, target);

      if (result.damage > 0) {
        target.receiveDamage(result.damage);
      }

      actions.push({
        attacker: participant.side,
        ...result,
      });

      // 检查目标死亡
      if (target.get('hp') <= 0) {
        this.endCombat(combat.id, participant.side === 'player' ? 'victory' : 'defeat');
        return;
      }
    }
  }

  // 推送 combatUpdate
  if (actions.length > 0) {
    this.sendCombatUpdate(combat, actions);
  }
}
```

---

## 影响范围

### 修改的已有文件

| 文件                                               | 修改内容                                                            |
| -------------------------------------------------- | ------------------------------------------------------------------- |
| `server/src/engine/game-objects/living-base.ts`    | 新增 getAttack/getDefense/getCombatSpeed/receiveDamage/die          |
| `server/src/engine/game-objects/npc-base.ts`       | onAI() 扩展 doCombat，die() 覆写                                    |
| `server/src/engine/game-objects/player-base.ts`    | die() 覆写（复活逻辑），getAttack/getDefense 使用 getEquipmentBonus |
| `server/src/engine/types/events.ts`                | 新增 COMBAT_START/COMBAT_END/PRE_ATTACK/POST_ATTACK/DEATH           |
| `server/src/engine/spawn-manager.ts`               | 新增 scheduleRespawn()                                              |
| `server/src/engine/command-loader.ts`              | 注册 kill/flee 指令                                                 |
| `server/src/engine/commands/std/go.ts`             | 战斗状态检查                                                        |
| `server/src/engine/engine.module.ts`               | 注册 CombatManager provider                                         |
| `server/src/websocket/handlers/command.handler.ts` | kill 指令后的战斗消息路由                                           |
| `packages/core/src/factory/index.ts`               | 导入 combat handler                                                 |
| `packages/core/src/index.ts`                       | 导出 combat 类型和常量                                              |
| `client/App.tsx`                                   | 注册 CombatScreen 路由 + combat 消息监听                            |
| `client/src/stores/useGameStore.ts`                | 新增 combat 状态切片                                                |

### 新增的文件

| 文件                                                 | 说明           |
| ---------------------------------------------------- | -------------- |
| `server/src/engine/combat/combat-manager.ts`         | 战斗调度器     |
| `server/src/engine/combat/damage-engine.ts`          | 伤害计算引擎   |
| `server/src/engine/combat/types.ts`                  | 战斗类型定义   |
| `server/src/engine/commands/std/kill.ts`             | kill 指令      |
| `server/src/engine/commands/std/flee.ts`             | flee 指令      |
| `packages/core/src/types/messages/combat.ts`         | 战斗消息类型   |
| `packages/core/src/types/combat-constants.ts`        | 战斗常量       |
| `packages/core/src/factory/handlers/combatStart.ts`  | MessageHandler |
| `packages/core/src/factory/handlers/combatUpdate.ts` | MessageHandler |
| `packages/core/src/factory/handlers/combatEnd.ts`    | MessageHandler |
| `client/src/screens/CombatScreen.tsx`                | 战斗页面       |
| `client/src/components/game/Combat/index.tsx`        | 战斗容器组件   |
| `client/src/components/game/Combat/CombatHeader.tsx` | 双方信息       |
| `client/src/components/game/Combat/FighterPanel.tsx` | 战斗者面板     |
| `client/src/components/game/Combat/AtbGauge.tsx`     | ATB 读条       |
| `client/src/components/game/Combat/CombatLog.tsx`    | 战斗日志       |
| `client/src/components/game/Combat/FleeButton.tsx`   | 逃跑按钮       |

### 潜在冲突

- `command.handler.ts` 需要注入 CombatManager
- `go.ts` 需要检查战斗状态，可能需要访问 CombatManager（通过 ServiceLocator）

## 风险点

| 风险                               | 应对方案                                             |
| ---------------------------------- | ---------------------------------------------------- |
| ATB 频率过快导致消息洪流           | combatUpdate 合并同一 tick 内所有 actions 为一条消息 |
| CombatManager 心跳异常影响其他对象 | HeartbeatManager 已有异常隔离（try-catch）           |
| 前端导航竞态（战斗结束时正在跳转） | combatEnd 使用 setTimeout 延迟返回                   |
| NPC 在战斗中被销毁（超时清理）     | 战斗中的 NPC 标记 tmpDbase 防止 onCleanUp            |
| 玩家断线时的战斗处理               | handleDisconnect 中检查并结束战斗                    |
| SpawnManager 重生时房间不存在      | 重生前校验房间存在性                                 |

---

> CX 工作流 | Design Doc | PRD #197 | Scope #196
