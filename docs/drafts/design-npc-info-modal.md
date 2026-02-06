# Design Doc: NPC 信息弹窗

## 关联

- PRD: #148
- Scope: #147
- 关联 Epic: #137 (NPC 基础系统 Phase 0)
- 关联 Design Doc: #136 (NPC Phase 0 设计)

## 基于现有代码

| 模块         | 文件                                             | 现状                                                          |
| ------------ | ------------------------------------------------ | ------------------------------------------------------------- |
| look 指令    | `server/src/engine/commands/std/look.ts`         | `lookAtNpc()` 已实现，data 只返回 `{ action, target, npcId }` |
| 指令结果分发 | `client/App.tsx` → `handleCommandResult`         | 目前只处理失败消息（appendLog），不识别 NPC look 结果         |
| NPC 卡片     | `client/src/components/game/NpcList/NpcCard.tsx` | 有 `onPress` prop，未绑定行为                                 |
| NPC 列表     | `client/src/components/game/NpcList/index.tsx`   | 未传入 onPress                                                |
| 水墨风弹窗   | `client/src/components/GameAlert.tsx`            | Modal + LinearGradient 设计语言，可参考                       |
| 血条         | `client/src/components/game/shared/HpBar.tsx`    | 可直接复用                                                    |
| 态度颜色     | `NpcCard.tsx` → `ATTITUDE_COLORS`                | 可复用                                                        |
| Store        | `client/src/stores/useGameStore.ts`              | 有 `NpcData` 类型，需扩展 `NpcDetailData`                     |

## 架构概览

```
用户点击 NpcCard
  ↓
NpcList.onPress → sendCommand("look 杂货商")
  ↓
WebSocket → Server: CommandHandler → LookCommand.lookAtNpc()
  ↓
Server 返回 commandResult { data: NpcDetailData }
  ↓
Client: App.tsx handleCommandResult → 识别 action='look' + target='npc'
  ↓
store.setNpcDetail(data) → NpcInfoModal 自动显示
  ↓
用户点击「对话」→ sendCommand("ask 杂货商 default") → 关闭弹窗
用户点击「关闭」→ store.setNpcDetail(null) → 关闭弹窗
```

## ⚡ 协议契约（WebSocket commandResult 扩展）

> **本项目使用 WebSocket 而非 REST API。此处定义 commandResult 中 NPC look 结果的 data 字段契约。**

### 消息类型: commandResult（look npc）

**触发指令**: `look <npcName>`

**现有格式**:

```json
{
  "type": "commandResult",
  "data": {
    "success": true,
    "message": "[rn]...[/rn]\n...",
    "data": {
      "action": "look",
      "target": "npc",
      "npcId": "npc/rift-town/merchant#1"
    }
  },
  "timestamp": 1738691234567
}
```

**扩展后格式**:

```json
{
  "type": "commandResult",
  "data": {
    "success": true,
    "message": "[rn][b]裂隙镇·杂货商[/b][/rn]\n「裂隙镇」杂货商 [男]\n[rd]杂货铺老板是个精瘦的中年人...[/rd]",
    "data": {
      "action": "look",
      "target": "npc",
      "npcId": "npc/rift-town/merchant#1",
      "name": "杂货商",
      "title": "裂隙镇",
      "gender": "male",
      "faction": "散盟",
      "level": 18,
      "hpPct": 100,
      "attitude": "neutral",
      "short": "一个精明的中年商人",
      "long": "杂货铺老板是个精瘦的中年人，一双小眼睛滴溜溜地转，嘴角永远挂着一丝职业化的微笑。..."
    }
  },
  "timestamp": 1738691234567
}
```

### 新增字段说明

