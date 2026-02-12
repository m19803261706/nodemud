/**
 * 裂隙镇地图集成测试
 *
 * 验证:
 * - 蓝图加载（1 Area + 19 Room）
 * - 出口连接双向一致性
 * - 坐标与方向偏移一致性
 * - 房间属性完整性
 */
import * as path from 'path';
import { BlueprintLoader } from '../blueprint-loader';
import { BlueprintRegistry } from '../blueprint-registry';
import { BlueprintFactory } from '../blueprint-factory';
import { ObjectManager } from '../object-manager';
import { RoomBase } from '../game-objects/room-base';
import { Area } from '../game-objects/area';

/** 裂隙镇 world 目录 */
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

/** 所有房间蓝图 ID */
const ROOM_IDS = [
  'area/rift-town/square',
  'area/rift-town/north-street',
  'area/rift-town/south-street',
  'area/rift-town/tavern',
  'area/rift-town/inn',
  'area/rift-town/inn-upstairs',
  'area/rift-town/herb-shop',
  'area/rift-town/smithy',
  'area/rift-town/martial-hall',
  'area/rift-town/training-yard',
  'area/rift-town/notice-board',
  'area/rift-town/academy',
  'area/rift-town/academy-library',
  'area/rift-town/general-store',
  'area/rift-town/north-road',
  'area/rift-town/south-road',
  'area/rift-town/north-gate',
  'area/rift-town/south-gate',
  'area/rift-town/underground',
];

describe('裂隙镇地图', () => {
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
      if (key.includes('world/area/rift-town') || key.includes('world/npc/rift-town')) {
        delete require.cache[key];
      }
    }
  });

  it('应加载蓝图（Area + Room + NPC + Item）', () => {
    // 1 Area + 19 Room + NPC 蓝图 + 装备蓝图
    expect(registry.getCount()).toBeGreaterThanOrEqual(19);
  });

  it('Area 应包含全部 19 个房间 ID', () => {
    const area = objectManager.findById('area/rift-town/area');
    expect(area).toBeDefined();
    expect(area).toBeInstanceOf(Area);

    const areaInstance = area as Area;
    const roomIds = areaInstance.getRoomIds();
    expect(roomIds).toHaveLength(19);

    for (const roomId of ROOM_IDS) {
      expect(roomIds).toContain(roomId);
    }
  });

  it('所有房间应有 short/long/coordinates/exits', () => {
    for (const roomId of ROOM_IDS) {
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

  it('出口连接应双向一致', () => {
    for (const roomId of ROOM_IDS) {
      const room = objectManager.findById(roomId) as RoomBase;
      const exits = room.getExits();

      for (const [dir, targetId] of Object.entries(exits)) {
        const reverseDir = REVERSE_DIR[dir];
        expect(reverseDir).toBeDefined();

        const targetRoom = objectManager.findById(targetId) as RoomBase;
        expect(targetRoom).toBeDefined();

        const targetExits = targetRoom.getExits();
        expect(targetExits[reverseDir]).toBe(roomId);
      }
    }
  });

  it('坐标应与方向偏移一致', () => {
    for (const roomId of ROOM_IDS) {
      const room = objectManager.findById(roomId) as RoomBase;
      const coords = room.getCoordinates()!;
      const exits = room.getExits();

      for (const [dir, targetId] of Object.entries(exits)) {
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

  it('镇中广场应有 5 个出口（含 down）', () => {
    const square = objectManager.findById('area/rift-town/square') as RoomBase;
    const exits = square.getExits();
    const dirs = Object.keys(exits);

    expect(dirs).toHaveLength(5);
    expect(dirs).toContain('north');
    expect(dirs).toContain('south');
    expect(dirs).toContain('east');
    expect(dirs).toContain('west');
    expect(dirs).toContain('down');
  });

  it('武馆与书院公共教习应配置在刷新规则中', () => {
    const area = objectManager.findById('area/rift-town/area') as Area;
    const spawnRuleMap = new Map(
      area.getSpawnRules().map((rule) => [rule.blueprintId, rule.roomId]),
    );

    expect(spawnRuleMap.get('npc/rift-town/martial-instructor')).toBe(
      'area/rift-town/martial-hall',
    );
    expect(spawnRuleMap.get('npc/rift-town/academy-lecturer')).toBe('area/rift-town/academy');

    expect(registry.has('npc/rift-town/martial-instructor')).toBe(true);
    expect(registry.has('npc/rift-town/academy-lecturer')).toBe(true);
  });

  it('北门应连通山道，南门保持单出口', () => {
    const northGate = objectManager.findById('area/rift-town/north-gate') as RoomBase;
    expect(Object.keys(northGate.getExits())).toHaveLength(2);
    expect(northGate.getExit('south')).toBe('area/rift-town/north-road');
    expect(northGate.getExit('north')).toBe('area/songyang/mountain-path');

    const southGate = objectManager.findById('area/rift-town/south-gate') as RoomBase;
    expect(Object.keys(southGate.getExits())).toHaveLength(1);
    expect(southGate.getExit('north')).toBe('area/rift-town/south-road');
  });

  it('地下暗道应只有 up 出口', () => {
    const underground = objectManager.findById('area/rift-town/underground') as RoomBase;
    const exits = underground.getExits();

    expect(Object.keys(exits)).toHaveLength(1);
    expect(exits.up).toBe('area/rift-town/square');
  });
});
