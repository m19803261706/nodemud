# Design Doc: NPC 基础系统 — Phase 0（活过来 + 会说话）

## 关联

- PRD: #135
- Scope: #134（NPC 系统细化设计）
- 世界观: #84（天衍世界观设定 — 八方势力）
- 裂隙镇地图: #85（出生点地图 — 15 个房间 + NPC 规划）

## 基于现有代码

### 可直接使用

| 模块                 | 路径                                         | 用途                                            |
| -------------------- | -------------------------------------------- | ----------------------------------------------- |
| NpcBase              | `server/src/engine/game-objects/npc-base.ts` | 心跳→onAI 钩子、onChat 钩子                     |
| LivingBase           | `living-base.ts`                             | getName/getShort/getLong/go/executeCommand      |
| BaseEntity           | `base-entity.ts`                             | Dbase set/get、Environment 7 步事件链、心跳注册 |
| BlueprintFactory     | `blueprint-factory.ts`                       | clone() 创建 NPC 多实例                         |
| Area.getSpawnRules() | `area.ts`                                    | SpawnRule 接口已定义                            |
| RoomBase.broadcast() | `room-base.ts`                               | 房间广播（遍历 inventory emit message）         |
| HeartbeatManager     | `heartbeat-manager.ts`                       | 全局心跳调度（累积器模式）                      |
| look 命令            | `commands/std/look.ts`                       | 已有 lookAtRoom，需扩展 look NPC                |
| 富文本               | `packages/core/src/rich-text/`               | rt('npc', name) 标签协议                        |
| 前端 NpcList/NpcCard | `client/src/components/game/NpcList/`        | 已有组件，需适配真实数据                        |
| Zustand nearbyNpcs   | `useGameStore.ts`                            | 已有 NpcData 接口和 setNpcs action              |

### 需要新建的文件

| 文件                                                    | 用途                                 |
| ------------------------------------------------------- | ------------------------------------ |
| `packages/core/src/constants/factions.ts`               | Factions 常量（前后端共享）          |
| `packages/core/src/factory/handlers/roomInfo.ts`        | 扩展 roomInfo Handler 支持 npcs 字段 |
| `server/src/engine/spawn-manager.ts`                    | SpawnManager 刷新管理器              |
| `server/src/engine/commands/std/ask.ts`                 | ask 对话指令                         |
| `server/src/world/npc/rift-town/town-elder.ts`          | 老镇长蓝图                           |
| `server/src/world/npc/rift-town/bartender.ts`           | 酒保蓝图                             |
| `server/src/world/npc/rift-town/mysterious-traveler.ts` | 神秘旅人蓝图                         |
| `server/src/world/npc/rift-town/innkeeper.ts`           | 客栈老板蓝图                         |
| `server/src/world/npc/rift-town/herbalist.ts`           | 白发药师蓝图                         |
| `server/src/world/npc/rift-town/blacksmith.ts`          | 老周铁匠蓝图                         |
| `server/src/world/npc/rift-town/merchant.ts`            | 杂货商蓝图                           |
| `server/src/world/npc/rift-town/old-beggar.ts`          | 老乞丐蓝图                           |
| `server/src/world/npc/rift-town/north-guard.ts`         | 北门卫兵蓝图                         |
| `server/src/world/npc/rift-town/south-guard.ts`         | 南门卫兵蓝图                         |

### 需要修改的文件

| 文件                                             | 修改内容                                     |
| ------------------------------------------------ | -------------------------------------------- |
| `server/src/engine/game-objects/npc-base.ts`     | 扩展 onAI 闲聊逻辑（chat_chance + chat_msg） |
| `server/src/engine/commands/std/look.ts`         | 扩展支持 `look <npc名>`                      |
| `server/src/world/area/rift-town/area.ts`        | 添加 spawn_rules 配置                        |
| `server/src/websocket/handlers/room-utils.ts`    | sendRoomInfo 附带 NPC 列表                   |
| `server/src/engine/engine.module.ts`             | 注册 SpawnManager                            |
| `client/src/stores/useGameStore.ts`              | 修改 NpcData 接口、删除 INITIAL_NPCS         |
| `client/src/components/game/NpcList/NpcCard.tsx` | 适配新字段                                   |
| `client/App.tsx`                                 | 处理 roomInfo 中的 npcs 数据                 |
| `packages/core/src/index.ts`                     | 导出 Factions 常量                           |

