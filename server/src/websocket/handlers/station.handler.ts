/**
 * 驿站传送系统处理器
 * 处理驿站列表请求和驿站传送
 */

import { Injectable, Logger } from '@nestjs/common';
import {
  MessageFactory,
  type StationInfo,
  type StationListResponseData,
  type StationTeleportResponseData,
} from '@packages/core';
import { ObjectManager } from '../../engine/object-manager';
import { BlueprintFactory } from '../../engine/blueprint-factory';
import { ExplorationService } from '../../character/exploration.service';
import { ServiceLocator } from '../../engine/service-locator';
import { Area } from '../../engine/game-objects/area';
import type { PlayerBase } from '../../engine/game-objects/player-base';
import type { RoomBase } from '../../engine/game-objects/room-base';
import { sendRoomInfo } from './room-utils';
import type { Session } from '../types/session';

/** 驿站可传送城镇定义 */
interface StationDef {
  areaId: string;
  name: string;
  description: string;
  region: string;
  levelRange: { min: number; max: number };
  entryRoomId: string;
}

/** 8 个可传送城镇 */
const STATION_LIST: StationDef[] = [
  {
    areaId: 'area/rift-town',
    name: '裂隙镇',
    description: '天裂后形成的裂谷中的中立小镇，各方势力的交汇之地',
    region: '中原',
    levelRange: { min: 1, max: 5 },
    entryRoomId: 'area/rift-town/south-gate',
  },
  {
    areaId: 'area/central-plain',
    name: '洛阳废都',
    description: '昔日天下第一城，门派倾覆后的废墟，政治真空引各方蜂拥',
    region: '中原',
    levelRange: { min: 5, max: 12 },
    entryRoomId: 'area/central-plain/north-gate',
  },
  {
    areaId: 'area/songyang',
    name: '嵩阳宗',
    description: '中原正道宗门，门规森严，重心法与根骨并修',
    region: '中原',
    levelRange: { min: 3, max: 15 },
    entryRoomId: 'area/songyang/gate',
  },
  {
    areaId: 'area/frost-pass',
    name: '朔云关',
    description: '北境边关要塞，抵御外族入侵的最后防线',
    region: '北境',
    levelRange: { min: 6, max: 12 },
    entryRoomId: 'area/frost-pass/south-gate',
  },
  {
    areaId: 'area/jiangnan',
    name: '烟雨镇',
    description: '江南水乡小镇，表面宁静，暗流涌动',
    region: '江南',
    levelRange: { min: 6, max: 12 },
    entryRoomId: 'area/jiangnan/west-dock',
  },
  {
    areaId: 'area/eastern-sea',
    name: '潮汐港',
    description: '半合法港口半海盗窝，没有一面官方旗帜',
    region: '东海',
    levelRange: { min: 15, max: 22 },
    entryRoomId: 'area/eastern-sea/harbor-gate',
  },
  {
    areaId: 'area/nanjiang-south',
    name: '雾岚寨',
    description: '苗疆山顶木寨，常年云雾缭绕，外人不经引荐不得入内',
    region: '南疆',
    levelRange: { min: 8, max: 14 },
    entryRoomId: 'area/nanjiang-south/zhai-gate',
  },
  {
    areaId: 'area/western-wastes',
    name: '黄沙驿',
    description: '丝路上唯一的绿洲驿站，各国商人密宗僧侣混居',
    region: '西域',
    levelRange: { min: 10, max: 18 },
    entryRoomId: 'area/western-wastes/east-gate',
  },
];

/** 可传送区域 ID 集合（快速查找用） */
const STATION_AREA_IDS = new Set(STATION_LIST.map((s) => s.areaId));

/** 回城目标区域（裂隙镇） */
const HOME_AREA_ID = 'area/rift-town';

@Injectable()
export class StationHandler {
  private readonly logger = new Logger(StationHandler.name);

  constructor(
    private readonly objectManager: ObjectManager,
    private readonly blueprintFactory: BlueprintFactory,
    private readonly explorationService: ExplorationService,
  ) {}

  /**
   * 处理驿站列表请求 -- 返回所有可传送城镇及探索状态
   */
  async handleStationListRequest(session: Session): Promise<void> {
    const player = this.getPlayerFromSession(session);
    if (!player) return;

    // 获取玩家当前所在区域
    const currentRoom = player.getEnvironment() as RoomBase | null;
    const currentAreaId = currentRoom ? this.roomIdToAreaId(currentRoom.id) : null;

    // 构建每个城镇的探索状态
    const stations: StationInfo[] = [];
    for (const def of STATION_LIST) {
      let isExplored = false;

      if (session.characterId) {
        isExplored = await this.explorationService.hasExploredArea(
          session.characterId,
          def.areaId,
        );
      }

      stations.push({
        areaId: def.areaId,
        name: def.name,
        description: def.description,
        region: def.region,
        levelRange: def.levelRange,
        isExplored,
        isCurrent: currentAreaId === def.areaId,
        entryRoomId: def.entryRoomId,
      });
    }

    const responseData: StationListResponseData = { stations };
    const msg = MessageFactory.create('stationListResponse', responseData);
    if (msg) {
      player.sendToClient(MessageFactory.serialize(msg));
    }
  }

