/**
 * SellCommand 出售指令单元测试
 */
import { SellCommand } from '../../commands/std/sell';
import { ItemBase } from '../../game-objects/item-base';
import { LivingBase } from '../../game-objects/living-base';
import { MerchantBase } from '../../game-objects/merchant-base';
import { RoomBase } from '../../game-objects/room-base';

describe('SellCommand', () => {
  let room: RoomBase;
  let player: LivingBase;
  let merchant: MerchantBase;
  let herbalist: MerchantBase;
  let command: SellCommand;

  async function giveToPlayer(item: ItemBase) {
    await item.moveTo(player, { quiet: true });
    return item;
  }

  beforeEach(async () => {
    room = new RoomBase('room/test-market');
    player = new LivingBase('player/test');
    player.set('name', '测试玩家');
    player.set('silver', 50);
    await player.moveTo(room, { quiet: true });

    merchant = new MerchantBase('npc/general-merchant');
    merchant.set('name', '杂货商');
    merchant.set('shop_recycle', {
      enabled: true,
      allowedTypes: ['food', 'container', 'misc', 'key'],
      deniedTypes: ['weapon', 'armor', 'book'],
      priceRate: 0.5,
      minPrice: 1,
      rejectionMessage: '杂货商道：「刀剑甲胄我不收。」',
    });
    await merchant.moveTo(room, { quiet: true });

    herbalist = new MerchantBase('npc/herbalist');
    herbalist.set('name', '白发药师');
    herbalist.set('shop_recycle', {
      enabled: true,
      allowedTypes: ['medicine', 'food'],
      deniedTypes: ['weapon', 'armor', 'book', 'container', 'key', 'misc'],
      priceRate: 0.6,
      minPrice: 1,
      rejectionMessage: '白发药师道：「老身只收药品与食材。」',
    });
    await herbalist.moveTo(room, { quiet: true });

    command = new SellCommand();
  });

  it('可将杂货卖给杂货商并增加银两', async () => {
    const ration = await giveToPlayer(new ItemBase('item/test/ration'));
    ration.set('name', '干粮');
    ration.set('type', 'food');
    ration.set('value', 20);

    const result = command.execute(player, ['干粮', 'to', '杂货商']);

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      action: 'sell',
      merchantName: '杂货商',
      itemName: '干粮',
      price: 10,
      remainingSilver: 60,
      moneyChanged: true,
    });
    expect(player.getSilver()).toBe(60);
    expect(player.getInventory().includes(ration)).toBe(false);
  });

  it('杂货商拒收武器', async () => {
    const sword = await giveToPlayer(new ItemBase('item/test/sword'));
    sword.set('name', '铁剑');
    sword.set('type', 'weapon');
    sword.set('value', 100);

    const result = command.execute(player, ['铁剑', 'to', '杂货商']);

    expect(result.success).toBe(false);
    expect(result.message).toContain('不收');
    expect(player.getSilver()).toBe(50);
    expect(player.getInventory().includes(sword)).toBe(true);
  });

  it('药师可收药品但拒收容器', async () => {
    const medicine = await giveToPlayer(new ItemBase('item/test/medicine'));
    medicine.set('name', '金疮药');
    medicine.set('type', 'medicine');
    medicine.set('value', 30);

    const sellMedicine = command.execute(player, ['金疮药', 'to', '白发药师']);
    expect(sellMedicine.success).toBe(true);
    expect(player.getSilver()).toBe(68);

    const pouch = await giveToPlayer(new ItemBase('item/test/pouch'));
    pouch.set('name', '小包裹');
    pouch.set('type', 'container');
    pouch.set('value', 40);

    const sellPouch = command.execute(player, ['小包裹', 'to', '白发药师']);
    expect(sellPouch.success).toBe(false);
    expect(sellPouch.message).toContain('只收药品');
    expect(player.getSilver()).toBe(68);
    expect(player.getInventory().includes(pouch)).toBe(true);
  });

  it('已装备物品不能出售', async () => {
    const armor = await giveToPlayer(new ItemBase('item/test/armor'));
    armor.set('name', '布衣');
    armor.set('type', 'armor');
    armor.set('value', 80);
    player.equip(armor, 'body');

    const result = command.execute(player, ['布衣', 'to', '杂货商']);

    expect(result.success).toBe(false);
    expect(result.message).toContain('请先卸下');
    expect(player.getInventory().includes(armor)).toBe(true);
  });
});
