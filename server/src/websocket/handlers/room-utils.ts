/**
 * 房间工具函数
 * 提供 sendRoomInfo、方向映射等复用逻辑
 */

import { MessageFactory } from '@packages/core';
import type { NpcBrief, ItemBrief, InventoryItem, RoomAction } from '@packages/core';
import { BaseEntity } from '../../engine/base-entity';
import { PlayerBase } from '../../engine/game-objects/player-base';
import type { RoomBase } from '../../engine/game-objects/room-base';
import { NpcBase } from '../../engine/game-objects/npc-base';
import { ItemBase } from '../../engine/game-objects/item-base';
import { ContainerBase } from '../../engine/game-objects/container-base';
import { RemainsBase } from '../../engine/game-objects/remains-base';
import type { BlueprintFactory } from '../../engine/blueprint-factory';
import { ServiceLocator } from '../../engine/service-locator';

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
 * 构建 NPC 简要信息（复用于 sendRoomInfo 和增量通知）
 * @param npc NPC 实例
 * @param player 可选，传入时标记任务状态
 */
function buildNpcBrief(npc: NpcBase, player?: PlayerBase): NpcBrief {
  const brief: NpcBrief = {
    id: npc.id,
    name: npc.getName(),
    title: npc.get<string>('title') || '',
    gender: npc.get<string>('gender') || 'male',
    faction: npc.get<string>('visible_faction') || '',
    level: npc.get<number>('level') || 1,
    hpPct: Math.round(((npc.get<number>('hp') || 0) / (npc.get<number>('max_hp') || 1)) * 100),
    attitude: npc.get<string>('attitude') || 'neutral',
  };

  // 任务系统：标记 NPC 是否有可接/可交付任务
  if (player && ServiceLocator.questManager) {
    const npcBlueprintId = npc.id.split('#')[0];
    const questBriefs = ServiceLocator.questManager.getNpcQuestBriefs(player, npcBlueprintId);
    if (questBriefs.length > 0) {
      brief.hasQuest = questBriefs.some((q) => q.state === 'available');
      brief.hasQuestReady = questBriefs.some((q) => q.state === 'ready');
    }
  }

  return brief;
}

/**
 * 构建物品简要信息（复用于 sendRoomInfo 和增量通知）
 */
function buildItemBrief(item: ItemBase): ItemBrief {
  const brief: ItemBrief = {
    id: item.id,
    name: item.getName(),
    short: item.getShort(),
    type: item.getType(),
  };
  if (item instanceof ContainerBase) {
    brief.isContainer = true;
    brief.contentCount = item.getContents().length;
  }
  if (item instanceof RemainsBase) {
    brief.isRemains = true;
  }
  return brief;
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

  const npcs: NpcBrief[] = room
    .getInventory()
    .filter((e): e is NpcBase => e instanceof NpcBase)
    .map((npc) => buildNpcBrief(npc, player));

  const items: ItemBrief[] = room
    .getInventory()
    .filter((e): e is ItemBase => e instanceof ItemBase)
    .map((item) => buildItemBrief(item));

  // 读取房间配置的动态动作（采集、挖矿等，由房间自行定义）
  const roomActions = room.get<RoomAction[]>('roomActions') ?? [];

  const msg = MessageFactory.create(
    'roomInfo',
    room.getShort(),
    room.getLong(),
    Object.keys(exits),
    { x: coordinates.x, y: coordinates.y, z: coordinates.z ?? 0 },
    exitNames,
    npcs,
    items,
    roomActions,
  );
  if (msg) {
    player.sendToClient(MessageFactory.serialize(msg));
  }
}

/**
 * 通知房间内所有玩家：新对象加入
 * 增量消息的 NpcBrief 不携带任务标记（不同玩家看到的任务状态不同），
 * 玩家下次进入房间时 sendRoomInfo 会覆盖完整数据。
 */
export function notifyRoomObjectAdded(room: RoomBase, entity: BaseEntity): void {
  let objectType: 'npc' | 'item';
  let brief: NpcBrief | ItemBrief;

  if (entity instanceof NpcBase) {
    objectType = 'npc';
    brief = buildNpcBrief(entity);
  } else if (entity instanceof ItemBase) {
    objectType = 'item';
    brief = buildItemBrief(entity);
  } else {
    return;
  }

  const msg = MessageFactory.create('roomObjectAdded', objectType, brief);
  if (!msg) return;
  const serialized = MessageFactory.serialize(msg);

  for (const occupant of room.getInventory()) {
    if (occupant instanceof PlayerBase) {
      occupant.sendToClient(serialized);
    }
  }
}

/**
 * 通知房间内所有玩家：对象移除
 */
export function notifyRoomObjectRemoved(
  room: RoomBase,
  entityId: string,
  objectType: 'npc' | 'item',
): void {
  const msg = MessageFactory.create('roomObjectRemoved', objectType, entityId);
  if (!msg) return;
  const serialized = MessageFactory.serialize(msg);

  for (const occupant of room.getInventory()) {
    if (occupant instanceof PlayerBase) {
      occupant.sendToClient(serialized);
    }
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

  const items: InventoryItem[] = [];
  const stackIndexByBlueprint = new Map<string, number>();

  for (const item of player
    .getInventory()
    .filter((e): e is ItemBase => e instanceof ItemBase)
    .filter((it) => !equippedIds.has(it.id))) {
    const itemData: InventoryItem = {
      id: item.id,
      name: item.getName(),
      short: item.getShort(),
      type: item.getType(),
      weight: item.getWeight(),
      value: item.getValue(),
      count: 1,
      actions: item.getActions(player),
      actionCommands: item.getActionCommands(player),
    };

    if (!item.isStackable()) {
      items.push(itemData);
      continue;
    }

    const blueprintId = item.id.split('#')[0];
    const existingIndex = stackIndexByBlueprint.get(blueprintId);
    if (existingIndex === undefined) {
      stackIndexByBlueprint.set(blueprintId, items.length);
      items.push(itemData);
      continue;
    }

    items[existingIndex].count += 1;
  }

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
