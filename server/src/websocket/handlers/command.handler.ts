/**
 * 指令处理器
 * 接收客户端 command 消息，查找玩家对象，执行指令并返回结果
 */

import { Injectable, Logger } from '@nestjs/common';
import { MessageFactory, type SkillMapResultData, type SkillSlotType } from '@packages/core';
import { ObjectManager } from '../../engine/object-manager';
import { BlueprintFactory } from '../../engine/blueprint-factory';
import { CharacterService } from '../../character/character.service';
import { ExplorationService } from '../../character/exploration.service';
import { ServiceLocator } from '../../engine/service-locator';
import type { PlayerBase } from '../../engine/game-objects/player-base';
import type { RoomBase } from '../../engine/game-objects/room-base';
import { NpcBase } from '../../engine/game-objects/npc-base';
import { ItemBase } from '../../engine/game-objects/item-base';
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
    private readonly explorationService: ExplorationService,
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
          // 旧房间广播（稳妥起见显式排除自己，避免边界场景下自收旁观消息）
          if (oldRoom) {
            oldRoom.broadcast(`${playerName}向${getDirectionCN(direction)}离去。`, player);
          }

          // 新房间广播到达
          const newRoom = player.getEnvironment() as RoomBase | null;
          if (newRoom) {
            newRoom.broadcast(
              `${playerName}从${getOppositeDirectionCN(direction)}来到此处。`,
              player,
            );
            sendRoomInfo(player, newRoom, this.blueprintFactory);

            // 探索记录：异步解锁新房间
            if (session.characterId) {
              this.unlockRoomExploration(session.characterId, newRoom.id);
            }

            // 任务系统：检查新房间 NPC 可接任务
            if (ServiceLocator.questManager) {
              ServiceLocator.questManager.onPlayerEnterRoom(player, newRoom);
            }
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

    // buy 命令成功后：
    // - 推送 inventoryUpdate
    // - 持久化银两并推送 playerStats
    if (result.success && result.data?.action === 'buy') {
      sendInventoryUpdate(player);
      if (session.characterId) {
        try {
          await this.characterService.updateSilver(session.characterId, player.getSilver());
          const character = await this.characterService.findById(session.characterId);
          if (character) sendPlayerStats(player, character);
        } catch {
          // 查询失败不阻塞主流程
        }
      }
    }

    // sell 命令成功后：
    // - 推送 inventoryUpdate
    // - 持久化银两并推送 playerStats
    if (result.success && result.data?.action === 'sell') {
      sendInventoryUpdate(player);
      if (session.characterId) {
        try {
          await this.characterService.updateSilver(session.characterId, player.getSilver());
          const character = await this.characterService.findById(session.characterId);
          if (character) sendPlayerStats(player, character);
        } catch {
          // 查询失败不阻塞主流程
        }
      }
    }

    // rent 命令成功后：
    // - 持久化银两并推送 playerStats（住店扣费 + 二楼恢复精力）
    if (result.success && result.data?.action === 'rent_room') {
      if (session.characterId) {
        try {
          await this.characterService.updateSilver(session.characterId, player.getSilver());
          const character = await this.characterService.findById(session.characterId);
          if (character) sendPlayerStats(player, character);
        } catch {
          // 查询失败不阻塞主流程
        }
      }
    }

    // give 命令成功且 NPC 接受后：任务系统检查 deliver 类进度
    if (result.success && result.data?.action === 'give' && result.data?.accepted) {
      sendInventoryUpdate(player);
      if (ServiceLocator.questManager) {
        // 从 result.data 中获取 NPC 和物品信息
        const npcId = result.data.npcId as string;
        const itemId = result.data.itemId as string;
        const npc = this.objectManager.findById(npcId);
        const item = this.objectManager.findById(itemId);
        if (npc instanceof NpcBase && item instanceof ItemBase) {
          const autoCompleteResults = ServiceLocator.questManager.onItemDelivered(
            npc,
            player,
            item,
          );

          for (const autoCompleteResult of autoCompleteResults) {
            if (autoCompleteResult.message) {
              player.receiveMessage(autoCompleteResult.message);
            }
          }

          const completedByDelivery = autoCompleteResults.some((r) => r.success);
          if (completedByDelivery) {
            // 自动完成可能发放奖励物品，需再次刷新背包
            sendInventoryUpdate(player);

            // 自动完成可能获得经验，复用 questComplete 的升级/属性/持久化链路
            if (session.characterId) {
              try {
                const character = await this.characterService.findById(session.characterId);
                if (character) {
                  const beforeLevel = player.get<number>('level') ?? character.level ?? 1;
                  if (ServiceLocator.expManager) {
                    ServiceLocator.expManager.checkLevelUp(player, character);
                  }
                  const afterLevel = player.get<number>('level') ?? beforeLevel;

                  if (afterLevel <= beforeLevel) {
                    sendPlayerStats(player, character);
                  }

                  await this.characterService.savePlayerDataToDB(player, session.characterId);
                }
              } catch {
                // 查询失败不阻塞主流程
              }
            }
          }
        }
      }
    }

    // donate 命令成功后：推送背包刷新（捐献物品已移除）
    if (result.success && result.data?.action === 'donate') {
      sendInventoryUpdate(player);
    }

    // enable/disable 命令成功后：推送 skillMapResult 同步前端技能面板
    if (result.success && (result.data?.action === 'enable' || result.data?.action === 'disable')) {
      const skillManager = player.skillManager;
      if (skillManager) {
        const responseData: SkillMapResultData = {
          success: true,
          slotType: result.data.slotType as SkillSlotType,
          skillId: result.data.skillId ?? null,
          skillName: result.data.skillName ?? null,
          message: result.message ?? '',
          updatedMap: skillManager.getSkillMap(),
        };
        const msg = MessageFactory.create('skillMapResult', responseData);
        if (msg) {
          player.sendToClient(MessageFactory.serialize(msg));
        }
      }
    }

    // 背包变更通知任务系统检查 collect 类进度
    // 只要背包物品发生变化，就检查任务进度
    if (result.success && ServiceLocator.questManager) {
      const inventoryActions = [
        'get',
        'drop',
        'get_from',
        'put',
        'buy',
        'sell',
        'wear',
        'wield',
        'remove',
        'give',
        'donate',
      ];
      if (inventoryActions.includes(result.data?.action)) {
        ServiceLocator.questManager.onInventoryChange(player);
      }
      // use 命令消耗物品时也检查
      if (result.data?.action === 'use' && result.data?.consumed) {
        ServiceLocator.questManager.onInventoryChange(player);
      }
    }
  }

  /**
   * 异步解锁房间探索记录（不阻塞移动流程）
   * 从房间 ID 推导区域 ID（area/{area-name}/{room-name} → area/{area-name}）
   */
  private unlockRoomExploration(characterId: string, roomId: string): void {
    const parts = roomId.split('/');
    if (parts.length < 3) return;
    const areaId = `${parts[0]}/${parts[1]}`;

    // 异步执行，不阻塞主流程
    this.explorationService.unlockRoom(characterId, areaId, roomId).catch((err) => {
      this.logger.error(`解锁房间探索记录失败: ${roomId}`, err);
    });
  }
}
