/**
 * list 指令 -- 查看商人货单
 *
 * 用法:
 *   list
 *   list <商人名>
 */
import { Command, type ICommand, type CommandResult } from '../../types/command';
import { LivingBase } from '../../game-objects/living-base';
import { RoomBase } from '../../game-objects/room-base';
import { MerchantBase } from '../../game-objects/merchant-base';

@Command({ name: 'list', aliases: ['shop', '商品', '货单'], description: '查看商人货单' })
export class ListCommand implements ICommand {
  name = 'list';
  aliases = ['shop', '商品', '货单'];
  description = '查看商人货单';
  directory = 'std';

  execute(executor: LivingBase, args: string[]): CommandResult {
    const env = executor.getEnvironment();
    if (!env || !(env instanceof RoomBase)) {
      return { success: false, message: '你不在任何房间中。' };
    }

    const merchantName = args.join(' ').trim();
    const merchant = this.findMerchant(env, merchantName);
    if (!merchant) {
      if (merchantName) {
        return { success: false, message: '这里没有这个商人。' };
      }
      return { success: false, message: '这里没有可以交易的商人。' };
    }

    const goods = merchant.getShopGoodViews();
    if (goods.length === 0) {
      return { success: true, message: `${merchant.getName()}摊了摊手：「小店暂无货物。」` };
    }

    const lines: string[] = [];
    lines.push(`${merchant.getName()}的货单：`);
    for (const good of goods) {
      const stockText = good.stock < 0 ? '不限' : `${good.stock}`;
      lines.push(
        `${good.index}. ${good.name} - ${good.price}两银子（库存:${stockText}）\n   ${good.short}`,
      );
    }
    lines.push(`\n可用: buy <序号|名称> from ${merchant.getName()}`);
    lines.push(`      sell <物品名> to ${merchant.getName()}`);

    return {
      success: true,
      message: lines.join('\n'),
      data: {
        action: 'list_goods',
        merchantId: merchant.id,
        merchantName: merchant.getName(),
        goods,
      },
    };
  }

  private findMerchant(room: RoomBase, merchantName: string): MerchantBase | null {
    const merchants = room
      .getInventory()
      .filter((entity): entity is MerchantBase => entity instanceof MerchantBase);

    if (merchants.length === 0) return null;

    if (!merchantName) {
      return merchants[0] ?? null;
    }

    const lowered = merchantName.toLowerCase();
    return (
      merchants.find(
        (merchant) =>
          merchant.getName().includes(merchantName) || merchant.getName().toLowerCase() === lowered,
      ) ?? null
    );
  }
}
