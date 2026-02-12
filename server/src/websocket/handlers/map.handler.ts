/**
 * 地图系统处理器
 * 处理地图请求和导航请求（BFS 最短路径寻路）
 */

import { Injectable, Logger } from '@nestjs/common';
import {
  MessageFactory,
  type MapRoom,
  type MapResponseData,
  type NavigateResponseData,
} from '@packages/core';
import { ObjectManager } from '../../engine/object-manager';
import { BlueprintFactory } from '../../engine/blueprint-factory';
import { ExplorationService } from '../../character/exploration.service';
import { ServiceLocator } from '../../engine/service-locator';
import type { PlayerBase } from '../../engine/game-objects/player-base';
import type { RoomBase } from '../../engine/game-objects/room-base';
import { Area } from '../../engine/game-objects/area';
import { sendRoomInfo, getDirectionCN, getOppositeDirectionCN } from './room-utils';
import type { Session } from '../types/session';

/** 导航步进间隔（毫秒） */
const NAV_STEP_DELAY = 300;

@Injectable()
export class MapHandler {
  private readonly logger = new Logger(MapHandler.name);

  constructor(
    private readonly objectManager: ObjectManager,
    private readonly blueprintFactory: BlueprintFactory,
    private readonly explorationService: ExplorationService,
  ) {}

  /**
   * 处理地图请求 — 返回当前区域的所有房间节点
   */
  async handleMapRequest(session: Session): Promise<void> {
    const player = this.getPlayerFromSession(session);
    if (!player) return;

    const currentRoom = player.getEnvironment() as RoomBase | null;
    if (!currentRoom) {
      player.receiveMessage('你现在不在任何房间中。');
      return;
    }

    // 查找当前房间所属区域
    const areaInfo = this.findAreaByRoom(currentRoom.id);
    if (!areaInfo) {
      player.receiveMessage('无法确定当前区域。');
      return;
    }

    const { area, areaId } = areaInfo;

    // 查询已探索房间列表
    const exploredRoomIds = session.characterId
      ? await this.explorationService.getExploredRoomIds(session.characterId, areaId)
      : [];
    const exploredSet = new Set(exploredRoomIds);

    // 遍历区域所有房间，构建地图数据
    const roomIds = area.getRoomIds();
    const rooms: MapRoom[] = [];

    for (const roomId of roomIds) {
      const room = this.blueprintFactory.getVirtual(roomId) as RoomBase | undefined;
      if (!room) continue;

      const coordinates = room.getCoordinates() ?? { x: 0, y: 0, z: 0 };
      const exits = room.getExits();
      const shortName = room.getShort();
      // 截取区域前缀后的地点名
      const name = shortName.includes('·') ? shortName.split('·').pop()! : shortName;

      rooms.push({
        roomId,
        name,
        coordinates: { x: coordinates.x, y: coordinates.y, z: coordinates.z ?? 0 },
        exits: Object.keys(exits),
        exitTargets: exits,
        isCurrent: roomId === currentRoom.id,
        isExplored: exploredSet.has(roomId),
      });
    }

    // 构建响应数据
    const responseData: MapResponseData = {
      areaId,
      areaName: area.getName(),
      rooms,
      currentRoomId: currentRoom.id,
    };

    const msg = MessageFactory.create('mapResponse', responseData);
    if (msg) {
      player.sendToClient(MessageFactory.serialize(msg));
    }
  }

