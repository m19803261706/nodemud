/**
 * ObjectManager 全局对象注册表 + GC 单元测试
 */
import { BaseEntity } from '../base-entity';
import { ObjectManager } from '../object-manager';

/** 测试用具体子类，提供 onReset / onCleanUp 钩子 */
class TestEntity extends BaseEntity {
  public resetCount = 0;
  public cleanUpResult = true;

  constructor(id: string) {
    super(id);
  }

  onHeartbeat(): void {}

  onReset(): void {
    this.resetCount++;
  }

  onCleanUp(): boolean {
    return this.cleanUpResult;
  }
}

describe('ObjectManager', () => {
  let manager: ObjectManager;

  beforeEach(() => {
    jest.useFakeTimers();
    manager = new ObjectManager();
  });

  afterEach(() => {
    manager.onModuleDestroy();
    jest.useRealTimers();
  });

  // ================================================================
  //  注册 / 注销
  // ================================================================

  describe('注册 / 注销', () => {
    it('注册后 findById 返回对象', () => {
      const entity = new TestEntity('npc/test');
      manager.register(entity);
      expect(manager.findById('npc/test')).toBe(entity);
    });

    it('注销后 findById 返回 undefined', () => {
      const entity = new TestEntity('npc/test');
      manager.register(entity);
      manager.unregister(entity);
      expect(manager.findById('npc/test')).toBeUndefined();
    });

    it('重复注册相同 ID 抛出错误', () => {
      const entity1 = new TestEntity('npc/test');
      const entity2 = new TestEntity('npc/test');
      manager.register(entity1);
      expect(() => manager.register(entity2)).toThrow('已存在');
    });

    it('注销不存在的对象静默忽略', () => {
      const entity = new TestEntity('npc/ghost');
      expect(() => manager.unregister(entity)).not.toThrow();
    });

    it('getCount 正确计数', () => {
      expect(manager.getCount()).toBe(0);
      manager.register(new TestEntity('a'));
      manager.register(new TestEntity('b'));
      expect(manager.getCount()).toBe(2);
    });

    it('has 正确判断', () => {
      const entity = new TestEntity('npc/test');
      expect(manager.has('npc/test')).toBe(false);
      manager.register(entity);
      expect(manager.has('npc/test')).toBe(true);
    });
  });

  // ================================================================
  //  查询
  // ================================================================

  describe('查询', () => {
    it('findById 精确查找', () => {
      const e1 = new TestEntity('room/inn');
      const e2 = new TestEntity('room/market');
      manager.register(e1);
      manager.register(e2);
      expect(manager.findById('room/inn')).toBe(e1);
      expect(manager.findById('room/market')).toBe(e2);
      expect(manager.findById('room/none')).toBeUndefined();
    });

    it('findAll 无参数返回所有', () => {
      const e1 = new TestEntity('a');
      const e2 = new TestEntity('b');
      const e3 = new TestEntity('c');
      manager.register(e1);
      manager.register(e2);
      manager.register(e3);
      const all = manager.findAll();
      expect(all).toHaveLength(3);
      expect(all).toContain(e1);
      expect(all).toContain(e2);
      expect(all).toContain(e3);
    });

    it('findAll 有 predicate 过滤', () => {
      const e1 = new TestEntity('npc/a');
      const e2 = new TestEntity('room/b');
      const e3 = new TestEntity('npc/c');
      manager.register(e1);
      manager.register(e2);
      manager.register(e3);
      const npcs = manager.findAll((e) => e.id.startsWith('npc/'));
      expect(npcs).toHaveLength(2);
      expect(npcs).toContain(e1);
      expect(npcs).toContain(e3);
    });

    it('findAll 空注册表返回空数组', () => {
      expect(manager.findAll()).toEqual([]);
    });
  });

  // ================================================================
  //  ID 分配
  // ================================================================

  describe('ID 分配', () => {
    it('nextInstanceId 首次返回 #1', () => {
      expect(manager.nextInstanceId('npc/dianxiaoer')).toBe('npc/dianxiaoer#1');
    });

    it('连续调用递增 #2, #3', () => {
      manager.nextInstanceId('npc/guard');
      expect(manager.nextInstanceId('npc/guard')).toBe('npc/guard#2');
      expect(manager.nextInstanceId('npc/guard')).toBe('npc/guard#3');
    });

    it('不同蓝图 ID 独立计数', () => {
      expect(manager.nextInstanceId('npc/a')).toBe('npc/a#1');
      expect(manager.nextInstanceId('npc/b')).toBe('npc/b#1');
      expect(manager.nextInstanceId('npc/a')).toBe('npc/a#2');
      expect(manager.nextInstanceId('npc/b')).toBe('npc/b#2');
    });
  });

  // ================================================================
  //  GC - cleanUp
  // ================================================================

  describe('GC - cleanUp（LPC 对象自治）', () => {
    it('onCleanUp 返回 true -> 被清理', () => {
      const entity = new TestEntity('orphan');
      entity.cleanUpResult = true;
      manager.register(entity);

      expect(entity.destroyed).toBe(false);
      (manager as any).cleanUp();
      expect(entity.destroyed).toBe(true);
    });

    it('onCleanUp 返回 false -> 不清理', () => {
      const entity = new TestEntity('protected');
      entity.cleanUpResult = false;
      manager.register(entity);

      (manager as any).cleanUp();
      expect(entity.destroyed).toBe(false);
    });

    it('已销毁对象跳过', () => {
      const entity = new TestEntity('dead');
      manager.register(entity);
      entity.destroy();

      // 不应重复销毁或报错
      expect(() => (manager as any).cleanUp()).not.toThrow();
    });

    it('onCleanUp 抛异常 -> 不清理（安全）', () => {
      const entity = new TestEntity('error-prone');
      entity.onCleanUp = () => {
        throw new Error('boom');
      };
      manager.register(entity);

      (manager as any).cleanUp();
      expect(entity.destroyed).toBe(false);
    });

    it('GC 不做 environment/inventory 判断，完全由对象自决', async () => {
      // 即使有环境，只要 onCleanUp 返回 true 就清理
      const room = new TestEntity('room/inn');
      const entity = new TestEntity('npc/test');
      entity.cleanUpResult = true;
      manager.register(room);
      manager.register(entity);
      await entity.moveTo(room, { quiet: true });

      (manager as any).cleanUp();
      expect(entity.destroyed).toBe(true);
    });
  });

  // ================================================================
  //  GC - reset
  // ================================================================

  describe('GC - resetAll', () => {
    it('调用所有注册对象的 onReset', () => {
      const e1 = new TestEntity('a');
      const e2 = new TestEntity('b');
      manager.register(e1);
      manager.register(e2);

      (manager as any).resetAll();
      expect(e1.resetCount).toBe(1);
      expect(e2.resetCount).toBe(1);
    });

    it('跳过已销毁对象', () => {
      const e1 = new TestEntity('alive');
      const e2 = new TestEntity('dead');
      manager.register(e1);
      manager.register(e2);
      e2.destroy();

      (manager as any).resetAll();
      expect(e1.resetCount).toBe(1);
      expect(e2.resetCount).toBe(0);
    });

    it('onReset 抛异常不影响其他对象', () => {
      const e1 = new TestEntity('error');
      const e2 = new TestEntity('normal');
      e1.onReset = () => {
        throw new Error('reset error');
      };
      manager.register(e1);
      manager.register(e2);

      (manager as any).resetAll();
      expect(e2.resetCount).toBe(1);
    });
  });

  // ================================================================
  //  GC - removeDestructed
  // ================================================================

  describe('GC - removeDestructed', () => {
    it('清除注册表中 destroyed=true 的对象', () => {
      const e1 = new TestEntity('alive');
      const e2 = new TestEntity('dead');
      manager.register(e1);
      manager.register(e2);
      e2.destroy();

      expect(manager.getCount()).toBe(2);
      (manager as any).removeDestructed();
      expect(manager.getCount()).toBe(1);
      expect(manager.has('alive')).toBe(true);
      expect(manager.has('dead')).toBe(false);
    });

    it('不影响活跃对象', () => {
      const e1 = new TestEntity('a');
      const e2 = new TestEntity('b');
      manager.register(e1);
      manager.register(e2);

      (manager as any).removeDestructed();
      expect(manager.getCount()).toBe(2);
    });
  });

  // ================================================================
  //  生命周期
  // ================================================================

  describe('生命周期', () => {
    it('onModuleDestroy 清空注册表和计数器', () => {
      manager.register(new TestEntity('a'));
      manager.register(new TestEntity('b'));
      manager.nextInstanceId('npc/test');
      manager.startGC();

      manager.onModuleDestroy();

      expect(manager.getCount()).toBe(0);
      // 计数器被清空后，重新分配应从 #1 开始
      expect(manager.nextInstanceId('npc/test')).toBe('npc/test#1');
    });
  });
});
