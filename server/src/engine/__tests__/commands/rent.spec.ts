import { RentCommand } from '../../commands/std/rent';
import { PlayerBase } from '../../game-objects/player-base';
import { RoomBase } from '../../game-objects/room-base';
import { NpcBase } from '../../game-objects/npc-base';

describe('rent 指令', () => {
  let cmd: RentCommand;
  let room: RoomBase;
  let player: PlayerBase;

  beforeEach(async () => {
    cmd = new RentCommand();

    room = new RoomBase('area/rift-town/inn');
    room.set('short', '裂隙镇·安歇客栈');
    room.set('exits', { up: 'area/rift-town/inn-upstairs' });

    player = new PlayerBase('player/test-rent');
    player.set('name', '测试少侠');
    player.set('silver', 100);
    await player.moveTo(room, { quiet: true });
  });

  it('找不到可住店 NPC 时应失败', () => {
    const result = cmd.execute(player, ['店小二']);
    expect(result.success).toBe(false);
    expect(result.message).toContain('没人能替你安排住店');
  });

  it('银两不足时应拒绝住店', async () => {
    const waiter = new NpcBase('npc/rift-town/waiter#1');
    waiter.set('name', '店小二');
    waiter.set('short', '店小二');
    waiter.set('can_rent_room', true);
    waiter.set('rent_price', 120);
    await waiter.moveTo(room, { quiet: true });

    const result = cmd.execute(player, ['店小二']);
    expect(result.success).toBe(false);
    expect(result.message).toContain('房钱 120 两');
    expect(player.getSilver()).toBe(100);
  });

  it('住店成功应扣银并给出上楼移动意图', async () => {
    const waiter = new NpcBase('npc/rift-town/waiter#1');
    waiter.set('name', '店小二');
    waiter.set('short', '店小二');
    waiter.set('can_rent_room', true);
    waiter.set('rent_price', 18);
    await waiter.moveTo(room, { quiet: true });

    const result = cmd.execute(player, ['店小二']);

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      action: 'rent_room',
      npcId: waiter.id,
      targetId: 'area/rift-town/inn-upstairs',
      direction: 'up',
      silverSpent: 18,
    });
    expect(player.getSilver()).toBe(82);

    const passUntil = player.getTemp<number>('inn/rift_town_rent_pass_until') ?? 0;
    expect(passUntil).toBeGreaterThan(Date.now());
  });
});
