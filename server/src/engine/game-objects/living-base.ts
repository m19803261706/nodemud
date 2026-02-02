/**
 * LivingBase -- 生物基类
 *
 * 所有"活着的"游戏对象（玩家、NPC）的基类。
 * 提供名字/描述、移动、指令执行、权限等通用能力。
 *
 * 对标: LPC living.c / 炎黄 LIVING
 */
import { BaseEntity } from '../base-entity';
import { ServiceLocator } from '../service-locator';
import type { CommandResult } from '../types/command';
import { Permission } from '../types/command';

export class LivingBase extends BaseEntity {
  /** 获取名字（对标 LPC query("name")） */
  getName(): string {
    return this.get<string>('name') ?? '无名';
  }

  /** 获取简短描述（房间内显示） */
  getShort(): string {
    return this.get<string>('short') ?? this.getName();
  }

  /** 获取详细描述（look 查看） */
  getLong(): string {
    return this.get<string>('long') ?? `你看到了${this.getName()}。`;
  }

  /**
   * 向指定方向移动
   * @param direction 方向（如 "north", "south"）
   * @returns 是否移动成功
   */
  async go(direction: string): Promise<boolean> {
    const env = this.getEnvironment();
    // 延迟加载 RoomBase 避免循环依赖
    const { RoomBase } = require('./room-base');
    if (!(env instanceof RoomBase)) return false;

    const room = env as import('./room-base').RoomBase;
    const targetId = room.getExit(direction);
    if (!targetId) return false;

    if (!ServiceLocator.initialized) return false;
    const targetRoom = ServiceLocator.blueprintFactory.getVirtual(targetId);
    if (!targetRoom) return false;

    return this.moveTo(targetRoom);
  }

  /**
   * 执行指令
   * @param input 玩家输入的原始指令字符串
   * @returns 指令执行结果
   */
  executeCommand(input: string): CommandResult {
    if (!ServiceLocator.initialized || !ServiceLocator.commandManager) {
      return { success: false, message: '指令系统未初始化' };
    }
    return ServiceLocator.commandManager.execute(this, input);
  }

  /** 获取权限等级 */
  getPermission(): Permission {
    return this.get<number>('permission') ?? Permission.NPC;
  }

  /** 接收消息（子类覆写实现消息推送） */
  receiveMessage(msg: string): void {}
}
