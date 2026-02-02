/**
 * BlueprintRegistry 蓝图注册表 单元测试
 */
import { BlueprintRegistry } from '../blueprint-registry';
import { BaseEntity } from '../base-entity';

/**
 * BlueprintMeta 内联定义
 * 并行任务 #58 会创建 types/blueprint-meta.ts，
 * 此处临时定义以保证测试独立运行。
 */
interface BlueprintMeta {
  /** 蓝图唯一 ID（路径式，如 "room/yangzhou/inn"） */
  id: string;
  /** 蓝图文件路径 */
  filePath: string;
  /** 蓝图构造类 */
  blueprintClass: new (id: string) => BaseEntity;
  /** 是否为虚拟蓝图（不可直接实例化） */
  virtual: boolean;
}

/** 测试用蓝图类 */
class TestBlueprint extends BaseEntity {
  static virtual = false;
  constructor(id: string) {
    super(id);
  }
}

/** 另一个测试用蓝图类 */
class AnotherBlueprint extends BaseEntity {
  static virtual = true;
  constructor(id: string) {
    super(id);
  }
}

/** 创建测试用 BlueprintMeta */
function createMeta(
  id: string,
  virtual = false,
  blueprintClass: new (id: string) => BaseEntity = TestBlueprint,
): BlueprintMeta {
  return {
    id,
    filePath: `/test/world/${id}.js`,
    blueprintClass,
    virtual,
  };
}

describe('BlueprintRegistry', () => {
  let registry: BlueprintRegistry;

  beforeEach(() => {
    registry = new BlueprintRegistry();
  });

  // ========== 注册/查询 ==========

  describe('register + get', () => {
    it('应正确注册蓝图并通过 get 查询到', () => {
      const meta = createMeta('room/yangzhou/inn');
      registry.register(meta);

      const result = registry.get('room/yangzhou/inn');
      expect(result).toBe(meta);
      expect(result?.id).toBe('room/yangzhou/inn');
      expect(result?.filePath).toBe('/test/world/room/yangzhou/inn.js');
      expect(result?.blueprintClass).toBe(TestBlueprint);
      expect(result?.virtual).toBe(false);
    });

    it('应支持注册多个不同 ID 的蓝图', () => {
      const meta1 = createMeta('room/yangzhou/inn');
      const meta2 = createMeta('npc/yangzhou/dianxiaoer', false, AnotherBlueprint);

      registry.register(meta1);
      registry.register(meta2);

      expect(registry.get('room/yangzhou/inn')).toBe(meta1);
      expect(registry.get('npc/yangzhou/dianxiaoer')).toBe(meta2);
    });

    it('注册重复 ID 应抛出错误', () => {
      const meta = createMeta('room/yangzhou/inn');
      registry.register(meta);

      const duplicate = createMeta('room/yangzhou/inn');
      expect(() => registry.register(duplicate)).toThrow(
        '蓝图 ID "room/yangzhou/inn" 已存在，不允许重复注册',
      );
    });

    it('get 不存在的 ID 应返回 undefined', () => {
      expect(registry.get('nonexistent')).toBeUndefined();
    });
  });

  // ========== 注销 ==========

  describe('unregister', () => {
    it('注销后应查询不到该蓝图', () => {
      const meta = createMeta('room/yangzhou/inn');
      registry.register(meta);
      expect(registry.has('room/yangzhou/inn')).toBe(true);

      registry.unregister('room/yangzhou/inn');
      expect(registry.has('room/yangzhou/inn')).toBe(false);
      expect(registry.get('room/yangzhou/inn')).toBeUndefined();
    });

    it('注销不存在的 ID 应静默忽略，不抛出错误', () => {
      expect(() => registry.unregister('nonexistent')).not.toThrow();
    });

    it('注销一个蓝图不应影响其他蓝图', () => {
      const meta1 = createMeta('room/a');
      const meta2 = createMeta('room/b');
      registry.register(meta1);
      registry.register(meta2);

      registry.unregister('room/a');
      expect(registry.has('room/a')).toBe(false);
      expect(registry.has('room/b')).toBe(true);
      expect(registry.get('room/b')).toBe(meta2);
    });
  });

  // ========== 查询 API ==========

  describe('has', () => {
    it('已注册的蓝图应返回 true', () => {
      registry.register(createMeta('room/inn'));
      expect(registry.has('room/inn')).toBe(true);
    });

    it('未注册的蓝图应返回 false', () => {
      expect(registry.has('room/inn')).toBe(false);
    });
  });

  describe('getAll', () => {
    it('空注册表应返回空数组', () => {
      expect(registry.getAll()).toEqual([]);
    });

    it('应返回所有已注册蓝图的副本数组', () => {
      const meta1 = createMeta('room/a');
      const meta2 = createMeta('room/b');
      const meta3 = createMeta('npc/c', true);

      registry.register(meta1);
      registry.register(meta2);
      registry.register(meta3);

      const all = registry.getAll();
      expect(all).toHaveLength(3);
      expect(all).toContain(meta1);
      expect(all).toContain(meta2);
      expect(all).toContain(meta3);
    });

    it('返回的数组应为副本，修改不影响内部状态', () => {
      registry.register(createMeta('room/a'));
      const all = registry.getAll();
      all.length = 0; // 清空返回的数组

      expect(registry.getCount()).toBe(1);
      expect(registry.getAll()).toHaveLength(1);
    });
  });

  describe('getCount', () => {
    it('空注册表计数为 0', () => {
      expect(registry.getCount()).toBe(0);
    });

    it('应正确反映已注册蓝图数量', () => {
      registry.register(createMeta('room/a'));
      expect(registry.getCount()).toBe(1);

      registry.register(createMeta('room/b'));
      expect(registry.getCount()).toBe(2);

      registry.unregister('room/a');
      expect(registry.getCount()).toBe(1);
    });
  });

  // ========== 清空 ==========

  describe('clear', () => {
    it('清空后计数应为 0', () => {
      registry.register(createMeta('room/a'));
      registry.register(createMeta('room/b'));
      registry.register(createMeta('npc/c'));
      expect(registry.getCount()).toBe(3);

      registry.clear();
      expect(registry.getCount()).toBe(0);
    });

    it('清空后所有查询应返回空结果', () => {
      registry.register(createMeta('room/a'));
      registry.clear();

      expect(registry.has('room/a')).toBe(false);
      expect(registry.get('room/a')).toBeUndefined();
      expect(registry.getAll()).toEqual([]);
    });

    it('清空后应可重新注册相同 ID', () => {
      const meta = createMeta('room/a');
      registry.register(meta);
      registry.clear();

      const newMeta = createMeta('room/a');
      expect(() => registry.register(newMeta)).not.toThrow();
      expect(registry.get('room/a')).toBe(newMeta);
    });
  });
});
