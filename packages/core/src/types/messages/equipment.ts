/**
 * 装备栏消息类型定义
 * 用于装备穿戴/脱下后的装备栏更新推送
 */

import type { ServerMessage } from '../base';

/** 装备槽位信息 */
export interface EquipmentSlot {
  id: string;
  name: string;
  type: string;
}

/** 装备栏数据（10 个槽位，未装备为 null） */
export type EquipmentData = Record<string, EquipmentSlot | null>;

/** 装备栏更新消息（服务端 → 客户端） */
export interface EquipmentUpdateMessage extends ServerMessage {
  type: 'equipmentUpdate';
  data: {
    equipment: EquipmentData;
  };
}
