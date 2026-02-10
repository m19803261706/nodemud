/**
 * WebSocket Gateway
 * 处理 WebSocket 连接、断开、消息路由
 */

import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server } from 'ws';
import { Logger, OnModuleDestroy } from '@nestjs/common';
import { MessageFactory } from '@packages/core';
import type { ClientMessage } from '@packages/core';
import type { Session } from './types/session';
import { AuthHandler } from './handlers/auth.handler';
import { CharacterHandler } from './handlers/character.handler';
import { CommandHandler } from './handlers/command.handler';
import { sendPlayerStats } from './handlers/stats.utils';
import { sendInventoryUpdate } from './handlers/room-utils';
import { CharacterService } from '../character/character.service';
import { ObjectManager } from '../engine/object-manager';
import { ServiceLocator } from '../engine/service-locator';
import type { PlayerBase } from '../engine/game-objects/player-base';
import type { RoomBase } from '../engine/game-objects/room-base';
import { NpcBase } from '../engine/game-objects/npc-base';

@WebSocketGateway({ transports: ['websocket'] })
export class GameGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, OnModuleDestroy
{
  private readonly logger = new Logger(GameGateway.name);

  @WebSocketServer()
  server: Server;

  /** 1 秒定时推送 playerStats */
  private statsInterval: ReturnType<typeof setInterval>;

  constructor(
    private readonly authHandler: AuthHandler,
    private readonly characterHandler: CharacterHandler,
    private readonly commandHandler: CommandHandler,
    private readonly characterService: CharacterService,
    private readonly objectManager: ObjectManager,
  ) {}

  // Session 存储（内存 Map）
  private sessions = new Map<string, Session>();

  /** Gateway 初始化后启动定时推送 */
  afterInit() {
    this.statsInterval = setInterval(() => {
      this.broadcastPlayerStats();
    }, 1000);
    this.logger.log('playerStats 定时推送已启动（1s 间隔）');
  }

