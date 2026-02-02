# Design Doc: 创建角色系统

## 关联

- PRD: #28
- Scope: #27
- 关联 Design Doc: #12（WebSocket 通信协议与消息工厂 — 沿用消息格式和 Handler 模式）

## 基于现有代码

| 现有代码                 | 路径                                                 | 设计决策                                        |
| ------------------------ | ---------------------------------------------------- | ----------------------------------------------- |
| Account 实体             | `server/src/account/account.entity.ts`               | Character 实体通过 `account_id` 外键关联        |
| AccountService.login     | `server/src/account/account.service.ts:166`          | 修改 `hasCharacter` 逻辑，查询 Character 表     |
| Session 接口             | `server/src/websocket/types/session.ts`              | 扩展存储临时命格数据                            |
| GameGateway switch       | `server/src/websocket/websocket.gateway.ts:70`       | 新增角色创建消息路由                            |
| WebSocketModule          | `server/src/websocket/websocket.module.ts`           | 注入 CharacterHandler 和 CharacterModule        |
| MessageFactory 模式      | `packages/core/src/factory/`                         | 新增 5 个 Handler 文件                          |
| LoginSuccessHandler 模式 | `packages/core/src/factory/handlers/loginSuccess.ts` | 沿用 `@MessageHandler` + `IMessageHandler` 模式 |
| CreateCharacterScreen    | `client/src/screens/CreateCharacterScreen.tsx`       | 替换占位符，实现 4 步创建流程                   |

## 架构概览

```
┌────────────────────────────────────────────────────────────────────┐
│                        创建角色数据流                                │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Client                          Server                            │
│  ┌──────────────┐               ┌──────────────────────┐          │
│  │ Step1: 选出身 │──step1 msg──→│ CharacterHandler      │          │
│  └──────────────┘               │   ├─ 验证 Session     │          │
│                                 │   ├─ 验证无角色       │          │
│  ┌──────────────┐               │   ├─ iztro 排盘       │          │
│  │ Step2: 命格  │←──fate msg───│   ├─ 映射算法         │          │
│  └──────────────┘               │   └─ 存临时数据到     │          │
│                                 │      Session          │          │
│  ┌──────────────┐               │                       │          │
│  │ Step3: 分配  │               │                       │          │
│  └──────────────┘               │                       │          │
│                                 │                       │          │
│  ┌──────────────┐               │   ├─ 验证属性合法     │          │
│  │ Step4: 确认  │──confirm msg→│   ├─ 计算最终属性     │          │
│  └──────────────┘               │   ├─ 写入 Character   │          │
│                                 │   └─ 返回 success     │          │
│  ┌──────────────┐               └──────────────────────┘          │
│  │ GameHome     │←──success msg──                                  │
│  └──────────────┘                                                  │
│                                                                    │
│  CharacterService                FateService (新)                   │
│  ┌────────────────┐             ┌────────────────────┐            │
│  │ create()       │             │ generateFate()     │            │
│  │ findByAccount()│             │ mapStarToFate()    │            │
│  │ validateAttrs()│             │ calcAttrCaps()     │            │
│  └────────────────┘             │ calcDestinyDims()  │            │
│                                 │ normalizeCaps()    │            │
│                                 └────────────────────┘            │
└────────────────────────────────────────────────────────────────────┘
```

## 数据库设计

### 新增表: `character`

```sql
CREATE TABLE `character` (
  `id` CHAR(36) NOT NULL COMMENT '角色ID (UUID v4)',
  `account_id` CHAR(36) NOT NULL COMMENT '关联账号ID (唯一，一对一)',
  `name` VARCHAR(20) NOT NULL COMMENT '角色名（2-6中文字符，全服唯一）',
  `origin` ENUM('noble','wanderer','scholar','soldier','herbalist','beggar')
    NOT NULL COMMENT '出身类型',
  `fate_name` VARCHAR(20) NOT NULL COMMENT '命格名称（如"天机化变"）',
  `fate_type` VARCHAR(20) NOT NULL COMMENT '命宫主星标识（如"tianji"）',
  `fate_poem` VARCHAR(100) NOT NULL COMMENT '命格诗句',
  `destiny` TINYINT UNSIGNED NOT NULL COMMENT '命数 1-5',
  `benefactor` TINYINT UNSIGNED NOT NULL COMMENT '贵人 1-5',
  `calamity` TINYINT UNSIGNED NOT NULL COMMENT '劫数 1-5',
  `fortune` TINYINT UNSIGNED NOT NULL COMMENT '机缘 1-5',
  `wisdom` TINYINT UNSIGNED NOT NULL COMMENT '慧根（最终值=根基+出身加成）',
  `perception` TINYINT UNSIGNED NOT NULL COMMENT '心眼',
  `spirit` TINYINT UNSIGNED NOT NULL COMMENT '气海',
  `meridian` TINYINT UNSIGNED NOT NULL COMMENT '脉络',
  `strength` TINYINT UNSIGNED NOT NULL COMMENT '筋骨',
  `vitality` TINYINT UNSIGNED NOT NULL COMMENT '血气',
  `wisdom_cap` TINYINT UNSIGNED NOT NULL COMMENT '慧根上限',
  `perception_cap` TINYINT UNSIGNED NOT NULL COMMENT '心眼上限',
  `spirit_cap` TINYINT UNSIGNED NOT NULL COMMENT '气海上限',
  `meridian_cap` TINYINT UNSIGNED NOT NULL COMMENT '脉络上限',
  `strength_cap` TINYINT UNSIGNED NOT NULL COMMENT '筋骨上限',
  `vitality_cap` TINYINT UNSIGNED NOT NULL COMMENT '血气上限',
  `astrolabe_json` JSON NOT NULL COMMENT '紫微排盘完整数据（iztro原始输出）',
  `wuxingju` VARCHAR(10) NOT NULL COMMENT '五行局（如"水二局"）',
  `mingzhu_star` VARCHAR(10) NOT NULL COMMENT '命主星',
  `shenzhu_star` VARCHAR(10) NOT NULL COMMENT '身主星',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_account_id` (`account_id`),
  UNIQUE KEY `uk_name` (`name`),
  INDEX `idx_fate_type` (`fate_type`),
  CONSTRAINT `fk_character_account` FOREIGN KEY (`account_id`)
    REFERENCES `account`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';