  /**
   * 处理导航请求 — BFS 最短路径寻路并逐步执行
   */
  async handleNavigateRequest(
    client: any,
    session: Session,
    data: { targetRoomId: string },
  ): Promise<void> {
    const player = this.getPlayerFromSession(session);
    if (!player) return;

    const currentRoom = player.getEnvironment() as RoomBase | null;
    if (!currentRoom) {
      this.sendNavigateResponse(player, {
        success: false,
        targetRoomId: data.targetRoomId,
        path: [],
        message: '你现在不在任何房间中。',
      });
      return;
    }

    // 已在目标房间
    if (currentRoom.id === data.targetRoomId) {
      this.sendNavigateResponse(player, {
        success: true,
        targetRoomId: data.targetRoomId,
        path: [],
        message: '你已在目标位置。',
      });
      return;
    }

    // BFS 寻路
    const path = this.bfsPath(currentRoom.id, data.targetRoomId);
    if (!path || path.length === 0) {
      this.sendNavigateResponse(player, {
        success: false,
        targetRoomId: data.targetRoomId,
        path: [],
        message: '无法找到到达目标的路径。',
      });
      return;
    }

    // 先发送寻路结果（方向序列）
    this.sendNavigateResponse(player, {
      success: true,
      targetRoomId: data.targetRoomId,
      path: path.map((p) => p.direction),
      message: `开始移动，共${path.length}步...`,
    });

    // 逐步执行移动
    for (let i = 0; i < path.length; i++) {
      const step = path[i];

      // 等待步进间隔
      if (i > 0) {
        await this.delay(NAV_STEP_DELAY);
      }

      // 检查玩家是否仍在线
      if (!session.playerId || !this.objectManager.findById(session.playerId)) {
        break;
      }

      // 检查当前房间是否符合预期（可能被其他事件移动）
      const nowRoom = player.getEnvironment() as RoomBase | null;
      if (!nowRoom) {
        this.sendNavigateResponse(player, {
          success: false,
          targetRoomId: data.targetRoomId,
          path: [],
          message: '导航中断：你不在任何房间中。',
          interrupted: true,
        });
        break;
      }

      // 执行移动
      const playerName = player.getName();
      const oldRoom = nowRoom;

      const moved = await player.go(step.direction);
      if (!moved) {
        this.sendNavigateResponse(player, {
          success: false,
          targetRoomId: data.targetRoomId,
          path: [],
          message: `导航中断：无法向${getDirectionCN(step.direction)}移动。`,
          interrupted: true,
          stoppedAt: oldRoom.id,
        });
        break;
      }

      // 旧房间广播离去
      oldRoom.broadcast(`${playerName}向${getDirectionCN(step.direction)}离去。`, player);

      // 新房间广播到达 + 推送 roomInfo
      const newRoom = player.getEnvironment() as RoomBase | null;
      if (newRoom) {
        newRoom.broadcast(
          `${playerName}从${getOppositeDirectionCN(step.direction)}来到此处。`,
          player,
        );
        sendRoomInfo(player, newRoom, this.blueprintFactory);

        // 探索记录：异步解锁新房间
        if (session.characterId) {
          const parts = newRoom.id.split('/');
          if (parts.length >= 3) {
            const areaId = `${parts[0]}/${parts[1]}`;
            this.explorationService.unlockRoom(session.characterId, areaId, newRoom.id).catch(() => {
              // 静默处理
            });
          }
        }

        // 任务系统：检查新房间 NPC 可接任务
        if (ServiceLocator.questManager) {
          ServiceLocator.questManager.onPlayerEnterRoom(player, newRoom);
        }
      }
    }
  }

  /**
   * BFS 最短路径搜索
   * 通过蓝图 exits 建图，返回方向序列
   */
  private bfsPath(
    fromRoomId: string,
    toRoomId: string,
  ): { direction: string; roomId: string }[] | null {
    // 队列：[当前房间ID, 路径]
    const queue: { roomId: string; path: { direction: string; roomId: string }[] }[] = [];
    const visited = new Set<string>();

    queue.push({ roomId: fromRoomId, path: [] });
    visited.add(fromRoomId);

    while (queue.length > 0) {
      const { roomId, path } = queue.shift()!;

      const room = this.blueprintFactory.getVirtual(roomId) as RoomBase | undefined;
      if (!room) continue;

      const exits = room.getExits();
      for (const [direction, targetId] of Object.entries(exits)) {
        if (visited.has(targetId)) continue;

        const newPath = [...path, { direction, roomId: targetId }];

        // 找到目标
        if (targetId === toRoomId) {
          return newPath;
        }

        visited.add(targetId);
        queue.push({ roomId: targetId, path: newPath });
      }
    }

    return null; // 不可达
  }

  /**
   * 根据房间 ID 查找所属区域
   * 遍历所有 Area 蓝图的 getRoomIds()
   */
  findAreaByRoom(roomId: string): { area: Area; areaId: string } | null {
    // 尝试从房间 ID 推导区域 ID（如 area/rift-town/square → area/rift-town）
    const parts = roomId.split('/');
    if (parts.length >= 3) {
      const guessedAreaId = `${parts[0]}/${parts[1]}`;
      const areaObj = this.objectManager.findById(guessedAreaId);
      if (areaObj instanceof Area) {
        const roomIds = areaObj.getRoomIds();
        if (roomIds.includes(roomId)) {
          return { area: areaObj, areaId: guessedAreaId };
        }
      }
    }

    // 回退：遍历所有 Area 对象
    const allEntities = this.objectManager.findAll(
      (e) => e instanceof Area && !e.destroyed,
    );
    for (const entity of allEntities) {
      const area = entity as Area;
      if (area.getRoomIds().includes(roomId)) {
        return { area, areaId: area.id };
      }
    }

    return null;
  }

  /** 发送导航响应消息 */
  private sendNavigateResponse(player: PlayerBase, data: NavigateResponseData): void {
    const msg = MessageFactory.create('navigateResponse', data);
    if (msg) {
      player.sendToClient(MessageFactory.serialize(msg));
    }
  }

  /** 从 session 获取玩家对象 */
  private getPlayerFromSession(session: Session): PlayerBase | undefined {
    if (!session.authenticated || !session.playerId) return undefined;
    return this.objectManager.findById(session.playerId) as PlayerBase | undefined;
  }

  /** 延迟工具 */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
