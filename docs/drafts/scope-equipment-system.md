# [Scope] 装备系统细化 — 属性加成 + 穿戴流程 + 品质框架

## 关联文档

- 项目蓝图: #1
- 物品系统 Scope: #153（Phase 2 装备部分）
- NPC 系统 Scope: #134（商店/交易 — 不纳入本轮）

## 现状分析

### 已完成（~35%）

| 模块                          | 状态          | 说明                                                                     |
| ----------------------------- | ------------- | ------------------------------------------------------------------------ |
| 装备槽位定义                  | ✅            | 10 个槽位（head/body/hands/feet/waist/weapon/offhand/neck/finger/wrist） |
| wear 指令                     | ✅ 基本       | 穿戴防具到指定位置，无等级检查                                           |
| wield 指令                    | ✅ 基本       | 装备武器到主手，无双手武器逻辑、无等级检查                               |
| remove 指令                   | ✅            | 脱下装备回背包                                                           |
| eq 指令                       | ✅            | 查看当前装备列表                                                         |
| equipmentUpdate 消息          | ✅            | WebSocket 推送装备栏变更                                                 |
| 客户端 EquipmentView          | ✅            | 显示 10 个装备槽位                                                       |
| ArmorBase.getAttributeBonus() | ⚠️ 定义未使用 | 方法存在但返回空对象，无应用逻辑                                         |
| WeaponBase.isTwoHanded()      | ⚠️ 定义未使用 | 方法存在但 wield 未检查                                                  |
| ItemBase.getLevelReq()        | ⚠️ 定义未使用 | 方法存在但 wear/wield 未检查                                             |

### 缺失模块

| 模块                       | 优先级    | 说明                               |
| -------------------------- | --------- | ---------------------------------- |
| 装备属性加成计算           | 🔴 核心   | 装备对角色六维/三维资源/攻防的加成 |
| 属性加成应用到 playerStats | 🔴 核心   | playerStats 需展示基础值+装备加成  |
| 双手武器逻辑               | 🟡 重要   | 双手武器同时占用 weapon+offhand    |
| 等级需求检查               | 🟡 重要   | wear/wield 检查角色等级是否满足    |
| 品质系统框架               | 🟢 框架   | 品质枚举+品质对属性的影响系数      |
| 耐久度消耗                 | 🔵 后续   | 本轮不做，预留接口                 |
| 套装效果                   | 🔵 后续   | 本轮不做                           |
| 锻造/强化                  | 🔵 后续   | 本轮不做                           |
| 商店系统                   | ❌ 不纳入 | 独立 Scope                         |
| 战斗系统集成               | ❌ 不纳入 | 独立 Scope                         |

## 本轮目标

### 核心目标

**让装备从"纯装饰"变成"有属性加成"**，穿上/脱下装备后，角色属性实时变化并在客户端可见。

### 范围边界

- ✅ 装备属性加成（六维属性 + 三维资源上限 + 攻防数值）
- ✅ 穿戴流程修复（双手武器、等级需求）
- ✅ 品质系统框架（品质枚举、品质系数，所有现有物品默认最低品质）
- ❌ 战斗系统（攻防数值仅定义和展示，不做战斗计算）
- ❌ 商店/交易
- ❌ 锻造/强化/附魔
- ❌ 套装效果
- ❌ 耐久度消耗

## 技术设计要点

### 1. 装备属性加成体系

装备可影响的三类属性：

```typescript
/** 装备属性加成 */
interface EquipmentBonus {
  // 六维属性加成
  attrs?: {
    wisdom?: number; // 悟性
    perception?: number; // 灵觉
    spirit?: number; // 神识
    meridian?: number; // 经脉
    strength?: number; // 力量
    vitality?: number; // 体质
  };
  // 三维资源上限加成
  resources?: {
    maxHp?: number; // 气血上限
    maxMp?: number; // 法力上限
    maxEnergy?: number; // 精力上限
  };
  // 攻防数值
  combat?: {
    attack?: number; // 攻击力
    defense?: number; // 防御力
  };
}
```

**计算规则**：

- 角色最终属性 = 基础属性 + 所有装备加成之和
- 穿上/脱下装备后立即重算并推送 playerStats
- 资源上限变化时，当前值不超过新上限（如 maxHp 降低，hp.current 也不超过）

### 2. 品质系统