| #   | 字段     | 类型   | 必填 | 来源                         | 说明                                              |
| --- | -------- | ------ | ---- | ---------------------------- | ------------------------------------------------- |
| 1   | action   | string | ✅   | 固定 `"look"`                | 指令动作标识                                      |
| 2   | target   | string | ✅   | 固定 `"npc"`                 | 目标类型标识                                      |
| 3   | npcId    | string | ✅   | `npc.id`                     | NPC 实例 ID                                       |
| 4   | name     | string | ✅   | `npc.getName()`              | NPC 名字                                          |
| 5   | title    | string | ✅   | `npc.get('title')`           | 头衔（可为空字符串）                              |
| 6   | gender   | string | ✅   | `npc.get('gender')`          | 性别: `"male"` / `"female"`                       |
| 7   | faction  | string | ✅   | `npc.get('visible_faction')` | 可见势力名（可为空字符串）                        |
| 8   | level    | number | ✅   | `npc.get('level')`           | 等级                                              |
| 9   | hpPct    | number | ✅   | `hp / max_hp * 100`          | 血量百分比 0-100                                  |
| 10  | attitude | string | ✅   | `npc.get('attitude')`        | 态度: `"friendly"` / `"neutral"` / `"aggressive"` |
| 11  | short    | string | ✅   | `npc.getShort()`             | 简短描述                                          |
| 12  | long     | string | ✅   | `npc.getLong()`              | 详细描述                                          |

### 状态枚举

#### attitude（NPC 态度）

| 枚举值     | 后端常量       | 前端常量       | 显示颜色     | 说明 |
| ---------- | -------------- | -------------- | ------------ | ---- |
| friendly   | `'friendly'`   | `'friendly'`   | `#2F5D3A` 绿 | 友善 |
| neutral    | `'neutral'`    | `'neutral'`    | `#8B7A5A` 褐 | 中立 |
| aggressive | `'aggressive'` | `'aggressive'` | `#8B2500` 红 | 敌对 |

#### gender（NPC 性别）

| 枚举值 | 显示图标 | 图标颜色     |
| ------ | -------- | ------------ |
| male   | ♂        | `#4A90D9` 蓝 |
| female | ♀        | `#D94A7A` 粉 |

### commandResult 识别逻辑

```typescript
// App.tsx handleCommandResult 扩展
if (data.success && data.data?.action === 'look' && data.data?.target === 'npc') {
  store.setNpcDetail(data.data); // 弹出弹窗
}
// 成功的 look npc 不再 appendLog（弹窗已展示信息）
// 失败时仍走原逻辑 appendLog
```

## ⚡ VO/DTO 字段映射表

### NPC 详情字段映射（Server → Client）

| #   | 服务端来源                   | commandResult data 字段 | TypeScript 字段 | 类型   | 说明        |
| --- | ---------------------------- | ----------------------- | --------------- | ------ | ----------- |
| 1   | `npc.id`                     | `npcId`                 | `npcId`         | string | NPC 实例 ID |
| 2   | `npc.getName()`              | `name`                  | `name`          | string | 名字        |
| 3   | `npc.get('title')`           | `title`                 | `title`         | string | 头衔        |
| 4   | `npc.get('gender')`          | `gender`                | `gender`        | string | 性别        |
| 5   | `npc.get('visible_faction')` | `faction`               | `faction`       | string | 可见势力    |
| 6   | `npc.get('level')`           | `level`                 | `level`         | number | 等级        |
| 7   | `hp/max_hp*100`              | `hpPct`                 | `hpPct`         | number | 血量%       |
| 8   | `npc.get('attitude')`        | `attitude`              | `attitude`      | string | 态度        |
| 9   | `npc.getShort()`             | `short`                 | `short`         | string | 简短描述    |
| 10  | `npc.getLong()`              | `long`                  | `long`          | string | 详细描述    |

### TypeScript 类型定义

```typescript
/** NPC 详情数据（弹窗用，从 commandResult.data 获取） */
export interface NpcDetailData {
  npcId: string;
  name: string;
  title: string;
  gender: string;
  faction: string;
  level: number;
  hpPct: number;
  attitude: string;
  short: string;
  long: string;
}
```

## 前端设计

### 组件结构

```
client/src/components/game/NpcList/
├── index.tsx          # 修改: 传入 onPress + 挂载 NpcInfoModal
├── NpcCard.tsx        # 修改: onPress 绑定 look 指令（改动极小）
└── NpcInfoModal.tsx   # 新增: 水墨风 NPC 详情弹窗
```

