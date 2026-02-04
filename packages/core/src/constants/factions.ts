/**
 * 天衍世界观 — 势力常量
 * 前后端共享，NPC 蓝图中通过 Factions.XXX 引用
 */

export const Factions = {
  /** 无势力 */
  NONE: '',
  /** 承天朝 — 中央皇朝 */
  CHENG_TIAN: '承天朝',
  /** 嵩阳宗 — 正道大派 */
  SONG_YANG: '嵩阳宗',
  /** 云岳派 — 山岳门派 */
  YUN_YUE: '云岳派',
  /** 碧澜阁 — 水系门派 */
  BI_LAN: '碧澜阁',
  /** 暗河 — 地下势力 */
  AN_HE: '暗河',
  /** 北漠·狼庭 — 北方游牧 */
  LANG_TING: '北漠·狼庭',
  /** 东海·散盟 — 海商联盟 */
  SAN_MENG: '东海·散盟',
  /** 西南·百蛮 — 西南部族 */
  BAI_MAN: '西南·百蛮',
  /** 西域·遗民 — 西域势力 */
  XI_YU: '西域·遗民',
  /** 天裂教 — 邪教势力 */
  TIAN_LIE: '天裂教',
} as const;

export type FactionKey = keyof typeof Factions;
export type FactionName = (typeof Factions)[FactionKey];
