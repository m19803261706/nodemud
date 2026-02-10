/**
 * 认证处理器
 * 处理登录和注册消息
 */

import { Injectable, Logger } from '@nestjs/common';
import { MessageFactory } from '@packages/core';
import { AccountService } from '../../account/account.service';
import { CharacterService } from '../../character/character.service';
import { BlueprintFactory } from '../../engine/blueprint-factory';
import { ObjectManager } from '../../engine/object-manager';
import { PlayerBase } from '../../engine/game-objects/player-base';
import type { RoomBase } from '../../engine/game-objects/room-base';
import { sendRoomInfo } from './room-utils';
import { loadCharacterToPlayer, sendPlayerStats } from './stats.utils';
import type { Session } from '../types/session';

/** 默认出生房间 */
const DEFAULT_ROOM = 'area/rift-town/square';

@Injectable()
export class AuthHandler {
  private readonly logger = new Logger(AuthHandler.name);

  constructor(
    private readonly accountService: AccountService,
    private readonly characterService: CharacterService,
    private readonly blueprintFactory: BlueprintFactory,
    private readonly objectManager: ObjectManager,
  ) {}

  /**
   * 处理登录
   */
  async handleLogin(client: any, session: Session, data: { username: string; password: string }) {
    const result = await this.accountService.login(data.username, data.password);

    if (result.success) {
      // 更新 Session
      session.authenticated = true;
      session.accountId = result.account!.id;
      session.username = result.account!.username;

      client.send(
        MessageFactory.serialize(
          MessageFactory.create(
            'loginSuccess',
            result.account!.id,
            result.account!.username,
            result.hasCharacter,
            result.message,
            result.characterId,
            result.characterName,
          )!,
        ),
      );

      // === 登录成功后：若有角色，自动进场 ===
      if (result.hasCharacter && result.characterId) {
        try {
          const character = await this.characterService.findByAccountId(result.account!.id);
          if (character) {
            // 创建 PlayerBase 并注册
            const playerId = this.objectManager.nextInstanceId('player');
            const player = new PlayerBase(playerId);
            this.objectManager.register(player);
            loadCharacterToPlayer(player, character);

            // 绑定 WebSocket 连接
            player.bindConnection((msg: any) => {
              const payload = typeof msg === 'string' ? msg : JSON.stringify(msg);
              client.send(payload);
            });

            // 记录到 Session
            session.playerId = playerId;
            session.characterId = character.id;

            // 获取上次下线房间，不存在时 fallback 到广场
            const roomId = character.lastRoom || DEFAULT_ROOM;
            const room =
              (this.blueprintFactory.getVirtual(roomId) as RoomBase | undefined) ??
              (this.blueprintFactory.getVirtual(DEFAULT_ROOM) as RoomBase | undefined);

            if (room) {
              await player.moveTo(room, { quiet: true });
              sendRoomInfo(player, room, this.blueprintFactory);
              sendPlayerStats(player, character);
              room.broadcast(`${character.name}上线了。`, player);
            } else {
              this.logger.warn(`房间 ${roomId} 和默认房间都不存在`);
            }

            // 初始化技能管理器（从数据库加载技能并推送 skillList）
            try {
              await player.initSkillManager(character.id);
            } catch (skillError) {
              this.logger.error('初始化技能管理器失败:', skillError);
            }
          }
        } catch (enterError) {
          this.logger.error('登录进场失败:', enterError);
        }
      }
    } else {
      client.send(
        MessageFactory.serialize(
          MessageFactory.create('loginFailed', result.reason!, result.message)!,
        ),
      );
    }
  }

  /**
   * 处理注册
   */
  async handleRegister(client: any, data: { username: string; password: string; phone: string }) {
    const result = await this.accountService.register(data.username, data.password, data.phone);

    if (result.success) {
      client.send(
        MessageFactory.serialize(
          MessageFactory.create(
            'registerSuccess',
            result.accountId!,
            data.username,
            result.message,
          )!,
        ),
      );
    } else {
      client.send(
        MessageFactory.serialize(
          MessageFactory.create('registerFailed', result.reason!, result.message)!,
        ),
      );
    }
  }
}
