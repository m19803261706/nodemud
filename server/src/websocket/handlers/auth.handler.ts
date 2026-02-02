/**
 * 认证处理器
 * 处理登录和注册消息
 */

import { Injectable } from '@nestjs/common';
import { MessageFactory } from '@packages/core';
import { AccountService } from '../../account/account.service';
import type { Session } from '../types/session';

@Injectable()
export class AuthHandler {
  constructor(private readonly accountService: AccountService) {}

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