  /**
   * 处理驿站传送请求 -- 传送到目标城镇入口
   */
  async handleStationTeleportRequest(
    client: any,
    session: Session,
    data: { targetAreaId: string },
  ): Promise<void> {
    const player = this.getPlayerFromSession(session);
    if (!player) return;

    const { targetAreaId } = data;

    // 战斗中禁止传送
    if (player.isInCombat()) {
      this.sendToast(player, '战斗中无法传送');
      this.sendTeleportResponse(player, false, '战斗中无法传送');
      return;
    }

    // 修炼中禁止传送
    if (ServiceLocator.practiceManager?.isInPractice(player)) {
      this.sendToast(player, '修炼中无法传送');
      this.sendTeleportResponse(player, false, '修炼中无法传送');
      return;
    }

    // 校验目标是否在可传送列表中
    if (!STATION_AREA_IDS.has(targetAreaId)) {
      this.sendToast(player, '无法传送到该地点');
      this.sendTeleportResponse(player, false, '无法传送到该地点');
      return;
    }

    // 查找目标城镇定义
    const stationDef = STATION_LIST.find((s) => s.areaId === targetAreaId);
    if (!stationDef) {
      this.sendTeleportResponse(player, false, '目标城镇不存在');
      return;
    }

    // 校验是否已在目标区域
    const currentRoom = player.getEnvironment() as RoomBase | null;
    const currentAreaId = currentRoom ? this.roomIdToAreaId(currentRoom.id) : null;
    if (currentAreaId === targetAreaId) {
      this.sendToast(player, '你已在此区域');
      this.sendTeleportResponse(player, false, '你已在此区域');
      return;
    }

    // 校验探索状态（回城到裂隙镇跳过此检查）
    if (targetAreaId !== HOME_AREA_ID && session.characterId) {
      const isExplored = await this.explorationService.hasExploredArea(
        session.characterId,
        targetAreaId,
      );
      if (!isExplored) {
        this.sendToast(player, '你尚未探索过该区域');
        this.sendTeleportResponse(player, false, '你尚未探索过该区域');
        return;
      }
    }

    // 获取目标入口房间
    const targetRoom = this.objectManager.findById(stationDef.entryRoomId) as RoomBase | undefined;
    if (!targetRoom) {
      this.logger.warn(`驿站目标房间不存在: ${stationDef.entryRoomId}`);
      this.sendToast(player, '目标地点暂时无法到达');
      this.sendTeleportResponse(player, false, '目标地点暂时无法到达');
      return;
    }

    // 旧房间广播离去消息
    if (currentRoom) {
      currentRoom.broadcast(`${player.getName()}搭乘驿站马车离去。`, player);
    }

    // 执行传送
    await player.moveTo(targetRoom, { quiet: true });

    // 发送传送日志（富文本）
    player.receiveMessage(
      `[sys]你搭乘驿站马车，一路颠簸，抵达了[/sys][rn]${stationDef.name}[/rn][sys]。[/sys]`,
    );

    // 推送新房间信息
    sendRoomInfo(player, targetRoom, this.blueprintFactory);

    // 新房间广播到达消息
    targetRoom.broadcast(`${player.getName()}从驿站马车上走了下来。`, player);

    // 返回传送成功
    this.sendTeleportResponse(player, true, `已抵达${stationDef.name}`);
  }

  // ================================================================
  //  内部方法
  // ================================================================

  /** 从房间 ID 推导区域 ID（area/x/y -> area/x） */
  private roomIdToAreaId(roomId: string): string | null {
    const parts = roomId.split('/');
    if (parts.length < 3) return null;
    return `${parts[0]}/${parts[1]}`;
  }

  /** 发送驿站传送响应 */
  private sendTeleportResponse(player: PlayerBase, success: boolean, message: string): void {
    const data: StationTeleportResponseData = { success, message };
    const msg = MessageFactory.create('stationTeleportResponse', data);
    if (msg) {
      player.sendToClient(MessageFactory.serialize(msg));
    }
  }

  /** 发送 toast 提示 */
  private sendToast(player: PlayerBase, message: string): void {
    const msg = MessageFactory.create('toast', message);
    if (msg) {
      player.sendToClient(MessageFactory.serialize(msg));
    }
  }

  /** 从 session 获取玩家对象 */
  private getPlayerFromSession(session: Session): PlayerBase | undefined {
    if (!session.authenticated || !session.playerId) return undefined;
    return this.objectManager.findById(session.playerId) as PlayerBase | undefined;
  }
}