---

## 架构概览

```
服务端启动
  ↓
EngineModule.onModuleInit()
  ├── BlueprintLoader 扫描 world/ 目录 → 注册 NPC 蓝图（virtual objects）
  └── SpawnManager.init() → 读取所有 Area.spawn_rules
       └── 每条规则: clone(blueprintId) → instance.moveTo(room) → enableHeartbeat()
  ↓
运行时
  ├── HeartbeatManager tick → NPC.onHeartbeat() → onAI()
  │   └── chat_chance 命中 → room.broadcast(chat_msg[random])
  ├── 玩家进入房间 → sendRoomInfo(player, room)
  │   └── 遍历 room.getInventory() → 收集 NPC 数据 → 附加到 roomInfo
  ├── look <npc名> → 在房间 inventory 中查找 → 返回 NPC long 描述
  └── ask <npc名> about <keyword> → 匹配 inquiry mapping → 返回回答
```

---

## ⚡ 消息协议契约

> **此章节是前后端的对齐合同。实现阶段必须严格遵守此处定义的消息格式和字段。**

### 消息总览

| #   | 消息类型                 | 方向            | 说明                         |
| --- | ------------------------ | --------------- | ---------------------------- |
| 1   | roomInfo                 | Server → Client | 扩展现有消息，增加 npcs 字段 |
| 2   | commandResult (look NPC) | Server → Client | look NPC 的结果              |
| 3   | commandResult (ask)      | Server → Client | ask 对话的结果               |
| 4   | broadcast (chat)         | Server → Client | NPC 闲聊广播                 |

### 1. roomInfo 消息（扩展）

现有 roomInfo 消息增加 `npcs` 字段：

```typescript
// packages/core roomInfo Handler 扩展
interface RoomInfoData {
  short: string; // 房间名（已有）
  long: string; // 房间描述（已有）
  exits: string[]; // 出口方向列表（已有）
  exitNames: Record<string, string>; // 出口名称映射（已有）
  coordinates: RoomCoordinates; // 坐标（已有）
  npcs: NpcBrief[]; // ← 新增：房间内 NPC 列表
}

interface NpcBrief {
  id: string; // NPC 实例 ID（如 "npc/rift-town/bartender#1"）
  name: string; // 名字（如 "酒保"）
  title: string; // 头衔/归属（如 "裂隙镇"）
  gender: string; // "male" | "female"
  faction: string; // 势力显示名（如 ""、"承天朝"），隐藏势力传空串
  level: number; // 等级
  hpPct: number; // 血量百分比 0-100
  attitude: string; // "friendly" | "neutral" | "aggressive"
}
```

**服务端构建方式**：

```typescript
// room-utils.ts 中的 sendRoomInfo 扩展
const npcs: NpcBrief[] = room
  .getInventory()
  .filter((e) => e instanceof NpcBase)
  .map((npc) => ({
    id: npc.id,
    name: npc.getName(),
    title: npc.get<string>('title') || '',
    gender: npc.get<string>('gender') || 'male',
    faction: npc.get<string>('visible_faction') || '',
    level: npc.get<number>('level') || 1,
    hpPct: calcHpPct(npc),
    attitude: npc.get<string>('attitude') || 'neutral',
  }));
```

### 2. commandResult — look NPC

`look <npc名>` 的返回结果：