```

### 字段说明

| 字段           | 数据库类型   | API 字段      | 前端字段      | 说明            |
| -------------- | ------------ | ------------- | ------------- | --------------- |
| id             | CHAR(36)     | characterId   | characterId   | UUID v4         |
| account_id     | CHAR(36)     | accountId     | accountId     | FK → account.id |
| name           | VARCHAR(20)  | name          | name          | 2-6 中文字符    |
| origin         | ENUM         | origin        | origin        | 出身标识        |
| fate_name      | VARCHAR(20)  | fateName      | fateName      | 命格名称        |
| fate_type      | VARCHAR(20)  | fateType      | fateType      | 命宫主星标识    |
| fate_poem      | VARCHAR(100) | fatePoem      | fatePoem      | 命格诗句        |
| destiny        | TINYINT      | destiny       | destiny       | 命数 1-5        |
| benefactor     | TINYINT      | benefactor    | benefactor    | 贵人 1-5        |
| calamity       | TINYINT      | calamity      | calamity      | 劫数 1-5        |
| fortune        | TINYINT      | fortune       | fortune       | 机缘 1-5        |
| wisdom         | TINYINT      | wisdom        | wisdom        | 慧根最终值      |
| perception     | TINYINT      | perception    | perception    | 心眼最终值      |
| spirit         | TINYINT      | spirit        | spirit        | 气海最终值      |
| meridian       | TINYINT      | meridian      | meridian      | 脉络最终值      |
| strength       | TINYINT      | strength      | strength      | 筋骨最终值      |
| vitality       | TINYINT      | vitality      | vitality      | 血气最终值      |
| wisdom_cap     | TINYINT      | wisdomCap     | wisdomCap     | 慧根上限        |
| perception_cap | TINYINT      | perceptionCap | perceptionCap | 心眼上限        |
| spirit_cap     | TINYINT      | spiritCap     | spiritCap     | 气海上限        |
| meridian_cap   | TINYINT      | meridianCap   | meridianCap   | 脉络上限        |
| strength_cap   | TINYINT      | strengthCap   | strengthCap   | 筋骨上限        |
| vitality_cap   | TINYINT      | vitalityCap   | vitalityCap   | 血气上限        |
| astrolabe_json | JSON         | astrolabeJson | astrolabeJson | 完整排盘数据    |
| wuxingju       | VARCHAR(10)  | wuxingju      | wuxingju      | 五行局          |
| mingzhu_star   | VARCHAR(10)  | mingzhuStar   | mingzhuStar   | 命主星          |
| shenzhu_star   | VARCHAR(10)  | shenzhuStar   | shenzhuStar   | 身主星          |
| created_at     | TIMESTAMP    | createdAt     | createdAt     | 创建时间        |

## WebSocket 消息设计

### 消息类型总览

| 消息类型                 | 方向            | 触发时机                     |
| ------------------------ | --------------- | ---------------------------- |
| `createCharacterStep1`   | Client → Server | 用户选完出身，点击继续       |
| `createCharacterFate`    | Server → Client | 服务端排盘完成，返回命格     |
| `createCharacterConfirm` | Client → Server | 用户完成分配和取名，点击确认 |
| `createCharacterSuccess` | Server → Client | 角色创建成功                 |
| `createCharacterFailed`  | Server → Client | 角色创建失败                 |

### 消息数据结构（TypeScript 类型定义）

位置: `packages/core/src/types/messages/character.ts`

```typescript
/**
 * 角色创建相关消息类型定义
 */

import type { ClientMessage, ServerMessage } from '../base';

/** 出身类型 */
export type CharacterOrigin =
  | 'noble' // 世家子弟
  | 'wanderer' // 江湖浪子
  | 'scholar' // 书院学子
  | 'soldier' // 边塞军卒
  | 'herbalist' // 山野药童
  | 'beggar'; // 乞丐流民

/** 六属性结构 */
export interface CharacterAttributes {
  wisdom: number; // 慧根
  perception: number; // 心眼
  spirit: number; // 气海
  meridian: number; // 脉络
  strength: number; // 筋骨
  vitality: number; // 血气
}

// ========== Step 1: 提交出身 ==========

export interface CreateCharacterStep1Message extends ClientMessage {
  type: 'createCharacterStep1';
  data: {
    origin: CharacterOrigin;
    gender: 'male' | 'female'; // 预留性别选择
  };
}

// ========== Step 2: 返回命格 ==========

