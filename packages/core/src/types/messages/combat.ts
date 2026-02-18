/**
 * 战斗消息类型定义
 * 客户端与服务端共享的战斗系统消息接口
 */

import type { CombatActionOption } from './skill';

/** 战斗参与者信息 */
export interface CombatFighter {
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  atbPct: number; // 0-100 读条百分比
}

/** 战斗动作类型 */
export type CombatActionType = 'attack' | 'crit' | 'miss' | 'flee_fail';

/** 战斗方标识 */
export type CombatSide = 'player' | 'enemy';

/** 战斗结束原因 */
export type CombatEndReason = 'victory' | 'defeat' | 'flee';

/** 战斗动作 */
export interface CombatAction {
  attacker: CombatSide;
  type: CombatActionType;
  damage?: number;
  isCrit: boolean;
  description: string;
}

/** combatStart 消息数据 */
export interface CombatStartData {
  combatId: string;
  player: CombatFighter;
  enemy: CombatFighter;
  availableActions?: CombatActionOption[]; // 战斗开始时的可用招式列表
}

/** combatUpdate 消息数据 */
export interface CombatUpdateData {
  combatId: string;
  actions: CombatAction[];
  player: Pick<CombatFighter, 'hp' | 'maxHp' | 'atbPct'>;
  enemy: Pick<CombatFighter, 'hp' | 'maxHp' | 'atbPct'>;
  availableActions?: CombatActionOption[]; // 最新招式列表（含冷却状态）
}

/** combatEnd 消息数据 */
export interface CombatEndData {
  combatId: string;
  reason: CombatEndReason;
  message: string;
}

/** combatStart 消息 */
export interface CombatStartMessage {
  type: 'combatStart';
  data: CombatStartData;
  timestamp: number;
}

/** combatUpdate 消息 */
export interface CombatUpdateMessage {
  type: 'combatUpdate';
  data: CombatUpdateData;
  timestamp: number;
}

/** combatEnd 消息 */
export interface CombatEndMessage {
  type: 'combatEnd';
  data: CombatEndData;
  timestamp: number;
}