```json
{
  "type": "commandResult",
  "data": {
    "success": true,
    "message": "[rn][b]断崖酒馆·酒保[/b][/rn]\n「裂隙镇」酒保 [男]\n[rd]柜台后的酒保四十来岁...[/rd]",
    "data": {
      "action": "look",
      "target": "npc",
      "npcId": "npc/rift-town/bartender#1"
    }
  },
  "timestamp": 1706979845000
}
```

**匹配规则**：在当前房间 `getInventory()` 中查找 `getName()` 包含输入关键词的 NPC（模糊匹配）。

### 3. commandResult — ask

`ask <npc名> about <keyword>` 的返回结果：

**匹配成功**：

```json
{
  "type": "commandResult",
  "data": {
    "success": true,
    "message": "你向酒保打听消息。\n[npc]酒保[/npc]放下手里的杯子，压低声音说：「最近裂谷深处不太平...」",
    "data": {
      "action": "ask",
      "npcId": "npc/rift-town/bartender#1",
      "keyword": "消息"
    }
  },
  "timestamp": 1706979845000
}
```

**匹配失败（default 回答）**：

```json
{
  "type": "commandResult",
  "data": {
    "success": true,
    "message": "你向酒保打听天裂。\n[npc]酒保[/npc]不置可否地摇了摇头：「这种事我可不清楚，你去问问广场上的老镇长。」",
    "data": {
      "action": "ask",
      "npcId": "npc/rift-town/bartender#1",
      "keyword": "天裂"
    }
  },
  "timestamp": 1706979845000
}
```

**NPC 不存在**：

```json
{
  "type": "commandResult",
  "data": {
    "success": false,
    "message": "这里没有这个人。"
  },
  "timestamp": 1706979845000
}
```

### 4. broadcast — NPC 闲聊

NPC 闲聊通过 `room.broadcast()` 发送，前端收到的消息格式：

```json
{
  "type": "commandResult",
  "data": {
    "success": true,
    "message": "[npc]酒保[/npc]擦了擦柜台上的酒渍。",
    "data": {
      "action": "npc_chat",
      "npcId": "npc/rift-town/bartender#1"
    }
  },
  "timestamp": 1706979845000
}
```

> 注意：NPC 闲聊复用 `player.receiveMessage()` 机制，前端已有 GameLog 显示逻辑。具体实现时需确认 broadcast 传递到玩家的消息格式。如果 broadcast 走的是 `entity.emit('message')` → 前端需要监听此消息类型。

---

## ⚡ 数据模型契约

### Factions 常量定义

```typescript
// packages/core/src/constants/factions.ts
export const Factions = {
  NONE: '',
  CHENG_TIAN: '承天朝',
  SONG_YANG: '嵩阳宗',
  YUN_YUE: '云岳派',
  BI_LAN: '碧澜阁',
  AN_HE: '暗河',
  LANG_TING: '北漠·狼庭',
  SAN_MENG: '东海·散盟',
  BAI_MAN: '西南·百蛮',
  XI_YU: '西域·遗民',
  TIAN_LIE: '天裂教',
} as const;

export type FactionKey = keyof typeof Factions;
export type FactionName = (typeof Factions)[FactionKey];
```

### NPC Dbase 属性规范

| 属性路径          | 类型                   | 必填 | 说明                       | 示例                                        |
| ----------------- | ---------------------- | ---- | -------------------------- | ------------------------------------------- |
| `name`            | string                 | ✅   | 名字                       | `"酒保"`                                    |
| `short`           | string                 | ✅   | 简短描述                   | `"一个不苟言笑的中年男子"`                  |
| `long`            | string                 | ✅   | 详细描述                   | 长文本                                      |
| `title`           | string                 | ❌   | 头衔/归属                  | `"裂隙镇"`                                  |
| `gender`          | string                 | ✅   | 性别                       | `"male"` / `"female"`                       |
| `faction`         | string                 | ❌   | 真实势力（Factions 值）    | `Factions.CHENG_TIAN`                       |
| `visible_faction` | string                 | ❌   | 对外显示势力（隐藏时为空） | `""`                                        |
| `attitude`        | string                 | ✅   | 态度                       | `"friendly"` / `"neutral"` / `"aggressive"` |
| `level`           | number                 | ✅   | 等级                       | `15`                                        |
| `max_hp`          | number                 | ✅   | 最大血量                   | `500`                                       |
| `hp`              | number                 | ✅   | 当前血量                   | `500`                                       |
| `chat_chance`     | number                 | ❌   | 闲聊概率(%)                | `15`                                        |
| `chat_msg`        | string[]               | ❌   | 闲聊内容数组               | `["酒保擦了擦杯子。"]`                      |
| `inquiry`         | Record<string, string> | ❌   | 问答映射                   | `{ "消息": "最近...", "default": "..." }`   |

