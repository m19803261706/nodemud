# PRD: 创建角色系统

## 基本信息

- **创建时间**: 2026-02-02
- **优先级**: P0（紧急，阻塞后续所有游戏功能）
- **技术栈**: React Native + NestJS + TypeORM + MySQL + iztro
- **关联 Scope**: #27 [Scope] 创建角色系统 功能探讨

## 功能概述

为"人在江湖"水墨风武侠 MUD 游戏实现角色创建系统。玩家登录后（无角色时）进入创建流程：选择出身 → 自动生成紫微命格 → 分配属性根基点 → 取名确认。系统融合紫微斗数命理排盘、三丹田六属性体系、六种江湖出身，打造独一无二的角色创建体验。

## 用户场景

### 场景 1: 新玩家首次创建角色

**触发条件**: 注册成功后自动跳转，或登录成功但 `hasCharacter = false`

**用户流程**:

1. 进入创建角色页面，看到出身选择界面
2. 浏览 6 种出身的故事描述和属性倾向，选择一个
3. 系统自动调用紫微排盘（基于服务器当前时间），生成命格
4. 水墨风命格展示页面呈现：命格名称、诗句、命数/贵人/劫数/机缘四维度
5. 查看命格决定的六属性上限分布
6. 在上限范围内自由分配 18 个根基点到六项属性
7. 输入角色名称（2-6 个中文字符）
8. 确认预览页面展示完整角色信息
9. 确认创建 → 服务端存储 → 跳转游戏主页

### 场景 2: 查看紫微星盘详情

**触发条件**: 角色创建完成后，在个人信息页点击"查看命盘"

**用户流程**:

1. 进入紫微星盘详情页
2. 展示完整的紫微十二宫排盘信息（主星、辅星、四化等）
3. 展示命格 → 属性映射关系说明

### 场景 3: 一个账号一个角色

**约束**: 每个账号只能创建一个角色，创建后不可删除或重建。

## 详细需求

### 一、属性系统 — 三丹田六属性

#### 1.1 属性定义

| 属性 | 英文标识   | 丹田      | 影响                                     |
| ---- | ---------- | --------- | ---------------------------------------- |
| 慧根 | wisdom     | 上丹田·神 | 武学领悟速度、秘籍研读、对话选项         |
| 心眼 | perception | 上丹田·神 | 战斗感知、危险预判、发现隐藏事物         |
| 气海 | spirit     | 中丹田·气 | 内力总量、内功威力、内家功法伤害         |
| 脉络 | meridian   | 中丹田·气 | 内力流转速度、恢复速率、可学内功数量上限 |
| 筋骨 | strength   | 下丹田·精 | 外功伤害、负重、抗击打、外家功法威力     |
| 血气 | vitality   | 下丹田·精 | 生命总量、体力恢复、中毒/受伤抵抗        |

#### 1.2 数值规则

- **可分配根基点**: 固定 **18** 点（所有玩家完全相同）
- **属性上限总和**: 固定 **42** 点（所有玩家完全相同）
- **单项属性下限**: **1**（任何属性不可为 0）
- **单项属性上限**: 由命格决定，范围 **4-10**
- 命格只改变 42 点的分布方式，不改变总量
- 前端分配时实时校验：单项 ≥ 1 且 ≤ 该项上限，总和 = 18

### 二、出身系统

#### 2.1 六种出身

| 出身     | 英文标识  | 故事                     | 属性加成       | 独特开局                   |
| -------- | --------- | ------------------------ | -------------- | -------------------------- |
| 世家子弟 | noble     | 武林世家的后人，家道中落 | 慧根+1、气海+1 | 起步带一本残缺家传秘籍     |
| 江湖浪子 | wanderer  | 从小在市井中摸爬滚打     | 心眼+1、血气+1 | 起步有额外银两和江湖关系   |
| 书院学子 | scholar   | 读圣贤书的文人，偶入江湖 | 慧根+2、筋骨-1 | 识字能力强，能读更多秘籍   |
| 边塞军卒 | soldier   | 从军归来的退役兵士       | 筋骨+1、血气+1 | 起步带一把制式兵器         |
| 山野药童 | herbalist | 深山采药人的徒弟         | 脉络+1、心眼+1 | 懂基础药理，能辨认草药     |
| 乞丐流民 | beggar    | 一无所有的底层人         | 无属性加成     | 机缘维度+2（奇遇概率大增） |

