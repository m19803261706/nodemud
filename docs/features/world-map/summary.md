# 天衍世界地图骨架 — 功能汇总

**日期**: 2026-02-19
**状态**: 已完成
**Commits**: 5 个

---

## 1. 功能概述

本次扩展以裂隙镇（rift-town）为起点，通过官道体系向四方延伸，构建了天衍世界的完整地图骨架。新增 10 个 Area（12 个含道路区域）、55 间房间、28 个 NPC，覆盖中原、北境、江南、东海、蛮疆、西域六大方向，为后续世界内容填充提供稳固框架。

---

## 2. 变更统计

| 项目 | 数量 |
|------|------|
| Commits | 5 |
| 变更文件总数 | 97 |
| 新增文件 | 95 |
| 修改文件 | 2 |
| 新增行数 | +3614 |
| 删除行数 | -3 |
| 新增 Area | 12（含 6 条道路） |
| 新增房间 | 55 间 |
| 新增 NPC | 28 个（13 hostile + 15 friendly） |

### Commit 明细

| Hash | 描述 |
|------|------|
| `30f1541` | feat(world): Wave 1 主干道 + 洛阳废都地图骨架 |
| `3560066` | feat(world): Wave 2 北境区域 road-north + frost-pass |
| `0f90f7d` | feat(world): Wave 3 江南+东海区域 — 4区域17间房9个NPC |
| `35142a3` | feat(world): Wave 4+5 蛮疆+西域+南疆区域（18间房+9个NPC） |
| `de1f4bf` | feat(world): 跨区域出口连接 + 测试更新 |

---

## 3. 区域地图总览

### 区域列表

| Area ID | 名称 | 房间数 | NPC数 | 等级范围 | Wave |
|---------|------|--------|-------|---------|------|
| road-central | 官道·中原段 | 5 | 1 | 3–8 | 1 |
| central-plain | 洛阳废都 | 4 | 3 | 5–15 | 1 |
| road-north | 官道·北境段 | 5 | 2 | 5–10 | 2 |
| frost-pass | 朔云关 | 5 | 3 | 6–12 | 2 |
| road-jiangnan | 水路·江南段 | 5 | 1 | 8–12 | 3 |
| jiangnan | 烟雨镇 | 4 | 3 | 6–12 | 3 |
| road-eastern | 海路·东海段 | 4 | 2 | 8–14 | 3 |
| eastern-sea | 潮汐港 | 4 | 3 | 15–22 | 3 |
| road-nanjiang | 山路·蛮疆段 | 5 | 2 | 8–14 | 4 |
| nanjiang-south | 雾岚寨 | 5+1封路 | 3 | 8–14 | 4 |
| road-western | 丝路·西域段 | 5 | 2 | 10–18 | 5 |
| western-wastes | 黄沙驿 | 3 | 3 | 10–18 | 5 |

### 连接拓扑（ASCII）

```
                         朔云关 (frost-pass)
                              ↑ north
                       官道·北境 (road-north)
                              ↑ northeast
裂隙镇 (rift-town) ──south──> 官道·中原 (road-central) ──south──> 十字路口
                                                                        │
                                                              ┌─────────┼──────────┐
                                                           south       east      ...
                                                              │          │
                                                         洛阳废都    水路·江南
                                                       (central-plain) (road-jiangnan)
                                                              │          │ east
                                                           ┌──┴──┐    烟雨镇 (jiangnan)
                                                         south  west     │ east
                                                           │      │   海路·东海 (road-eastern)
                                                       蛮疆山路  丝路·西域    │ east
                                                     (road-nanjiang)(road-western) │
                                                           │          │    潮汐港 (eastern-sea)
                                                       雾岚寨      黄沙驿
                                                    (nanjiang-south)(western-wastes)
                                                           │
                                                      [南疆封路·暂不通行]
```

### 等级梯度

```
裂隙镇(1-5) → 中原主干道(3-8) → 洛阳废都/朔云关/烟雨镇(5-15) → 蛮疆/西域(8-18) → 潮汐港(15-22)
```

---

## 4. NPC 总览

### 道路区域 NPC（hostile）

| NPC ID | 名称 | 区域 | 等级 | 阵营 | 态度 |
|--------|------|------|------|------|------|
| road-bandit | 官道劫匪 | road-central | 3–8 | NONE | hostile |
| wolf | 草原狼 | road-north | 5–10 | NONE | hostile |
| steppe-raider | 草原游骑 | road-north | 6–10 | LANG_TING | hostile |
| lake-bandit | 水路水匪 | road-jiangnan | 8–12 | NONE | hostile |
| pirate-scout | 东海海盗斥候 | road-eastern | 8–14 | SAN_MENG | hostile |
| sea-creature | 海中妖兽 | road-eastern | 8–14 | NONE | hostile |
| poison-snake | 毒蛇 | road-nanjiang | 8–14 | NONE | hostile |
| jungle-beast | 丛林猛兽 | road-nanjiang | 8–14 | NONE | hostile |
| desert-bandit | 沙漠马匪 | road-western | 10–18 | NONE | hostile |
| sand-scorpion | 沙漠蝎妖 | road-western | 10–18 | NONE | hostile |

