/**
 * 房间工具函数
 * 提供 sendRoomInfo、方向映射等复用逻辑
 */

import { MessageFactory } from '@packages/core';
import type { NpcBrief, ItemBrief, InventoryItem } from '@packages/core';
import type { PlayerBase } from '../../engine/game-objects/player-base';
import type { RoomBase } from '../../engine/game-objects/room-base';
import { NpcBase } from '../../engine/game-objects/npc-base';
import { ItemBase } from '../../engine/game-objects/item-base';
import type { BlueprintFactory } from '../../engine/blueprint-factory';

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
 * 解析出口目标房间的简称
 * @param exits 出口映射 { direction: roomId }
 * @param blueprintFactory 蓝图工厂，用于查找目标房间
 * @returns { direction: shortName }
 */
function resolveExitNames(
  exits: Record<string, string>,
  blueprintFactory?: BlueprintFactory,
): Record<string, string> {
  if (!blueprintFactory) return {};
  const names: Record<string, string> = {};
  for (const [dir, roomId] of Object.entries(exits)) {
    const target = blueprintFactory.getVirtual(roomId) as RoomBase | undefined;
    if (target) {
      const short = target.getShort();
      // 截取区域前缀后的地点名（如"裂隙镇·北门" → "北门"）
      names[dir] = short.includes('·') ? short.split('·').pop()! : short;
    }
  }
  return names;
}

/**
 * 向玩家发送当前房间信息
 */
export function sendRoomInfo(
  player: PlayerBase,
  room: RoomBase,
  blueprintFactory?: BlueprintFactory,
): void {
  const coordinates = room.getCoordinates() ?? { x: 0, y: 0, z: 0 };
  const exits = room.getExits();
  const exitNames = resolveExitNames(exits, blueprintFactory);

  // 收集房间内 NPC 列表
  const npcs: NpcBrief[] = room
    .getInventory()
    .filter((e): e is NpcBase => e instanceof NpcBase)
    .map((npc) => ({
      id: npc.id,
      name: npc.getName(),
      title: npc.get<string>('title') || '',
      gender: npc.get<string>('gender') || 'male',
      faction: npc.get<string>('visible_faction') || '',
      level: npc.get<number>('level') || 1,
      hpPct: Math.round(((npc.get<number>('hp') || 0) / (npc.get<number>('max_hp') || 1)) * 100),
      attitude: npc.get<string>('attitude') || 'neutral',
    }));

  // 收集房间内地面物品列表
  const items: ItemBrief[] = room
    .getInventory()
    .filter((e): e is ItemBase => e instanceof ItemBase)
    .map((item) => ({
      id: item.id,
      name: item.getName(),
      short: item.getShort(),
      type: item.getType(),
    }));

  const msg = MessageFactory.create(
    'roomInfo',
    room.getShort(),
    room.getLong(),
    Object.keys(exits),
    { x: coordinates.x, y: coordinates.y, z: coordinates.z ?? 0 },
    exitNames,
    npcs,
    items,
  );
  if (msg) {
    player.sendToClient(MessageFactory.serialize(msg));
  }
}

/**
 * 向玩家推送背包物品更新
 */
export function sendInventoryUpdate(player: PlayerBase): void {
  // 排除已装备的物品
  const equippedIds = new Set<string>();
  for (const [, item] of player.getEquipment()) {
    if (item) equippedIds.add(item.id);
  }

  const items: InventoryItem[] = player
    .getInventory()
    .filter((e): e is ItemBase => e instanceof ItemBase)
    .filter((item) => !equippedIds.has(item.id))
    .map((item) => ({
      id: item.id,
      name: item.getName(),
      short: item.getShort(),
      type: item.getType(),
      weight: item.getWeight(),
      value: item.getValue(),
      count: 1,
      actions: item.getActions(),
    }));

  const msg = MessageFactory.create('inventoryUpdate', items);
  if (msg) player.sendToClient(MessageFactory.serialize(msg));
}

/**
 * 向玩家推送装备栏更新
 */
export function sendEquipmentUpdate(player: PlayerBase): void {
  const equipment: Record<string, any> = {};
  for (const [pos, item] of player.getEquipment()) {
    equipment[pos] = item
      ? { id: item.id, name: item.getName(), type: item.getType(), quality: item.getQuality() }
      : null;
  }

  const msg = MessageFactory.create('equipmentUpdate', equipment);
  if (msg) player.sendToClient(MessageFactory.serialize(msg));
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
