/**
 * 打工系统类型定义
 * 玩家打工数据持久化到 Character.workData，并在运行时挂载到 player dbase 的 work 字段。
 */

export interface PlayerWorkDaily {
  /** 每日计数日期键（yyyy-mm-dd） */
  dateKey: string;
  /** 当日通过打工获得经验 */
  expEarned: number;
  /** 当日通过打工获得潜能 */
  potentialEarned: number;
  /** 当日通过打工获得银两 */
  silverEarned: number;
  /** 当日完成轮次数 */
  cycles: number;
}

export interface PlayerWorkData {
  daily: PlayerWorkDaily;
  /** 各工种累计完成次数 */
  history: Record<string, number>;
}

export const EMPTY_PLAYER_WORK_DATA: PlayerWorkData = {
  daily: {
    dateKey: '',
    expEarned: 0,
    potentialEarned: 0,
    silverEarned: 0,
    cycles: 0,
  },
  history: {},
};

function toSafeInt(value: unknown, fallback = 0): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.max(0, Math.floor(value));
}

function toSafeString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

/** 深拷贝，避免运行时引用污染持久化对象 */
export function clonePlayerWorkData(data: PlayerWorkData): PlayerWorkData {
  return {
    daily: {
      dateKey: data.daily.dateKey,
      expEarned: toSafeInt(data.daily.expEarned, 0),
      potentialEarned: toSafeInt(data.daily.potentialEarned, 0),
      silverEarned: toSafeInt(data.daily.silverEarned, 0),
      cycles: toSafeInt(data.daily.cycles, 0),
    },
    history: { ...data.history },
  };
}

/**
 * 运行时/持久化兼容归一化
 * 任何非法结构都会回退为可用最小打工数据，避免登录链路出现 undefined 分支。
 */
export function normalizePlayerWorkData(raw: unknown): PlayerWorkData {
  if (!raw || typeof raw !== 'object') {
    return clonePlayerWorkData(EMPTY_PLAYER_WORK_DATA);
  }

  const input = raw as Record<string, any>;
  const dailyInput = input.daily && typeof input.daily === 'object' ? input.daily : {};
  const historyInput = input.history && typeof input.history === 'object' ? input.history : {};

  const history: Record<string, number> = {};
  for (const [jobId, count] of Object.entries(historyInput)) {
    if (typeof jobId !== 'string' || !jobId) continue;
    history[jobId] = toSafeInt(count, 0);
  }

  return {
    daily: {
      dateKey: toSafeString(dailyInput.dateKey),
      expEarned: toSafeInt(dailyInput.expEarned, 0),
      potentialEarned: toSafeInt(dailyInput.potentialEarned, 0),
      silverEarned: toSafeInt(dailyInput.silverEarned, 0),
      cycles: toSafeInt(dailyInput.cycles, 0),
    },
    history,
  };
}
