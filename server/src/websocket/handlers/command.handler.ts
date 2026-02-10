/**
 * 指令处理器
 * 接收客户端 command 消息，查找玩家对象，执行指令并返回结果
 */

import { Injectable, Logger } from '@nestjs/common';
import { MessageFactory } from '@packages/core';
import { ObjectManager } from '../../engine/object-manager';
import { BlueprintFactory } from '../../engine/blueprint-factory';
import { CharacterService } from '../../character/character.service';
import type { PlayerBase } from '../../engine/game-objects/player-base';
import type { RoomBase } from '../../engine/game-objects/room-base';
import {
  sendRoomInfo,
  sendInventoryUpdate,
  sendEquipmentUpdate,
  getDirectionCN,
  getOppositeDirectionCN,
} from './room-utils';
import { sendPlayerStats } from './stats.utils';
import type { Session } from '../types/session';

@Injectable()
export class CommandHandler {
  private readonly logger = new Logger(CommandHandler.name);

  constructor(
    private readonly objectManager: ObjectManager,
    private readonly blueprintFactory: BlueprintFactory,
    private readonly characterService: CharacterService,
  ) {}

  /**
   * 处理指令消息
   * @param client WebSocket 客户端
   * @param session 当前会话
   * @param data 指令数据 { input: string }
   */
  async handleCommand(client: any, session: Session, data: { input: string }) {
    // 认证检查
    if (!session.authenticated) {
      const resp = MessageFactory.create('toast', { message: '请先登录', type: 'error' });
      client.send(MessageFactory.serialize(resp));
      return;
    }

    // 查找玩家对象
    if (!session.playerId) {
      const resp = MessageFactory.create('toast', { message: '请先创建角色', type: 'error' });
      client.send(MessageFactory.serialize(resp));
      return;
    }

    const player = this.objectManager.findById(session.playerId) as PlayerBase | undefined;
    if (!player) {
      this.logger.warn(`玩家对象不存在: ${session.playerId}`);
      const resp = MessageFactory.create('toast', { message: '角色数据异常', type: 'error' });
      client.send(MessageFactory.serialize(resp));
      return;
    }

    // 执行指令
    const input = data.input?.trim();
    if (!input) return;

    const result = player.executeCommand(input);
    this.logger.log(
      `指令执行结果: input="${input}" success=${result.success} data=${JSON.stringify(result.data)} message=${result.message}`,
    );

    // 返回指令结果
    const resp = {
      type: 'commandResult',
      data: result,
      timestamp: Date.now(),
    };
    client.send(JSON.stringify(resp));

    // go 命令成功后：广播 + 推送 roomInfo
    if (result.success && result.data?.direction && result.data?.targetId) {
      try {
        const direction = result.data.direction as string;
        const playerName = player.getName();

        // 旧房间广播离去
        const oldRoom = player.getEnvironment() as RoomBase | null;
        this.logger.log(
          `移动前: player=${playerName} oldRoom=${oldRoom?.id} direction=${direction} targetId=${result.data.targetId}`,
        );

        // 执行移动
        const moved = await player.go(direction);
        this.logger.log(`移动结果: moved=${moved}`);
        if (moved) {
          // 旧房间广播（移动后 player 已不在旧房间，不需要 exclude）
          if (oldRoom) {
            oldRoom.broadcast(`${playerName}向${getDirectionCN(direction)}离去。`);
          }

          // 新房间广播到达
          const newRoom = player.getEnvironment() as RoomBase | null;
          if (newRoom) {
            newRoom.broadcast(
              `${playerName}从${getOppositeDirectionCN(direction)}来到此处。`,
              player,
            );
            sendRoomInfo(player, newRoom, this.blueprintFactory);
          }
        }
      } catch (moveError) {
        this.logger.error('移动处理失败:', moveError);
      }
    }

    // get 命令成功后：推送 inventoryUpdate + roomInfo（地面物品变化）
    if (result.success && result.data?.action === 'get') {
      const room = player.getEnvironment() as RoomBase | null;
      sendInventoryUpdate(player);
      if (room) {
        sendRoomInfo(player, room, this.blueprintFactory);
        // 广播给房间其他人
        const itemName = result.data.itemName || '物品';
        room.broadcast(`${player.getName()}捡起了${itemName}。`, player);
      }
    }

    // drop 命令成功后：推送 inventoryUpdate + roomInfo
    if (result.success && result.data?.action === 'drop') {
      const room = player.getEnvironment() as RoomBase | null;
      sendInventoryUpdate(player);
      if (room) {
        sendRoomInfo(player, room, this.blueprintFactory);
        const itemName = result.data.itemName || '物品';
        room.broadcast(`${player.getName()}丢弃了${itemName}。`, player);
      }
    }

    // wear/wield/remove 命令成功后：推送 inventoryUpdate + equipmentUpdate + playerStats
    if (result.success && ['wear', 'wield', 'remove'].includes(result.data?.action)) {
      sendInventoryUpdate(player);
      sendEquipmentUpdate(player);
      // 穿脱装备后即时推送含装备加成的 playerStats
      if (session.characterId) {
        try {
          const character = await this.characterService.findById(session.characterId);
          if (character) sendPlayerStats(player, character);
        } catch {
          // 查询失败不阻塞主流程
        }
      }
    }

    // use 命令成功后：
    // - consumed: 推送 inventoryUpdate
    // - resourceChanged: 推送 playerStats（修复状态栏不同步）
    if (result.success && result.data?.action === 'use') {
      if (result.data?.consumed) {
        sendInventoryUpdate(player);
      }
      if (result.data?.resourceChanged && session.characterId) {
        try {
          const character = await this.characterService.findById(session.characterId);
          if (character) sendPlayerStats(player, character);
        } catch {
          // 查询失败不阻塞主流程
        }
      }
    }

    // get_from 成功后：推送 inventoryUpdate + roomInfo
    if (result.success && result.data?.action === 'get_from') {
      const room = player.getEnvironment() as RoomBase | null;
      sendInventoryUpdate(player);
      if (room) sendRoomInfo(player, room, this.blueprintFactory);
    }

    // put 成功后：推送 inventoryUpdate + roomInfo
    if (result.success && result.data?.action === 'put') {
      const room = player.getEnvironment() as RoomBase | null;
      sendInventoryUpdate(player);
      if (room) sendRoomInfo(player, room, this.blueprintFactory);
    }
  }
}