export interface CreateCharacterFateMessage extends ServerMessage {
  type: 'createCharacterFate';
  data: {
    fateName: string; // 命格名称
    fatePoem: string; // 命格诗句
    fateType: string; // 命宫主星标识
    destiny: number; // 命数 1-5
    benefactor: number; // 贵人 1-5
    calamity: number; // 劫数 1-5
    fortune: number; // 机缘 1-5
    attributeCaps: CharacterAttributes; // 六属性上限（总和=42）
    wuxingju: string; // 五行局
    mingzhuStar: string; // 命主星
    shenzhuStar: string; // 身主星
  };
}

// ========== Step 3: 确认创建 ==========

export interface CreateCharacterConfirmMessage extends ClientMessage {
  type: 'createCharacterConfirm';
  data: {
    name: string; // 角色名（2-6中文字符）
    origin: CharacterOrigin; // 出身（重复传递用于校验）
    attributes: CharacterAttributes; // 根基点分配（总和=18，每项≥1且≤上限）
  };
}

// ========== 创建结果 ==========

export interface CreateCharacterSuccessMessage extends ServerMessage {
  type: 'createCharacterSuccess';
  data: {
    characterId: string;
    characterName: string;
    message: string;
  };
}

export interface CreateCharacterFailedMessage extends ServerMessage {
  type: 'createCharacterFailed';
  data: {
    reason:
      | 'name_exists'
      | 'name_invalid'
      | 'already_has_character'
      | 'invalid_attributes'
      | 'invalid_origin'
      | 'session_expired'
      | 'fate_not_generated'
      | 'server_error';
    message: string;
  };
}
```

## 后端设计

### 代码路径

```
server/src/
├── character/                          # 新增模块
│   ├── character.entity.ts             # Character TypeORM 实体
│   ├── character.service.ts            # 角色创建 CRUD
│   └── character.module.ts             # 模块定义
├── fate/                               # 新增模块（命格生成）
│   ├── fate.service.ts                 # 紫微排盘 + 映射算法
│   ├── fate.constants.ts               # 命格映射表、诗句、出身数据
│   └── fate.module.ts                  # 模块定义
└── websocket/
    ├── handlers/
    │   └── character.handler.ts        # 新增：角色创建消息处理
    ├── types/
    │   └── session.ts                  # 修改：扩展临时命格数据
    ├── websocket.gateway.ts            # 修改：添加路由
    └── websocket.module.ts             # 修改：注入依赖
```

### Session 扩展

```typescript
// server/src/websocket/types/session.ts
export interface Session {
  socketId: string;
  authenticated: boolean;
  accountId?: string;
  username?: string;
  lastPing?: number;
  // 新增：角色创建临时数据（Step1 生成，Step3 消费后清除）
  pendingCharacter?: {
    origin: CharacterOrigin;
    gender: 'male' | 'female';
    fateName: string;
    fateType: string;
    fatePoem: string;
    destiny: number;
    benefactor: number;
    calamity: number;
    fortune: number;
    attributeCaps: CharacterAttributes;
    wuxingju: string;
    mingzhuStar: string;
    shenzhuStar: string;
    astrolabeJson: object; // iztro 原始输出
    generatedAt: number; // 生成时间戳，超时失效
  };
}
```

### FateService — 命格生成核心

```typescript
// server/src/fate/fate.service.ts
@Injectable()
export class FateService {
  /**
   * 生成命格
   * @param gender 性别
   * @returns 完整命格数据
   */
  generateFate(gender: 'male' | 'female'): FateResult {
    // 1. 获取服务器当前时间
    const now = new Date();
    const solarDate = this.formatDate(now);
    const timeIndex = this.getTimeIndex(now);

    // 2. 调用 iztro 排盘
    const astrolabe = astro.bySolar(solarDate, timeIndex, gender === 'male' ? '男' : '女');

    // 3. 提取命宫主星
    const soulPalace = this.findPalace(astrolabe.palaces, '命宫');
    const mainStar = this.getMainStar(soulPalace);

    // 4. 查表映射命格名称和诗句
    const fateConfig = FATE_STAR_MAP[mainStar];

    // 5. 计算命运四维度（基于四化）
    const dimensions = this.calcDestinyDimensions(astrolabe);

    // 6. 计算六属性上限分布（归一化到总和=42）
    const attributeCaps = this.calcAttributeCaps(astrolabe.palaces);

    return { ...fateConfig, dimensions, attributeCaps, astrolabe };
  }

  /**
   * 属性上限归一化算法
   * 保证总和=42，每项在[4,10]范围内
   */
  private calcAttributeCaps(palaces: Palace[]): CharacterAttributes {
    // 1. 各宫位星耀强度评分
    const rawScores = {
      wisdom: this.scorePalaces(palaces, ['命宫'], true), // +身宫
      perception: this.scorePalaces(palaces, ['迁移', '福德']),
      spirit: this.scorePalaces(palaces, ['财帛', '官禄']),
      meridian: this.scorePalaces(palaces, ['疾厄']),
      strength: this.scorePalaces(palaces, ['兄弟', '父母']),
      vitality: this.scorePalaces(palaces, ['子女', '夫妻']),
    };

    // 2. 归一化到总和=42，范围[4,10]
    return this.normalizeCaps(rawScores, 42, 4, 10);
  }

