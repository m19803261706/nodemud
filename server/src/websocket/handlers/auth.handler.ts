/**
 * 认证处理器
 * 处理登录和注册消息
 */

import { Injectable, Logger } from '@nestjs/common';
import { MessageFactory } from '@packages/core';
import { AccountService } from '../../account/account.service';
import { CharacterService } from '../../character/character.service';
import { ExplorationService } from '../../character/exploration.service';
import { BlueprintFactory } from '../../engine/blueprint-factory';
import { ObjectManager } from '../../engine/object-manager';
import type { Session } from '../types/session';
import { enterWorldWithCharacter } from './enter-world.utils';

/** 默认出生房间 */
const DEFAULT_ROOM = 'area/rift-town/square';

@Injectable()
export class AuthHandler {
  private readonly logger = new Logger(AuthHandler.name);

  constructor(
    private readonly accountService: AccountService,
    private readonly characterService: CharacterService,
    private readonly explorationService: ExplorationService,
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
            await enterWorldWithCharacter({
              client,
              session,
              character,
              objectManager: this.objectManager,
              blueprintFactory: this.blueprintFactory,
              defaultRoomId: DEFAULT_ROOM,
              entryBroadcastText: `${character.name}上线了。`,
              useLastRoom: true,
              logger: this.logger,
              explorationService: this.explorationService,
            });
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
