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
  // 宗门核心区
  'area/songyang/master-retreat',
  'area/songyang/practice-cliff',
  'area/songyang/tianyan-stele',
  'area/songyang/meditation-room',
  'area/songyang/scripture-pavilion',
  'area/songyang/hall',
  'area/songyang/deacon-court',
  'area/songyang/discipline-hall',
  'area/songyang/disciples-yard',
  'area/songyang/herb-garden',
  'area/songyang/gate',
  'area/songyang/drill-ground',
  'area/songyang/armory',
  // 嵩阳山道
  'area/songyang/mountain-path',
  'area/songyang/pine-pavilion',
  'area/songyang/mountain-path-middle',
  'area/songyang/mountain-stream',
  'area/songyang/rocky-slope',
  'area/songyang/mountain-path-lower',
  // 官道
  'area/songyang/road-songshan',
  'area/songyang/road-rift',
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

  it('Area 应包含 21 个房间与 14 条 NPC 刷新规则', () => {
    const area = objectManager.findById('area/songyang/area') as Area;
    const roomIds = area.getRoomIds();
    expect(roomIds).toHaveLength(21);
    for (const roomId of ROOM_IDS) {
      expect(roomIds).toContain(roomId);
    }

    const spawnRules = area.getSpawnRules();
    expect(spawnRules).toHaveLength(14);
    expect(spawnRules.map((x) => x.blueprintId)).toEqual(
      expect.arrayContaining([
        // 原有 NPC
        'npc/songyang/master-li',
        'npc/songyang/deacon-zhao',
        'npc/songyang/sparring-disciple',
        'npc/songyang/elder-xu',
        'npc/songyang/discipline-elder-lu',
        'npc/songyang/senior-disciple-lin',
        'npc/songyang/mentor-he',
        'npc/songyang/gate-disciple',
        // 新增 NPC
        'npc/songyang/herb-disciple',
        'npc/songyang/patrol-disciple',
        'npc/songyang/mountain-bandit',
        'npc/songyang/bandit-leader',
        'npc/songyang/wild-wolf',
      ]),
    );
  });

  it('嵩阳山道经官道与裂隙镇北门连通', () => {
    const mountainPath = objectManager.findById('area/songyang/mountain-path') as RoomBase;
    const roadRift = objectManager.findById('area/songyang/road-rift') as RoomBase;
    const northGate = objectManager.findById('area/rift-town/north-gate') as RoomBase;

    // 山道·上段 → 古松亭（不再直连北门）
    expect(mountainPath.getExit('south')).toBe('area/songyang/pine-pavilion');
    // 官道·裂谷段 → 北门
    expect(roadRift.getExit('south')).toBe('area/rift-town/north-gate');
    // 北门 → 官道·裂谷段
    expect(northGate.getExit('north')).toBe('area/songyang/road-rift');
  });

  it('房间坐标应与出口方向一致', () => {
    const mountainPath = objectManager.findById('area/songyang/mountain-path') as RoomBase;
    const gate = objectManager.findById('area/songyang/gate') as RoomBase;
    const hall = objectManager.findById('area/songyang/hall') as RoomBase;
    const drillGround = objectManager.findById('area/songyang/drill-ground') as RoomBase;
    const disciplesYard = objectManager.findById('area/songyang/disciples-yard') as RoomBase;
    const scripturePavilion = objectManager.findById(
      'area/songyang/scripture-pavilion',
    ) as RoomBase;
    const deaconCourt = objectManager.findById('area/songyang/deacon-court') as RoomBase;
    const meditationRoom = objectManager.findById('area/songyang/meditation-room') as RoomBase;
    const armory = objectManager.findById('area/songyang/armory') as RoomBase;
    const northGate = objectManager.findById('area/rift-town/north-gate') as RoomBase;

    expect(gate.getCoordinates()).toEqual({ x: 0, y: -5, z: 0 });
    expect(mountainPath.getCoordinates()).toEqual({ x: 0, y: -4, z: 0 });
    expect(hall.getCoordinates()).toEqual({ x: 0, y: -6, z: 0 });
    expect(drillGround.getCoordinates()).toEqual({ x: 1, y: -5, z: 0 });
    expect(disciplesYard.getCoordinates()).toEqual({ x: -1, y: -5, z: 0 });
    expect(scripturePavilion.getCoordinates()).toEqual({ x: -1, y: -6, z: 0 });
    expect(deaconCourt.getCoordinates()).toEqual({ x: 1, y: -6, z: 0 });
    expect(meditationRoom.getCoordinates()).toEqual({ x: 0, y: -7, z: 0 });
    expect(armory.getCoordinates()).toEqual({ x: 2, y: -5, z: 0 });

    expect(mountainPath.getExit('north')).toBe('area/songyang/gate');
    expect(gate.getExit('south')).toBe('area/songyang/mountain-path');

    expect(gate.getExit('north')).toBe('area/songyang/hall');
    expect(hall.getExit('south')).toBe('area/songyang/gate');

    expect(gate.getExit('east')).toBe('area/songyang/drill-ground');
    expect(drillGround.getExit('west')).toBe('area/songyang/gate');

    expect(gate.getExit('west')).toBe('area/songyang/disciples-yard');
    expect(disciplesYard.getExit('east')).toBe('area/songyang/gate');

    expect(disciplesYard.getExit('north')).toBe('area/songyang/scripture-pavilion');
    expect(scripturePavilion.getExit('south')).toBe('area/songyang/disciples-yard');

    expect(scripturePavilion.getExit('east')).toBe('area/songyang/hall');
    expect(hall.getExit('west')).toBe('area/songyang/scripture-pavilion');

    expect(hall.getExit('east')).toBe('area/songyang/deacon-court');
    expect(deaconCourt.getExit('west')).toBe('area/songyang/hall');

    expect(hall.getExit('north')).toBe('area/songyang/meditation-room');
    expect(meditationRoom.getExit('south')).toBe('area/songyang/hall');

    expect(drillGround.getExit('east')).toBe('area/songyang/armory');
    expect(armory.getExit('west')).toBe('area/songyang/drill-ground');

    expect(northGate.getCoordinates()).toEqual({ x: 0, y: -3, z: 0 });
    expect(mountainPath.getCoordinates()).toEqual({ x: 0, y: -4, z: 0 });
  });
});
