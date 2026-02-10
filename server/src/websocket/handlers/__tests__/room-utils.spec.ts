import { ItemBase } from '../../../engine/game-objects/item-base';
import { LivingBase } from '../../../engine/game-objects/living-base';
import { PlayerBase } from '../../../engine/game-objects/player-base';
import { RoomBase } from '../../../engine/game-objects/room-base';
import { sendInventoryUpdate } from '../room-utils';

describe('room-utils sendInventoryUpdate', () => {
  it('会将可堆叠物品按蓝图合并计数', async () => {
    const room = new RoomBase('room/test');
    const player = new PlayerBase('player/test');
    await player.moveTo(room, { quiet: true });

    const ration1 = new ItemBase('item/rift-town/dry-rations#1');
    ration1.set('name', '干粮');
    ration1.set('short', '一份干粮');
    ration1.set('type', 'food');
    ration1.set('weight', 1);
    ration1.set('value', 5);
    ration1.set('stackable', true);
    await ration1.moveTo(player, { quiet: true });

    const ration2 = new ItemBase('item/rift-town/dry-rations#2');
    ration2.set('name', '干粮');
    ration2.set('short', '一份干粮');
    ration2.set('type', 'food');
    ration2.set('weight', 1);
    ration2.set('value', 5);
    ration2.set('stackable', true);
    await ration2.moveTo(player, { quiet: true });

    const sword = new ItemBase('item/rift-town/iron-sword#1');
    sword.set('name', '铁剑');
    sword.set('short', '一把铁剑');
    sword.set('type', 'weapon');
    sword.set('weight', 4);
    sword.set('value', 30);
    sword.set('stackable', false);
    await sword.moveTo(player, { quiet: true });

    const sent: string[] = [];
    player.bindConnection((payload) => sent.push(payload));

    sendInventoryUpdate(player);

    expect(sent).toHaveLength(1);
    const msg = JSON.parse(sent[0]);
    expect(msg.type).toBe('inventoryUpdate');
    expect(Array.isArray(msg.data.items)).toBe(true);
    expect(msg.data.items).toHaveLength(2);

    const ration = msg.data.items.find((it: any) => it.name === '干粮');
    const weapon = msg.data.items.find((it: any) => it.name === '铁剑');

    expect(ration).toBeTruthy();
    expect(ration.count).toBe(2);
    expect(weapon).toBeTruthy();
    expect(weapon.count).toBe(1);
  });

  it('不会把已装备物品计入背包列表', async () => {
    const room = new RoomBase('room/test-equip');
    const player = new PlayerBase('player/test');
    await player.moveTo(room, { quiet: true });

    const weapon = new ItemBase('item/test/sword#1');
    weapon.set('name', '铁剑');
    weapon.set('type', 'weapon');
    weapon.set('stackable', false);
    await weapon.moveTo(player, { quiet: true });
    player.equip(weapon, 'weapon');

    const herb = new ItemBase('item/test/herb#1');
    herb.set('name', '草药');
    herb.set('type', 'food');
    herb.set('stackable', true);
    await herb.moveTo(player, { quiet: true });

    const sent: string[] = [];
    player.bindConnection((payload) => sent.push(payload));

    sendInventoryUpdate(player);

    const msg = JSON.parse(sent[0]);
    expect(msg.data.items).toHaveLength(1);
    expect(msg.data.items[0].name).toBe('草药');
  });
});
