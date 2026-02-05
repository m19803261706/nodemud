/**
 * drop 指令 -- 丢弃物品
 *
 * 将背包中指定物品丢弃到当前房间地面。
 * 支持模糊匹配物品名称。
 *
 * 对标: LPC drop / 炎黄 drop_cmd
 */
import { Command, type ICommand, type CommandResult } from '../../types/command';
import type { LivingBase } from '../../game-objects/living-base';
import { ItemBase } from '../../game-objects/item-base';
import { rt } from '@packages/core';

@Command({ name: 'drop', aliases: ['丢', '丢弃'], description: '丢弃物品' })
export class DropCommand implements ICommand {
  name = 'drop';
  aliases = ['丢', '丢弃'];
  description = '丢弃物品';
  directory = 'std';

  execute(executor: LivingBase, args: string[]): CommandResult {
    const env = executor.getEnvironment();
    if (!env) {
      return { success: false, message: '你不在任何地方。' };
    }

    if (args.length === 0) {
      return { success: false, message: '丢弃什么？用法: drop <物品名>' };
    }

    const target = args.join(' ').trim();

    // 从背包模糊匹配 ItemBase
    const items = executor.getInventory().filter((e): e is ItemBase => e instanceof ItemBase);
    const item = items.find(
      (i) => i.getName().includes(target) || i.getName().toLowerCase() === target.toLowerCase(),
    );

    if (!item) {
      return { success: false, message: '你没有这个东西。' };
    }

    if (!item.isDroppable()) {
      return { success: false, message: `${item.getName()}不能被丢弃。` };
    }

    // 物品移到房间地面
    item.moveTo(env, { quiet: true });
    const name = item.getName();

    return {
      success: true,
      message: `你丢弃了${rt('item', name)}。`,
      data: { action: 'drop', itemId: item.id, itemName: name },
    };
  }
}
