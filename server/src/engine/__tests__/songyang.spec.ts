/**
 * 嵩阳宗地图集成测试
 *
 * 验证:
 * - 区域与房间蓝图加载
 * - 房间出口与坐标一致
 * - 裂隙镇北门与嵩阳山道双向连通
 * - 门派 NPC 刷新规则完整
 */
import * as path from 'path';
import { BlueprintLoader } from '../blueprint-loader';
import { BlueprintRegistry } from '../blueprint-registry';
import { BlueprintFactory } from '../blueprint-factory';
import { ObjectManager } from '../object-manager';
import { RoomBase } from '../game-objects/room-base';
import { Area } from '../game-objects/area';

const WORLD_DIR = path.join(__dirname, '..', '..', 'world');

const ROOM_IDS = [
  'area/songyang/mountain-path',
  'area/songyang/gate',
  'area/songyang/drill-ground',
  'area/songyang/hall',
];

describe('嵩阳宗地图', () => {
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
      if (key.includes('world/area/songyang') || key.includes('world/npc/songyang')) {
        delete require.cache[key];
      }
    }
  });

  it('应加载嵩阳宗区域与房间蓝图', () => {
    const area = objectManager.findById('area/songyang/area');
    expect(area).toBeDefined();
    expect(area).toBeInstanceOf(Area);

    for (const roomId of ROOM_IDS) {
      const room = objectManager.findById(roomId);
      expect(room).toBeDefined();
      expect(room).toBeInstanceOf(RoomBase);
    }
  });

  it('Area 应包含 4 个房间与 3 条 NPC 刷新规则', () => {
    const area = objectManager.findById('area/songyang/area') as Area;
    const roomIds = area.getRoomIds();
    expect(roomIds).toHaveLength(4);
    for (const roomId of ROOM_IDS) {
      expect(roomIds).toContain(roomId);
    }

    const spawnRules = area.getSpawnRules();
    expect(spawnRules).toHaveLength(3);
    expect(spawnRules.map((x) => x.blueprintId)).toEqual(
      expect.arrayContaining([
        'npc/songyang/master-li',
        'npc/songyang/deacon-zhao',
        'npc/songyang/sparring-disciple',
      ]),
    );
  });

  it('嵩阳山道应与裂隙镇北门双向连通', () => {
    const mountainPath = objectManager.findById('area/songyang/mountain-path') as RoomBase;
    const northGate = objectManager.findById('area/rift-town/north-gate') as RoomBase;

    expect(mountainPath.getExit('south')).toBe('area/rift-town/north-gate');
    expect(northGate.getExit('north')).toBe('area/songyang/mountain-path');
  });

  it('房间坐标应与出口方向一致', () => {
    const mountainPath = objectManager.findById('area/songyang/mountain-path') as RoomBase;
    const gate = objectManager.findById('area/songyang/gate') as RoomBase;
    const hall = objectManager.findById('area/songyang/hall') as RoomBase;
    const drillGround = objectManager.findById('area/songyang/drill-ground') as RoomBase;
    const northGate = objectManager.findById('area/rift-town/north-gate') as RoomBase;

    expect(gate.getCoordinates()).toEqual({ x: 0, y: -5, z: 0 });
    expect(mountainPath.getCoordinates()).toEqual({ x: 0, y: -4, z: 0 });
    expect(hall.getCoordinates()).toEqual({ x: 0, y: -6, z: 0 });
    expect(drillGround.getCoordinates()).toEqual({ x: 1, y: -5, z: 0 });

    expect(mountainPath.getExit('north')).toBe('area/songyang/gate');
    expect(gate.getExit('south')).toBe('area/songyang/mountain-path');

    expect(gate.getExit('north')).toBe('area/songyang/hall');
    expect(hall.getExit('south')).toBe('area/songyang/gate');

    expect(gate.getExit('east')).toBe('area/songyang/drill-ground');
    expect(drillGround.getExit('west')).toBe('area/songyang/gate');

    expect(northGate.getCoordinates()).toEqual({ x: 0, y: -3, z: 0 });
    expect(mountainPath.getCoordinates()).toEqual({ x: 0, y: -4, z: 0 });
  });
});
