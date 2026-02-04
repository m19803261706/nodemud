/**
 * 房间工具函数
 * 提供 sendRoomInfo、方向映射等复用逻辑
 */

import { MessageFactory } from '@packages/core';
import type { PlayerBase } from '../../engine/game-objects/player-base';
import type { RoomBase } from '../../engine/game-objects/room-base';

/** 反方向映射表 */
const OPPOSITE_DIRECTION: Record<string, string> = {
  north: '南方',
  south: '北方',
  east: '西方',
  west: '东方',
  up: '下方',
  down: '上方',
  northeast: '西南方',
  northwest: '东南方',
  southeast: '西北方',
  southwest: '东北方',
};

/** 方向中文映射表 */
const DIRECTION_CN: Record<string, string> = {
  north: '北',
  south: '南',
  east: '东',
  west: '西',
  up: '上',
  down: '下',
  northeast: '东北',
  northwest: '西北',
  southeast: '东南',
  southwest: '西南',
};

/**
 * 向玩家发送当前房间信息
 */
export function sendRoomInfo(player: PlayerBase, room: RoomBase): void {
  const coordinates = room.getCoordinates() ?? { x: 0, y: 0, z: 0 };
  const msg = MessageFactory.create(
    'roomInfo',
    room.getShort(),
    room.getLong(),
    Object.keys(room.getExits()),
    { x: coordinates.x, y: coordinates.y, z: coordinates.z ?? 0 },
  );
  if (msg) {
    player.sendToClient(MessageFactory.serialize(msg));
  }
}

/**
 * 获取方向的反方向（中文）
 */
export function getOppositeDirectionCN(direction: string): string {
  return OPPOSITE_DIRECTION[direction] ?? '远方';
}

/**
 * 获取方向的中文名
 */
export function getDirectionCN(direction: string): string {
  return DIRECTION_CN[direction] ?? direction;
}
