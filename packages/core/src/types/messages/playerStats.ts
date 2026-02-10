/**
 * 玩家属性消息类型定义
 * 服务端定时推送玩家运行时属性（HP/MP/精力）和六维属性给客户端
 */

import type { ServerMessage } from '../base';
import type { EquipmentBonus } from '../equipment-bonus';

/** 运行时资源值（进度条用） */
export interface ResourceValue {
  current: number;
  max: number;
}

/** 六维属性 */
export interface CharacterAttrs {
  wisdom: number; // 慧根
  perception: number; // 心眼
  spirit: number; // 气海
  meridian: number; // 脉络
  strength: number; // 筋骨
  vitality: number; // 血气
}

/** playerStats 消息（服务端 → 客户端） */
export interface PlayerStatsMessage extends ServerMessage {
  type: 'playerStats';
  data: {
    name: string; // 角色名
    level: string; // 中文等级（如 "初入江湖"）
    silver: number; // 银两
    hp: ResourceValue; // 气血
    mp: ResourceValue; // 内力
    energy: ResourceValue; // 精力
    attrs: CharacterAttrs; // 六维属性
    equipBonus: EquipmentBonus; // 装备加成汇总
    combat: { attack: number; defense: number }; // 最终攻防值
  };
}
