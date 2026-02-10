/**
 * sell 指令 -- 向商人出售物品
 *
 * 用法:
 *   sell <物品名>
 *   sell <物品名> to <商人名>
 */
import { Command, type ICommand, type CommandResult } from '../../types/command';
import { ItemBase } from '../../game-objects/item-base';
import { LivingBase } from '../../game-objects/living-base';
import { MerchantBase } from '../../game-objects/merchant-base';
import { RoomBase } from '../../game-objects/room-base';

@Command({ name: 'sell', aliases: ['出售', '卖'], description: '向商人出售物品' })
export class SellCommand implements ICommand {
  name = 'sell';
  aliases = ['出售', '卖'];
  description = '向商人出售物品';
  directory = 'std';

  execute(executor: LivingBase, args: string[]): CommandResult {
    if (args.length === 0) {
      return { success: false, message: '卖什么？用法: sell <物品名> [to <商人名>]' };
    }

    const env = executor.getEnvironment();
    if (!env || !(env instanceof RoomBase)) {
      return { success: false, message: '你不在任何房间中。' };
    }

    const parsed = this.parseArgs(args);
    if (!parsed.itemName) {
      return { success: false, message: '卖什么？用法: sell <物品名> [to <商人名>]' };
    }

    const item = this.findItemInInventory(executor, parsed.itemName);
    if (!item) {
      return { success: false, message: '你没有这个东西。' };
    }

    const equipped = executor.findEquipped((equippedItem) => equippedItem.id === item.id);
    if (equipped) {
      return { success: false, message: `你正装备着${item.getName()}，请先卸下再出售。` };
    }

    const merchant = this.findMerchant(env, parsed.merchantName);
    if (!merchant) {
      if (parsed.merchantName) {
        return { success: false, message: '这里没有这个商人。' };
      }
      return { success: false, message: '这里没有可以交易的商人。' };
    }

    const result = merchant.sellItem(executor, item);
    return {
      success: result.success,
      message: result.message,
      data: result.data,
    };
  }

  private parseArgs(args: string[]): { itemName: string; merchantName?: string } {
    const toIdx = this.findKeywordIndex(args, ['to', '给', '向']);
    if (toIdx > 0) {
      const itemName = args.slice(0, toIdx).join(' ').trim();
      const merchantName = args.slice(toIdx + 1).join(' ').trim();
      return {
        itemName,
        merchantName: merchantName || undefined,
      };
    }
    return { itemName: args.join(' ').trim() };
  }

  private findKeywordIndex(args: string[], keywords: string[]): number {
    for (let i = args.length - 1; i >= 0; i--) {
      if (keywords.includes(args[i].toLowerCase())) return i;
    }
    return -1;
  }

  private findItemInInventory(executor: LivingBase, itemName: string): ItemBase | null {
    const lowered = itemName.toLowerCase();
    const items = executor.getInventory().filter((entity): entity is ItemBase => entity instanceof ItemBase);
    return (
      items.find(
        (item) => item.getName().includes(itemName) || item.getName().toLowerCase() === lowered,
      ) ?? null
    );
  }

  private findMerchant(room: RoomBase, merchantName?: string): MerchantBase | null {
    const merchants = room
      .getInventory()
      .filter((entity): entity is MerchantBase => entity instanceof MerchantBase);
    if (merchants.length === 0) return null;
    if (!merchantName) return merchants[0] ?? null;

    const lowered = merchantName.toLowerCase();
    return (
      merchants.find(
        (merchant) =>
          merchant.getName().includes(merchantName) || merchant.getName().toLowerCase() === lowered,
      ) ?? null
    );
  }
}
