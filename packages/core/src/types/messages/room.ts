/**
 * 房间信息消息类型定义
 * 服务端推送房间数据给客户端（进入房间、移动后）
 */

import type { ServerMessage } from '../base';

/** 地图坐标 */
export interface RoomCoordinates {
  x: number;
  y: number;
  z: number;
}

/** 房间信息消息（服务端 → 客户端） */
export interface RoomInfoMessage extends ServerMessage {
  type: 'roomInfo';
  data: {
    short: string; // 房间标题（如"镇中广场"）
    long: string; // 房间描述
    exits: string[]; // 可走方向列表（如 ['north', 'south', 'east']）
    coordinates: RoomCoordinates; // 地图坐标（预留）
  };
}