### 前端 NpcData 接口（修改）

```typescript
// client/src/stores/useGameStore.ts
export interface NpcData {
  id: string; // NPC 实例 ID
  name: string; // 名字
  title: string; // 头衔
  gender: string; // "male" | "female"
  faction: string; // 势力显示名
  level: number; // 等级（数字）
  hpPct: number; // 血量百分比 0-100
  attitude: string; // 态度
}
```

**与现有 NpcData 对比变更**：

| 旧字段                       | 新字段                    | 变更                         |
| ---------------------------- | ------------------------- | ---------------------------- |
| `name: string`               | `name: string`            | 不变                         |
| `nameColor: string`          | 删除                      | 由 attitude/faction 前端计算 |
| `gender: string` ("♂")       | `gender: string` ("male") | 改为语义值，前端显示时转换   |
| `genderColor: string`        | 删除                      | 前端按 gender 值计算         |
| `level: string` ("四十六级") | `level: number` (46)      | 改为数字，前端格式化         |
| `hpPct: number`              | `hpPct: number`           | 不变                         |
| `hpColor: string`            | 删除                      | 前端按 hpPct 计算            |
| `borderColor: string`        | 删除                      | 前端按 attitude 计算         |
| —                            | `id: string`              | 新增                         |
| —                            | `title: string`           | 新增                         |
| —                            | `faction: string`         | 新增                         |
| —                            | `attitude: string`        | 新增                         |

### NPC 卡片颜色规则

```typescript
// 前端 NpcCard 中的颜色计算
const nameColor =
  {
    friendly: '#2F5D3A', // 友好：绿色
    neutral: '#8B7A5A', // 中立：灰褐
    aggressive: '#8B2500', // 敌对：暗红
  }[attitude] || '#8B7A5A';

const borderColor = nameColor;

const genderDisplay = gender === 'male' ? '♂' : '♀';
const genderColor = gender === 'male' ? '#4A90D9' : '#D94A7A';

const levelDisplay = `${level}级`;
```

---

## 后端设计

### SpawnManager

```typescript
// server/src/engine/spawn-manager.ts
@Injectable()
export class SpawnManager implements OnModuleInit {
  constructor(
    private readonly objectManager: ObjectManager,
    private readonly blueprintFactory: BlueprintFactory,
  ) {}

  async onModuleInit() {
    this.spawnAll();
  }

  /** 读取所有 Area 的 spawn_rules，执行初始刷新 */
  private spawnAll(): void {
    const areas = this.objectManager.findAll((area) => area instanceof Area);
    for (const area of areas) {
      const rules = (area as Area).getSpawnRules();
      for (const rule of rules) {
        this.spawnByRule(rule);
      }
    }
  }

  /** 按规则刷新 NPC */
  private spawnByRule(rule: SpawnRule): void {
    for (let i = 0; i < rule.count; i++) {
      const npc = this.blueprintFactory.clone(rule.blueprintId) as NpcBase;
      const room = this.objectManager.findById(rule.roomId);
      if (room) {
        npc.moveTo(room, { quiet: true });
        npc.enableHeartbeat(2000); // 2 秒心跳间隔
      }
    }
  }
}
```

### NPC 蓝图模板

