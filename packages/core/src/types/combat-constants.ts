/**
 * 战斗系统常量
 * ATB 读条、伤害、逃跑等核心数值配置
 */

/** 战斗系统常量 */
export const COMBAT_CONSTANTS = {
  /** ATB 满值 */
  MAX_GAUGE: 1000,
  /** 速度系数 */
  SPEED_FACTOR: 5,
  /** 最低伤害 */
  MIN_DAMAGE: 1,
  /** 逃跑基础概率 */
  FLEE_BASE_CHANCE: 0.5,
  /** 逃跑速度差系数 */
  FLEE_SPEED_FACTOR: 0.005,
  /** 逃跑最低概率 */
  FLEE_MIN_CHANCE: 0.2,
  /** 逃跑最高概率 */
  FLEE_MAX_CHANCE: 0.9,
  /** 玩家复活 HP 比例 */
  PLAYER_REVIVE_HP_RATIO: 0.3,
  /** 默认重生间隔（ms） */
  DEFAULT_RESPAWN_INTERVAL: 600000,
} as const;
