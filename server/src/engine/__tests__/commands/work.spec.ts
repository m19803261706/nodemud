import { WorkCommand } from '../../commands/std/work';
import { NpcBase } from '../../game-objects/npc-base';
import { PlayerBase } from '../../game-objects/player-base';
import { RoomBase } from '../../game-objects/room-base';
import { ServiceLocator } from '../../service-locator';

describe('work 指令', () => {
  let room: RoomBase;
  let player: PlayerBase;
  let npc: NpcBase;

  beforeEach(async () => {
    ServiceLocator.reset();
    room = new RoomBase('room/test-work');
    player = new PlayerBase('player/test-work');
    player.set('name', '测试玩家');
    await player.moveTo(room, { quiet: true });

    npc = new NpcBase('npc/rift-town/academy-lecturer#1');
    npc.set('name', '温夫子');
    await npc.moveTo(room, { quiet: true });
  });

  afterEach(() => {
    ServiceLocator.reset();
  });

  it('work list 应路由到 workManager.openWorkList', () => {
    const openWorkList = jest.fn().mockReturnValue({ success: true, data: { action: 'work_list' } });
    (ServiceLocator as any).workManager = { openWorkList };

    const cmd = new WorkCommand();
    const result = cmd.execute(player, ['list', '温夫子']);

    expect(result.success).toBe(true);
    expect(openWorkList).toHaveBeenCalledWith(player, npc);
  });

  it('work start 应路由到 workManager.startWork', () => {
    const startWork = jest.fn().mockReturnValue({ success: true, data: { action: 'work_start' } });
    (ServiceLocator as any).workManager = { startWork };

    const cmd = new WorkCommand();
    const result = cmd.execute(player, [
      'start',
      'rift.copy-script',
      '5',
      'npc/rift-town/academy-lecturer#1',
    ]);

    expect(result.success).toBe(true);
    expect(startWork).toHaveBeenCalledWith(player, {
      npc,
      jobId: 'rift.copy-script',
      plan: '5',
    });
  });

  it('work stop 应路由到 workManager.stopWork', () => {
    const stopWork = jest.fn().mockReturnValue({ success: true, data: { action: 'work_stop' } });
    (ServiceLocator as any).workManager = { stopWork };

    const cmd = new WorkCommand();
    const result = cmd.execute(player, ['stop']);

    expect(result.success).toBe(true);
    expect(stopWork).toHaveBeenCalledWith(player, 'manual');
  });

  it('work <npc> 简写应等价于 work list <npc>', () => {
    const openWorkList = jest.fn().mockReturnValue({ success: true, data: { action: 'work_list' } });
    (ServiceLocator as any).workManager = { openWorkList };

    const cmd = new WorkCommand();
    const result = cmd.execute(player, ['温夫子']);

    expect(result.success).toBe(true);
    expect(openWorkList).toHaveBeenCalledWith(player, npc);
  });
});
