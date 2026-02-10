/**
 * buy 指令 -- 向商人购买物品
 *
 * 用法:
 *   buy <序号|物品名>
 *   buy <序号|物品名> from <商人名>
 */
import { Command, type ICommand, type CommandResult } from '../../types/command';
import { LivingBase } from '../../game-objects/living-base';
import { MerchantBase } from '../../game-objects/merchant-base';
import { RoomBase } from '../../game-objects/room-base';

@Command({ name: 'buy', aliases: ['购买', '买'], description: '向商人购买物品' })
export class BuyCommand implements ICommand {
  name = 'buy';
  aliases = ['购买', '买'];
  description = '向商人购买物品';
  directory = 'std';

  execute(executor: LivingBase, args: string[]): CommandResult {
    if (args.length === 0) {
      return { success: false, message: '买什么？用法: buy <序号|物品名> [from <商人名>]' };
    }

    const env = executor.getEnvironment();
    if (!env || !(env instanceof RoomBase)) {
      return { success: false, message: '你不在任何房间中。' };
    }

    const parsed = this.parseArgs(args);
    if (!parsed.selector) {
      return { success: false, message: '买什么？用法: buy <序号|物品名> [from <商人名>]' };
    }

    const merchant = this.findMerchant(env, parsed.merchantName);
    if (!merchant) {
      if (parsed.merchantName) {
        return { success: false, message: '这里没有这个商人。' };
      }
      return { success: false, message: '这里没有可以交易的商人。' };
    }

    const result = merchant.buyGood(executor, parsed.selector);
    return {
      success: result.success,
      message: result.message,
      data: result.data,
    };
  }

  private parseArgs(args: string[]): { selector: string; merchantName?: string } {
    const fromIdx = this.findKeywordIndex(args, ['from', '从']);
    if (fromIdx > 0) {
      const selector = args.slice(0, fromIdx).join(' ').trim();
      const merchantName = args
        .slice(fromIdx + 1)
        .join(' ')
        .trim();
      return {
        selector,
        merchantName: merchantName || undefined,
      };
    }

    return {
      selector: args.join(' ').trim(),
    };
  }

  private findKeywordIndex(args: string[], keywords: string[]): number {
    for (let i = args.length - 1; i >= 0; i--) {
      if (keywords.includes(args[i].toLowerCase())) return i;
    }
    return -1;
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
