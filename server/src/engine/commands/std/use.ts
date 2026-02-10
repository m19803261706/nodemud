/**
 * use 指令 -- 使用物品
 *
 * 统一调用物品可使用协议（IUsableItem）：
 * - 支持默认使用: use <物品名>
 * - 支持指定选项: use <物品名> <optionKey>
 * - 可由物品自行决定是否消耗、是否改变资源
 *
 * 对标: LPC use / 炎黄 use_cmd
 */
import { Command, type ICommand, type CommandResult } from '../../types/command';
import type { LivingBase } from '../../game-objects/living-base';
import { ItemBase } from '../../game-objects/item-base';
import { isUsableItem } from '../../game-objects/usable-item';

@Command({ name: 'use', aliases: ['使用'], description: '使用物品' })
export class UseCommand implements ICommand {
  name = 'use';
  aliases = ['使用'];
  description = '使用物品';
  directory = 'std';

  execute(executor: LivingBase, args: string[]): CommandResult {
    if (args.length === 0) {
      return { success: false, message: '使用什么？用法: use <物品名>' };
    }

    // 从背包查找物品
    const items = executor.getInventory().filter((e): e is ItemBase => e instanceof ItemBase);
    const parsed = this.resolveItemAndOption(items, args);
    const item = parsed?.item;
    const optionKey = parsed?.optionKey;

    if (!item) {
      return { success: false, message: '你没有这个东西。' };
    }

    if (!isUsableItem(item)) {
      return { success: false, message: `${item.getName()}不能被使用。` };
    }

    const result = item.use(executor, optionKey);
    if (!result.success) {
      return {
        success: false,
        message: result.message,
        data: {
          action: 'use',
          itemId: item.id,
          optionKey: optionKey ?? 'default',
          consumed: false,
          resourceChanged: false,
          ...result.data,
        },
      };
    }

    const consumed = result.consume ?? true;
    if (consumed) {
      item.destroy();
    }

    return {
      success: true,
      message: result.message,
      data: {
        action: 'use',
        itemId: item.id,
        optionKey: optionKey ?? 'default',
        consumed,
        resourceChanged: !!result.resourceChanged,
        ...result.data,
      },
    };
  }

  /**
   * 解析“物品名 + 可选 use 选项”
   * 策略：从长到短尝试匹配物品名，剩余参数作为 optionKey
   */
  private resolveItemAndOption(
    items: ItemBase[],
    args: string[],
  ): { item: ItemBase; optionKey?: string } | null {
    for (let i = args.length; i >= 1; i--) {
      const itemName = args.slice(0, i).join(' ').trim();
      if (!itemName) continue;
      const item = items.find(
        (candidate) =>
          candidate.getName().includes(itemName) ||
          candidate.getName().toLowerCase() === itemName.toLowerCase(),
      );
      if (!item) continue;

      const optionKeyRaw = args.slice(i).join(' ').trim();
      return {
        item,
        optionKey: optionKeyRaw || undefined,
      };
    }
    return null;
  }
}
