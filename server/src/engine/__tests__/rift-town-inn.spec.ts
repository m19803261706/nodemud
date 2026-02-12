import { PlayerBase } from '../game-objects/player-base';
import RiftTownInn from '../../world/area/rift-town/inn';
import RiftTownInnUpstairs from '../../world/area/rift-town/inn-upstairs';

describe('裂隙镇客栈二楼门禁与休息', () => {
  let inn: RiftTownInn;
  let upstairs: RiftTownInnUpstairs;
  let player: PlayerBase;

  beforeEach(async () => {
    inn = new RiftTownInn('area/rift-town/inn');
    inn.create();

    upstairs = new RiftTownInnUpstairs('area/rift-town/inn-upstairs');
    upstairs.create();

    player = new PlayerBase('player/inn-test');
    player.set('name', '过路客');
    player.set('max_energy', 220);
    player.set('energy', 40);
    await player.moveTo(inn, { quiet: true });
  });

  it('未付房钱时上楼应被拦截', async () => {
    const moved = await player.moveTo(upstairs);

    expect(moved).toBe(false);
    expect(player.getEnvironment()).toBe(inn);
  });

  it('付费凭证有效时可上楼，且精力恢复并消耗凭证', async () => {
    player.setTemp('inn/rift_town_rent_pass_until', Date.now() + 60_000);

    const moved = await player.moveTo(upstairs);

    expect(moved).toBe(true);
    expect(player.getEnvironment()).toBe(upstairs);
    expect(player.get<number>('energy')).toBe(220);
    expect(player.getTemp<number>('inn/rift_town_rent_pass_until')).toBe(0);
  });
});