#### 2.2 出身加成规则

- 出身的属性加成是**额外的**，不从 18 根基点中扣除
- 加成后属性仍受上限约束（不可超过命格上限）
- 出身加成在根基点分配**之后**叠加

### 三、命格系统 — 紫微斗数驱动

#### 3.1 排盘规则

- 使用 `iztro` npm 包进行紫微斗数排盘
- **输入**: 服务器当前时间（年月日时辰）+ 玩家选择的性别（暂时固定"男"，后续扩展）
- **计算位置**: Server 端（防止客户端篡改时间）
- 排盘完整数据（JSON）存入数据库，与角色绑定

#### 3.2 命格名称映射（命宫主星 → 命格名称）

| 命宫主星 | 命格名称 | 诗句                           | 属性倾向      |
| -------- | -------- | ------------------------------ | ------------- |
| 紫微     | 紫微在命 | 紫微高照居中天，帝星临世主威权 | 均衡型        |
| 天机     | 天机化变 | 机关算尽天下事，一朝悟道入青云 | 慧根/心眼偏高 |
| 太阳     | 日照中天 | 赤日当空照四方，光明磊落走八荒 | 筋骨/血气偏高 |
| 武曲     | 武曲临门 | 武曲刚金主杀伐，铁骨铮铮震四方 | 筋骨/气海偏高 |
| 天同     | 天同福泽 | 天同化福享安宁，闲云野鹤伴平生 | 脉络/血气偏高 |
| 廉贞     | 廉贞入命 | 廉贞化气性多端，亦正亦邪两极间 | 极端偏科      |
| 天府     | 天府坐镇 | 天府厚德载万物，稳如磐石立乾坤 | 均衡型        |
| 太阴     | 太阴化清 | 太阴如水照冰心，静水深流蕴万金 | 气海/脉络偏高 |
| 贪狼     | 贪狼桃花 | 贪狼化气主风流，桃花朵朵满枝头 | 心眼偏高      |
| 巨门     | 巨门暗曜 | 巨门暗曜多是非，口舌生风辨真伪 | 慧根偏高      |
| 天相     | 天相辅弼 | 天相端庄辅帝星，左右逢源济苍生 | 脉络/慧根偏高 |
| 天梁     | 天梁化禄 | 天梁化荫寿星高，逢凶化吉福自来 | 血气/脉络偏高 |
| 七杀     | 七杀破军 | 七杀临身胆气豪，将星入命镇边陲 | 筋骨/心眼偏高 |
| 破军     | 破军先锋 | 破军横行不畏难，先锋开路斩万关 | 大起大落型    |

#### 3.3 四化 → 命运维度映射

| 四化 | 命运维度 | 英文标识   | 数值范围 | 效果                                                            |
| ---- | -------- | ---------- | -------- | --------------------------------------------------------------- |
| 化禄 | 机缘     | fortune    | 1-5 星   | 影响奇遇品质和触发概率                                          |
| 化权 | 命数     | destiny    | 1-5 星   | 影响主线剧情走向和难度                                          |
| 化科 | 贵人     | benefactor | 1-5 星   | 影响 NPC 好感度获取速度、拜师成功率                             |
| 化忌 | 劫数     | calamity   | 1-5 星   | 影响负面随机事件频率（高劫数 = 更多挑战但也更多"大难不死"奖励） |

#### 3.4 属性上限分布算法

**输入**: 紫微十二宫的星耀强弱评分

**宫位 → 属性映射**:

| 紫微宫位        | 游戏属性 |
| --------------- | -------- |
| 命宫 + 身宫     | 慧根上限 |
| 迁移宫 + 福德宫 | 心眼上限 |
| 财帛宫 + 官禄宫 | 气海上限 |
| 疾厄宫          | 脉络上限 |
| 兄弟宫 + 父母宫 | 筋骨上限 |
| 子女宫 + 夫妻宫 | 血气上限 |

**归一化算法**（Design Doc 阶段细化）:

1. 对每组宫位的星耀进行强度评分（主星亮度、是否有四化加成等）
2. 得到 6 个原始分数
3. 归一化到总和 = 42，每项限制在 [4, 10] 范围内
4. 四舍五入为整数，误差修正保证总和精确等于 42

