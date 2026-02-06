/**
 * remove 指令 -- 脱下装备
 *
 * 将已装备的物品从槽位脱下，放回背包。
 *
 * 对标: LPC remove / 炎黄 remove_cmd
 */
import { Command, type ICommand, type CommandResult } from '../../types/command';
import type { LivingBase } from '../../game-objects/living-base';
import { PlayerBase } from '../../game-objects/player-base';
import { rt } from '@packages/core';

@Command({ name: 'remove', aliases: ['脱', '卸下'], description: '脱下装备' })
export class RemoveCommand implements ICommand {
  name = 'remove';
  aliases = ['脱', '卸下'];
  description = '脱下装备';
  directory = 'std';

  execute(executor: LivingBase, args: string[]): CommandResult {
    if (!(executor instanceof PlayerBase)) {
      return { success: false, message: '只有玩家才能操作装备。' };
    }

    if (args.length === 0) {
      return { success: false, message: '卸下什么？用法: remove <装备名>' };
    }

    const target = args.join(' ').trim();

    // 查找已装备的物品
    const found = executor.findEquipped(
      (item) =>
        item.getName().includes(target) || item.getName().toLowerCase() === target.toLowerCase(),
    );

    if (!found) {
      return { success: false, message: '你没有装备这个东西。' };
    }

    const [position, item] = found;
    executor.unequip(position);
    const name = item.getName();

    return {
      success: true,
      message: `你卸下了${rt('item', name)}。`,
      data: { action: 'remove', itemId: item.id, position },
    };
  }
}
