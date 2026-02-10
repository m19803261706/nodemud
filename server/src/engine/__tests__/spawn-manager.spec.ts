import { SpawnManager } from '../spawn-manager';
import { Area } from '../game-objects/area';
import { NpcBase } from '../game-objects/npc-base';
import { RoomBase } from '../game-objects/room-base';

describe('SpawnManager', () => {
  it('spawnAll 会把 spawn 规则写入 NPC 临时数据', () => {
    const area = new Area('area/test');
    area.set('spawn_rules', [
      {
        blueprintId: 'npc/test/bandit',
        roomId: 'room/test',
        count: 1,
        interval: 45000,
      },
    ]);
    area.set('item_spawn_rules', []);

    const room = new RoomBase('room/test');
    const npc = new NpcBase('npc/test/bandit#1');
    const enableHeartbeatSpy = jest.spyOn(npc, 'enableHeartbeat').mockImplementation(() => {});

    const objectManager = {
      findAll: jest.fn((predicate: (e: unknown) => boolean) =>
        [area].filter((entity) => predicate(entity)),
      ),
      findById: jest.fn((id: string) => (id === room.id ? room : undefined)),
    };
    const blueprintFactory = {
      clone: jest.fn((blueprintId: string) => {
        if (blueprintId === 'npc/test/bandit') return npc;
        throw new Error(`unexpected blueprintId: ${blueprintId}`);
      }),
    };

    const spawnManager = new SpawnManager(objectManager as any, blueprintFactory as any);
    spawnManager.spawnAll();

    expect(npc.getTemp('spawn/blueprintId')).toBe('npc/test/bandit');
    expect(npc.getTemp('spawn/roomId')).toBe('room/test');
    expect(npc.getTemp('spawn/interval')).toBe(45000);
    expect(enableHeartbeatSpy).toHaveBeenCalledWith(2000);
  });

  it('scheduleRespawn 会按延迟调度 respawnNpc 并透传间隔', () => {
    jest.useFakeTimers();

    const spawnManager = new SpawnManager({} as any, {} as any);
    const respawnSpy = jest.spyOn(spawnManager, 'respawnNpc').mockImplementation(() => undefined);

    spawnManager.scheduleRespawn('npc/test/bandit', 'room/test', 1234);
    jest.advanceTimersByTime(1234);

    expect(respawnSpy).toHaveBeenCalledWith('npc/test/bandit', 'room/test', 1234);
    jest.useRealTimers();
  });
});