  /**
   * 宫位星耀强度评分
   * 主星亮度权重: 庙=5, 旺=4, 得=3, 利=2, 平=1, 不=0, 陷=-1
   * 辅星加分: 六吉+1, 六煞-1
   * 身宫额外+1
   */
  private scorePalaces(palaces: Palace[], names: string[], includeBody = false): number {
    let score = 0;
    for (const palace of palaces) {
      const isTarget = names.some((n) => palace.name.includes(n));
      const isBody = includeBody && palace.isBodyPalace;
      if (!isTarget && !isBody) continue;

      // 主星亮度评分
      for (const star of palace.majorStars) {
        score += BRIGHTNESS_SCORE[star.brightness] ?? 1;
      }
      // 辅星加减分
      for (const star of palace.minorStars) {
        score += star.type === 'soft' ? 1 : star.type === 'tough' ? -1 : 0;
      }
      // 身宫加分
      if (palace.isBodyPalace) score += 1;
      // 空宫保底
      if (palace.majorStars.length === 0) score += 1;
    }
    return Math.max(score, 1); // 最低1分
  }

  /**
   * 归一化算法
   * 将原始分数映射到 [min, max] 范围，保证总和 = targetSum
   */
  private normalizeCaps(
    raw: CharacterAttributes,
    targetSum: number,
    min: number,
    max: number,
  ): CharacterAttributes {
    const keys = Object.keys(raw) as (keyof CharacterAttributes)[];
    const totalRaw = keys.reduce((sum, k) => sum + raw[k], 0);

    // 第一轮：按比例缩放
    const scaled: CharacterAttributes = {} as any;
    for (const k of keys) {
      scaled[k] = Math.round((raw[k] / totalRaw) * targetSum);
      scaled[k] = Math.max(min, Math.min(max, scaled[k]));
    }

    // 第二轮：修正误差（贪心法，调整最接近边界的属性）
    let currentSum = keys.reduce((sum, k) => sum + scaled[k], 0);
    while (currentSum !== targetSum) {
      const diff = targetSum - currentSum;
      const direction = diff > 0 ? 1 : -1;

      // 找最适合调整的属性（距离边界最远的）
      let bestKey: keyof CharacterAttributes = keys[0];
      let bestMargin = 0;
      for (const k of keys) {
        const margin = direction > 0 ? max - scaled[k] : scaled[k] - min;
        if (margin > bestMargin) {
          bestMargin = margin;
          bestKey = k;
        }
      }
      scaled[bestKey] += direction;
      currentSum += direction;
    }

    return scaled;
  }

  /**
   * 命运四维度计算
   * 基于四化在十二宫的分布
   */
  private calcDestinyDimensions(astrolabe: any): {
    destiny: number;
    benefactor: number;
    calamity: number;
    fortune: number;
  } {
    // 遍历十二宫，统计四化星的位置和强度
    let luCount = 0,
      quanCount = 0,
      keCount = 0,
      jiCount = 0;

    for (const palace of astrolabe.palaces) {
      for (const star of [...palace.majorStars, ...palace.minorStars]) {
        const name = star.name;
        // iztro 在星名后标注四化，如 "太阳 化禄"
        // 也可通过 star.mutagen 字段判断
        if (name.includes('化禄') || star.mutagen === '禄') luCount++;
        if (name.includes('化权') || star.mutagen === '权') quanCount++;
        if (name.includes('化科') || star.mutagen === '科') keCount++;
        if (name.includes('化忌') || star.mutagen === '忌') jiCount++;
      }
    }

    // 映射到 1-5 星（基础3星，有四化+1~2，命宫有四化额外+1）
    return {
      fortune: Math.min(5, Math.max(1, 3 + luCount)), // 化禄 → 机缘
      destiny: Math.min(5, Math.max(1, 3 + quanCount)), // 化权 → 命数
      benefactor: Math.min(5, Math.max(1, 3 + keCount)), // 化科 → 贵人
      calamity: Math.min(5, Math.max(1, 3 + jiCount)), // 化忌 → 劫数
    };
  }

  /** 日期格式化 YYYY-M-D */
  private formatDate(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }

  /** 当前时间 → 时辰序号 (0=早子,1=丑,...,12=晚子) */
  private getTimeIndex(date: Date): number {
    const hour = date.getHours();
    if (hour >= 23 || hour < 1) return 0; // 子时
    return Math.floor((hour + 1) / 2);
  }

  /** 从宫位数组中找指定宫位 */
  private findPalace(palaces: any[], name: string): any {
    // iztro 返回的宫位 name 为中文
    // 命宫是 palaces 数组中的固定位置，也可通过名称查找
    return palaces.find((p) => p.name === name) || palaces[0];
  }

  /** 获取宫位主星名称（取亮度最高的） */
  private getMainStar(palace: any): string {
    if (!palace.majorStars || palace.majorStars.length === 0) return '天府'; // 空宫默认
    // 取第一颗主星（iztro 按重要性排序）
    return palace.majorStars[0].name;
  }
}
```

### fate.constants.ts — 命格映射表

```typescript
// server/src/fate/fate.constants.ts

/** 主星亮度评分 */
export const BRIGHTNESS_SCORE: Record<string, number> = {
  庙: 5,
  旺: 4,
  得: 3,
  利: 2,
  平: 1,
  不: 0,
  陷: -1,
  '': 1, // 无亮度标注默认1
};

