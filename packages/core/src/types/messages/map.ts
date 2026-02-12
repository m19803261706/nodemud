/**
 * 地图系统消息类型定义
 * 包含地图请求/响应、导航请求/响应
 */

import type { ClientMessage, ServerMessage } from '../base';

// ========== 子接口 ==========

/** 地图房间节点 */
export interface MapRoom {
  roomId: string; // 房间蓝图 ID
  name: string; // 房间简称
  coordinates: { x: number; y: number; z: number }; // 地图坐标
  exits: string[]; // 出口方向列表
  exitTargets: Record<string, string>; // 出口方向 → 目标房间 ID
  isCurrent: boolean; // 是否为玩家当前所在房间
  isExplored: boolean; // 是否已探索（解锁）
}

// ========== 客户端 → 服务端消息 ==========

/** mapRequest 消息数据 — 请求当前区域地图 */
export interface MapRequestData {
  // 暂无额外参数，请求当前所在区域的地图
}

/** mapRequest 消息 */
export interface MapRequestMessage extends ClientMessage {
  type: 'mapRequest';
  data: MapRequestData;
}

/** navigateRequest 消息数据 — 请求自动寻路 */
export interface NavigateRequestData {
  targetRoomId: string; // 目标房间 ID
}

/** navigateRequest 消息 */
export interface NavigateRequestMessage extends ClientMessage {
  type: 'navigateRequest';
  data: NavigateRequestData;
}

// ========== 服务端 → 客户端消息 ==========

/** mapResponse 消息数据 — 区域地图数据 */
export interface MapResponseData {
  areaId: string; // 区域蓝图 ID
  areaName: string; // 区域名称
  rooms: MapRoom[]; // 区域内所有房间节点
  currentRoomId: string; // 玩家当前房间 ID
}

/** mapResponse 消息 */
export interface MapResponseMessage extends ServerMessage {
  type: 'mapResponse';
  data: MapResponseData;
}

/** navigateResponse 消息数据 — 寻路结果 */
export interface NavigateResponseData {
  success: boolean; // 是否成功
  targetRoomId: string; // 目标房间 ID
  path: string[]; // 方向序列（如 ['north', 'east']）
  message: string; // 提示信息
  interrupted?: boolean; // 是否中途中断
  stoppedAt?: string; // 中断时停留的房间 ID
}

/** navigateResponse 消息 */
export interface NavigateResponseMessage extends ServerMessage {
  type: 'navigateResponse';
  data: NavigateResponseData;
}
