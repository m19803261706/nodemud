/**
 * ItemBase 物品基类 — 单元测试
 */
import { ItemBase } from '../game-objects/item-base';

describe('ItemBase', () => {
  // ========== static virtual ==========

  it('static virtual 应为 false（物品可克隆）', () => {
    expect(ItemBase.virtual).toBe(false);
  });

  // ========== getName ==========

  describe('getName()', () => {
    it('有值时返回 dbase 中的 name', () => {
      const item = new ItemBase('test/sword');
      item.set('name', '青钢剑');
      expect(item.getName()).toBe('青钢剑');
    });

    it('无值时返回默认值 "未知物品"', () => {
      const item = new ItemBase('test/unknown');
      expect(item.getName()).toBe('未知物品');
    });
  });

  // ========== getShort ==========

  describe('getShort()', () => {
    it('有值时返回 dbase 中的 short', () => {
      const item = new ItemBase('test/sword');
      item.set('short', '一把锋利的青钢剑');
      expect(item.getShort()).toBe('一把锋利的青钢剑');
    });

    it('无值时 fallback 到 getName()', () => {
      const item = new ItemBase('test/sword');
      item.set('name', '青钢剑');
      expect(item.getShort()).toBe('青钢剑');
    });

    it('name 和 short 都无值时返回 "未知物品"', () => {
      const item = new ItemBase('test/unknown');
      expect(item.getShort()).toBe('未知物品');
    });
  });

  // ========== getLong ==========

  describe('getLong()', () => {
    it('有值时返回 dbase 中的 long', () => {
      const item = new ItemBase('test/sword');
      item.set('long', '这把青钢剑寒光闪闪，削铁如泥。');
      expect(item.getLong()).toBe('这把青钢剑寒光闪闪，削铁如泥。');
    });

    it('无值时返回包含 getName() 的默认描述', () => {
      const item = new ItemBase('test/sword');
      item.set('name', '青钢剑');
      expect(item.getLong()).toBe('这是一个青钢剑。');
    });

    it('name 也无值时返回 "这是一个未知物品。"', () => {
      const item = new ItemBase('test/unknown');
      expect(item.getLong()).toBe('这是一个未知物品。');
    });
  });

  // ========== getType ==========

  describe('getType()', () => {
    it('有值时返回 dbase 中的 type', () => {
      const item = new ItemBase('test/sword');
      item.set('type', 'weapon');
      expect(item.getType()).toBe('weapon');
    });

    it('无值时返回默认值 "misc"', () => {
      const item = new ItemBase('test/unknown');
      expect(item.getType()).toBe('misc');
    });
  });

  // ========== getWeight ==========

  describe('getWeight()', () => {
    it('有值时返回 dbase 中的 weight', () => {
      const item = new ItemBase('test/sword');
      item.set('weight', 5);
      expect(item.getWeight()).toBe(5);
    });

    it('无值时返回默认值 0', () => {
      const item = new ItemBase('test/unknown');
      expect(item.getWeight()).toBe(0);
    });
  });

  // ========== getValue ==========

  describe('getValue()', () => {
    it('有值时返回 dbase 中的 value', () => {
      const item = new ItemBase('test/sword');
      item.set('value', 1000);
      expect(item.getValue()).toBe(1000);
    });

    it('无值时返回默认值 0', () => {
      const item = new ItemBase('test/unknown');
      expect(item.getValue()).toBe(0);
    });
  });

  // ========== isStackable ==========

  describe('isStackable()', () => {
    it('有值时返回 dbase 中的 stackable', () => {
      const item = new ItemBase('test/potion');
      item.set('stackable', true);
      expect(item.isStackable()).toBe(true);
    });

    it('无值时返回默认值 false', () => {
      const item = new ItemBase('test/sword');
      expect(item.isStackable()).toBe(false);
    });
  });
});
