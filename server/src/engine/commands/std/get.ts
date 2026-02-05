/**
 * get 指令 -- 捡起地面物品
 *
 * 从当前房间地面捡起指定物品或所有物品到背包。
 * 支持模糊匹配物品名称。
 *
 * 对标: LPC get / 炎黄 get_cmd
 */
import { Command, type ICommand, type CommandResult } from '../../types/command';
import type { LivingBase } from '../../game-objects/living-base';
import { ItemBase } from '../../game-objects/item-base';
import { rt } from '@packages/core';

@Command({ name: 'get', aliases: ['take', '拿', '捡'], description: '捡起物品' })
export class GetCommand implements ICommand {
  name = 'get';
  aliases = ['take', '拿', '捡'];
  description = '捡起物品';
  directory = 'std';

  execute(executor: LivingBase, args: string[]): CommandResult {
    const env = executor.getEnvironment();
    if (!env) {
      return { success: false, message: '你不在任何地方。' };
    }

    // 无参数 → 提示格式
    if (args.length === 0) {
      return { success: false, message: '捡什么？用法: get <物品名> 或 get all' };
    }

    const target = args.join(' ').trim();

    // get all → 捡起所有地面物品
    if (target === 'all' || target === '全部') {
      return this.getAll(executor);
    }

    // 模糊匹配房间地面的 ItemBase
    return this.getItem(executor, target);
  }

  /** 捡起指定物品 */
  private getItem(executor: LivingBase, target: string): CommandResult {
    const env = executor.getEnvironment()!;
    const items = env.getInventory().filter((e): e is ItemBase => e instanceof ItemBase);

    const item = items.find(
      (i) =>
        i.getName().includes(target) ||
        i.getName().toLowerCase() === target.toLowerCase(),
    );

    if (!item) {
      return { success: false, message: '这里没有这个东西。' };
    }

    item.moveTo(executor, { quiet: true });
    const name = item.getName();

    return {
      success: true,
      message: `你捡起了${rt('item', name)}。`,
      data: { action: 'get', itemId: item.id, itemName: name },
    };
  }

  /** 捡起所有物品 */
  private getAll(executor: LivingBase): CommandResult {
    const env = executor.getEnvironment()!;
    const items = env.getInventory().filter((e): e is ItemBase => e instanceof ItemBase);

    if (items.length === 0) {
      return { success: false, message: '这里没有可以捡起的东西。' };
    }

    const names: string[] = [];
    for (const item of items) {
      item.moveTo(executor, { quiet: true });
      names.push(item.getName());
    }

    return {
      success: true,
      message: `你捡起了${names.map((n) => rt('item', n)).join('、')}。`,
      data: { action: 'get', all: true, count: names.length },
    };
  }
}
