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
  async handleLogin(
    client: any,
    session: Session,
    data: { username: string; password: string },
  ) {
    const result = await this.accountService.login(data.username, data.password);

    if (result.success) {
      // 更新 Session
      session.authenticated = true;
      session.accountId = result.account!.id;
      session.username = result.account!.username;

      // 发送成功消息
      client.send(
        MessageFactory.serialize({
          type: 'loginSuccess',
          data: {
            accountId: result.account!.id,
            username: result.account!.username,
            hasCharacter: result.hasCharacter,
            characterId: result.characterId,
            characterName: result.characterName,
            message: result.message,
          },
          timestamp: Date.now(),
        }),
      );
    } else {
      // 发送失败消息
      client.send(
        MessageFactory.serialize({
          type: 'loginFailed',
          data: {
            reason: result.reason!,
            message: result.message,
          },
          timestamp: Date.now(),
        }),
      );
    }
  }

  /**
   * 处理注册
   */
  async handleRegister(client: any, data: { username: string; password: string; phone: string }) {
    const result = await this.accountService.register(data.username, data.password, data.phone);

    if (result.success) {
      // 发送成功消息
      client.send(
        MessageFactory.serialize({
          type: 'registerSuccess',
          data: {
            accountId: result.accountId!,
            username: data.username,
            message: result.message,
          },
          timestamp: Date.now(),
        }),
      );
    } else {
      // 发送失败消息
      client.send(
        MessageFactory.serialize({
          type: 'registerFailed',
          data: {
            reason: result.reason!,
            message: result.message,
          },
          timestamp: Date.now(),
        }),
      );
    }
  }
}