### 城镇区域 NPC（friendly）

| NPC ID | 名称 | 城镇 | 等级 | 阵营 |
|--------|------|------|------|------|
| xie-wenyuan | 谢文远 | 洛阳废都 | 8–12 | NONE |
| merchant-liu | 商人刘发财 | 洛阳废都 | 5–8 | NONE |
| city-guard | 废都守卫 | 洛阳废都 | 6–10 | CHENG_TIAN |
| border-captain | 边关校尉 | 朔云关 | 8–12 | CHENG_TIAN |
| blacksmith-fan | 铁匠樊铁锤 | 朔云关 | 6–10 | CHENG_TIAN |
| spy-yan | 探子燕七 | 朔云关 | 8–12 | NONE |
| teahouse-gu | 掌柜顾婉 | 烟雨镇 | 6–10 | BI_LAN |
| scholar-ji | 书生季鸿文 | 烟雨镇 | 6–10 | NONE |
| boatman-lao | 船夫老罗 | 烟雨镇 | 5–8 | SAN_MENG |
| harbor-master | 港务长 | 潮汐港 | 10–15 | SAN_MENG |
| immortal-ling | 仙岛使者凌虚 | 潮汐港 | 20–25 | NONE |
| doctor-qiu | 大夫邱杏林 | 潮汐港 | 12–18 | NONE |
| baimanvillage-elder | 百蛮寨长老 | 雾岚寨 | 10–15 | BAI_MAN |
| young-chief | 青年首领 | 雾岚寨 | 10–15 | BAI_MAN |
| witch-doctor | 巫医玲珑 | 雾岚寨 | 10–15 | BAI_MAN |
| station-master | 驿站主 | 黄沙驿 | 10–15 | XI_YU |
| monk-dharma | 密宗行者达摩旃 | 黄沙驿 | 12–18 | XI_YU |
| relic-trader | 遗物商人 | 黄沙驿 | 10–15 | NONE |

### 阵营分布

| 阵营 | NPC 数 | 代表 NPC |
|------|-------|---------|
| CHENG_TIAN（承天朝） | 3 | border-captain, blacksmith-fan, city-guard |
| BI_LAN（碧澜阁） | 1 | teahouse-gu |
| SAN_MENG（散盟） | 3 | boatman-lao, pirate-scout, harbor-master |
| BAI_MAN（百蛮） | 3 | baimanvillage-elder, young-chief, witch-doctor |
| XI_YU（西域） | 2 | station-master, monk-dharma |
| LANG_TING（狼庭） | 1 | steppe-raider |
| NONE | 15 | 其余 |

---

## 5. 沉浸锚点

以下为各城镇核心房间的氛围摘要，体现世界观多样性。

### 朔云关·烽燧台（`frost-pass/watchtower`）

> 烽燧台高出城墙一丈有余，登上台顶，北方的草原便尽收眼底。枯黄的草甸无边无际，一直延伸到天际那条细细的灰线——据说山的那边就是狼庭的王帐所在。台面的石砖上密密麻麻刻满了名字，每一个曾在此驻守的士兵都会刻下自己的名字。

**特色**：边塞重关，守望北境。探子燕七独立远眺，名字石砖暗示守关士兵的生死悬念。

---

### 烟雨镇·听雨茶楼（`jiangnan/teahouse`）

> 二楼临水的雅座，窗棂半开，雨丝连绵地飘进来，打湿了窗台的青苔。掌柜顾婉穿着烟灰色的棉布衫，笑盈盈地递上茶单。窗外湖面极静，偶有鱼跃水面，荡出几圈涟漪，又重归平静，像是什么秘密被捡起又放下。

**特色**：江南水乡，细腻温柔。茶楼兼具情报枢纽与市井人情，碧澜阁势力渗透。

---

### 潮汐港·远航码头（`eastern-sea/wharf`）

> 大型船只停泊的远航码头延伸入深水区。夜晚，附近海面发出幽幽的蓝色荧光，渔民说是冤魂作祟，老海盗说那里有宝藏，没有人敢去证实，也没有人愿意忘记。一位白衣男子站在码头边缘，望着海天交界处，衣袂随风飘动，宛如画中人。

**特色**：神秘东海，仙岛使者凌虚驻守。蓝色荧光与宝藏传说预留后续剧情钩子。

---