/** 命宫主星 → 命格映射 */
export const FATE_STAR_MAP: Record<
  string,
  {
    fateName: string;
    fateType: string;
    fatePoem: string;
    attrBias: Record<string, number>; // 属性倾向权重（正值=擅长）
  }
> = {
  紫微: {
    fateName: '紫微在命',
    fateType: 'ziwei',
    fatePoem: '紫微高照居中天，帝星临世主威权',
    attrBias: { wisdom: 1, perception: 1, spirit: 1, meridian: 1, strength: 1, vitality: 1 },
  },
  天机: {
    fateName: '天机化变',
    fateType: 'tianji',
    fatePoem: '机关算尽天下事，一朝悟道入青云',
    attrBias: { wisdom: 3, perception: 2, spirit: 0, meridian: 0, strength: -2, vitality: -1 },
  },
  太阳: {
    fateName: '日照中天',
    fateType: 'taiyang',
    fatePoem: '赤日当空照四方，光明磊落走八荒',
    attrBias: { wisdom: 0, perception: 0, spirit: -1, meridian: -1, strength: 3, vitality: 2 },
  },
  武曲: {
    fateName: '武曲临门',
    fateType: 'wuqu',
    fatePoem: '武曲刚金主杀伐，铁骨铮铮震四方',
    attrBias: { wisdom: -1, perception: 0, spirit: 2, meridian: -1, strength: 3, vitality: 0 },
  },
  天同: {
    fateName: '天同福泽',
    fateType: 'tiantong',
    fatePoem: '天同化福享安宁，闲云野鹤伴平生',
    attrBias: { wisdom: 0, perception: -1, spirit: 0, meridian: 2, strength: -1, vitality: 3 },
  },
  廉贞: {
    fateName: '廉贞入命',
    fateType: 'lianzhen',
    fatePoem: '廉贞化气性多端，亦正亦邪两极间',
    attrBias: { wisdom: 2, perception: -2, spirit: 3, meridian: -2, strength: 2, vitality: -1 },
  },
  天府: {
    fateName: '天府坐镇',
    fateType: 'tianfu',
    fatePoem: '天府厚德载万物，稳如磐石立乾坤',
    attrBias: { wisdom: 1, perception: 1, spirit: 1, meridian: 1, strength: 1, vitality: 1 },
  },
  太阴: {
    fateName: '太阴化清',
    fateType: 'taiyin',
    fatePoem: '太阴如水照冰心，静水深流蕴万金',
    attrBias: { wisdom: 0, perception: -1, spirit: 3, meridian: 2, strength: -2, vitality: 0 },
  },
  贪狼: {
    fateName: '贪狼桃花',
    fateType: 'tanlang',
    fatePoem: '贪狼化气主风流，桃花朵朵满枝头',
    attrBias: { wisdom: 0, perception: 3, spirit: 0, meridian: -1, strength: 0, vitality: 2 },
  },
  巨门: {
    fateName: '巨门暗曜',
    fateType: 'jumen',
    fatePoem: '巨门暗曜多是非，口舌生风辨真伪',
    attrBias: { wisdom: 3, perception: 1, spirit: 0, meridian: 0, strength: -1, vitality: -1 },
  },
  天相: {
    fateName: '天相辅弼',
    fateType: 'tianxiang',
    fatePoem: '天相端庄辅帝星，左右逢源济苍生',
    attrBias: { wisdom: 2, perception: 0, spirit: 0, meridian: 2, strength: -1, vitality: 0 },
  },
  天梁: {
    fateName: '天梁化禄',
    fateType: 'tianliang',
    fatePoem: '天梁化荫寿星高，逢凶化吉福自来',
    attrBias: { wisdom: 0, perception: 0, spirit: -1, meridian: 2, strength: 0, vitality: 3 },
  },
  七杀: {
    fateName: '七杀破军',
    fateType: 'qisha',
    fatePoem: '七杀临身胆气豪，将星入命镇边陲',
    attrBias: { wisdom: -1, perception: 2, spirit: 0, meridian: -2, strength: 3, vitality: 1 },
  },
  破军: {
    fateName: '破军先锋',
    fateType: 'pojun',
    fatePoem: '破军横行不畏难，先锋开路斩万关',
    attrBias: { wisdom: -2, perception: 1, spirit: 2, meridian: -1, strength: 2, vitality: 1 },
  },
};

/** 出身配置 */
export const ORIGIN_CONFIG: Record<
  string,
  {
    nameZh: string;
    story: string;
    bonus: Partial<Record<string, number>>;
    perk: string;
  }
> = {
  noble: {
    nameZh: '世家子弟',
    story: '武林世家的后人，家道中落，身怀残缺秘籍踏入江湖',
    bonus: { wisdom: 1, spirit: 1 },
    perk: '起步带一本残缺家传秘籍',
  },
  wanderer: {
    nameZh: '江湖浪子',
    story: '从小在市井中摸爬滚打，见惯了三教九流',
    bonus: { perception: 1, vitality: 1 },
    perk: '起步有额外银两和江湖关系',
  },
  scholar: {
    nameZh: '书院学子',
    story: '读圣贤书的文人，偶入江湖，以智谋立足',
    bonus: { wisdom: 2, strength: -1 },
    perk: '识字能力强，能读更多秘籍',
  },
  soldier: {
    nameZh: '边塞军卒',
    story: '从军归来的退役兵士，一身杀伐之气',
    bonus: { strength: 1, vitality: 1 },
    perk: '起步带一把制式兵器',
  },
  herbalist: {
    nameZh: '山野药童',
    story: '深山采药人的徒弟，通晓草木之性',
    bonus: { meridian: 1, perception: 1 },
    perk: '懂基础药理，能辨认草药',
  },
  beggar: {
    nameZh: '乞丐流民',
    story: '一无所有的底层人，却有着非凡的际遇',
    bonus: {},
    perk: '机缘维度+2，奇遇概率大增',
  },
};
```

### CharacterService

```typescript
// server/src/character/character.service.ts
@Injectable()
export class CharacterService {
  constructor(
    @InjectRepository(Character)
    private readonly characterRepository: Repository<Character>,
  ) {}