### 四、创建流程 — 客户端页面

#### 4.1 页面拆分（4 步）

**Step 1: 选择出身**

- 6 个出身卡片，水墨风格
- 每张卡片展示：出身名称、一句话故事、属性倾向图标、独特开局提示
- 点击卡片展开详细描述
- 选中后底部确认按钮亮起

**Step 2: 命格天成（自动生成展示）**

- 选择出身后，客户端发送 `createCharacterStep1` 消息（携带出身选择）
- Server 端执行紫微排盘，返回命格数据
- 水墨风全屏展示命格信息：
  - 命格名称（大字，Noto Serif SC）
  - 命格诗句（小字）
  - 命数/贵人/劫数/机缘 四维度（星级展示）
  - 底部：「此命格由阁下踏入江湖之时辰推演」
- 一个"继续"按钮进入下一步

**Step 3: 分配根基点**

- 顶部显示六属性上限分布（由命格决定）
- 每个属性一行：属性名 + 当前值滑块/加减按钮 + 上限值
- 底部显示剩余可分配点数
- 实时校验：每项 ≥ 1 且 ≤ 上限，总和 = 18
- 出身加成以灰色"(+1)"标注在属性值旁

**Step 4: 取名 + 确认**

- 角色名输入框（2-6 个中文字符）
- 角色信息预览卡片：
  - 角色名、出身、命格名称
  - 六属性最终值（根基 + 出身加成）
  - 命运四维度
- "踏入江湖"确认按钮
- 确认后发送 `createCharacterConfirm` 消息

#### 4.2 导航限制

- 创建流程中不可退出（无返回按钮跳回登录）
- 步骤之间可以回退修改（Step 3 回到 Step 1）
- 确认创建后不可撤销

### 五、WebSocket 消息协议

#### 5.1 新增消息类型

| 消息类型                 | 方向            | 说明                                     |
| ------------------------ | --------------- | ---------------------------------------- |
| `createCharacterStep1`   | Client → Server | 提交出身选择，请求生成命格               |
| `createCharacterFate`    | Server → Client | 返回命格数据（命格名/属性上限/四维度）   |
| `createCharacterConfirm` | Client → Server | 提交完整角色数据（出身+属性分配+角色名） |
| `createCharacterSuccess` | Server → Client | 角色创建成功                             |
| `createCharacterFailed`  | Server → Client | 角色创建失败（重名等）                   |

#### 5.2 消息数据结构

```typescript
// Step 1: 客户端提交出身
interface CreateCharacterStep1Message extends ClientMessage {
  type: 'createCharacterStep1';
  data: {
    origin: 'noble' | 'wanderer' | 'scholar' | 'soldier' | 'herbalist' | 'beggar';
    gender: 'male' | 'female'; // 预留
  };
}

// Step 2: 服务端返回命格
interface CreateCharacterFateMessage extends ServerMessage {
  type: 'createCharacterFate';
  data: {
    fateName: string; // 命格名称，如"天机化变"
    fatePoem: string; // 命格诗句
    fateType: string; // 命宫主星英文标识
    destiny: number; // 命数 1-5
    benefactor: number; // 贵人 1-5
    calamity: number; // 劫数 1-5
    fortune: number; // 机缘 1-5
    attributeCaps: {
      // 六属性上限
      wisdom: number; // 慧根上限 4-10
      perception: number; // 心眼上限 4-10
      spirit: number; // 气海上限 4-10
      meridian: number; // 脉络上限 4-10
      strength: number; // 筋骨上限 4-10
      vitality: number; // 血气上限 4-10
    };
    wuxingju: string; // 五行局（如"水二局"）
    mingzhuStar: string; // 命主星
    shenzhuStar: string; // 身主星
  };
}

// Step 3: 客户端提交完整角色
interface CreateCharacterConfirmMessage extends ClientMessage {
  type: 'createCharacterConfirm';
  data: {
    name: string; // 角色名（2-6 中文字符）
    origin: 'noble' | 'wanderer' | 'scholar' | 'soldier' | 'herbalist' | 'beggar';
    attributes: {
      // 根基点分配（总和 = 18，每项 ≥ 1 且 ≤ 上限）
      wisdom: number;
      perception: number;
      spirit: number;
      meridian: number;
      strength: number;
      vitality: number;
    };
  };
}

// 创建成功
interface CreateCharacterSuccessMessage extends ServerMessage {
  type: 'createCharacterSuccess';
  data: {
    characterId: string; // 角色 ID
    characterName: string; // 角色名
    message: string; // 提示信息
  };
}

// 创建失败
interface CreateCharacterFailedMessage extends ServerMessage {
  type: 'createCharacterFailed';
  data: {
    reason:
      | 'name_exists'
      | 'name_invalid'
      | 'already_has_character'
      | 'invalid_attributes'
      | 'session_expired'
      | 'server_error';
    message: string; // 中文错误提示
  };
}
```

