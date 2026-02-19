/**
 * 全局出口对称性测试
 *
 * 验证官道·中原段和洛阳废都所有房间的出口连接双向一致：
 * - A[dir] → B，则 B[reverse(dir)] → A
 * - 跨区域出口（连接到其他 area）也需要有回路
 */
import * as path from 'path';
import { BlueprintLoader } from '../blueprint-loader';
import { BlueprintRegistry } from '../blueprint-registry';
import { BlueprintFactory } from '../blueprint-factory';
import { ObjectManager } from '../object-manager';
import { RoomBase } from '../game-objects/room-base';
import { Area } from '../game-objects/area';

/** world 根目录 */
const WORLD_DIR = path.join(__dirname, '..', '..', 'world');

/** 方向反向映射 */
const REVERSE_DIR: Record<string, string> = {
  north: 'south',
  south: 'north',
  east: 'west',
  west: 'east',
  up: 'down',
  down: 'up',
};

/** 方向坐标偏移 */
const DIR_OFFSET: Record<string, { dx: number; dy: number; dz: number }> = {
  north: { dx: 0, dy: -1, dz: 0 },
  south: { dx: 0, dy: 1, dz: 0 },
  east: { dx: 1, dy: 0, dz: 0 },
  west: { dx: -1, dy: 0, dz: 0 },
  up: { dx: 0, dy: 0, dz: 1 },
  down: { dx: 0, dy: 0, dz: -1 },
};

/** 官道·中原段所有房间 */
const ROAD_CENTRAL_ROOMS = [
  'area/road-central/north-end',
  'area/road-central/dusty-road',
  'area/road-central/old-bridge',
  'area/road-central/crossroads',
  'area/road-central/south-end',
];

/** 洛阳废都所有房间 */
const CENTRAL_PLAIN_ROOMS = [
  'area/central-plain/north-gate',
  'area/central-plain/ruins-square',
  'area/central-plain/old-tavern',
  'area/central-plain/broken-hall',
];

/** 全部新增房间 */
const ALL_NEW_ROOMS = [...ROAD_CENTRAL_ROOMS, ...CENTRAL_PLAIN_ROOMS];