### 雾岚寨·祖灵树（`nanjiang-south/spirit-tree`）

> 古树的树干要五六人合抱，每一根枝上都挂满了布条和骨牌——每一块骨牌上都刻着名字，是逝去族人的名字，一代代积累，密密麻麻，不知几百上千块。山风一起，布条猎猎，骨牌轻碰，发出细碎绵长的声响，像是那些名字在低语。

**特色**：苗疆圣地，不可动武的禁忌空间。骨牌低语的听觉意象极具沉浸感，巫医玲珑驻守。

---

### 黄沙驿·禅修帐（`western-wastes/meditation-tent`）

> 帐篷低矮，门帘厚重，走进去，热闹的集市声音骤然减弱。帐顶有一道细长的缝隙，白天透入一线天光，到了夜晚，可以从这里看见西域的星空——据说这里的星星比中原的更多、更亮，因为离天更近，空气更干净。

**特色**：西域密宗氛围，动静对比（集市喧嚣 vs 禅定寂静）。夜观星空为玩家提供独特体验节点。

---

## 6. 测试覆盖

| 测试套件 | 通过情况 |
|---------|---------|
| exits-symmetry.spec.ts | 13/13 通过 |
| rift-town.spec.ts | 全部通过 |
| 全套测试 | 59 suites / 585 tests 全部通过 |

`exits-symmetry.spec.ts` 是专门为本次扩展设计的测试套件，验证所有跨区域出口的**双向对称性**（A→B 必有 B→A），防止单向死路。

---

## 7. 关键设计决策

### 决策 1：区域独立坐标系
每个 Area 的 `(0,0,0)` 是自己的入口房间，房间 roomId 为 `area/{area-id}/{room-name}`。跨区域通过 exit 中的 roomId 字符串硬连接，不依赖全局坐标系。

**优点**：各区域可独立开发，无坐标冲突风险；连接关系在 exit 定义中一目了然。

### 决策 2：道路 + 城镇分离架构
每条路线由独立的 road-xxx Area 和 city-xxx Area 组成，路段 Area 提供沿途遭遇战 NPC，城镇 Area 提供剧情/服务 NPC。

**优点**：内容密度可独立调整；玩家旅途体验层次分明（旅途遭遇 → 城镇探索）。

### 决策 3：骨架城镇规模（3–5 房间 + 2–3 NPC）
刻意保持最小规模，预留大量扩展空间。

**优点**：避免过早过度设计；等后续 Epic 需要具体内容时再扩充，保持开发节奏。

### 决策 4：南疆封路设计
`nanjiang-south/south-boundary` 只有 north 出口，无 south 出口，表示百蛊滩当前版本未开放。房间描述本身通过文案传达"此路不通"的氛围。

**优点**：地图拓扑上干净封口；玩家可以探索到边界，增加神秘感，为后续内容制造期待。

### 决策 5：exits 对称性测试作为强制约束
新增专项测试 `exits-symmetry.spec.ts`，确保所有 exit 双向对称。每次扩展新区域时必须同步更新测试。

**优点**：防止地图出现单向门或死路，保证玩家体验一致性。

---

## 8. 扩展指南

### 8.1 添加新区域（标准流程）

```
1. 创建 server/src/world/area/{area-id}/
2. 创建 area.ts（注册 rooms + spawn_rules）
3. 创建各房间 .ts 文件（继承 RoomBase）
4. 在连接点房间的 exits 中添加出口
5. 更新 exits-symmetry.spec.ts 测试用例
6. 运行 pnpm test 确认通过
```

### 8.2 扩展已有城镇

在对应 `area.ts` 的 `rooms` 列表追加新房间，在 `spawn_rules` 追加新 NPC，在已有房间的 `exits` 中添加连接。

### 8.3 开放百蛊滩（南疆深区）

```
1. 给 nanjiang-south/south-boundary.ts 添加 south exit
2. 创建 area/baigu-tan/ 区域
3. 连接点：south-boundary.south → baigu-tan/{entrance-room}
4. 更新 exits-symmetry 测试
```

### 8.4 开放嵩山东路

嵩阳宗（songyang）可直接在其出口房间添加 exit 连接至 road-central 或 crossroads，无需修改已有道路结构。

### 8.5 添加区域间随机遭遇

道路区域的 spawn_rules 中追加 NPC 配置，设置 `respawn_interval` 和 `max_count` 即可实现动态刷新。

### 8.6 城镇剧情扩展

每个城镇预留的 friendly NPC 均设计有人设钩子（如朔云关的燕七、潮汐港的凌虚），可直接作为任务链的起点 NPC，后续 Epic 可按需添加 `onAsk` / `onReceiveItem` 等钩子逻辑。

---

*本文档由 TC 系统自动生成 — 2026-02-19*