### 六、数据模型

#### 6.1 Character 表（新建）

| 字段           | 类型                   | 说明                               |
| -------------- | ---------------------- | ---------------------------------- |
| id             | UUID v4                | 角色主键                           |
| account_id     | UUID (FK → account.id) | 关联账号（唯一，一对一）           |
| name           | VARCHAR(20) UNIQUE     | 角色名（2-6 中文字符）             |
| origin         | ENUM                   | 出身类型                           |
| fate_name      | VARCHAR(20)            | 命格名称                           |
| fate_type      | VARCHAR(20)            | 命宫主星标识                       |
| fate_poem      | VARCHAR(100)           | 命格诗句                           |
| destiny        | TINYINT                | 命数 1-5                           |
| benefactor     | TINYINT                | 贵人 1-5                           |
| calamity       | TINYINT                | 劫数 1-5                           |
| fortune        | TINYINT                | 机缘 1-5                           |
| wisdom         | TINYINT                | 慧根（根基+出身加成后的最终值）    |
| perception     | TINYINT                | 心眼                               |
| spirit         | TINYINT                | 气海                               |
| meridian       | TINYINT                | 脉络                               |
| strength       | TINYINT                | 筋骨                               |
| vitality       | TINYINT                | 血气                               |
| wisdom_cap     | TINYINT                | 慧根上限                           |
| perception_cap | TINYINT                | 心眼上限                           |
| spirit_cap     | TINYINT                | 气海上限                           |
| meridian_cap   | TINYINT                | 脉络上限                           |
| strength_cap   | TINYINT                | 筋骨上限                           |
| vitality_cap   | TINYINT                | 血气上限                           |
| astrolabe_json | JSON                   | 紫微排盘完整数据（iztro 原始输出） |
| wuxingju       | VARCHAR(10)            | 五行局                             |
| mingzhu_star   | VARCHAR(10)            | 命主星                             |
| shenzhu_star   | VARCHAR(10)            | 身主星                             |
| created_at     | TIMESTAMP              | 创建时间                           |

#### 6.2 关系

- Account : Character = 1 : 1（一个账号只能有一个角色）
- Account 表现有 `id` 字段作为外键关联

### 七、服务端逻辑

#### 7.1 新增模块

- `server/src/character/` — 角色模块
  - `character.entity.ts` — Character TypeORM 实体
  - `character.service.ts` — 角色创建业务逻辑
  - `character.module.ts` — 模块定义

- `server/src/websocket/handlers/character.handler.ts` — 角色创建消息处理器

#### 7.2 创建流程（Step 1: 生成命格）

1. 收到 `createCharacterStep1` 消息
2. 验证 Session 已认证
3. 验证该账号尚未创建角色
4. 调用 `iztro.astro.bySolar(当前日期, 当前时辰, 性别)` 排盘
5. 从排盘结果提取命宫主星 → 查表得命格名称和诗句
6. 从排盘结果提取四化 → 计算命运四维度
7. 从排盘结果提取十二宫星耀 → 计算六属性上限分布（归一化到总和 42）
8. 将排盘结果和命格数据临时存入 Session（Step 3 确认时使用）
9. 返回 `createCharacterFate` 消息

#### 7.3 创建流程（Step 3: 确认创建）

1. 收到 `createCharacterConfirm` 消息
2. 验证 Session 已认证且存在 Step 1 的临时数据
3. 验证角色名格式（2-6 中文字符，正则 `/^[\u4e00-\u9fa5]{2,6}$/`）
4. 验证角色名唯一性（查数据库）
5. 验证属性分配合法性：
   - 每项 ≥ 1 且 ≤ 对应上限
   - 总和 = 18