  /** 根据账号ID查找角色 */
  async findByAccountId(accountId: string): Promise<Character | null> {
    return this.characterRepository.findOne({ where: { accountId } });
  }

  /** 检查角色名是否存在 */
  async isNameExists(name: string): Promise<boolean> {
    const count = await this.characterRepository.count({ where: { name } });
    return count > 0;
  }

  /** 创建角色 */
  async create(data: CreateCharacterData): Promise<Character> {
    const character = this.characterRepository.create({
      id: uuidv4(),
      ...data,
    });
    return this.characterRepository.save(character);
  }
}
```

### CharacterHandler — WebSocket 消息处理

```typescript
// server/src/websocket/handlers/character.handler.ts
@Injectable()
export class CharacterHandler {
  constructor(
    private readonly characterService: CharacterService,
    private readonly fateService: FateService,
  ) {}

  /** 处理 Step1: 生成命格 */
  async handleStep1(client: any, session: Session, data: { origin: string; gender: string }) {
    // 1. 校验 Session 已认证
    if (!session.authenticated || !session.accountId) {
      return this.sendFailed(client, 'session_expired', '请先登录');
    }

    // 2. 校验无角色
    const existing = await this.characterService.findByAccountId(session.accountId);
    if (existing) {
      return this.sendFailed(client, 'already_has_character', '已有角色，不可重复创建');
    }

    // 3. 校验出身合法
    if (!ORIGIN_CONFIG[data.origin]) {
      return this.sendFailed(client, 'invalid_origin', '无效的出身类型');
    }

    // 4. 生成命格
    const fate = this.fateService.generateFate(data.gender as any);

    // 5. 存入 Session 临时数据
    session.pendingCharacter = {
      origin: data.origin as CharacterOrigin,
      gender: data.gender as any,
      fateName: fate.fateName,
      fateType: fate.fateType,
      fatePoem: fate.fatePoem,
      destiny: fate.dimensions.destiny,
      benefactor: fate.dimensions.benefactor,
      calamity: fate.dimensions.calamity,
      fortune: fate.dimensions.fortune,
      attributeCaps: fate.attributeCaps,
      wuxingju: fate.wuxingju,
      mingzhuStar: fate.mingzhuStar,
      shenzhuStar: fate.shenzhuStar,
      astrolabeJson: fate.astrolabe,
      generatedAt: Date.now(),
    };

    // 6. 返回命格
    client.send(
      MessageFactory.serialize(
        MessageFactory.create(
          'createCharacterFate',
          fate.fateName,
          fate.fatePoem,
          fate.fateType,
          fate.dimensions.destiny,
          fate.dimensions.benefactor,
          fate.dimensions.calamity,
          fate.dimensions.fortune,
          fate.attributeCaps,
          fate.wuxingju,
          fate.mingzhuStar,
          fate.shenzhuStar,
        )!,
      ),
    );
  }

