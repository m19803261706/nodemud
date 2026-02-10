import { PlayerBase } from '../game-objects/player-base';
import SongyangMountainPath from '../../world/area/songyang/mountain-path';
import SongyangGate from '../../world/area/songyang/gate';
import SongyangGateDisciple from '../../world/npc/songyang/gate-disciple';

const GATE_PASS_TEMP_KEY = 'sect/songyang_gate_pass_until';

describe('嵩阳山门门禁事件', () => {
  let mountainPath: SongyangMountainPath;
  let gate: SongyangGate;
  let outsider: PlayerBase;

  beforeEach(async () => {
    mountainPath = new SongyangMountainPath('area/songyang/mountain-path');
    mountainPath.create();

    gate = new SongyangGate('area/songyang/gate');
    gate.create();

    outsider = new PlayerBase('player/outsider');
    outsider.set('name', '过路人');
    await outsider.moveTo(mountainPath, { quiet: true });
  });

  it('守山弟子在场且外来者无许可时，应拦截进入山门', async () => {
    await spawnGuardInMountainPath();

    const moved = await outsider.moveTo(gate);

    expect(moved).toBe(false);
    expect(outsider.getEnvironment()).toBe(mountainPath);
  });

  it('守山弟子在场且外来者持许可时，应放行并消耗许可', async () => {
    await spawnGuardInMountainPath();
    outsider.setTemp(GATE_PASS_TEMP_KEY, Date.now() + 30_000);

    const moved = await outsider.moveTo(gate);

    expect(moved).toBe(true);
    expect(outsider.getEnvironment()).toBe(gate);
    expect(outsider.getTemp(GATE_PASS_TEMP_KEY)).toBe(0);
  });

  it('嵩阳同门不应被守山弟子阻拦', async () => {
    await spawnGuardInMountainPath();
    outsider.set('sect', { current: { sectId: 'songyang' } });

    const moved = await outsider.moveTo(gate);

    expect(moved).toBe(true);
    expect(outsider.getEnvironment()).toBe(gate);
  });

  it('守山弟子不在场时，不触发门禁拦路', async () => {
    const moved = await outsider.moveTo(gate);

    expect(moved).toBe(true);
    expect(outsider.getEnvironment()).toBe(gate);
  });

  it('守山弟子被击溃后，不再触发门禁拦路', async () => {
    const guard = await spawnGuardInMountainPath();
    guard.destroy();

    const moved = await outsider.moveTo(gate);

    expect(moved).toBe(true);
    expect(outsider.getEnvironment()).toBe(gate);
  });

  async function spawnGuardInMountainPath(): Promise<SongyangGateDisciple> {
    const guard = new SongyangGateDisciple('npc/songyang/gate-disciple#1');
    guard.create();
    await guard.moveTo(mountainPath, { quiet: true });
    return guard;
  }
});
