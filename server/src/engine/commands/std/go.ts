/**
 * go 指令 -- 向指定方向移动
 *
 * 解析方向参数（支持英文、中文、缩写），查询当前房间出口，
 * 返回移动结果信息。实际移动由上层 CommandHandler 根据结果处理。
 *
 * 对标: LPC go / 炎黄 go_cmd
 */
import { Command } from '../../types/command';
import type { ICommand, CommandResult } from '../../types/command';
import type { LivingBase } from '../../game-objects/living-base';
import { RoomBase } from '../../game-objects/room-base';
import { ServiceLocator } from '../../service-locator';
import { rt } from '@packages/core';

/** 方向别名映射表：缩写/中文 → 标准英文方向 */
const DIRECTION_ALIASES: Record<string, string> = {
  // 英文缩写
  n: 'north',
  s: 'south',
  e: 'east',
  w: 'west',
  u: 'up',
  d: 'down',
  ne: 'northeast',
  nw: 'northwest',
  se: 'southeast',
  sw: 'southwest',

  // 中文
  北: 'north',
  南: 'south',
  东: 'east',
  西: 'west',
  上: 'up',
  下: 'down',
  东北: 'northeast',
  西北: 'northwest',
  东南: 'southeast',
  西南: 'southwest',

  // 英文全称（标准化）
  north: 'north',
  south: 'south',
  east: 'east',
  west: 'west',
  up: 'up',
  down: 'down',
  northeast: 'northeast',
  northwest: 'northwest',
  southeast: 'southeast',
  southwest: 'southwest',
};

@Command({ name: 'go', aliases: ['走', '移动'], description: '向指定方向移动' })
export class GoCommand implements ICommand {
  name = 'go';
  aliases = ['走', '移动'];
  description = '向指定方向移动';
  directory = '';

  /**
   * 执行移动指令
   * @param executor 执行者（LivingBase）
   * @param args 参数列表，args[0] 为方向
   * @returns 指令结果（不实际执行移动，仅返回结果信息）
   */
  execute(executor: LivingBase, args: string[]): CommandResult {
    // 战斗中禁止移动
    if (executor.isInCombat()) {
      return { success: false, message: '你正在战斗中，无法移动！' };
    }

    // 无方向参数
    if (args.length === 0 || !args[0].trim()) {
      return { success: false, message: '去哪里？请指定方向。' };
    }

    // 解析方向
    const input = args[0].trim().toLowerCase();
    const direction = DIRECTION_ALIASES[input];
    if (!direction) {
      return { success: false, message: `未知方向: ${args[0]}` };
    }

    // 检查执行者是否在房间中
    const env = executor.getEnvironment();
    if (!env || !(env instanceof RoomBase)) {
      return { success: false, message: '你不在任何房间中。' };
    }

    // 查询房间出口
    const room = env as RoomBase;
    const targetId = room.getExit(direction);
    if (!targetId) {
      return { success: false, message: '这个方向没有出口。' };
    }

    const gateCheck = this.checkSongyangGate(executor, room, direction, targetId);
    if (gateCheck !== true) {
      return { success: false, message: gateCheck };
    }

    // 获取目标房间名（优先显示中文 short name）
    const targetRoom = ServiceLocator.objectManager.findById(targetId);
    const targetName = targetRoom instanceof RoomBase ? targetRoom.getShort() : targetId;

    // 返回成功结果，由上层处理实际移动
    return {
      success: true,
      message: `${rt('sys', '你向')}${rt('exit', targetName)}${rt('sys', '走去。')}`,
      data: { direction, targetId },
    };
  }

  /**
   * 嵩阳山门拦路规则:
   * - 从山道 north 进山门时，非嵩阳弟子需先向守山弟子说明来意
   * - 说明来意后可获得一次短时通行许可（在 gate-disciple.onChat 中设置）
   */
  private checkSongyangGate(
    executor: LivingBase,
    room: RoomBase,
    direction: string,
    targetId: string,
  ): true | string {
    if (
      room.id !== 'area/songyang/mountain-path' ||
      direction !== 'north' ||
      targetId !== 'area/songyang/gate'
    ) {
      return true;
    }

    const sectData = executor.get<any>('sect');
    const currentSectId = sectData?.current?.sectId;
    if (currentSectId === 'songyang') {
      return true;
    }

    const passUntil = executor.getTemp<number>('sect/songyang_gate_pass_until') ?? 0;
    if (passUntil > Date.now()) {
      // 一次性许可，进门即消耗，避免无限通行
      executor.setTemp('sect/songyang_gate_pass_until', 0);
      return true;
    }

    return '守山弟子横剑拦住去路：「报上来意。可先 ask 守山弟子 about 来意。」';
  }
}
