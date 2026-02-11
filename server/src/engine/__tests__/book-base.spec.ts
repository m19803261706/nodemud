/**
 * BookBase 书籍基类 单元测试
 */
import { BookBase } from '../game-objects/book-base';
import { BookType } from '@packages/core';

/** 创建测试用书籍实例 */
function createBook(id: string, props?: Record<string, any>): BookBase {
  const book = new BookBase(id);
  if (props) {
    for (const [key, val] of Object.entries(props)) {
      book.set(key, val);
    }
  }
  return book;
}

describe('BookBase 书籍基类', () => {
  describe('基础属性访问', () => {
    it('getBookType 默认返回 TEXT', () => {
      const book = createBook('test/book');
      expect(book.getBookType()).toBe(BookType.TEXT);
    });

    it('getBookType 返回设置的类型', () => {
      const book = createBook('test/book', { book_type: BookType.SKILL });
      expect(book.getBookType()).toBe(BookType.SKILL);
    });

    it('getSkillName 从 skill/name 路径读取', () => {
      const book = createBook('test/book');
      book.set('skill/name', '基础剑法');
      expect(book.getSkillName()).toBe('基础剑法');
    });

    it('getSkillName 兼容旧属性 skill_name', () => {
      const book = createBook('test/book', { skill_name: '旧版剑法' });
      expect(book.getSkillName()).toBe('旧版剑法');
    });

    it('getSkillId 返回技能注册 ID', () => {
      const book = createBook('test/book');
      book.set('skill/skill_id', 'jiben-jianfa');
      expect(book.getSkillId()).toBe('jiben-jianfa');
    });

    it('getDifficulty 默认返回 10', () => {
      const book = createBook('test/book');
      expect(book.getDifficulty()).toBe(10);
    });

    it('getBaseJingCost 默认返回 5', () => {
      const book = createBook('test/book');
      expect(book.getBaseJingCost()).toBe(5);
    });

    it('getMinLevel 默认返回 0', () => {
      const book = createBook('test/book');
      expect(book.getMinLevel()).toBe(0);
    });

    it('getMaxLevel 默认返回 20', () => {
      const book = createBook('test/book');
      expect(book.getMaxLevel()).toBe(20);
    });

    it('getNeedSkills 默认返回空对象', () => {
      const book = createBook('test/book');
      expect(book.getNeedSkills()).toEqual({});
    });

    it('getRecipes 默认返回空对象', () => {
      const book = createBook('test/book');
      expect(book.getRecipes()).toEqual({});
    });

    it('getContent 默认返回空字符串', () => {
      const book = createBook('test/book');
      expect(book.getContent()).toBe('');
    });

    it('getPages 默认返回空数组', () => {
      const book = createBook('test/book');
      expect(book.getPages()).toEqual([]);
    });
  });

  describe('calculateEnergyCost 精力消耗计算', () => {
    it('基本公式: max(10, floor((jing_cost*20 + difficulty - perception) / 20))', () => {
      const book = createBook('test/book');
      book.set('skill/jing_cost', 5);
      book.set('skill/difficulty', 10);
      // (5*20 + 10 - 10) / 20 = 100/20 = 5
      expect(book.calculateEnergyCost(10)).toBe(10);
    });

    it('高慧根降低消耗', () => {
      const book = createBook('test/book');
      book.set('skill/jing_cost', 5);
      book.set('skill/difficulty', 10);
      // (5*20 + 10 - 50) / 20 = 60/20 = 3 → max(10, 3) = 10
      expect(book.calculateEnergyCost(50)).toBe(10);
    });

    it('高难度增加消耗', () => {
      const book = createBook('test/book');
      book.set('skill/jing_cost', 10);
      book.set('skill/difficulty', 50);
      // (10*20 + 50 - 10) / 20 = 240/20 = 12
      expect(book.calculateEnergyCost(10)).toBe(12);
    });

    it('最低消耗不低于 10', () => {
      const book = createBook('test/book');
      book.set('skill/jing_cost', 1);
      book.set('skill/difficulty', 1);
      // (1*20 + 1 - 100) / 20 = -79/20 = -3 → max(10, -3) = 10
      expect(book.calculateEnergyCost(100)).toBe(10);
    });
  });

  describe('getUseOptions 使用选项', () => {
    it('SKILL 类型返回 查阅 和 研读', () => {
      const book = createBook('test/book', { book_type: BookType.SKILL });
      const options = book.getUseOptions();
      expect(options).toHaveLength(2);
      expect(options[0].key).toBe('read');
      expect(options[1].key).toBe('study');
    });

    it('TEXT 类型返回 阅读', () => {
      const book = createBook('test/book', { book_type: BookType.TEXT });
      const options = book.getUseOptions();
      expect(options).toHaveLength(1);
      expect(options[0].key).toBe('read');
      expect(options[0].label).toBe('阅读');
    });

    it('RECIPE 类型返回 查阅配方', () => {
      const book = createBook('test/book', { book_type: BookType.RECIPE });
      const options = book.getUseOptions();
      expect(options).toHaveLength(1);
      expect(options[0].key).toBe('read');
      expect(options[0].label).toBe('查阅配方');
    });
  });

  describe('use 使用逻辑', () => {
    it('SKILL 类型 read 返回提示使用 study 命令', () => {
      const book = createBook('test/book', {
        name: '测试秘籍',
        book_type: BookType.SKILL,
      });
      book.set('skill/name', '测试剑法');
      const result = book.use({} as any, 'read');
      expect(result.success).toBe(true);
      expect(result.message).toContain('study');
      expect(result.consume).toBe(false);
    });

    it('SKILL 类型 study 返回命令引导', () => {
      const book = createBook('test/book', {
        name: '测试秘籍',
        book_type: BookType.SKILL,
      });
      const result = book.use({} as any, 'study');
      expect(result.success).toBe(true);
      expect(result.message).toContain('study');
    });

    it('TEXT 类型 study 返回错误', () => {
      const book = createBook('test/book', {
        name: '普通书',
        book_type: BookType.TEXT,
      });
      const result = book.use({} as any, 'study');
      expect(result.success).toBe(false);
      expect(result.message).toContain('不是一本技能秘籍');
    });

    it('未知 optionKey 返回错误', () => {
      const book = createBook('test/book', { name: '测试书' });
      const result = book.use({} as any, 'unknown');
      expect(result.success).toBe(false);
    });
  });

  describe('getActionDefinitions 动作定义', () => {
    it('SKILL 类型包含 研读 和 查阅 动作', () => {
      const book = createBook('test/book', {
        name: '测试秘籍',
        book_type: BookType.SKILL,
      });
      const actions = book.getActionDefinitions();
      const labels = actions.map((a) => a.label);
      expect(labels).toContain('研读');
      expect(labels).toContain('查阅');
    });

    it('TEXT 类型包含 阅读 动作', () => {
      const book = createBook('test/book', {
        name: '普通书',
        book_type: BookType.TEXT,
      });
      const actions = book.getActionDefinitions();
      const labels = actions.map((a) => a.label);
      expect(labels).toContain('阅读');
    });

    it('RECIPE 类型包含 查阅配方 动作', () => {
      const book = createBook('test/book', {
        name: '配方书',
        book_type: BookType.RECIPE,
      });
      const actions = book.getActionDefinitions();
      const labels = actions.map((a) => a.label);
      expect(labels).toContain('查阅配方');
    });

    it('SKILL 类型 研读 命令格式正确', () => {
      const book = createBook('test/book', {
        name: '基础剑法残页',
        book_type: BookType.SKILL,
      });
      const actions = book.getActionDefinitions();
      const studyAction = actions.find((a) => a.label === '研读');
      expect(studyAction?.command).toBe('study 基础剑法残页');
    });

    it('继承父类的 查看 和 丢弃 动作', () => {
      const book = createBook('test/book', {
        name: '测试书',
        book_type: BookType.TEXT,
      });
      const actions = book.getActionDefinitions();
      const labels = actions.map((a) => a.label);
      expect(labels).toContain('查看');
      expect(labels).toContain('丢弃');
    });
  });
});