### NpcInfoModal 组件设计

```typescript
interface NpcInfoModalProps {
  detail: NpcDetailData | null; // null 时隐藏
  onClose: () => void; // 关闭弹窗
  onChat: (npcName: string) => void; // 对话按钮
}
```

**弹窗布局结构**:

```
Modal (transparent, fade)
└── overlay (半透明黑色遮罩, 点击关闭)
    └── card (280-300 宽, LinearGradient 背景)
        ├── header: 「头衔」名字 + 性别图标
        ├── meta: Lv.等级 + 势力 + 态度标签
        ├── divider (渐变分隔线)
        ├── short: 简短描述 (斜体)
        ├── divider
        ├── long: 详细描述 (ScrollView, maxHeight 限制)
        ├── divider
        ├── HpBar: 血量条
        ├── divider
        └── buttons: [对话] [关闭]
```

**态度标签样式**:

- 小圆角色块 + 对应颜色背景20%透明度 + 文字
- friendly → 「友善」绿底
- neutral → 「中立」褐底
- aggressive → 「敌对」红底

### 状态管理

```typescript
// useGameStore 新增
npcDetail: NpcDetailData | null;   // 初始值 null
setNpcDetail: (detail: NpcDetailData | null) => void;
```

### NpcList/index.tsx 改动

```typescript
export const NpcList = () => {
  const nearbyNpcs = useGameStore(state => state.nearbyNpcs);
  const npcDetail = useGameStore(state => state.npcDetail);
  const setNpcDetail = useGameStore(state => state.setNpcDetail);
  const sendCommand = useGameStore(state => state.sendCommand);

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.content}>
        {nearbyNpcs.map(npc => (
          <NpcCard key={npc.id} npc={npc}
            onPress={() => sendCommand(`look ${npc.name}`)} />
        ))}
      </ScrollView>
      <NpcInfoModal
        detail={npcDetail}
        onClose={() => setNpcDetail(null)}
        onChat={(name) => { sendCommand(`ask ${name} default`); setNpcDetail(null); }}
      />
    </View>
  );
};
```

## 后端设计

### 修改文件

`server/src/engine/commands/std/look.ts` → `lookAtNpc()` 方法

### 改动内容

```typescript
private lookAtNpc(npc: NpcBase): CommandResult {
  // ... 现有 message 构建不变 ...
  return {
    success: true,
    message: lines.join('\n'),
    data: {
      action: 'look',
      target: 'npc',
      npcId: npc.id,
      name: npc.getName(),
      title: npc.get<string>('title') || '',
      gender: npc.get<string>('gender') || 'male',
      faction: npc.get<string>('visible_faction') || '',
      level: npc.get<number>('level') || 1,
      hpPct: Math.round(
        ((npc.get<number>('hp') || 0) / (npc.get<number>('max_hp') || 1)) * 100,
      ),
      attitude: npc.get<string>('attitude') || 'neutral',
      short: npc.getShort(),
      long: npc.getLong(),
    },
  };
}
```

## 影响范围

| 类型 | 文件                                                  | 改动                                |
| ---- | ----------------------------------------------------- | ----------------------------------- |
| 修改 | `server/src/engine/commands/std/look.ts`              | lookAtNpc data 字段扩展             |
| 修改 | `client/src/stores/useGameStore.ts`                   | 新增 NpcDetailData + npcDetail 状态 |
| 修改 | `client/App.tsx`                                      | handleCommandResult 识别 NPC look   |
| 修改 | `client/src/components/game/NpcList/index.tsx`        | onPress 绑定 + 挂载 Modal           |
| 新增 | `client/src/components/game/NpcList/NpcInfoModal.tsx` | 水墨风弹窗组件                      |

## 风险点

- **NPC 已被 GC**: look 指令返回 `success: false`，前端正常走 appendLog 错误提示，不弹窗。已有保护。
- **long 描述过长**: NpcInfoModal 内 ScrollView + maxHeight 限制，不会撑破布局。
- **快速连续点击**: 每次点击都发 look 指令，最新结果覆盖 store，无竞态问题。

---

> CX 工作流 | Design Doc | PRD #148
