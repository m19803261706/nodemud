/**
 * 全局活动管理器
 *
 * 管理玩家的忙碌活动（采集、制作等需要延迟完成的活动）。
 * 统一处理：活动状态跟踪、定时器管理、前端按钮通知。
 *
 * 使用方式：
 *   ActivityManager.startActivity(player, { type, label, stopLabel, delay, onComplete })
 *   ActivityManager.stopActivity(player)   // stop 指令调用
 *   ActivityManager.isActive(player)       // 其他指令检查忙碌
 *
 * 前端收到 activityUpdate 消息后自动管理停止按钮，无需硬编码特定活动类型。
 */
import { Injectable, Logger } from '@nestjs/common';
import { MessageFactory } from '@packages/core';
import type { PlayerBase } from '../game-objects/player-base';
import { ServiceLocator } from '../service-locator';

/** 启动活动的配置 */
export interface ActivityOptions {
  /** 活动类型标识（如 gathering, crafting） */
  type: string;
  /** 活动中文标签（如 '采集'），用于移动阻止等提示 */
  label: string;
  /** 前端停止按钮文案（如 '停止采集'） */
  stopLabel: string;
  /** 延迟时间（毫秒） */
  delay: number;
  /** 活动完成回调（定时器到期后执行） */
  onComplete: (player: PlayerBase) => void;
}

/** 活动会话（内部） */
interface ActivitySession {
  type: string;
  label: string;
  stopLabel: string;
  timer: ReturnType<typeof setTimeout>;
  onComplete: (player: PlayerBase) => void;
}

@Injectable()
export class ActivityManager {
  private readonly logger = new Logger(ActivityManager.name);
  /** 玩家 ID → 活动会话 */
  private readonly sessions = new Map<string, ActivitySession>();

  /**
   * 开始一个活动
   * 设置玩家忙碌状态、启动定时器、通知前端显示停止按钮
   */
  startActivity(player: PlayerBase, options: ActivityOptions): void {
    const playerId = player.id;

    // 防止重复启动
    if (this.sessions.has(playerId)) {
      this.logger.warn(`玩家 ${playerId} 已有活动进行中，忽略重复启动`);
      return;
    }

    // 设置玩家临时状态（供 go 等指令检查）
    player.setTemp('activity', options.type);

    // 启动定时器
    const timer = setTimeout(() => {
      this.completeActivity(playerId);
    }, options.delay);

    // 记录会话
    this.sessions.set(playerId, {
      type: options.type,
      label: options.label,
      stopLabel: options.stopLabel,
      timer,
      onComplete: options.onComplete,
    });

    // 通知前端：活动开始
    this.sendActivityUpdate(player, 'started', options.type, options.stopLabel);

    this.logger.log(
      `活动开始: player=${playerId} type=${options.type} delay=${options.delay}ms`,
    );
  }

  /**
   * 停止活动（手动停止，如 stop 指令）
   * @returns 是否成功停止（false = 没有活动在进行）
   */
  stopActivity(player: PlayerBase): boolean {
    const session = this.sessions.get(player.id);
    if (!session) return false;

    clearTimeout(session.timer);
    player.setTemp('activity', undefined);
    this.sessions.delete(player.id);

    // 通知前端：活动停止
    this.sendActivityUpdate(player, 'stopped', session.type);

    this.logger.log(`活动停止: player=${player.id} type=${session.type}`);
    return true;
  }

  /** 检查玩家是否有活动进行中 */
  isActive(player: PlayerBase): boolean {
    return this.sessions.has(player.id);
  }

  /** 获取玩家当前活动信息 */
  getActivity(player: PlayerBase): { type: string; label: string } | null {
    const session = this.sessions.get(player.id);
    if (!session) return null;
    return { type: session.type, label: session.label };
  }

  /** 清除玩家活动（玩家下线时调用，不发消息） */
  clearActivity(playerId: string): void {
    const session = this.sessions.get(playerId);
    if (!session) return;
    clearTimeout(session.timer);
    this.sessions.delete(playerId);
    this.logger.log(`活动清除: player=${playerId} type=${session.type}`);
  }

  /**
   * 活动完成（定时器到期触发）
   * 清除状态 → 执行回调 → 通知前端
   */
  private completeActivity(playerId: string): void {
    const session = this.sessions.get(playerId);
    if (!session) return;

    this.sessions.delete(playerId);

    // 通过 ObjectManager 查找玩家（可能已下线）
    const player = ServiceLocator.objectManager?.findById(playerId) as
      | PlayerBase
      | undefined;
    if (!player) {
      this.logger.warn(`活动完成但玩家不在线: ${playerId}`);
      return;
    }

    // 验证玩家状态一致
    if (player.getTemp<string>('activity') !== session.type) {
      this.logger.warn(
        `活动状态不一致: expected=${session.type} actual=${player.getTemp<string>('activity')}`,
      );
      return;
    }

    // 清除忙碌状态
    player.setTemp('activity', undefined);

    // 执行完成回调（创建物品、追踪任务等）
    try {
      session.onComplete(player);
    } catch (err) {
      this.logger.error(
        `活动完成回调失败: player=${playerId} type=${session.type}`,
        err,
      );
    }

    // 通知前端：活动完成
    this.sendActivityUpdate(player, 'completed', session.type);

    this.logger.log(`活动完成: player=${playerId} type=${session.type}`);
  }

  /** 发送 activityUpdate 消息到客户端 */
  private sendActivityUpdate(
    player: PlayerBase,
    status: 'started' | 'completed' | 'stopped',
    activityType: string,
    stopLabel?: string,
  ): void {
    const msg = MessageFactory.create('activityUpdate', {
      status,
      activityType,
      stopLabel: status === 'started' ? stopLabel : undefined,
    });
    if (msg) {
      player.sendToClient(MessageFactory.serialize(msg));
    }
  }
}