```typescript
/** 品质等级枚举 */
enum ItemQuality {
  COMMON = 0, // 白色 — 凡品
  FINE = 1, // 绿色 — 精良
  RARE = 2, // 蓝色 — 稀有
  EPIC = 3, // 紫色 — 史诗
  LEGENDARY = 4, // 橙色 — 传说
}

/** 品质对属性的影响系数 */
const QUALITY_MULTIPLIER = {
  [ItemQuality.COMMON]: 1.0,
  [ItemQuality.FINE]: 1.2,
  [ItemQuality.RARE]: 1.5,
  [ItemQuality.EPIC]: 2.0,
  [ItemQuality.LEGENDARY]: 3.0,
};
```

**规则**：

- 所有现有物品默认 `ItemQuality.COMMON`
- 品质系数乘以基础属性得到最终加成
- 品质影响物品名称颜色（富文本标记）
- 后续锻造/强化系统可修改品质

### 3. 穿戴流程修复

**双手武器**：

- `wield` 检查 `isTwoHanded()`
- 双手武器装备时：同时占用 weapon + offhand
- 如果 offhand 已有装备，先自动卸下到背包
- 单手武器装备时：如果当前是双手武器，先自动卸下

**等级需求**：

- `wear` 和 `wield` 检查 `getLevelReq()`
- 不满足时返回提示："你的修为不足以使用{物品名}（需要{等级}）"

### 4. playerStats 扩展

当前 playerStats 只有基础六维属性，扩展后：

```typescript
/** 扩展后的 playerStats 数据 */
{
  name: string;
  level: string;
  hp: ResourceValue;      // max 包含装备加成
  mp: ResourceValue;
  energy: ResourceValue;
  attrs: {                // 基础六维
    wisdom, perception, spirit,
    meridian, strength, vitality
  };
  equipBonus: {           // 装备加成汇总（新增）
    attrs?: Partial<CharacterAttrs>;
    resources?: { maxHp?, maxMp?, maxEnergy? };
    combat?: { attack?, defense? };
  };
  combat: {               // 最终攻防数值（新增）
    attack: number;
    defense: number;
  };
}
```

### 5. 客户端展示

- PlayerStats 面板增加攻防数值显示
- 属性值旁可显示装备加成部分（如 "力量 15 (+3)"）
- 装备栏每个槽位可显示装备品质颜色
- examine 指令查看装备时显示属性加成详情

## 功能拆分（初步）

### Phase 1: 核心属性加成

1. **装备加成数据结构** — EquipmentBonus 接口定义 + ArmorBase/WeaponBase 蓝图扩展
2. **属性加成计算引擎** — PlayerBase 汇总所有装备加成、穿脱时重算
3. **playerStats 扩展** — 推送含装备加成的完整属性给客户端
4. **客户端 PlayerStats 展示** — 显示攻防数值 + 属性加成标注

### Phase 2: 穿戴流程修复

5. **双手武器逻辑** — wield 指令检查 + 自动卸下冲突装备
6. **等级需求检查** — wear/wield 检查 getLevelReq()

### Phase 3: 品质系统框架

7. **品质枚举 + 系数定义** — ItemQuality 枚举 + 品质乘数
8. **品质应用到属性加成** — 基础属性 × 品质系数
9. **品质颜色显示** — examine/eq/背包中物品名称品质色

## MUD 行业参考

- **北大侠客行**: 装备加成直接影响六维属性，穿脱实时生效
- **炎黄 MUD**: 品质分 5 级，品质影响基础属性的系数倍率
- **LPC mudcore**: equipment 模块负责 equip/unequip + apply/remove 属性修正
- **DikuMUD**: 装备 affect 系统，每件装备挂多个属性修正

## 后续规划（不纳入本轮）

| 模块     | 前置依赖     | 说明                        |
| -------- | ------------ | --------------------------- |
| 战斗系统 | 本轮攻防数值 | 攻击/防御公式、PvE 战斗流程 |
| 锻造系统 | 品质框架     | 材料 + 配方 → 提升品质/属性 |
| 强化系统 | 品质框架     | 强化等级 +1/+2/... 提升属性 |
| 附魔系统 | 品质框架     | 附加特殊效果                |
| 套装效果 | 属性加成     | 多件同套装备额外加成        |
| 商店系统 | NPC 系统     | NPC 商店买卖装备            |

---

> CX 工作流 | Scope | 装备系统细化
