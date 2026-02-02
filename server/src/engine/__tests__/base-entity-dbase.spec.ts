/**
 * BaseEntity Dbase 动态属性系统 单元测试
 */
import { BaseEntity } from '../base-entity';
import type { Blueprint } from '../types/dbase';

/** 测试用具体子类（BaseEntity 是 abstract） */
class TestEntity extends BaseEntity {
  constructor(id: string, blueprint?: Blueprint) {
    super(id, blueprint);
  }
}

/** 创建测试用蓝图 */
function createBlueprint(id: string, data: Record<string, any>): Blueprint {
  return {
    id,
    dbase: data,
    getDbaseValue<T = any>(path: string): T | undefined {
      const parts = path.split('/');
      let current: any = this.dbase;
      for (const part of parts) {
        if (current === undefined || current === null) return undefined;
        current = current[part];
      }
      return current as T | undefined;
    },
  };
}

describe('BaseEntity Dbase 动态属性系统', () => {
  let entity: TestEntity;

  beforeEach(() => {
    entity = new TestEntity('test/entity');
  });

  describe('set / get 基础操作', () => {
    it('设置和获取单层属性', () => {
      entity.set('name', '店小二');
      expect(entity.get('name')).toBe('店小二');
    });

    it('设置和获取嵌套属性', () => {
      entity.set('combat/attack', 100);
      expect(entity.get('combat/attack')).toBe(100);
    });

    it('三层嵌套属性', () => {
      entity.set('skills/sword/level', 5);
      expect(entity.get('skills/sword/level')).toBe(5);
    });

    it('中间层自动创建', () => {
      entity.set('a/b/c', 'deep');
      expect(entity.get('a/b/c')).toBe('deep');
    });

    it('不存在的属性返回 undefined', () => {
      expect(entity.get('nonexistent')).toBeUndefined();
      expect(entity.get('a/b/c')).toBeUndefined();
    });

    it('覆盖已有值', () => {
      entity.set('hp', 100);
      entity.set('hp', 200);
      expect(entity.get('hp')).toBe(200);
    });

    it('设置不同类型的值', () => {
      entity.set('name', '测试');
      entity.set('level', 10);
      entity.set('active', true);
      entity.set('items', [1, 2, 3]);
      entity.set('meta', { key: 'value' });

      expect(entity.get('name')).toBe('测试');
      expect(entity.get('level')).toBe(10);
      expect(entity.get('active')).toBe(true);
      expect(entity.get('items')).toEqual([1, 2, 3]);
      expect(entity.get('meta')).toEqual({ key: 'value' });
    });
  });

  describe('add 累加操作', () => {
    it('累加数值属性', () => {
      entity.set('combat/attack', 100);
      entity.add('combat/attack', 20);
      expect(entity.get('combat/attack')).toBe(120);
    });

    it('不存在的属性从 0 开始累加', () => {
      entity.add('gold', 50);
      expect(entity.get('gold')).toBe(50);
    });

    it('负数累加（减少）', () => {
      entity.set('hp', 100);
      entity.add('hp', -30);
      expect(entity.get('hp')).toBe(70);
    });
  });

  describe('del 删除操作', () => {
    it('删除单层属性', () => {
      entity.set('name', '测试');
      expect(entity.del('name')).toBe(true);
      expect(entity.get('name')).toBeUndefined();
    });

    it('删除嵌套属性', () => {
      entity.set('combat/attack', 100);
      expect(entity.del('combat/attack')).toBe(true);
      expect(entity.get('combat/attack')).toBeUndefined();
    });

    it('删除不存在的属性返回 false', () => {
      expect(entity.del('nonexistent')).toBe(false);
    });
  });

  describe('蓝图原型链', () => {
    it('本地无属性时回退蓝图', () => {
      const bp = createBlueprint('npc/guard', {
        name: '守卫',
        combat: { attack: 50, defense: 30 },
      });
      const npc = new TestEntity('npc/guard#1', bp);

      expect(npc.get('name')).toBe('守卫');
      expect(npc.get('combat/attack')).toBe(50);
    });

    it('本地属性覆盖蓝图', () => {
      const bp = createBlueprint('npc/guard', {
        name: '守卫',
        hp: 100,
      });
      const npc = new TestEntity('npc/guard#1', bp);
      npc.set('hp', 80);

      expect(npc.get('hp')).toBe(80);
      expect(npc.get('name')).toBe('守卫');
    });

    it('set 不修改蓝图', () => {
      const bp = createBlueprint('npc/guard', { hp: 100 });
      const npc = new TestEntity('npc/guard#1', bp);
      npc.set('hp', 50);

      expect(bp.dbase.hp).toBe(100);
      expect(npc.get('hp')).toBe(50);
    });

    it('del 不影响蓝图回退', () => {
      const bp = createBlueprint('npc/guard', { hp: 100 });
      const npc = new TestEntity('npc/guard#1', bp);
      npc.set('hp', 50);
      npc.del('hp');

      // 删除本地后应回退到蓝图
      expect(npc.get('hp')).toBe(100);
    });

    it('add 基于蓝图值累加到本地', () => {
      const bp = createBlueprint('npc/guard', { hp: 100 });
      const npc = new TestEntity('npc/guard#1', bp);
      npc.add('hp', 20);

      expect(npc.get('hp')).toBe(120);
      expect(bp.dbase.hp).toBe(100); // 蓝图不变
    });

    it('无蓝图时属性不存在返回 undefined', () => {
      expect(entity.get('anything')).toBeUndefined();
    });
  });

  describe('临时属性 (setTemp/getTemp/addTemp/delTemp)', () => {
    it('设置和获取临时属性', () => {
      entity.setTemp('fighting', true);
      expect(entity.getTemp('fighting')).toBe(true);
    });

    it('临时属性支持嵌套', () => {
      entity.setTemp('cache/lastHit', 999);
      expect(entity.getTemp('cache/lastHit')).toBe(999);
    });

    it('临时属性不走蓝图原型链', () => {
      const bp = createBlueprint('npc/test', { tempKey: 'fromBP' });
      const npc = new TestEntity('npc/test#1', bp);

      // getTemp 不应该回退蓝图
      expect(npc.getTemp('tempKey')).toBeUndefined();
      // get 可以回退
      expect(npc.get('tempKey')).toBe('fromBP');
    });

    it('addTemp 累加临时属性', () => {
      entity.setTemp('counter', 10);
      entity.addTemp('counter', 5);
      expect(entity.getTemp('counter')).toBe(15);
    });

    it('delTemp 删除临时属性', () => {
      entity.setTemp('flag', true);
      expect(entity.delTemp('flag')).toBe(true);
      expect(entity.getTemp('flag')).toBeUndefined();
    });

    it('持久化和临时属性互不干扰', () => {
      entity.set('hp', 100);
      entity.setTemp('hp', 999);
      expect(entity.get('hp')).toBe(100);
      expect(entity.getTemp('hp')).toBe(999);
    });
  });

  describe('getDbase / setDbase 序列化', () => {
    it('getDbase 导出所有属性', () => {
      entity.set('name', '测试');
      entity.set('level', 10);
      entity.set('combat', { attack: 100 });

      const data = entity.getDbase();
      expect(data).toEqual({
        name: '测试',
        level: 10,
        combat: { attack: 100 },
      });
    });

    it('setDbase 批量加载', () => {
      entity.setDbase({
        name: '加载的',
        hp: 200,
        skills: { sword: 5 },
      });

      expect(entity.get('name')).toBe('加载的');
      expect(entity.get('hp')).toBe(200);
      expect(entity.get('skills/sword')).toBe(5);
    });

    it('setDbase 清除旧数据', () => {
      entity.set('old', 'data');
      entity.setDbase({ new: 'data' });

      expect(entity.get('old')).toBeUndefined();
      expect(entity.get('new')).toBe('data');
    });

    it('getDbase 不包含临时属性', () => {
      entity.set('permanent', true);
      entity.setTemp('temporary', true);

      const data = entity.getDbase();
      expect(data).toEqual({ permanent: true });
    });
  });
});
