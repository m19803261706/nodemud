import { AskCommand } from '../../commands/std/ask';
import { PlayerBase } from '../../game-objects/player-base';
import { RoomBase } from '../../game-objects/room-base';
import SongyangGateDisciple from '../../../world/npc/songyang/gate-disciple';

describe('AskCommand - 守山来意', () => {
  it('向守山弟子说明来意后，应获得短时通行许可', async () => {
    const room = new RoomBase('area/songyang/mountain-path');
    const player = new PlayerBase('player/test');
    player.set('name', '测试玩家');
    await player.moveTo(room, { quiet: true });

    const guard = new SongyangGateDisciple('npc/songyang/gate-disciple#1');
    guard.create();
    await guard.moveTo(room, { quiet: true });

    const cmd = new AskCommand();
    const result = cmd.execute(player, ['守山弟子', 'about', '来意']);

    expect(result.success).toBe(true);
    expect(result.message).toContain('来意');
    const passUntil = player.getTemp<number>('sect/songyang_gate_pass_until') ?? 0;
    expect(passUntil).toBeGreaterThan(Date.now());
  });
});