describe('Wave 1 地图出口对称性', () => {
  let registry: BlueprintRegistry;
  let objectManager: ObjectManager;
  let factory: BlueprintFactory;
  let loader: BlueprintLoader;

  beforeAll(async () => {
    registry = new BlueprintRegistry();
    objectManager = new ObjectManager();
    factory = new BlueprintFactory(registry, objectManager);
    loader = new BlueprintLoader(registry, factory, objectManager, {
      extensions: ['.js', '.ts'],
    });

    await loader.scanAndLoad(WORLD_DIR);
  });

  afterAll(() => {
    objectManager.onModuleDestroy();
    for (const key of Object.keys(require.cache)) {
      if (
        key.includes('world/area/road-central') ||
        key.includes('world/area/central-plain') ||
        key.includes('world/npc/road-central') ||
        key.includes('world/npc/central-plain')
      ) {
        delete require.cache[key];
      }
    }
  });

  it('应加载官道·中原段区域（Area + 5 Room）', () => {
    const area = objectManager.findById('area/road-central/area');
    expect(area).toBeDefined();
    expect(area).toBeInstanceOf(Area);

    const areaInstance = area as Area;
    const roomIds = areaInstance.getRoomIds();
    expect(roomIds).toHaveLength(5);

    for (const roomId of ROAD_CENTRAL_ROOMS) {
      expect(roomIds).toContain(roomId);
    }
  });

  it('应加载洛阳废都区域（Area + 4 Room）', () => {
    const area = objectManager.findById('area/central-plain/area');
    expect(area).toBeDefined();
    expect(area).toBeInstanceOf(Area);

    const areaInstance = area as Area;
    const roomIds = areaInstance.getRoomIds();
    expect(roomIds).toHaveLength(4);

    for (const roomId of CENTRAL_PLAIN_ROOMS) {
      expect(roomIds).toContain(roomId);
    }
  });

  it('所有新增房间应有 short/long/coordinates/exits', () => {
    for (const roomId of ALL_NEW_ROOMS) {
      const room = objectManager.findById(roomId) as RoomBase;
      expect(room).toBeDefined();

      const short = room.getShort();
      expect(short).toBeTruthy();
      expect(short).not.toBe('未知地点');

      const long = room.getLong();
      expect(long).toBeTruthy();
      expect(long).not.toBe('这里什么也没有。');

      const coords = room.getCoordinates();
      expect(coords).toBeDefined();
      expect(typeof coords!.x).toBe('number');
      expect(typeof coords!.y).toBe('number');

      const exits = room.getExits();
      expect(Object.keys(exits).length).toBeGreaterThan(0);
    }
  });

  it('官道·中原段出口连接应双向一致', () => {
    for (const roomId of ROAD_CENTRAL_ROOMS) {
      const room = objectManager.findById(roomId) as RoomBase;
      const exits = room.getExits();

      for (const [dir, targetId] of Object.entries(exits)) {
        const reverseDir = REVERSE_DIR[dir];
        // 仅校验四方向（north/south/east/west/up/down）
        if (!reverseDir) continue;

        const targetRoom = objectManager.findById(targetId) as RoomBase;
        expect(targetRoom).toBeDefined();

        const targetExits = targetRoom.getExits();
        expect(targetExits[reverseDir]).toBe(roomId);
      }
    }
  });

  it('洛阳废都出口连接应双向一致', () => {
    for (const roomId of CENTRAL_PLAIN_ROOMS) {
      const room = objectManager.findById(roomId) as RoomBase;
      const exits = room.getExits();

      for (const [dir, targetId] of Object.entries(exits)) {
        const reverseDir = REVERSE_DIR[dir];
        if (!reverseDir) continue;

        const targetRoom = objectManager.findById(targetId) as RoomBase;
        expect(targetRoom).toBeDefined();

        const targetExits = targetRoom.getExits();
        expect(targetExits[reverseDir]).toBe(roomId);
      }
    }
  });

  it('官道·中原段内部坐标应与方向偏移一致', () => {
    const roomIdSet = new Set(ROAD_CENTRAL_ROOMS);

    for (const roomId of ROAD_CENTRAL_ROOMS) {
      const room = objectManager.findById(roomId) as RoomBase;
      const coords = room.getCoordinates()!;
      const exits = room.getExits();

      for (const [dir, targetId] of Object.entries(exits)) {
        // 跨区域出口不校验坐标（各区域独立坐标系）
        if (!roomIdSet.has(targetId)) continue;

        const offset = DIR_OFFSET[dir];
        expect(offset).toBeDefined();

        const targetRoom = objectManager.findById(targetId) as RoomBase;
        const targetCoords = targetRoom.getCoordinates()!;

        expect(targetCoords.x).toBe(coords.x + offset.dx);
        expect(targetCoords.y).toBe(coords.y + offset.dy);
        expect(targetCoords.z ?? 0).toBe((coords.z ?? 0) + offset.dz);
      }
    }
  });

  it('洛阳废都内部坐标应与方向偏移一致', () => {
    const roomIdSet = new Set(CENTRAL_PLAIN_ROOMS);

    for (const roomId of CENTRAL_PLAIN_ROOMS) {
      const room = objectManager.findById(roomId) as RoomBase;
      const coords = room.getCoordinates()!;
      const exits = room.getExits();

      for (const [dir, targetId] of Object.entries(exits)) {
        // 跨区域出口不校验坐标（各区域独立坐标系）
        if (!roomIdSet.has(targetId)) continue;

        const offset = DIR_OFFSET[dir];
        expect(offset).toBeDefined();

        const targetRoom = objectManager.findById(targetId) as RoomBase;
        const targetCoords = targetRoom.getCoordinates()!;

        expect(targetCoords.x).toBe(coords.x + offset.dx);
        expect(targetCoords.y).toBe(coords.y + offset.dy);
        expect(targetCoords.z ?? 0).toBe((coords.z ?? 0) + offset.dz);
      }
    }
  });

  it('官道北端应连接裂隙镇南门', () => {
    const northEnd = objectManager.findById('area/road-central/north-end') as RoomBase;
    expect(northEnd.getExit('north')).toBe('area/rift-town/south-gate');

    // 反向：裂隙镇南门应有 south 出口指向官道北端
    const southGate = objectManager.findById('area/rift-town/south-gate') as RoomBase;
    expect(southGate.getExit('south')).toBe('area/road-central/north-end');
  });

  it('官道南端应连接洛阳废都北城门', () => {
    const southEnd = objectManager.findById('area/road-central/south-end') as RoomBase;
    expect(southEnd.getExit('south')).toBe('area/central-plain/north-gate');

    // 反向：洛阳废都北城门应有 north 出口指向官道南端
    const northGate = objectManager.findById('area/central-plain/north-gate') as RoomBase;
    expect(northGate.getExit('north')).toBe('area/road-central/south-end');
  });

  it('洛阳废都万宗广场应有 3 个出口（north/east/west）', () => {
    const ruinsSquare = objectManager.findById('area/central-plain/ruins-square') as RoomBase;
    const exits = ruinsSquare.getExits();
    const dirs = Object.keys(exits);

    expect(dirs).toHaveLength(3);
    expect(dirs).toContain('north');
    expect(dirs).toContain('east');
    expect(dirs).toContain('west');
  });

  it('残灯酒肆和断壁残殿应只有单方向出口连回广场', () => {
    const oldTavern = objectManager.findById('area/central-plain/old-tavern') as RoomBase;
    const tavernExits = oldTavern.getExits();
    expect(Object.keys(tavernExits)).toHaveLength(1);
    expect(tavernExits.east).toBe('area/central-plain/ruins-square');

    const brokenHall = objectManager.findById('area/central-plain/broken-hall') as RoomBase;
    const hallExits = brokenHall.getExits();
    expect(Object.keys(hallExits)).toHaveLength(1);
    expect(hallExits.west).toBe('area/central-plain/ruins-square');
  });

  it('官道·中原段 NPC 刷新规则应配置盗匪', () => {
    const area = objectManager.findById('area/road-central/area') as Area;
    const spawnRules = area.getSpawnRules();

    // 至少有 2 条盗匪刷新规则
    const banditRules = spawnRules.filter(
      (rule) => rule.blueprintId === 'npc/road-central/road-bandit',
    );
    expect(banditRules.length).toBeGreaterThanOrEqual(2);

    // 验证蓝图已注册
    expect(registry.has('npc/road-central/road-bandit')).toBe(true);
  });

  it('洛阳废都 NPC 刷新规则应配置 3 个 NPC', () => {
    const area = objectManager.findById('area/central-plain/area') as Area;
    const spawnRules = area.getSpawnRules();
    expect(spawnRules).toHaveLength(3);

    const blueprintIds = spawnRules.map((r) => r.blueprintId);
    expect(blueprintIds).toContain('npc/central-plain/xie-wenyuan');
    expect(blueprintIds).toContain('npc/central-plain/merchant-liu');
    expect(blueprintIds).toContain('npc/central-plain/city-guard');

    // 验证蓝图已注册
    expect(registry.has('npc/central-plain/xie-wenyuan')).toBe(true);
    expect(registry.has('npc/central-plain/merchant-liu')).toBe(true);
    expect(registry.has('npc/central-plain/city-guard')).toBe(true);
  });
});
