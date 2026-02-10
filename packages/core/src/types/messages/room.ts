/**
 * 房间信息消息类型定义
 * 服务端推送房间数据给客户端（进入房间、移动后）
 */

import type { ServerMessage } from '../base';
import type { ItemBrief } from './inventory';

/** 地图坐标 */
export interface RoomCoordinates {
  x: number;
  y: number;
  z: number;
}

/** NPC 简要信息（房间列表用） */
export interface NpcBrief {
  id: string;
  name: string;
  title: string;
  gender: string;
  faction: string;
  level: number;
  hpPct: number;
  attitude: string;
  hasQuest?: boolean; // 是否有可接任务
  hasQuestReady?: boolean; // 是否有可交付任务
}

/** 房间信息消息（服务端 → 客户端） */
export interface RoomInfoMessage extends ServerMessage {
  type: 'roomInfo';
  data: {
    short: string; // 房间标题（如"镇中广场"）
    long: string; // 房间描述
    exits: string[]; // 可走方向列表（如 ['north', 'south', 'east']）
    exitNames: Record<string, string>; // 出口目标房间名（如 { north: '北门' }）
    coordinates: RoomCoordinates; // 地图坐标（预留）
    npcs: NpcBrief[]; // 房间内 NPC 列表
    items: ItemBrief[]; // 房间地面物品列表
  };
}
