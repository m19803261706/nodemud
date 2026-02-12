import { NpcBase } from '../game-objects/npc-base';
import { PlayerBase } from '../game-objects/player-base';
import { RoomBase } from '../game-objects/room-base';
import { ServiceLocator } from '../service-locator';
import { WorkManager } from '../work/work-manager';

function todayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = `${now.getMonth() + 1}`.padStart(2, '0');
  const d = `${now.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

describe('WorkManager', () => {
  let manager: WorkManager;
  let room: RoomBase;
  let player: PlayerBase;
  let npc: NpcBase;

  beforeEach(async () => {
    jest.useFakeTimers();
    ServiceLocator.reset();

    manager = new WorkManager();
    room = new RoomBase('room/work-hall');
    player = new PlayerBase('player/worker');
    player.set('name', '打工仔');
    player.set('level', 5);
    player.set('exp', 1200);
    player.set('score', 100);
    player.set('hp', 120);
    player.set('energy', 90);
    player.set('potential', 0);
    player.set('silver', 0);
    player.set('wisdom', 10);
    player.set('perception', 10);
    player.set('strength', 10);
    player.set('vitality', 10);
    await player.moveTo(room, { quiet: true });

    npc = new NpcBase('npc/rift-town/academy-lecturer#1');
    npc.set('name', '温夫子');
    await npc.moveTo(room, { quiet: true });

    const registry = new Map<string, any>([
      [player.id, player],
      [npc.id, npc],
    ]);
    (ServiceLocator as any).objectManager = {
      findById: (id: string) => registry.get(id),
    };
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    ServiceLocator.reset();
  });

  it('openWorkList 应返回打工工单', () => {
    const result = manager.openWorkList(player, npc);
    expect(result.success).toBe(true);
    expect(result.data?.action).toBe('work_list');
    expect(Array.isArray(result.data?.jobs)).toBe(true);
    expect(result.data?.jobs.length).toBeGreaterThan(0);
  });

  it('startWork 1轮应自动结算并结束会话', () => {
    const start = manager.startWork(player, {
      npc,
      jobId: 'rift.copy-script',
      plan: '1',
    });

    expect(start.success).toBe(true);
    expect(manager.isInWork(player)).toBe(true);

    jest.advanceTimersByTime(2600);

    expect(manager.isInWork(player)).toBe(false);
    expect((player.get<number>('exp') ?? 0) > 1200).toBe(true);
    expect((player.get<number>('potential') ?? 0) > 0).toBe(true);
    expect((player.get<number>('silver') ?? 0) > 0).toBe(true);

    const work = player.get<any>('work');
    expect(work?.daily?.dateKey).toBe(todayKey());
    expect(work?.daily?.cycles).toBeGreaterThan(0);
  });

  it('超过新手阈值应无法开工', () => {
    player.set('level', 18);

    const start = manager.startWork(player, {
      npc,
      jobId: 'rift.copy-script',
      plan: '5',
    });

    expect(start.success).toBe(false);
    expect(start.message).toContain('更大的江湖');
  });

  it('在工单中应给超出新手阈值玩家标记不可接', () => {
    player.set('exp', 150000);

    const result = manager.openWorkList(player, npc);
    expect(result.success).toBe(true);
    const jobs = result.data?.jobs ?? [];
    expect(jobs.length).toBeGreaterThan(0);
    expect(jobs.every((job: any) => job.eligible === false)).toBe(true);
  });
});