```typescript
// server/src/world/npc/rift-town/bartender.ts
import { NpcBase } from '../../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class Bartender extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '酒保');
    this.set('short', '一个不苟言笑的中年男子');
    this.set('long', '柜台后的酒保四十来岁，一张不苟言笑的国字脸...');
    this.set('title', '裂隙镇');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'friendly');
    this.set('level', 15);
    this.set('max_hp', 500);
    this.set('hp', 500);
    this.set('chat_chance', 15);
    this.set('chat_msg', [
      '酒保擦了擦柜台上的酒渍。',
      '酒保不紧不慢地擦着杯子。',
      '酒保抬头扫了一眼酒馆里的客人。',
    ]);
    this.set('inquiry', {
      消息: '酒保放下手里的杯子，压低声音说：「最近裂谷深处不太平，有人说看到奇怪的光芒。北门的卫兵加了岗，你要是想往北走，最好小心点。」',
      裂隙镇:
        '酒保说：「裂隙镇虽小，但南来北往的人可不少。这里的人嘛，大多是为了讨口饭吃，不过也有些来历不明的家伙。」',
      default: '酒保不置可否地摇了摇头：「这种事我可不清楚，你去问问广场上的老镇长。」',
    });
  }
}
```

### NpcBase 闲聊扩展

```typescript
// server/src/engine/game-objects/npc-base.ts 扩展
protected onAI(): void {
  const chatChance = this.get<number>('chat_chance') || 0;
  if (chatChance <= 0) return;

  // 百分比概率判定
  if (Math.random() * 100 >= chatChance) return;

  const chatMsgs = this.get<string[]>('chat_msg');
  if (!chatMsgs || chatMsgs.length === 0) return;

  const msg = chatMsgs[Math.floor(Math.random() * chatMsgs.length)];
  const env = this.getEnvironment();
  if (env && env instanceof RoomBase) {
    env.broadcast(`[npc]${this.getName()}[/npc]${msg}`);
  }
}
```

### look NPC 扩展

```typescript
// look.ts 扩展 — 在 execute 方法中增加分支
if (args.length > 0) {
  const targetName = args.join(' ');
  const env = executor.getEnvironment();
  if (env) {
    const target = env.findInInventory(e =>
      e instanceof NpcBase && e.getName().includes(targetName)
    );
    if (target) {
      return this.lookAtNpc(target as NpcBase);
    }
    return { success: false, message: '这里没有这个人。' };
  }
}

private lookAtNpc(npc: NpcBase): CommandResult {
  const name = npc.getName();
  const title = npc.get<string>('title') || '';
  const long = npc.getLong();
  const gender = npc.get<string>('gender') === 'male' ? '男' : '女';
  const level = npc.get<number>('level') || 1;

  const header = title ? `${title}·${name}` : name;
  const lines = [
    rt('rn', bold(header)),
    title ? `「${title}」${name} [${gender}]` : `${name} [${gender}]`,
    rt('rd', long),
  ];

  return {
    success: true,
    message: lines.join('\n'),
    data: { action: 'look', target: 'npc', npcId: npc.id },
  };
}
```

### ask 指令

