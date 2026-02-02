/**
 * Session 类型定义
 * 存储 WebSocket 连接的状态信息
 */

import type { CharacterOrigin, CharacterAttributes } from '@packages/core';

export interface Session {
  socketId: string; // Socket ID
  authenticated: boolean; // 是否已认证
  accountId?: string; // 账号 ID（认证后）
  username?: string; // 用户名（认证后）
  playerId?: string; // 玩家对象 ID（进入游戏后）
  lastPing?: number; // 最后心跳时间（毫秒）
  // 角色创建临时数据（Step1 生成，Confirm 消费后清除）
  pendingCharacter?: {
    origin: CharacterOrigin;
    gender: 'male' | 'female';
    fateName: string;
    fateType: string;
    fatePoem: string;
    destiny: number;
    benefactor: number;
    calamity: number;
    fortune: number;
    attributeCaps: CharacterAttributes;
    wuxingju: string;
    mingzhuStar: string;
    shenzhuStar: string;
    astrolabeJson: object; // iztro 原始输出
    generatedAt: number; // 生成时间戳，超时失效
  };
}