6. 计算最终属性 = 根基分配 + 出身加成（不超上限）
7. 创建 Character 记录（含完整紫微排盘 JSON）
8. 返回 `createCharacterSuccess`
9. 清除 Session 临时数据

#### 7.4 校验清单

- [ ] 账号未创建过角色
- [ ] 角色名 2-6 中文字符
- [ ] 角色名数据库唯一
- [ ] 属性总和 = 18
- [ ] 每项属性 ≥ 1
- [ ] 每项属性 ≤ 命格上限
- [ ] 属性上限总和 = 42
- [ ] Session 中存在 Step 1 临时数据

## 现有代码基础

### 可复用

| 模块                  | 位置                                            | 复用内容                     |
| --------------------- | ----------------------------------------------- | ---------------------------- |
| Account 实体          | `server/src/account/account.entity.ts`          | 外键关联                     |
| MessageFactory        | `packages/core/src/factory/`                    | 添加新消息处理器             |
| 消息类型定义模式      | `packages/core/src/types/messages/auth.ts`      | 沿用 interface 模式          |
| Auth Handler 模式     | `server/src/websocket/handlers/auth.handler.ts` | 沿用 Handler 结构            |
| WebSocket Gateway     | `server/src/websocket/websocket.gateway.ts`     | switch 中添加路由            |
| 水墨风 UI             | `client/src/components/`                        | LinearGradient, GameAlert 等 |
| CreateCharacterScreen | `client/src/screens/CreateCharacterScreen.tsx`  | 替换占位符内容               |

### 新增依赖

| 包名    | 安装位置 | 用途         |
| ------- | -------- | ------------ |
| `iztro` | server   | 紫微斗数排盘 |

## 代码影响范围

| 层                | 模块                                | 变更类型                                  |
| ----------------- | ----------------------------------- | ----------------------------------------- |
| **packages/core** | `types/messages/`                   | 新增角色创建消息类型                      |
| **packages/core** | `factory/handlers/`                 | 新增 5 个消息处理器                       |
| **server**        | `character/`                        | 新建角色模块（entity + service + module） |
| **server**        | `websocket/handlers/`               | 新增 character.handler.ts                 |
| **server**        | `websocket/websocket.gateway.ts`    | switch 添加角色消息路由                   |
| **server**        | `app.module.ts`                     | 注册 CharacterModule                      |
| **server**        | `package.json`                      | 添加 iztro 依赖                           |
| **client**        | `screens/CreateCharacterScreen.tsx` | 重写（4 步创建流程）                      |

## 任务拆分（初步）

- [ ] **[core]** 定义角色创建消息类型（5 种）和处理器
- [ ] **[server]** 安装 iztro，实现紫微排盘 → 命格映射算法
- [ ] **[server]** 创建 Character 实体和 CharacterModule
- [ ] **[server]** 实现 CharacterService（创建逻辑 + 校验）
- [ ] **[server]** 实现 CharacterHandler（WebSocket 消息处理）
- [ ] **[server]** Gateway 添加角色消息路由
- [ ] **[client]** Step 1: 出身选择页面（水墨风卡片）
- [ ] **[client]** Step 2: 命格展示页面（水墨风全屏动画）
- [ ] **[client]** Step 3: 属性分配页面（滑块 + 实时校验）
- [ ] **[client]** Step 4: 取名 + 确认预览页面
- [ ] **[client]** 创建流程导航和状态管理

## 验收标准

- [ ] 注册成功/登录无角色 → 自动进入创建角色流程
- [ ] 6 种出身可选，展示故事和属性倾向
- [ ] 选择出身后，服务端根据当前时间紫微排盘生成命格
- [ ] 命格展示包含：名称、诗句、命数/贵人/劫数/机缘四维度
- [ ] 六属性上限由命格决定，上限总和恒等于 42
- [ ] 可分配根基点恒等于 18，分配时实时校验上下限
- [ ] 出身加成在根基分配后叠加
- [ ] 角色名 2-6 中文字符，全服唯一
- [ ] 创建成功后角色数据持久化到 MySQL
- [ ] 紫微排盘完整 JSON 数据存入数据库
- [ ] 创建成功后跳转游戏主页
- [ ] 一个账号只能创建一个角色
- [ ] 所有页面符合水墨风设计规范
- [ ] 属性分配校验在前后端双重执行

---

> CX 工作流 | PRD