  /** 处理 Step3: 确认创建 */
  async handleConfirm(
    client: any,
    session: Session,
    data: {
      name: string;
      origin: string;
      attributes: CharacterAttributes;
    },
  ) {
    // 1. 校验 Session
    if (!session.authenticated || !session.accountId) {
      return this.sendFailed(client, 'session_expired', '请先登录');
    }

    // 2. 校验存在临时命格数据
    if (!session.pendingCharacter) {
      return this.sendFailed(client, 'fate_not_generated', '请先选择出身生成命格');
    }

    // 3. 校验临时数据未超时（30分钟）
    if (Date.now() - session.pendingCharacter.generatedAt > 30 * 60 * 1000) {
      session.pendingCharacter = undefined;
      return this.sendFailed(client, 'session_expired', '命格数据已过期，请重新选择出身');
    }

    // 4. 校验角色名
    if (!/^[\u4e00-\u9fa5]{2,6}$/.test(data.name)) {
      return this.sendFailed(client, 'name_invalid', '角色名需为2-6个中文字符');
    }
    if (await this.characterService.isNameExists(data.name)) {
      return this.sendFailed(client, 'name_exists', '角色名已被使用');
    }

    // 5. 校验出身一致
    if (data.origin !== session.pendingCharacter.origin) {
      return this.sendFailed(client, 'invalid_origin', '出身数据不一致');
    }

    // 6. 校验属性分配
    const caps = session.pendingCharacter.attributeCaps;
    const attrs = data.attributes;
    const attrKeys: (keyof CharacterAttributes)[] = [
      'wisdom',
      'perception',
      'spirit',
      'meridian',
      'strength',
      'vitality',
    ];

    const attrSum = attrKeys.reduce((s, k) => s + attrs[k], 0);
    if (attrSum !== 18) {
      return this.sendFailed(client, 'invalid_attributes', '属性点总和必须为18');
    }
    for (const k of attrKeys) {
      if (attrs[k] < 1 || attrs[k] > caps[k]) {
        return this.sendFailed(client, 'invalid_attributes', `${k}的值必须在1-${caps[k]}之间`);
      }
    }

    // 7. 计算最终属性 = 根基 + 出身加成（不超上限）
    const bonus = ORIGIN_CONFIG[data.origin]?.bonus || {};
    const finalAttrs: CharacterAttributes = {} as any;
    for (const k of attrKeys) {
      finalAttrs[k] = Math.min(caps[k], attrs[k] + (bonus[k] || 0));
    }

    // 8. 乞丐出身特殊处理：机缘+2
    const pending = session.pendingCharacter;
    const finalFortune =
      data.origin === 'beggar' ? Math.min(5, pending.fortune + 2) : pending.fortune;

    // 9. 写入数据库
    const character = await this.characterService.create({
      accountId: session.accountId,
      name: data.name,
      origin: data.origin as CharacterOrigin,
      fateName: pending.fateName,
      fateType: pending.fateType,
      fatePoem: pending.fatePoem,
      destiny: pending.destiny,
      benefactor: pending.benefactor,
      calamity: pending.calamity,
      fortune: finalFortune,
      ...finalAttrs,
      wisdomCap: caps.wisdom,
      perceptionCap: caps.perception,
      spiritCap: caps.spirit,
      meridianCap: caps.meridian,
      strengthCap: caps.strength,
      vitalityCap: caps.vitality,
      astrolabeJson: pending.astrolabeJson,
      wuxingju: pending.wuxingju,
      mingzhuStar: pending.mingzhuStar,
      shenzhuStar: pending.shenzhuStar,
    });

    // 10. 清除临时数据
    session.pendingCharacter = undefined;

    // 11. 返回成功
    client.send(
      MessageFactory.serialize(
        MessageFactory.create(
          'createCharacterSuccess',
          character.id,
          character.name,
          '角色创建成功，踏入江湖！',
        )!,
      ),
    );
  }

  private sendFailed(client: any, reason: string, message: string) {
    client.send(
      MessageFactory.serialize(MessageFactory.create('createCharacterFailed', reason, message)!),
    );
  }
}
```

### AccountService 修改点

```typescript
// server/src/account/account.service.ts
// 修改 login() 方法第166行的 TODO
// 注入 CharacterService（或直接注入 Character Repository）

// 原代码:
//   const hasCharacter = false;

// 改为:
//   const character = await this.characterService.findByAccountId(account.id);
//   const hasCharacter = !!character;
//   const characterId = character?.id;
//   const characterName = character?.name;
```

### Gateway 路由扩展

```typescript
// server/src/websocket/websocket.gateway.ts
// switch 中新增:

case 'createCharacterStep1':
  await this.characterHandler.handleStep1(client, session, message.data as any);
  break;
case 'createCharacterConfirm':
  await this.characterHandler.handleConfirm(client, session, message.data as any);
  break;
```

### WebSocketModule 修改

```typescript
// server/src/websocket/websocket.module.ts
@Module({
  imports: [AccountModule, CharacterModule, FateModule], // 新增
  providers: [GameGateway, AuthHandler, CharacterHandler], // 新增
  exports: [GameGateway],
})
export class WebSocketModule {}
```

## 前端设计

### 页面/组件结构

```
client/src/screens/
├── CreateCharacterScreen.tsx          # 主容器（管理 4 步状态）
│   ├── components/
│   │   ├── OriginSelect.tsx           # Step1: 出身选择
│   │   ├── FateReveal.tsx             # Step2: 命格展示
│   │   ├── AttributeAllocate.tsx      # Step3: 属性分配
│   │   └── CharacterConfirm.tsx       # Step4: 取名+确认
```

### 状态管理

```typescript
// CreateCharacterScreen 内部状态
interface CreateCharacterState {
  step: 1 | 2 | 3 | 4;
  // Step 1
  selectedOrigin: CharacterOrigin | null;
  // Step 2 (从服务端返回)
  fateData: CreateCharacterFateMessage['data'] | null;
  // Step 3
  allocatedAttributes: CharacterAttributes;
  remainingPoints: number;
  // Step 4
  characterName: string;
  // 通用
  loading: boolean;
  error: string | null;
}
```

### WebSocket 消息监听

```typescript
// 在 CreateCharacterScreen 中
useEffect(() => {
  const handler = (msg: any) => {
    switch (msg.type) {
      case 'createCharacterFate':
        setFateData(msg.data);
        setStep(2);
        setLoading(false);
        break;
      case 'createCharacterSuccess':
        navigation.replace('GameHome', { characterId: msg.data.characterId });
        break;
      case 'createCharacterFailed':
        setError(msg.data.message);
        setLoading(false);
        break;
    }
  };
  wsService.on('message', handler);
  return () => wsService.off('message', handler);
}, []);
```

### 关键 UI 组件规格

**OriginSelect（出身选择）**:

- 6 张水墨风卡片，纵向滚动
- 每张卡片：出身名 + 故事（一行） + 属性图标
- 选中态：边框高亮 `#3A3530` + 微放大
- 底部固定"继续"按钮

