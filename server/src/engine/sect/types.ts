/**
 * 门派系统类型定义
 * 玩家门派数据持久化到 Character.sectData，并在运行时挂载到 player dbase 的 sect 字段。
 */

export interface PlayerSectCurrent {
  /** 门派唯一标识（如 songyang） */
  sectId: string;
  /** 门派显示名称 */
  sectName: string;
  /** 师父 NPC 蓝图 ID */
  masterNpcId: string;
  /** 师父显示名 */
  masterName: string;
  /** 当前职位/称号 */
  rank: string;
  /** 门派贡献 */
  contribution: number;
  /** 入门时间戳（毫秒） */
  joinedAt: number;
}

export interface PlayerSectRestrictions {
  /** 永久禁入门派列表 */
  bannedSectIds: string[];
  /** 预留：冷却截止时间（毫秒） */
  cooldownUntil: number | null;
}

export interface PlayerSectDaily {
  /** 每日计数日期键（yyyy-mm-dd） */
  dateKey: string;
  /** 当日演武次数 */
  sparCount: number;
}

export interface PlayerSectData {
  current: PlayerSectCurrent | null;
  restrictions: PlayerSectRestrictions;
  daily: PlayerSectDaily;
}

export const EMPTY_PLAYER_SECT_DATA: PlayerSectData = {
  current: null,
  restrictions: {
    bannedSectIds: [],
    cooldownUntil: null,
  },
  daily: {
    dateKey: '',
    sparCount: 0,
  },
};

/** 深拷贝，避免运行时引用污染持久化对象 */
export function clonePlayerSectData(data: PlayerSectData): PlayerSectData {
  return {
    current: data.current ? { ...data.current } : null,
    restrictions: {
      bannedSectIds: [...data.restrictions.bannedSectIds],
      cooldownUntil: data.restrictions.cooldownUntil ?? null,
    },
    daily: {
      dateKey: data.daily.dateKey ?? '',
      sparCount: Number.isFinite(data.daily.sparCount)
        ? Math.max(0, Math.floor(data.daily.sparCount))
        : 0,
    },
  };
}

function toSafeString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function toSafeNumber(value: unknown, fallback = 0): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.floor(value);
}

/**
 * 运行时/持久化兼容归一化
 * 任何非法结构都会回退为可用的最小门派数据，避免登录链路出现 undefined 分支。
 */
export function normalizePlayerSectData(raw: unknown): PlayerSectData {
  if (!raw || typeof raw !== 'object') {
    return clonePlayerSectData(EMPTY_PLAYER_SECT_DATA);
  }

  const input = raw as Record<string, any>;
  const currentInput = input.current;
  const restrictionsInput = input.restrictions;
  const dailyInput = input.daily;

  const current =
    currentInput && typeof currentInput === 'object'
      ? {
          sectId: toSafeString(currentInput.sectId),
          sectName: toSafeString(currentInput.sectName),
          masterNpcId: toSafeString(currentInput.masterNpcId),
          masterName: toSafeString(currentInput.masterName),
          rank: toSafeString(currentInput.rank, '入门弟子'),
          contribution: Math.max(0, toSafeNumber(currentInput.contribution, 0)),
          joinedAt: Math.max(0, toSafeNumber(currentInput.joinedAt, 0)),
        }
      : null;

  const bannedSectIds = Array.isArray(restrictionsInput?.bannedSectIds)
    ? restrictionsInput.bannedSectIds.filter(
        (id: unknown): id is string => typeof id === 'string' && id.length > 0,
      )
    : [];

  return {
    current: current && current.sectId ? current : null,
    restrictions: {
      bannedSectIds,
      cooldownUntil:
        typeof restrictionsInput?.cooldownUntil === 'number' &&
        Number.isFinite(restrictionsInput.cooldownUntil)
          ? Math.floor(restrictionsInput.cooldownUntil)
          : null,
    },
    daily: {
      dateKey: toSafeString(dailyInput?.dateKey),
      sparCount: Math.max(0, toSafeNumber(dailyInput?.sparCount, 0)),
    },
  };
}
