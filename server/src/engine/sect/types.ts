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

export enum PuzzleStepState {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export interface SongyangPuzzleProgress {
  /** 残卷收集数量（0-3） */
  canjuCollected: number;
  /** 残卷拼合步骤状态 */
  canjuState: PuzzleStepState;
  /** 碑文断句步骤状态 */
  duanjuState: PuzzleStepState;
  /** 试演答卷步骤状态 */
  shiyanState: PuzzleStepState;
}

export interface SongyangChallengeProgress {
  /** 首席弟子挑战是否通关 */
  chiefDiscipleWin: boolean;
  /** 演武连胜挑战是否通关 */
  sparStreakWin: boolean;
  /** 掌门认可是否达成 */
  masterApproval: boolean;
}

export interface SongyangLegacyProgress {
  /** 总纲是否处于残缺态 */
  canonCrippled: boolean;
}

export interface SongyangSkillProgress {
  puzzle: SongyangPuzzleProgress;
  challenges: SongyangChallengeProgress;
  legacy: SongyangLegacyProgress;
}

export interface PlayerSectData {
  current: PlayerSectCurrent | null;
  restrictions: PlayerSectRestrictions;
  daily: PlayerSectDaily;
  /** 嵩阳技能专项进度（可选，归一化后总是存在） */
  songyangSkill?: SongyangSkillProgress;
}

const EMPTY_SONGYANG_SKILL_PROGRESS: SongyangSkillProgress = {
  puzzle: {
    canjuCollected: 0,
    canjuState: PuzzleStepState.NOT_STARTED,
    duanjuState: PuzzleStepState.NOT_STARTED,
    shiyanState: PuzzleStepState.NOT_STARTED,
  },
  challenges: {
    chiefDiscipleWin: false,
    sparStreakWin: false,
    masterApproval: false,
  },
  legacy: {
    canonCrippled: false,
  },
};

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
  songyangSkill: EMPTY_SONGYANG_SKILL_PROGRESS,
};

/** 深拷贝，避免运行时引用污染持久化对象 */
export function clonePlayerSectData(data: PlayerSectData): PlayerSectData {
  const songyangSkill = data.songyangSkill ?? EMPTY_SONGYANG_SKILL_PROGRESS;
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
    songyangSkill: {
      puzzle: {
        canjuCollected: Math.max(0, Math.min(3, Math.floor(songyangSkill.puzzle.canjuCollected))),
        canjuState: songyangSkill.puzzle.canjuState,
        duanjuState: songyangSkill.puzzle.duanjuState,
        shiyanState: songyangSkill.puzzle.shiyanState,
      },
      challenges: {
        chiefDiscipleWin: !!songyangSkill.challenges.chiefDiscipleWin,
        sparStreakWin: !!songyangSkill.challenges.sparStreakWin,
        masterApproval: !!songyangSkill.challenges.masterApproval,
      },
      legacy: {
        canonCrippled: !!songyangSkill.legacy.canonCrippled,
      },
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

function toSafeBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value;
  return fallback;
}

function toPuzzleStepState(value: unknown): PuzzleStepState | null {
  if (value === PuzzleStepState.NOT_STARTED) return PuzzleStepState.NOT_STARTED;
  if (value === PuzzleStepState.IN_PROGRESS) return PuzzleStepState.IN_PROGRESS;
  if (value === PuzzleStepState.COMPLETED) return PuzzleStepState.COMPLETED;
  return null;
}

function resolvePuzzleStateFromCollection(collected: number): PuzzleStepState {
  if (collected >= 3) return PuzzleStepState.COMPLETED;
  if (collected > 0) return PuzzleStepState.IN_PROGRESS;
  return PuzzleStepState.NOT_STARTED;
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
  const songyangInput =
    input.songyangSkill && typeof input.songyangSkill === 'object' ? input.songyangSkill : {};
  const puzzleInput =
    songyangInput.puzzle && typeof songyangInput.puzzle === 'object' ? songyangInput.puzzle : {};
  const challengesInput =
    songyangInput.challenges && typeof songyangInput.challenges === 'object'
      ? songyangInput.challenges
      : {};
  const legacyInput =
    songyangInput.legacy && typeof songyangInput.legacy === 'object' ? songyangInput.legacy : {};

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

  const canjuCollected = Math.max(0, Math.min(3, toSafeNumber(puzzleInput.canjuCollected, 0)));
  const canjuState =
    toPuzzleStepState(puzzleInput.canjuState) ?? resolvePuzzleStateFromCollection(canjuCollected);
  const duanjuState =
    toPuzzleStepState(puzzleInput.duanjuState) ??
    (toSafeBoolean(puzzleInput.duanjuPassed) ? PuzzleStepState.COMPLETED : PuzzleStepState.NOT_STARTED);
  const shiyanState =
    toPuzzleStepState(puzzleInput.shiyanState) ??
    (toSafeBoolean(puzzleInput.shiyanPassed) ? PuzzleStepState.COMPLETED : PuzzleStepState.NOT_STARTED);

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
    songyangSkill: {
      puzzle: {
        canjuCollected,
        canjuState,
        duanjuState,
        shiyanState,
      },
      challenges: {
        chiefDiscipleWin: toSafeBoolean(challengesInput.chiefDiscipleWin, false),
        sparStreakWin: toSafeBoolean(challengesInput.sparStreakWin, false),
        masterApproval: toSafeBoolean(challengesInput.masterApproval, false),
      },
      legacy: {
        canonCrippled: toSafeBoolean(legacyInput.canonCrippled, false),
      },
    },
  };
}
