/**
 * 服务端战斗类型定义
 * CombatInstance / CombatParticipant 仅后端使用
 */
import type { LivingBase } from '../game-objects/living-base';
import type { CombatSide } from '@packages/core';

/** 战斗参与者 */
export interface CombatParticipant {
  /** 游戏对象引用 */
  entity: LivingBase;
  /** 阵营标识 */
  side: CombatSide;
  /** ATB 累积器 (0 ~ MAX_GAUGE-1) */
  gauge: number;
  /** 攻击目标 */
  target: LivingBase;
}

/** 战斗实例 */
export interface CombatInstance {
  /** 战斗 ID: "combat_{timestamp}_{counter}" */
  id: string;
  /** 参与者 Map (entity.id → CombatParticipant) */
  participants: Map<string, CombatParticipant>;
  /** 战斗开始时间戳 */
  startTime: number;
  /** 玩家快捷引用 */
  player: LivingBase;
  /** 敌方快捷引用 */
  enemy: LivingBase;
}
