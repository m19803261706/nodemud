# 功能探讨: 物品系统 — 分类/属性/交互/商店

## 基本信息

- **创建时间**: 2026-02-05 17:00
- **关联项目蓝图**: #1（NodeMUD 项目蓝图）
- **关联 Scope**: #134（NPC 系统细化设计）、#63（Layer 3 游戏对象子类）
- **参考**: 炎黄 MUD、北大侠客行、放置江湖、CircleMUD、mudcore 框架

## 功能目标

完善物品基础体系，让游戏世界中有可拾取、可丢弃、可买卖的物品。为 NPC 商店交易（Phase 2）和后续战斗装备系统（Phase 3）奠定基础。

## 当前引擎能力

### 已具备（骨架 100%）

| 模块                | 能力                                                       | 文件                                            | 状态          |
| ------------------- | ---------------------------------------------------------- | ----------------------------------------------- | ------------- |
| ItemBase            | 7 个 getter（name/short/long/type/weight/value/stackable） | `server/src/engine/game-objects/item-base.ts`   | ✅ 完整       |
| BaseEntity 容器系统 | environment/inventory/moveTo 事件链（7 个事件点）          | `server/src/engine/base-entity.ts`              | ✅ 完整       |
| 蓝图系统            | BlueprintRegistry/Factory/Loader 完整                      | `server/src/engine/blueprint-*.ts`              | ✅ 完整       |
| GC 清理             | 无环境物品自动回收                                         | `server/src/engine/object-manager.ts`           | ✅ 完整       |
| 预留事件            | GET/DROP/USE/LOOK 已定义                                   | `server/src/engine/types/events.ts`             | ✅ 定义未实现 |
| look 命令           | 可显示房间内物品                                           | `server/src/engine/commands/std/look.ts`        | ✅ 部分       |
| 单元测试            | ItemBase 完整覆盖                                          | `server/src/engine/__tests__/item-base.spec.ts` | ✅ 完整       |

### 关键缺口

- `server/src/world/item/` 目录为空 — 无任何物品蓝图
- 无 `get`/`drop`/`inventory`/`use` 等物品交互指令
- 无金钱系统
- 无商店/交易系统
- 无前端背包 UI
- ItemBase 缺少 tradeable/droppable/unique/durability 等属性

---

## 传统 MUD 物品系统对标分析

### 炎黄 MUD 物品继承体系

炎黄 MUD 的 `inherit/` 目录结构：

```
inherit/
├── item/       # 基础物品
├── weapon/     # 武器
├── armor/      # 防具
├── medicine/   # 药物
├── misc/       # 杂项
├── condition/  # 状态
├── skill/      # 技能
├── char/       # 角色
└── room/       # 房间
```

物品在 `create()` 函数中通过 `set("属性", 值)` 设定，蓝图克隆方式创建实例。

### CircleMUD 物品分类（23 种类型）

| 类型       | 说明      | 武侠适配     |
| ---------- | --------- | ------------ |
| WEAPON     | 武器      | ✅ 武器      |
| ARMOR      | 盔甲      | ✅ 防具      |
| POTION     | 魔法药剂  | ✅ 药品      |
| SCROLL     | 魔法卷轴  | ✅ 秘籍/书籍 |
| CONTAINER  | 容器      | ✅ 包裹      |
| FOOD       | 食物      | ✅ 食物      |
| DRINKCON   | 饮料容器  | ✅ 饮品      |
| KEY        | 钥匙      | ✅ 钥匙      |
| MONEY      | 金币      | ✅ 货币      |
| LIGHT      | 光源      | 🔜 灯笼/火把 |
| TREASURE   | 宝物      | ✅ 宝物/杂物 |
| NOTE       | 笔记      | ✅ 信件      |
| WAND/STAFF | 魔杖/法杖 | - 不适用     |
| BOAT       | 船只      | 🔜 后续      |
| TRASH      | 垃圾      | -            |

CircleMUD 装备属性修正系统：STR/DEX/INT/WIS/CON/CHA/MANA/HIT/MOVE/AC/HITROLL/DAMROLL。

### 北大侠客行物品体系

| 大类 | 子类                             | 核心属性                         | 特色                 |
| ---- | -------------------------------- | -------------------------------- | -------------------- |
| 武器 | 剑/刀/鞭/匕/锤/枪/杖/戟/棍/棒/斧 | 伤害(+N)、可塑性(宝石孔)、耐久度 | 武器类型关联武功技能 |
| 防具 | 头/披风/衣/甲/鞋/盾              | 护甲(+N)、外伤抗性               | 职业系数不同         |
| 药品 | 回复药/金疮药/丹药               | 回复量、冷却                     | 战斗常用消耗         |
| 秘籍 | 武功书/残页                      | 关联武功、学习条件               | 读书提升武功         |
| 宝石 | 攻击石/防御石/朱砂               | 属性加成                         | 镶嵌到装备           |
| 杂物 | 钥匙/铁铲/任务物品               | 触发条件                         | 特定用途             |