```typescript
// server/src/engine/commands/std/ask.ts
export default class AskCommand extends BaseCommand {
  name = 'ask';
  aliases = [];
  permission = Permission.PLAYER;
  help = 'ask <npc> about <keyword> — 向 NPC 提问';

  execute(executor: LivingBase, args: string[]): CommandResult {
    // 解析: ask 酒保 about 消息  或  ask 酒保 消息
    const input = args.join(' ');
    let npcName: string;
    let keyword: string;

    const aboutIndex = input.indexOf(' about ');
    if (aboutIndex !== -1) {
      npcName = input.substring(0, aboutIndex).trim();
      keyword = input.substring(aboutIndex + 7).trim();
    } else {
      // 简写格式: 最后一个空格后是关键词
      const lastSpace = input.lastIndexOf(' ');
      if (lastSpace === -1) {
        return { success: false, message: '格式: ask <NPC名> about <关键词>' };
      }
      npcName = input.substring(0, lastSpace).trim();
      keyword = input.substring(lastSpace + 1).trim();
    }

    // 查找 NPC
    const env = executor.getEnvironment();
    if (!env) return { success: false, message: '你不在任何地方。' };

    const npc = env.findInInventory((e) => e instanceof NpcBase && e.getName().includes(npcName));
    if (!npc) {
      return { success: false, message: '这里没有这个人。' };
    }

    const npcObj = npc as NpcBase;
    const inquiry = npcObj.get<Record<string, string>>('inquiry') || {};

    // 匹配关键词
    const answer = inquiry[keyword] || inquiry['default'] || `${npcObj.getName()}没有回应你。`;
    const message = `你向${npcObj.getName()}打听${keyword}。\n[npc]${npcObj.getName()}[/npc]${answer}`;

    // 触发 onChat 钩子
    npcObj.onChat(executor, keyword);

    return {
      success: true,
      message,
      data: { action: 'ask', npcId: npcObj.id, keyword },
    };
  }
}
```

### sendRoomInfo 扩展

```typescript
// room-utils.ts 扩展
import { NpcBase } from '../../engine/game-objects/npc-base';

function sendRoomInfo(player: PlayerBase, room: RoomBase, blueprintFactory?: BlueprintFactory) {
  // ... 现有逻辑 ...

  // 收集房间内 NPC
  const npcs = room
    .getInventory()
    .filter((e): e is NpcBase => e instanceof NpcBase)
    .map((npc) => ({
      id: npc.id,
      name: npc.getName(),
      title: npc.get<string>('title') || '',
      gender: npc.get<string>('gender') || 'male',
      faction: npc.get<string>('visible_faction') || '',
      level: npc.get<number>('level') || 1,
      hpPct: Math.round(((npc.get<number>('hp') || 0) / (npc.get<number>('max_hp') || 1)) * 100),
      attitude: npc.get<string>('attitude') || 'neutral',
    }));

  // 扩展 roomInfo 消息，附带 npcs
  const msg = {
    type: 'roomInfo',
    data: {
      short: room.getShort(),
      long: room.getLong(),
      exits: Object.keys(exits),
      exitNames,
      coordinates,
      npcs, // ← 新增
    },
    timestamp: Date.now(),
  };

  player.sendToClient(JSON.stringify(msg));
}
```

### 裂隙镇 spawn_rules

```typescript
// server/src/world/area/rift-town/area.ts
create() {
  // ... 现有代码 ...

  this.set('spawn_rules', [
    { blueprintId: 'npc/rift-town/town-elder', roomId: 'area/rift-town/square', count: 1, interval: 300000 },
    { blueprintId: 'npc/rift-town/bartender', roomId: 'area/rift-town/tavern', count: 1, interval: 300000 },
    { blueprintId: 'npc/rift-town/mysterious-traveler', roomId: 'area/rift-town/tavern', count: 1, interval: 300000 },
    { blueprintId: 'npc/rift-town/innkeeper', roomId: 'area/rift-town/inn', count: 1, interval: 300000 },
    { blueprintId: 'npc/rift-town/herbalist', roomId: 'area/rift-town/herb-shop', count: 1, interval: 300000 },
    { blueprintId: 'npc/rift-town/blacksmith', roomId: 'area/rift-town/smithy', count: 1, interval: 300000 },
    { blueprintId: 'npc/rift-town/merchant', roomId: 'area/rift-town/general-store', count: 1, interval: 300000 },
    { blueprintId: 'npc/rift-town/old-beggar', roomId: 'area/rift-town/south-street', count: 1, interval: 300000 },
    { blueprintId: 'npc/rift-town/north-guard', roomId: 'area/rift-town/north-gate', count: 1, interval: 300000 },
    { blueprintId: 'npc/rift-town/south-guard', roomId: 'area/rift-town/south-gate', count: 1, interval: 300000 },
  ]);
}
```

---

## 前端设计

