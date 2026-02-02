/**
 * nested-value 工具函数单元测试
 * 覆盖 getNestedValue / setNestedValue / deleteNestedValue
 */
import {
  getNestedValue,
  setNestedValue,
  deleteNestedValue,
} from '../utils/nested-value';

describe('nested-value 工具函数', () => {
  let data: Map<string, any>;

  beforeEach(() => {
    data = new Map<string, any>();
  });

  // ==================== getNestedValue ====================

  describe('getNestedValue', () => {
    it('单层 Map 取值', () => {
      data.set('name', '张三');
      expect(getNestedValue(data, ['name'])).toBe('张三');
    });

    it('多层嵌套取值', () => {
      data.set('combat', { attack: 100, defense: 50 });
      expect(getNestedValue(data, ['combat', 'attack'])).toBe(100);
    });

    it('三层嵌套取值', () => {
      data.set('skills', { sword: { level: 5 } });
      expect(getNestedValue(data, ['skills', 'sword', 'level'])).toBe(5);
    });

    it('路径不存在返回 undefined', () => {
      expect(getNestedValue(data, ['nonexistent'])).toBeUndefined();
    });

    it('中间路径不存在返回 undefined', () => {
      data.set('combat', { attack: 100 });
      expect(
        getNestedValue(data, ['combat', 'magic', 'fire']),
      ).toBeUndefined();
    });

    it('中间路径为基本类型返回 undefined', () => {
      data.set('hp', 100);
      expect(getNestedValue(data, ['hp', 'max'])).toBeUndefined();
    });

    it('空 parts 数组返回整个 Map', () => {
      data.set('a', 1);
      expect(getNestedValue(data, [])).toBe(data);
    });

    it('值为 null 时正常返回', () => {
      data.set('empty', null);
      expect(getNestedValue(data, ['empty'])).toBeNull();
    });

    it('值为 0 或空字符串时正常返回', () => {
      data.set('zero', 0);
      data.set('blank', '');
      expect(getNestedValue(data, ['zero'])).toBe(0);
      expect(getNestedValue(data, ['blank'])).toBe('');
    });
  });

  // ==================== setNestedValue ====================

  describe('setNestedValue', () => {
    it('单层 Map 设置值', () => {
      setNestedValue(data, ['name'], '李四');
      expect(data.get('name')).toBe('李四');
    });

    it('多层嵌套设置值，自动创建中间层', () => {
      setNestedValue(data, ['combat', 'attack'], 100);
      expect(data.get('combat')).toEqual({ attack: 100 });
    });

    it('三层嵌套设置值', () => {
      setNestedValue(data, ['skills', 'sword', 'level'], 5);
      expect(data.get('skills')).toEqual({ sword: { level: 5 } });
    });

    it('覆盖已有值', () => {
      setNestedValue(data, ['hp'], 100);
      setNestedValue(data, ['hp'], 200);
      expect(data.get('hp')).toBe(200);
    });

    it('覆盖嵌套已有值', () => {
      setNestedValue(data, ['combat', 'attack'], 100);
      setNestedValue(data, ['combat', 'attack'], 150);
      expect(getNestedValue(data, ['combat', 'attack'])).toBe(150);
    });

    it('不覆盖同级其他键', () => {
      setNestedValue(data, ['combat', 'attack'], 100);
      setNestedValue(data, ['combat', 'defense'], 50);
      expect(data.get('combat')).toEqual({ attack: 100, defense: 50 });
    });

    it('中间层为基本类型时覆盖为对象', () => {
      data.set('stats', 'invalid');
      setNestedValue(data, ['stats', 'hp'], 100);
      expect(data.get('stats')).toEqual({ hp: 100 });
    });

    it('空 parts 数组不做任何操作', () => {
      setNestedValue(data, [], 'value');
      expect(data.size).toBe(0);
    });

    it('可以设置值为对象', () => {
      setNestedValue(data, ['config'], { a: 1, b: 2 });
      expect(data.get('config')).toEqual({ a: 1, b: 2 });
    });
  });

  // ==================== deleteNestedValue ====================

  describe('deleteNestedValue', () => {
    it('单层 Map 删除', () => {
      data.set('name', '张三');
      expect(deleteNestedValue(data, ['name'])).toBe(true);
      expect(data.has('name')).toBe(false);
    });

    it('多层嵌套删除', () => {
      data.set('combat', { attack: 100, defense: 50 });
      expect(deleteNestedValue(data, ['combat', 'attack'])).toBe(true);
      expect(data.get('combat')).toEqual({ defense: 50 });
    });

    it('删除不存在的键返回 false', () => {
      expect(deleteNestedValue(data, ['nonexistent'])).toBe(false);
    });

    it('嵌套路径中间不存在返回 false', () => {
      expect(deleteNestedValue(data, ['a', 'b', 'c'])).toBe(false);
    });

    it('中间路径为基本类型返回 false', () => {
      data.set('hp', 100);
      expect(deleteNestedValue(data, ['hp', 'max'])).toBe(false);
    });

    it('空 parts 数组返回 false', () => {
      expect(deleteNestedValue(data, [])).toBe(false);
    });

    it('删除后再获取返回 undefined', () => {
      setNestedValue(data, ['combat', 'attack'], 100);
      deleteNestedValue(data, ['combat', 'attack']);
      expect(getNestedValue(data, ['combat', 'attack'])).toBeUndefined();
    });
  });

  // ==================== 综合场景 ====================

  describe('综合场景', () => {
    it('set -> get -> delete -> get 完整流程', () => {
      setNestedValue(data, ['player', 'inventory', 'sword'], '倚天剑');
      expect(getNestedValue(data, ['player', 'inventory', 'sword'])).toBe(
        '倚天剑',
      );
      expect(deleteNestedValue(data, ['player', 'inventory', 'sword'])).toBe(
        true,
      );
      expect(
        getNestedValue(data, ['player', 'inventory', 'sword']),
      ).toBeUndefined();
    });

    it('多次 set 构建复杂结构', () => {
      setNestedValue(data, ['player', 'name'], '令狐冲');
      setNestedValue(data, ['player', 'hp'], 100);
      setNestedValue(data, ['player', 'skills', 'dugu'], 10);
      setNestedValue(data, ['player', 'skills', 'xixing'], 8);

      expect(data.get('player')).toEqual({
        name: '令狐冲',
        hp: 100,
        skills: { dugu: 10, xixing: 8 },
      });
    });
  });
});
