/**
 * BlueprintFactory 单元测试
 *
 * 覆盖: createVirtual / clone / getVirtual
 */
import { BlueprintFactory } from '../blueprint-factory';
import { BlueprintRegistry } from '../blueprint-registry';
import { ObjectManager } from '../object-manager';
import { BaseEntity } from '../base-entity';
import type { BlueprintMeta } from '../types/blueprint-meta';

// ========== 测试用蓝图类 ==========

class VirtualBlueprint extends BaseEntity {
  static virtual = true;
  create() {
    this.set('short', '测试房间');
    this.set('type', 'room');
  }
}

class CloneBlueprint extends BaseEntity {
  static virtual = false;
  create() {
    this.set('name', '测试NPC');
    this.set('hp', 100);
  }
}

// ========== 测试 ==========

describe('BlueprintFactory', () => {
  let registry: BlueprintRegistry;
  let objectManager: ObjectManager;
  let factory: BlueprintFactory;

  beforeEach(() => {
    registry = new BlueprintRegistry();
    objectManager = new ObjectManager();
    factory = new BlueprintFactory(registry, objectManager);
  });

  afterEach(() => {
    objectManager.onModuleDestroy();
  });

  // ========== 辅助方法 ==========

  /** 注册虚拟蓝图 */
  function registerVirtual(id: string = 'room/test'): BlueprintMeta {
    const meta: BlueprintMeta = {
      id,
      filePath: `/blueprints/${id}.ts`,
      blueprintClass: VirtualBlueprint,
      virtual: true,
    };
    registry.register(meta);
    return meta;
  }

  /** 注册克隆蓝图 */
  function registerClone(id: string = 'npc/test'): BlueprintMeta {
    const meta: BlueprintMeta = {
      id,
      filePath: `/blueprints/${id}.ts`,
      blueprintClass: CloneBlueprint,
      virtual: false,
    };
    registry.register(meta);
    return meta;
  }

  // ================================================================
  //  createVirtual
  // ================================================================

  describe('createVirtual', () => {
    it('正常创建虚拟对象，create() 被调用', () => {
      registerVirtual('room/inn');
      const instance = factory.createVirtual('room/inn');

      expect(instance).toBeInstanceOf(BaseEntity);
      expect(instance.id).toBe('room/inn');
      // create() 设置了 dbase 属性
      expect(instance.get('short')).toBe('测试房间');
      expect(instance.get('type')).toBe('room');
    });

    it('实例注册到 ObjectManager', () => {
      registerVirtual('room/inn');
      const instance = factory.createVirtual('room/inn');

      expect(objectManager.has(instance.id)).toBe(true);
      expect(objectManager.findById('room/inn')).toBe(instance);
    });

    it('非虚拟蓝图调用 createVirtual 抛错', () => {
      registerClone('npc/guard');

      expect(() => factory.createVirtual('npc/guard')).toThrow(
        '蓝图 "npc/guard" 非虚拟蓝图，不能创建虚拟对象',
      );
    });

    it('蓝图不存在抛错', () => {
      expect(() => factory.createVirtual('room/not_exist')).toThrow('蓝图 "room/not_exist" 不存在');
    });
  });

  // ================================================================
  //  clone
  // ================================================================

  describe('clone', () => {
    it('正常克隆，create() 被调用', () => {
      registerClone('npc/warrior');
      const instance = factory.clone('npc/warrior');

      expect(instance).toBeInstanceOf(BaseEntity);
      // create() 设置了 dbase 属性
      expect(instance.get('name')).toBe('测试NPC');
      expect(instance.get('hp')).toBe(100);
    });

    it('ID 格式: blueprintId#1, blueprintId#2 递增', () => {
      registerClone('npc/warrior');

      const first = factory.clone('npc/warrior');
      const second = factory.clone('npc/warrior');
      const third = factory.clone('npc/warrior');

      expect(first.id).toBe('npc/warrior#1');
      expect(second.id).toBe('npc/warrior#2');
      expect(third.id).toBe('npc/warrior#3');
    });

    it('多次 clone 各自独立', () => {
      registerClone('npc/warrior');

      const a = factory.clone('npc/warrior');
      const b = factory.clone('npc/warrior');

      // 修改 a 不影响 b
      a.set('hp', 50);
      expect(a.get('hp')).toBe(50);
      expect(b.get('hp')).toBe(100);
    });

    it('实例注册到 ObjectManager', () => {
      registerClone('npc/warrior');

      const instance = factory.clone('npc/warrior');
      expect(objectManager.has(instance.id)).toBe(true);
      expect(objectManager.findById('npc/warrior#1')).toBe(instance);
    });

    it('虚拟蓝图调用 clone 抛错', () => {
      registerVirtual('room/inn');

      expect(() => factory.clone('room/inn')).toThrow('虚拟蓝图 "room/inn" 不可克隆');
    });

    it('蓝图不存在抛错', () => {
      expect(() => factory.clone('npc/not_exist')).toThrow('蓝图 "npc/not_exist" 不存在');
    });
  });

  // ================================================================
  //  getVirtual
  // ================================================================

  describe('getVirtual', () => {
    it('创建虚拟对象后可通过 getVirtual 获取', () => {
      registerVirtual('room/inn');
      const instance = factory.createVirtual('room/inn');

      expect(factory.getVirtual('room/inn')).toBe(instance);
    });

    it('未创建虚拟对象时返回 undefined', () => {
      registerVirtual('room/inn');
      // 只注册了蓝图，未 createVirtual
      expect(factory.getVirtual('room/inn')).toBeUndefined();
    });

    it('不存在的蓝图返回 undefined', () => {
      expect(factory.getVirtual('room/not_exist')).toBeUndefined();
    });
  });
});
