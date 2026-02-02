/**
 * say 指令 -- 在房间内说话
 *
 * 用法: say <message>
 * 别名: 说, 聊
 * 将消息广播给房间内所有人，自己收到确认信息。
 */
import { Command } from '../../types/command';
import type { ICommand, CommandResult } from '../../types/command';
import type { LivingBase } from '../../game-objects/living-base';
import { RoomBase } from '../../game-objects/room-base';
import { rt } from '@packages/core';

@Command({ name: 'say', aliases: ['说', '聊'], description: '在房间内说话' })
export class SayCommand implements ICommand {
  name = 'say';
  aliases = ['说', '聊'];
  description = '在房间内说话';
  directory = '';

  /**
   * 执行说话指令
   * @param executor 执行者（玩家/NPC）
   * @param args 参数数组，拼接为消息内容
   */
  execute(executor: LivingBase, args: string[]): CommandResult {
    // 无消息参数时提示
    if (args.length === 0) {
      return { success: false, message: '说什么？' };
    }

    // 检查是否在房间中
    const env = executor.getEnvironment();
    if (!(env instanceof RoomBase)) {
      return { success: false, message: '你不在任何房间中。' };
    }

    const message = args.join(' ');
    const name = executor.getName();

    // 广播给房间内其他人（排除自己）
    env.broadcast(
      `${rt('player', name)}${rt('sys', '说道: 「')}${rt('chat', message)}${rt('sys', '」')}`,
      executor,
    );

    // 返回给自己的确认消息
    return {
      success: true,
      message: `${rt('sys', '你说道: 「')}${rt('chat', message)}${rt('sys', '」')}`,
    };
  }
}