  /** 模块销毁时清理定时器 */
  onModuleDestroy() {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
    }
  }

  /** 向所有已登录玩家推送 playerStats */
  private async broadcastPlayerStats() {
    for (const [, session] of this.sessions) {
      if (!session.playerId || !session.characterId) continue;

      const player = this.objectManager.findById(session.playerId) as PlayerBase | undefined;
      if (!player) continue;

      try {
        const character = await this.characterService.findById(session.characterId);
        if (character) {
          sendPlayerStats(player, character);
        }
      } catch {
        // 查询失败时静默跳过，不中断其他玩家的推送
      }
    }
  }

  /** 客户端连接 */
  handleConnection(client: any) {
    const socketId = this.getSocketId(client);
    console.log('客户端连接:', socketId);

    this.sessions.set(socketId, {
      socketId,
      authenticated: false,
    });
  }

  /** 客户端断开 */
  async handleDisconnect(client: any) {
    const socketId = this.getSocketId(client);
    console.log('客户端断开:', socketId);

    const session = this.sessions.get(socketId);
    if (session?.playerId) {
      try {
        const player = this.objectManager.findById(session.playerId) as PlayerBase | undefined;
        if (player) {
          // 断线时清理战斗：如果玩家正在战斗中，以逃跑方式结束
          if (ServiceLocator.combatManager) {
            const combatId = ServiceLocator.combatManager.getCombatId(player as any);
            if (combatId) {
              try {
                ServiceLocator.combatManager.endCombat(combatId, 'flee');
                this.logger.log(`玩家断线，自动结束战斗: ${combatId}`);
              } catch (combatError) {
                this.logger.error('断线战斗清理失败:', combatError);
              }
            }
          }

          const room = player.getEnvironment() as RoomBase | null;

          // 保存位置到数据库
          if (session.characterId && room) {
            try {
              await this.characterService.updateLastRoom(session.characterId, room.id);
            } catch (dbError) {
              this.logger.error('保存位置失败:', dbError);
            }
          }

          // 保存玩家运行时数据（exp/level/potential/score/free_points/quests/silver）
          if (session.characterId) {
            try {
              await this.characterService.savePlayerDataToDB(player, session.characterId);
            } catch (saveError) {
              this.logger.error('保存玩家数据失败:', saveError);
            }
          }

          // 保存技能数据
          try {
            await player.saveSkills();
          } catch (skillError) {
            this.logger.error('保存技能数据失败:', skillError);
          }

          // 房间广播下线
          if (room) {
            room.broadcast(`${player.getName()}下线了。`, player);
          }

          // 解绑连接并销毁
          player.unbindConnection();
          this.objectManager.unregister(player);
        }
      } catch (error) {
        this.logger.error('断开处理失败:', error);
      }
    }

    this.sessions.delete(socketId);
  }

  /** 监听客户端消息 */
  @SubscribeMessage('message')
  async handleMessage(@ConnectedSocket() client: any, @MessageBody() data: string) {
    const socketId = this.getSocketId(client);
    const session = this.sessions.get(socketId);

    if (!session) {
      console.error('Session 不存在:', socketId);
      return;
    }

    // 反序列化消息（优先 MessageFactory，fallback 到直接解析）
    let message = MessageFactory.deserialize<ClientMessage>(data);
    if (!message) {
      try {
        const parsed = JSON.parse(data);
        if (parsed && parsed.type) {
          message = parsed as ClientMessage;
        }
      } catch {}
    }
    if (!message) {
      console.error('无效消息:', data);
      return;
    }

    if (message.type !== 'ping') {
      console.log('收到消息:', message.type, 'from', socketId);
    }

    // 消息路由
    switch (message.type) {
      case 'login':
        await this.authHandler.handleLogin(client, session, message.data as any);
        break;
      case 'register':
        await this.authHandler.handleRegister(client, message.data as any);
        break;
      case 'createCharacterStep1':
        await this.characterHandler.handleStep1(client, session, message.data as any);
        break;
      case 'createCharacterConfirm':
        await this.characterHandler.handleConfirm(client, session, message.data as any);
        break;
      case 'command':
        await this.commandHandler.handleCommand(client, session, message.data as any);
        break;
      case 'questAccept':
        await this.handleQuestAccept(session, message.data as any);
        break;
      case 'questAbandon':
        await this.handleQuestAbandon(session, message.data as any);
        break;
      case 'questComplete':
        await this.handleQuestComplete(session, message.data as any);
        break;
      case 'allocatePoints':
        await this.handleAllocatePoints(client, session, message.data as any);
        break;
      case 'ping':
        // 心跳，无需处理
        break;
      default:
        console.warn('未知消息类型:', message.type);
    }
  }

  /** 获取 Socket ID */
  private getSocketId(client: any): string {
    const address = client._socket?.remoteAddress;
    const port = client._socket?.remotePort;
    return address && port ? `${address}:${port}` : 'unknown';
  }

  // ================================================================
  //  任务系统消息处理
  // ================================================================

  /** 接受任务 */
  private async handleQuestAccept(
    session: Session,
    data: { questId: string; npcId: string },
  ): Promise<void> {
    const player = this.getPlayerFromSession(session);
    if (!player) return;

    const npc = this.findNpcInRoom(player, data.npcId);
    if (!npc) {
      player.receiveMessage('附近找不到这个人。');
      return;
    }

    if (!ServiceLocator.questManager) return;

    const result = ServiceLocator.questManager.acceptQuest(player, data.questId, npc);
    if (result.message) {
      player.receiveMessage(result.message);
    }

    // 接受任务可能获得任务道具，需立即刷新背包
    if (result.success) {
      sendInventoryUpdate(player);
    }
  }

  /** 放弃任务 */
  private async handleQuestAbandon(session: Session, data: { questId: string }): Promise<void> {
    const player = this.getPlayerFromSession(session);
    if (!player) return;

    if (!ServiceLocator.questManager) return;

    const result = ServiceLocator.questManager.abandonQuest(player, data.questId);
    if (result.message) {
      player.receiveMessage(result.message);
    }
  }

  /** 完成（交付）任务 */
  private async handleQuestComplete(
    session: Session,
    data: { questId: string; npcId: string },
  ): Promise<void> {
    const player = this.getPlayerFromSession(session);
    if (!player) return;

    const npc = this.findNpcInRoom(player, data.npcId);
    if (!npc) {
      player.receiveMessage('附近找不到这个人。');
      return;
    }

    if (!ServiceLocator.questManager) return;

    const result = ServiceLocator.questManager.completeQuest(player, data.questId, npc);
    if (result.message) {
      player.receiveMessage(result.message);
    }

    // 完成任务可能发放物品奖励，需立即刷新背包
    if (result.success) {
      sendInventoryUpdate(player);
    }

    // 完成任务可能获得经验，检查升级
    if (result.success && session.characterId) {
      try {
        const character = await this.characterService.findById(session.characterId);
        if (character) {
          const beforeLevel = player.get<number>('level') ?? character.level ?? 1;
          if (ServiceLocator.expManager) {
            ServiceLocator.expManager.checkLevelUp(player, character);
          }
          const afterLevel = player.get<number>('level') ?? beforeLevel;

          // 非升级场景主动推一次属性，避免奖励银两等信息延迟到下一轮定时推送
          if (afterLevel <= beforeLevel) {
            sendPlayerStats(player, character);
          }

          // 持久化玩家数据
          await this.characterService.savePlayerDataToDB(player, session.characterId);
        }
      } catch {
        // 查询失败不阻塞主流程
      }
    }
  }

  /** 分配属性点 */
  private async handleAllocatePoints(
    client: any,
    session: Session,
    data: { allocations: Record<string, number> },
  ): Promise<void> {
    const player = this.getPlayerFromSession(session);
    if (!player) return;

    if (!ServiceLocator.expManager || !session.characterId) return;

    try {
      const character = await this.characterService.findById(session.characterId);
      if (!character) return;

      const result = ServiceLocator.expManager.allocatePoints(player, character, {
        allocations: data.allocations,
      });

      if (result.message) {
        player.receiveMessage(result.message);
      }

      // 持久化角色属性数据
      if (result.success) {
        await this.characterService.savePlayerDataToDB(player, session.characterId);
      }
    } catch {
      // 查询失败不阻塞主流程
    }
  }

  // ================================================================
  //  内部工具方法
  // ================================================================

  /** 从 session 获取玩家对象 */
  private getPlayerFromSession(session: Session): PlayerBase | undefined {
    if (!session.authenticated || !session.playerId) return undefined;
    return this.objectManager.findById(session.playerId) as PlayerBase | undefined;
  }

  /** 在玩家所在房间中查找 NPC（按实例 ID） */
  private findNpcInRoom(player: PlayerBase, npcId: string): NpcBase | undefined {
    const room = player.getEnvironment() as RoomBase | null;
    if (!room) return undefined;

    return room.getInventory().find((e): e is NpcBase => e instanceof NpcBase && e.id === npcId) as
      | NpcBase
      | undefined;
  }

  /** 获取 Session */
  getSession(socketId: string): Session | undefined {
    return this.sessions.get(socketId);
  }
}