武器系统特色：

- 武器伤害用 (+N) 表示，如长剑(+20)、武士刀(+180)
- 可塑性（宝石孔位），3o/4o 表示 3/4 个孔位
- 耐久度降为 0 损坏，需找铁匠修理（fix 指令）
- 武器类型关联对应武功技能（剑法/刀法/鞭法...）

### 放置江湖物品体系

| 大类 | 子类                | 装备位 |
| ---- | ------------------- | ------ |
| 武器 | 剑/刀/鞭/棍/暗器    | 主手   |
| 防具 | 上衣/头帽/下装/鞋履 | 4 位   |
| 饰品 | 项链/腰带/腰坠/手套 | 4 位   |
| 药品 | 回复药/增益药       | -      |
| 秘籍 | 书页（残页）        | -      |
| 神兵 | DIY 武器            | 主手   |

装备位共 9 个：主手 + 头/身/下/脚 + 项链/腰带/腰坠/手套。

---

## 方案探讨

### 物品子类继承体系

**决策：武侠完整集 — 7 个子类**

```
ItemBase (通用物品基类) ← 已有，需扩展属性
├── WeaponBase (武器)
│   新增属性: damage, weapon_type, two_handed
│   武器类型: sword/blade/spear/staff/fist/dagger/whip/hammer/axe
│
├── ArmorBase (防具/装备)
│   新增属性: defense, wear_position, attribute_bonus
│   装备位: head/body/hands/feet/waist/weapon/offhand/neck/finger/wrist
│   备注: Phase 2 只定义类，穿戴逻辑留 Phase 3 战斗系统
│
├── MedicineBase (药品/消耗品)
│   新增属性: heal_hp, heal_mp, use_count, cooldown
│   子类型: restore(回复)/antidote(解毒)/buff(增益)
│
├── BookBase (秘籍/书籍)
│   新增属性: skill_name, skill_level, read_requirement
│   子类型: martial(武功秘籍)/knowledge(知识)/letter(信件)
│
├── ContainerBase (容器/包裹)
│   新增属性: capacity, weight_limit
│   行为: 重写 getInventory() 限制容量
│
├── FoodBase (食物/饮品)
│   新增属性: hunger_restore, thirst_restore, buff_type, buff_duration
│
└── KeyBase (钥匙/特殊物品)
    新增属性: lock_id, single_use
```

### ItemBase 通用属性扩展

| 属性           | 类型    | 默认值 | 说明               | 状态    |
| -------------- | ------- | ------ | ------------------ | ------- |
| name           | string  | '未知' | 物品名             | ✅ 已有 |
| short          | string  | name   | 短描述             | ✅ 已有 |
| long           | string  | -      | 详细描述           | ✅ 已有 |
| type           | string  | 'misc' | 物品类型           | ✅ 已有 |
| weight         | number  | 0      | 重量               | ✅ 已有 |
| value          | number  | 0      | 基准价（买卖参考） | ✅ 已有 |
| stackable      | boolean | false  | 可堆叠             | ✅ 已有 |
| tradeable      | boolean | true   | 可交易             | ❌ 新增 |
| droppable      | boolean | true   | 可丢弃             | ❌ 新增 |
| unique         | boolean | false  | 唯一物品           | ❌ 新增 |
| level_req      | number  | 0      | 等级要求           | ❌ 新增 |
| durability     | number  | -1     | 当前耐久(-1=无限)  | ❌ 新增 |
| max_durability | number  | -1     | 最大耐久           | ❌ 新增 |

### 武器类型与武功技能映射

对标北大侠客行，武器类型关联对应的武功技能：

| weapon_type | 中文名    | 关联技能  | 典型武器     |
| ----------- | --------- | --------- | ------------ |
| sword       | 剑        | 剑法      | 长剑、青锋剑 |
| blade       | 刀        | 刀法      | 大刀、柳叶刀 |
| spear       | 枪        | 枪法      | 长枪、银枪   |
| staff       | 杖/棍     | 杖法/棍法 | 铁杖、齐眉棍 |
| fist        | 拳/爪     | 拳法      | 铁拳套、虎爪 |
| dagger      | 匕首/短刃 | 匕法      | 短匕、袖里剑 |
| whip        | 鞭        | 鞭法      | 长鞭、软鞭   |
| hammer      | 锤        | 锤法      | 铁锤、流星锤 |
| axe         | 斧        | 斧法      | 板斧、双斧   |