**FateReveal（命格展示）**:

- 全屏水墨渐变背景
- 命格名大字居中（28px, letterSpacing: 6）
- 诗句小字（14px, `#8B7A5A`）
- 四维度：命数/贵人/劫数/机缘，每行一个，星级用 `★☆` 展示
- 底部 "查看属性分布" 按钮

**AttributeAllocate（属性分配）**:

- 每属性一行：丹田标签 + 属性名 + 减号 + 当前值 + 加号 + `/上限`
- 出身加成以 `(+1)` 灰色标注
- 顶部显示 `剩余根基点: X`
- 加减按钮实时更新，不可超限时灰显

**CharacterConfirm（确认）**:

- 角色名输入框（居中大字）
- 角色卡片预览：出身 + 命格 + 六属性最终值 + 四维度
- "踏入江湖" 确认按钮

## packages/core 新增文件

### 消息处理器（5 个）

| 文件                                         | 消息类型               |
| -------------------------------------------- | ---------------------- |
| `factory/handlers/createCharacterStep1.ts`   | createCharacterStep1   |
| `factory/handlers/createCharacterFate.ts`    | createCharacterFate    |
| `factory/handlers/createCharacterConfirm.ts` | createCharacterConfirm |
| `factory/handlers/createCharacterSuccess.ts` | createCharacterSuccess |
| `factory/handlers/createCharacterFailed.ts`  | createCharacterFailed  |

### 导出更新

```typescript
// types/messages/index.ts 新增
export * from './character';

// factory/index.ts 新增 import
import './handlers/createCharacterStep1';
import './handlers/createCharacterFate';
import './handlers/createCharacterConfirm';
import './handlers/createCharacterSuccess';
import './handlers/createCharacterFailed';
```

## 影响范围

### 修改的已有文件

| 文件                                           | 改动                                                     |
| ---------------------------------------------- | -------------------------------------------------------- |
| `server/src/app.module.ts`                     | imports 添加 CharacterModule, FateModule                 |
| `server/src/websocket/websocket.module.ts`     | imports + providers 添加新依赖                           |
| `server/src/websocket/websocket.gateway.ts`    | constructor 注入 CharacterHandler, switch 添加 2 个 case |
| `server/src/websocket/types/session.ts`        | 扩展 pendingCharacter 字段                               |
| `server/src/account/account.service.ts`        | login() 中查询角色（替换 TODO）                          |
| `server/src/account/account.module.ts`         | 需要导出 AccountService（已导出，无需改）                |
| `server/package.json`                          | 添加 iztro 依赖                                          |
| `packages/core/src/types/messages/index.ts`    | 导出 character 消息类型                                  |
| `packages/core/src/factory/index.ts`           | 导入 5 个新 Handler                                      |
| `client/src/screens/CreateCharacterScreen.tsx` | 全部重写                                                 |

### 新增文件

| 文件                                                           | 说明                   |
| -------------------------------------------------------------- | ---------------------- |
| `server/src/character/character.entity.ts`                     | Character TypeORM 实体 |
| `server/src/character/character.service.ts`                    | 角色 CRUD              |
| `server/src/character/character.module.ts`                     | 角色模块               |
| `server/src/fate/fate.service.ts`                              | 紫微排盘 + 命格映射    |
| `server/src/fate/fate.constants.ts`                            | 命格表/出身表/常量     |
| `server/src/fate/fate.module.ts`                               | 命格模块               |
| `server/src/websocket/handlers/character.handler.ts`           | 角色消息处理           |
| `packages/core/src/types/messages/character.ts`                | 角色消息类型定义       |
| `packages/core/src/factory/handlers/createCharacterStep1.ts`   | 消息处理器             |
| `packages/core/src/factory/handlers/createCharacterFate.ts`    | 消息处理器             |
| `packages/core/src/factory/handlers/createCharacterConfirm.ts` | 消息处理器             |
| `packages/core/src/factory/handlers/createCharacterSuccess.ts` | 消息处理器             |
| `packages/core/src/factory/handlers/createCharacterFailed.ts`  | 消息处理器             |
| `client/src/screens/components/OriginSelect.tsx`               | 出身选择组件           |
| `client/src/screens/components/FateReveal.tsx`                 | 命格展示组件           |
| `client/src/screens/components/AttributeAllocate.tsx`          | 属性分配组件           |
| `client/src/screens/components/CharacterConfirm.tsx`           | 确认组件               |

## 风险点

| 风险                                 | 影响                                     | 应对                                                                     |
| ------------------------------------ | ---------------------------------------- | ------------------------------------------------------------------------ |
| iztro 排盘结果的宫位名称依赖中文匹配 | 如果 iztro 版本更新改了宫位名，映射失败  | 使用固定版本锁定，写单元测试覆盖所有 14 主星映射                         |
| 归一化算法边界情况                   | 极端排盘可能导致多个属性都挤到边界       | 贪心修正法 + 单元测试覆盖各种分布                                        |
| Session 内存存储临时数据             | 服务重启后丢失，创建中的玩家需要重新开始 | 加 30 分钟超时，重启后自然失效，这是 MVP 阶段可接受的                    |
| 同一时辰创建的所有角色命格相同       | 玩家可能在社区发现                       | 这是设计意图（命格由天时决定），不同出身和属性分配仍然让每个角色独一无二 |

---

> CX 工作流 | Design Doc | PRD #28
