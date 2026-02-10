/**
 * BuyCommand / ListCommand 商店指令单元测试
 */
import { BuyCommand } from '../../commands/std/buy';
import { ListCommand } from '../../commands/std/list';
import { ItemBase } from '../../game-objects/item-base';
import { LivingBase } from '../../game-objects/living-base';
import { MerchantBase } from '../../game-objects/merchant-base';
import { RoomBase } from '../../game-objects/room-base';
import { ServiceLocator } from '../../service-locator';

describe('商店指令', () => {
  let room: RoomBase;
  let player: LivingBase;
  let merchant: MerchantBase;
  let buy: BuyCommand;
  let list: ListCommand;

  beforeEach(async () => {
    room = new RoomBase('room/test-shop');
    room.set('short', '测试商铺');

    player = new LivingBase('player/test');
    player.set('name', '测试玩家');
    player.set('silver', 100);
    await player.moveTo(room, { quiet: true });

    merchant = new MerchantBase('npc/test-merchant');
    merchant.set('name', '杂货商');
    merchant.set('shop_goods', [
      {
        blueprintId: 'item/test/heal',
        name: '止血散',
        short: '一包常见止血药',
        price: 30,
        stock: 2,
      },
    ]);
    await merchant.moveTo(room, { quiet: true });

    buy = new BuyCommand();
    list = new ListCommand();

    ServiceLocator.blueprintFactory = {
      clone: (blueprintId: string) => {
        const item = new ItemBase(`${blueprintId}#clone`);
        item.set('name', blueprintId.includes('heal') ? '止血散' : '未知货物');
        item.set('short', '一包常见止血药');
        item.set('type', 'medicine');
        item.set('value', 20);
        return item;
      },
    } as any;
  });

  afterEach(() => {
    ServiceLocator.reset();
  });

  it('list 可展示商人货单', () => {
    const result = list.execute(player, ['杂货商']);

    expect(result.success).toBe(true);
    expect(result.message).toContain('杂货商的货单');
    expect(result.message).toContain('止血散');
    expect(result.message).toContain('30两银子');
    expect(result.data).toMatchObject({
      action: 'list_goods',
      merchantId: merchant.id,
    });
  });

  it('buy 成功后扣银两并获得物品', () => {
    const result = buy.execute(player, ['1', 'from', '杂货商']);

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      action: 'buy',
      price: 30,
      remainingSilver: 70,
      stockLeft: 1,
      moneyChanged: true,
    });
    expect(player.getSilver()).toBe(70);

    const inventory = player.getInventory().filter((entity): entity is ItemBase => entity instanceof ItemBase);
    expect(inventory.some((item) => item.getName() === '止血散')).toBe(true);
  });

  it('余额不足时购买失败', () => {
    player.set('silver', 10);

    const result = buy.execute(player, ['止血散', 'from', '杂货商']);

    expect(result.success).toBe(false);
    expect(result.message).toContain('银两不够');
    expect(player.getSilver()).toBe(10);
    const inventory = player.getInventory().filter((entity): entity is ItemBase => entity instanceof ItemBase);
    expect(inventory.length).toBe(0);
  });

  it('库存耗尽后不可继续购买', () => {
    const first = buy.execute(player, ['止血散', 'from', '杂货商']);
    expect(first.success).toBe(true);
    const second = buy.execute(player, ['止血散', 'from', '杂货商']);
    expect(second.success).toBe(true);

    const third = buy.execute(player, ['止血散', 'from', '杂货商']);
    expect(third.success).toBe(false);
    expect(third.message).toContain('卖完了');
  });
});