### 装备位系统

对标放置江湖 + 北大侠客行，定义 10 个装备位：

| wear_position | 中文名   | 典型装备         |
| ------------- | -------- | ---------------- |
| head          | 头部     | 头巾、面具、斗笠 |
| body          | 身体     | 衣服、铠甲、长袍 |
| hands         | 手部     | 手套、护手       |
| feet          | 脚部     | 鞋、靴           |
| waist         | 腰部     | 腰带             |
| weapon        | 主手武器 | 各类武器         |
| offhand       | 副手     | 盾牌、副武器     |
| neck          | 颈部     | 项链、护身符     |
| finger        | 手指     | 戒指             |
| wrist         | 腕部     | 护腕、手镯       |

**备注**: Phase 2 只定义常量和数据结构，穿戴逻辑（wear/wield/remove 指令 + 属性加成计算）留到 Phase 3 战斗系统一起实现。

### 物品交互指令规划

**Phase 1 最小交互集**（Phase 2 商店前置）：

| 指令      | 格式                     | 功能           | Phase   |
| --------- | ------------------------ | -------------- | ------- |
| get/take  | `get <物品>` / `get all` | 捡起物品到背包 | Phase 1 |
| inventory | `inventory` / `i`        | 查看背包物品   | Phase 1 |
| buy       | `buy <物品> from <NPC>`  | 从商店购买     | Phase 2 |
| sell      | `sell <物品> to <NPC>`   | 向商店出售     | Phase 2 |
| list      | `list <NPC>`             | 查看商品列表   | Phase 2 |

**后续指令**（不在当前范围）：

| 指令          | 功能              | Phase          |
| ------------- | ----------------- | -------------- |
| drop          | 丢弃物品          | Phase 1 或后续 |
| give          | 给予他人物品      | 后续           |
| wear/wield    | 穿戴装备/持握武器 | Phase 3        |
| remove        | 脱下装备          | Phase 3        |
| use/eat/drink | 使用消耗品        | Phase 3        |
| examine       | 详细查看物品      | 后续           |

---

## 实现规划 — 调整后的 Phase 路线

### 原 Issue #134 Phase 2 拆分为 Phase 1 + Phase 2

#### Phase 1: 物品基础体系（新增，Phase 2 前置）

> 目标：物品子类定义完整，房间里有物品可以捡，背包能查看

| 序号 | 任务               | 类型     | 依赖 | 说明                                                                               |
| ---- | ------------------ | -------- | ---- | ---------------------------------------------------------------------------------- |
| 1-1  | ItemBase 属性扩展  | backend  | 无   | 新增 tradeable/droppable/unique/level_req/durability 便捷方法                      |
| 1-2  | 物品子类定义       | backend  | 1-1  | WeaponBase/ArmorBase/MedicineBase/BookBase/ContainerBase/FoodBase/KeyBase 七个子类 |
| 1-3  | 物品类型常量       | core     | 1-2  | WeaponTypes/WearPositions/MedicineTypes 等常量定义                                 |
| 1-4  | 裂隙镇初始物品蓝图 | backend  | 1-2  | 5-8 个物品蓝图（铁剑、布衣、金疮药、干粮、包裹等）                                 |
| 1-5  | get 指令           | backend  | 1-4  | `get <物品>` / `get all` — 从房间/容器捡起物品                                     |
| 1-6  | inventory 指令     | backend  | 1-5  | `i` / `inventory` — 显示背包物品列表                                               |
| 1-7  | 物品推送协议       | backend  | 1-5  | roomInfo 附带地面物品 / 背包变更推送                                               |
| 1-8  | 前端背包简单展示   | frontend | 1-7  | 底部导航"背包"tab 显示物品列表                                                     |

#### Phase 2: 商店交易系统（原 #134 Phase 2）

> 目标：商店 NPC 可买卖物品，玩家有金钱

| 序号 | 任务               | 类型     | 依赖    | 说明                                              |
| ---- | ------------------ | -------- | ------- | ------------------------------------------------- |
| 2-1  | 金钱系统           | backend  | Phase 1 | 玩家/NPC 的 gold/silver 属性 + 收支逻辑           |
| 2-2  | F_VENDOR 商店特征  | backend  | 2-1     | 商品列表、定价策略（买入折扣/卖出溢价）、库存管理 |
| 2-3  | buy/sell/list 指令 | backend  | 2-2     | 商店交互三指令                                    |
| 2-4  | drop 指令          | backend  | Phase 1 | `drop <物品>` — 丢弃物品到房间                    |
| 2-5  | 前端商店 UI        | frontend | 2-3     | 商品列表弹窗/面板 + 买卖确认                      |
| 2-6  | 前端金钱显示       | frontend | 2-1     | 状态栏显示金银数量                                |