### App.tsx 消息处理

```typescript
// roomInfo handler 扩展
const handleRoomInfo = (data: any) => {
  const { setLocation, setNpcs } = useGameStore.getState();
  setLocation({
    name: data.short,
    description: data.long,
    exits: data.exits,
    exitNames: data.exitNames,
  });

  // NPC 数据写入 store
  if (data.npcs) {
    setNpcs(
      data.npcs.map((npc: any) => ({
        id: npc.id,
        name: npc.name,
        title: npc.title,
        gender: npc.gender,
        faction: npc.faction,
        level: npc.level,
        hpPct: npc.hpPct,
        attitude: npc.attitude,
      })),
    );
  } else {
    setNpcs([]);
  }
};
```

### NpcCard 适配

```typescript
// 删除旧的颜色 props，改为根据 attitude 和 gender 计算
const NpcCard = ({ npc }: { npc: NpcData }) => {
  const nameColor = ATTITUDE_COLORS[npc.attitude] || '#8B7A5A';
  const genderIcon = npc.gender === 'male' ? '♂' : '♀';
  const genderColor = npc.gender === 'male' ? '#4A90D9' : '#D94A7A';
  const levelText = `${npc.level}级`;
  const titleText = npc.title ? `「${npc.title}」` : '';

  return (
    // 卡片布局：[title·name] [gender] [level] [hpBar]
    // 如有 faction 且非空，显示势力标签
  );
};
```

---

## 裂隙镇 NPC 一览

| NPC      | 蓝图 ID                           | 房间     | 真实势力   | 显示势力     | 态度     | 等级 |
| -------- | --------------------------------- | -------- | ---------- | ------------ | -------- | ---- |
| 老镇长   | npc/rift-town/town-elder          | 镇中广场 | NONE       | —            | friendly | 20   |
| 酒保     | npc/rift-town/bartender           | 酒馆     | NONE       | —            | friendly | 15   |
| 神秘旅人 | npc/rift-town/mysterious-traveler | 酒馆     | AN_HE      | — (隐藏)     | neutral  | 30   |
| 客栈老板 | npc/rift-town/innkeeper           | 客栈     | NONE       | —            | friendly | 12   |
| 白发药师 | npc/rift-town/herbalist           | 药铺     | BAI_MAN    | 百蛮(退隐)   | neutral  | 35   |
| 老周铁匠 | npc/rift-town/blacksmith          | 铁匠铺   | CHENG_TIAN | 承天朝(退役) | friendly | 25   |
| 杂货商   | npc/rift-town/merchant            | 杂货铺   | SAN_MENG   | 散盟         | neutral  | 18   |
| 老乞丐   | npc/rift-town/old-beggar          | 南街     | NONE       | —            | neutral  | 10   |
| 北门卫兵 | npc/rift-town/north-guard         | 北门     | CHENG_TIAN | 承天朝       | neutral  | 20   |
| 南门卫兵 | npc/rift-town/south-guard         | 南门     | CHENG_TIAN | 承天朝       | neutral  | 18   |

---

## 风险点

1. **broadcast 到玩家的消息链**：当前 `room.broadcast()` 通过 `entity.emit('message')` 发送，但玩家的 `receiveMessage` 如何将消息推送到前端需要确认。可能需要在 PlayerBase 中确保 `emit('message')` → `sendToClient()` 的链路。
2. **NPC 闲聊频率**：chat_chance 配合 2 秒心跳间隔，15% 概率意味着平均每 ~13 秒一条。同一房间多个 NPC 可能频繁刷屏，需要后续调优。
3. **BlueprintLoader 扫描路径**：需确认 `world/npc/rift-town/` 目录能被 BlueprintLoader 正确扫描并注册蓝图 ID。
4. **roomInfo 消息兼容**：扩展 roomInfo 消息格式后，需确保前端 handler 对 npcs 字段缺失时不报错（向后兼容）。

---

> CX 工作流 | Design Doc | PRD #135
