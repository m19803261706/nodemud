/**
 * Area 区域管理器 单元测试
 */
import { Area } from '../game-objects/area';
import type { SpawnRule } from '../game-objects/area';

describe('Area 区域管理器', () => {
  let area: Area;

  beforeEach(() => {
    area = new Area('area/yangzhou');
  });

  // ========== static virtual ==========

  it('static virtual 应为 true', () => {
    expect(Area.virtual).toBe(true);
  });

  // ========== getName ==========

  describe('getName()', () => {
    it('设置 name 后返回对应值', () => {
      area.set('name', '扬州城');
      expect(area.getName()).toBe('扬州城');
    });

    it('未设置 name 时返回默认值"未知区域"', () => {
      expect(area.getName()).toBe('未知区域');
    });
  });

  // ========== getLevelRange ==========

  describe('getLevelRange()', () => {
    it('设置 level_range 后返回对应值', () => {
      const range = { min: 1, max: 10 };
      area.set('level_range', range);
      expect(area.getLevelRange()).toEqual({ min: 1, max: 10 });
    });

    it('未设置 level_range 时返回 undefined', () => {
      expect(area.getLevelRange()).toBeUndefined();
    });
  });

  // ========== getRoomIds ==========

  describe('getRoomIds()', () => {
    it('设置 rooms 后返回对应列表', () => {
      const rooms = ['yangzhou/inn', 'yangzhou/market', 'yangzhou/gate'];
      area.set('rooms', rooms);
      expect(area.getRoomIds()).toEqual(rooms);
    });

    it('未设置 rooms 时返回空数组', () => {
      expect(area.getRoomIds()).toEqual([]);
    });
  });

  // ========== getSpawnRules ==========

  describe('getSpawnRules()', () => {
    it('设置 spawn_rules 后返回对应规则', () => {
      const rules: SpawnRule[] = [
        { blueprintId: 'npc/guard', roomId: 'yangzhou/gate', count: 2, interval: 60000 },
        { blueprintId: 'npc/merchant', roomId: 'yangzhou/market', count: 1, interval: 120000 },
      ];
      area.set('spawn_rules', rules);
      expect(area.getSpawnRules()).toEqual(rules);
    });

    it('未设置 spawn_rules 时返回空数组', () => {
      expect(area.getSpawnRules()).toEqual([]);
    });
  });
});