#### Phase 3: 战斗 + 装备系统（原 #134 Phase 3）

> 此时启用装备穿戴，与战斗系统同步

| 序号 | 任务                   | 说明               |
| ---- | ---------------------- | ------------------ |
| 3-x  | wear/wield/remove 指令 | 穿戴/脱下装备      |
| 3-x  | 装备属性加成           | 穿戴后影响战斗属性 |
| 3-x  | use/eat/drink 指令     | 使用消耗品         |
| 3-x  | 战斗系统               | 回合制战斗循环     |

---

## 与现有功能的关系

- **依赖**: BaseEntity 容器系统 ✅、蓝图系统 ✅、NPC 系统 Phase 0 ✅
- **影响**: look 命令需适配物品显示、roomInfo 协议需附带地面物品
- **复用**: ItemBase 已有的 getter 方法、moveTo 事件链、GC 清理机制

## 边界和约束

- Phase 1 只做 get + inventory，**不做 wear/use/drop**（最小交互集）
- Phase 2 补充 drop + buy/sell/list
- 装备穿戴逻辑全部留给 Phase 3（与战斗系统一起做才有意义）
- 物品子类在 Phase 1 全部定义完（武侠完整集 7 个子类），但只有部分在 Phase 1-2 被实际使用
- 不做物品耐久度消耗逻辑（留给战斗系统）
- 不做宝石镶嵌/强化/锻造系统（远期）

## 开放问题

- [ ] 背包容量限制？按数量上限还是按重量上限？还是两者都有？
- [ ] 物品堆叠的实现细节？stackable 物品如何在背包中合并计数？
- [ ] 商店库存是否无限？还是有限制？刷新机制如何？
- [ ] 金钱系统用单一货币(gold)还是双币(gold/silver)？换算比例？
- [ ] 地面物品的自动清理时间？放置多久后 GC 回收？
- [ ] BookBase 读书学技能是否在 Phase 2 实现？还是留给技能系统？

## 探讨记录

### 2026-02-05 物品系统方案探讨

**背景**：Phase 0（NPC 基础系统）已完成，准备推进 Phase 2（商店交易）。讨论发现 Phase 2 需要物品子类和基础交互作为前置，因此在 Phase 2 之前插入 Phase 1（物品基础体系）。

**参考资料对标**：

- 炎黄 MUD：`inherit/` 目录包含 item/weapon/armor/medicine/misc 五个继承类
- CircleMUD：定义了 23 种物品类型，15 个装备位，25 种属性修正
- 北大侠客行：武器伤害(+N)、可塑性(宝石孔)、耐久度；11 种武器类型关联武功技能
- 放置江湖：9 个装备位（武器+4防具+4饰品）；书页收集系统；神兵 DIY 武器

**关键决策**：

1. **物品子类范围**：选择「武侠完整集」— 7 个子类（Weapon/Armor/Medicine/Book/Container/Food/Key），一次性定义齐全，按需启用
2. **交互指令范围**：选择「最小交互」— Phase 1 只做 get + inventory，Phase 2 补 buy/sell/list + drop
3. **装备系统**：选择「暂不做」— 装备位和防具类只定义数据结构，穿戴逻辑留 Phase 3 战斗系统
4. **Phase 路线调整**：原 #134 Phase 2 拆为 Phase 1（物品基础）+ Phase 2（商店交易），确保商店有物品可卖

**参考链接**：

- [炎黄 MUD GitHub inherit 目录](https://github.com/MudRen/yhmud/tree/master/inherit)
- [CircleMUD Builder's Manual: Object Files](https://www.circlemud.org/cdp/building/building-5.html)
- [MUD.REN 蓝图对象小结](https://mud.ren/threads/387)
- [北大侠客行 MUD 百科](https://pkuxkx.net/wiki/pkuxkx/guide)
- [北大侠客行 武器装备讨论](https://web.pkuxkx.net/forum/thread-9348-1-1.html)
- [北大侠客行 战斗系统扫盲](https://pkuxkx.net/forum/thread-8605-1-1.html)
- [放置江湖装备大全](https://www.87g.com/zixun/62668.html)
- [放置游戏道具系统设计](https://www.cnblogs.com/lyosaki88/p/idlewow_16.html)
- [mudcore 框架](https://github.com/oiuv/mudcore)

---

> CX 工作流 | 功能探讨
