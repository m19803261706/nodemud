/**
 * GiveCommand give 指令单元测试
 */
import { GiveCommand } from '../../commands/std/give';
import { ItemBase } from '../../game-objects/item-base';
import { LivingBase } from '../../game-objects/living-base';
import { NpcBase } from '../../game-objects/npc-base';
import { RoomBase } from '../../game-objects/room-base';

class QuestNpc extends NpcBase {
  override onReceiveItem(
    _giver: LivingBase,
    item: ItemBase,
  ): { accept: boolean; message?: string } {
    if (item.getType() === 'quest') {
      return { accept: true, message: '白发药师接过信，轻轻点了点头。' };
    }
    return {
      accept: false,
      message: '白发药师淡淡道：「老身不需要这个。」',
    };
  }
}

describe('GiveCommand', () => {
  let room: RoomBase;
  let player: LivingBase;
  let npc: QuestNpc;
  let command: GiveCommand;

  async function giveToPlayer(item: ItemBase) {
    await item.moveTo(player, { quiet: true });
    return item;
  }

  beforeEach(async () => {
    room = new RoomBase('room/test-give');
    player = new LivingBase('player/test');
    player.set('name', '测试玩家');
    await player.moveTo(room, { quiet: true });

    npc = new QuestNpc('npc/test-herbalist');
    npc.set('name', '白发药师');
    await npc.moveTo(room, { quiet: true });

    command = new GiveCommand();
  });

  it('允许交付不可交易的任务物品', async () => {
    const letter = await giveToPlayer(new ItemBase('item/quest/blacksmith-letter'));
    letter.set('name', '铁匠的信');
    letter.set('type', 'quest');
    letter.set('tradeable', false);

    const result = command.execute(player, ['铁匠的信', 'to', '白发药师']);

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      action: 'give',
      itemName: '铁匠的信',
      npcName: '白发药师',
      accepted: true,
    });
    expect(player.getInventory().includes(letter)).toBe(false);
    expect(npc.getInventory().includes(letter)).toBe(true);
  });

  it('非任务的不可交易物品仍然不能给予', async () => {
    const ledger = await giveToPlayer(new ItemBase('item/misc/ledger'));
    ledger.set('name', '账本');
    ledger.set('type', 'misc');
    ledger.set('tradeable', false);

    const result = command.execute(player, ['账本', 'to', '白发药师']);

    expect(result.success).toBe(false);
    expect(result.message).toContain('不能被交易');
    expect(player.getInventory().includes(ledger)).toBe(true);
    expect(npc.getInventory().includes(ledger)).toBe(false);
  });

  it('可交易物品在 NPC 拒绝时保留在玩家背包', async () => {
    const herb = await giveToPlayer(new ItemBase('item/misc/herb'));
    herb.set('name', '草药');
    herb.set('type', 'food');
    herb.set('tradeable', true);

    const result = command.execute(player, ['草药', 'to', '白发药师']);

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      action: 'give',
      itemName: '草药',
      npcName: '白发药师',
      accepted: false,
    });
    expect(player.getInventory().includes(herb)).toBe(true);
    expect(npc.getInventory().includes(herb)).toBe(false);
  });
});
