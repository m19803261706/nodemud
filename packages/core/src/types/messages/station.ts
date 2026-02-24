/**
 * 驿站传送系统消息类型定义
 * 包含驿站列表请求/响应、驿站传送请求/响应
 */

import type { ClientMessage, ServerMessage } from '../base';

// ========== 子接口 ==========

/** 驿站信息 */
export interface StationInfo {
  areaId: string; // 区域蓝图 ID，如 'area/rift-town'
  name: string; // 城镇名称，如 '裂谷镇'
  description: string; // 区域描述
  region: string; // 所属区域，如 '中原'
  levelRange: { min: number; max: number }; // 等级范围
  isExplored: boolean; // 玩家是否已探索该区域
  isCurrent: boolean; // 是否当前所在区域
  entryRoomId: string; // 入口房间 ID
}

// ========== 客户端 -> 服务端消息 ==========

/** stationListRequest 消息数据 -- 请求驿站列表 */
export interface StationListRequestData {
  // 无额外参数
}

/** stationListRequest 消息 */
export interface StationListRequestMessage extends ClientMessage {
  type: 'stationListRequest';
  data: StationListRequestData;
}

/** stationTeleportRequest 消息数据 -- 请求驿站传送 */
export interface StationTeleportRequestData {
  targetAreaId: string; // 目标区域 ID
}

/** stationTeleportRequest 消息 */
export interface StationTeleportRequestMessage extends ClientMessage {
  type: 'stationTeleportRequest';
  data: StationTeleportRequestData;
}

// ========== 服务端 -> 客户端消息 ==========

/** stationListResponse 消息数据 -- 驿站列表响应 */
export interface StationListResponseData {
  stations: StationInfo[];
}

/** stationListResponse 消息 */
export interface StationListResponseMessage extends ServerMessage {
  type: 'stationListResponse';
  data: StationListResponseData;
}

/** stationTeleportResponse 消息数据 -- 驿站传送响应 */
export interface StationTeleportResponseData {
  success: boolean;
  message: string;
}

/** stationTeleportResponse 消息 */
export interface StationTeleportResponseMessage extends ServerMessage {
  type: 'stationTeleportResponse';
  data: StationTeleportResponseData;
}
