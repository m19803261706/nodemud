/**
 * HeartbeatManager 全局心跳调度器 单元测试
 *
 * 使用 jest.useFakeTimers() 控制时间，验证累积器调度、
 * 错误隔离、已销毁对象清理、生命周期等核心行为。
 */
import { BaseEntity } from '../base-entity';
import { GameEvents } from '../types/events';
import { HeartbeatManager } from '../heartbeat-manager';

/** 测试用子类，公开 onHeartbeat 并记录调用次数 */
class TestEntity extends BaseEntity {
  public heartbeatCount = 0;

  constructor(id: string) {
    super(id);
  }

  public onHeartbeat(): void {
    this.heartbeatCount++;
  }
}

/** 测试用子类，onHeartbeat 会抛出异常 */
class ErrorEntity extends BaseEntity {
  public heartbeatCount = 0;

  constructor(id: string) {
    super(id);
  }

  public onHeartbeat(): void {
    this.heartbeatCount++;
    throw new Error('heartbeat error');
  }
}

describe('HeartbeatManager', () => {
  let manager: HeartbeatManager;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    // 确保 manager 被销毁，清理定时器
    if (manager) {
      manager.onModuleDestroy();
    }
    jest.useRealTimers();
  });

  // ================================================================
  //  注册/注销
  // ================================================================

  describe('注册/注销', () => {
    beforeEach(() => {
      manager = new HeartbeatManager(1000);
    });

    it('注册后 isRegistered 返回 true', () => {
      const entity = new TestEntity('test/a');
      manager.register(entity, 1000);

      expect(manager.isRegistered(entity)).toBe(true);
    });

    it('注销后 isRegistered 返回 false', () => {
      const entity = new TestEntity('test/a');
      manager.register(entity, 1000);
      manager.unregister(entity);

      expect(manager.isRegistered(entity)).toBe(false);
    });

    it('重复注册更新间隔并重置累积器', () => {
      const entity = new TestEntity('test/a');
      manager.onModuleInit();
      manager.register(entity, 1000);

      // 推进 2 tick，触发 2 次（accumulated 在每次 tick 后为 0）
      jest.advanceTimersByTime(2000);
      expect(entity.heartbeatCount).toBe(2);

      // 重新注册，间隔改为 3000，累积器应重置为 0
      manager.register(entity, 3000);
      expect(manager.getInterval(entity)).toBe(3000);

      // 推进 2 tick (2000ms)，accumulated = 2000 < 3000，不触发
      jest.advanceTimersByTime(2000);
      expect(entity.heartbeatCount).toBe(2);

      // 再推进 1 tick (1000ms)，accumulated = 3000 >= 3000，触发
      jest.advanceTimersByTime(1000);
      expect(entity.heartbeatCount).toBe(3);
    });

    it('注销未注册对象静默忽略', () => {
      const entity = new TestEntity('test/a');
      expect(() => manager.unregister(entity)).not.toThrow();
    });

    it('intervalMs <= 0 抛出错误', () => {
      const entity = new TestEntity('test/a');
      expect(() => manager.register(entity, 0)).toThrow();
      expect(() => manager.register(entity, -100)).toThrow();
    });

    it('getRegisteredCount 正确计数', () => {
      expect(manager.getRegisteredCount()).toBe(0);

      const a = new TestEntity('test/a');
      const b = new TestEntity('test/b');
      manager.register(a, 1000);
      expect(manager.getRegisteredCount()).toBe(1);

      manager.register(b, 2000);
      expect(manager.getRegisteredCount()).toBe(2);

      manager.unregister(a);
      expect(manager.getRegisteredCount()).toBe(1);
    });

    it('getInterval 返回注册间隔 / 未注册返回 undefined', () => {
      const entity = new TestEntity('test/a');
      expect(manager.getInterval(entity)).toBeUndefined();

      manager.register(entity, 1500);
      expect(manager.getInterval(entity)).toBe(1500);
    });
  });

  // ================================================================
  //  累积器调度
  // ================================================================

  describe('累积器调度', () => {
    it('tick=1000ms, interval=1000ms: 每 tick 触发一次', () => {
      manager = new HeartbeatManager(1000);
      manager.onModuleInit();

      const entity = new TestEntity('test/a');
      manager.register(entity, 1000);

      jest.advanceTimersByTime(3000);
      expect(entity.heartbeatCount).toBe(3);
    });

    it('tick=1000ms, interval=2000ms: 每 2 tick 触发一次', () => {
      manager = new HeartbeatManager(1000);
      manager.onModuleInit();

      const entity = new TestEntity('test/a');
      manager.register(entity, 2000);

      jest.advanceTimersByTime(5000);
      expect(entity.heartbeatCount).toBe(2);
    });

    it('tick=1000ms, interval=1500ms: 累积器精确调度（3 tick 内触发 2 次）', () => {
      manager = new HeartbeatManager(1000);
      manager.onModuleInit();

      const entity = new TestEntity('test/a');
      manager.register(entity, 1500);

      // tick 1: accumulated = 1000, < 1500, 不触发
      jest.advanceTimersByTime(1000);
      expect(entity.heartbeatCount).toBe(0);

      // tick 2: accumulated = 2000, >= 1500, 触发1次, accumulated = 500
      jest.advanceTimersByTime(1000);
      expect(entity.heartbeatCount).toBe(1);

      // tick 3: accumulated = 1500, >= 1500, 触发1次, accumulated = 0
      jest.advanceTimersByTime(1000);
      expect(entity.heartbeatCount).toBe(2);
    });

    it('tick=1000ms, interval=500ms: while 循环，每 tick 触发 2 次', () => {
      manager = new HeartbeatManager(1000);
      manager.onModuleInit();

      const entity = new TestEntity('test/a');
      manager.register(entity, 500);

      // 1 tick = 1000ms, interval = 500ms -> while 循环触发 2 次
      jest.advanceTimersByTime(1000);
      expect(entity.heartbeatCount).toBe(2);

      // 3 ticks total -> 6 次
      jest.advanceTimersByTime(2000);
      expect(entity.heartbeatCount).toBe(6);
    });
  });

  // ================================================================
  //  错误隔离
  // ================================================================

  describe('错误隔离', () => {
    it('对象A的 onHeartbeat 抛异常，对象B 仍然正常触发', () => {
      manager = new HeartbeatManager(1000);
      manager.onModuleInit();

      const errorEntity = new ErrorEntity('test/error');
      const normalEntity = new TestEntity('test/normal');

      manager.register(errorEntity, 1000);
      manager.register(normalEntity, 1000);

      jest.advanceTimersByTime(3000);

      // errorEntity 的 onHeartbeat 虽然抛异常，但仍被调用
      expect(errorEntity.heartbeatCount).toBe(3);
      // normalEntity 不受影响
      expect(normalEntity.heartbeatCount).toBe(3);
    });

    it('异常不中断主循环', () => {
      manager = new HeartbeatManager(1000);
      manager.onModuleInit();

      const errorEntity = new ErrorEntity('test/error');
      manager.register(errorEntity, 1000);

      // 推进多个 tick，主循环不中断
      jest.advanceTimersByTime(5000);
      expect(errorEntity.heartbeatCount).toBe(5);
    });
  });

  // ================================================================
  //  已销毁对象
  // ================================================================

  describe('已销毁对象', () => {
    it('已销毁对象的 onHeartbeat 不被调用', () => {
      manager = new HeartbeatManager(1000);
      manager.onModuleInit();

      const entity = new TestEntity('test/a');
      manager.register(entity, 1000);

      // 先触发一次
      jest.advanceTimersByTime(1000);
      expect(entity.heartbeatCount).toBe(1);

      // 销毁对象
      entity.destroy();

      // 后续 tick 不再调用
      jest.advanceTimersByTime(3000);
      expect(entity.heartbeatCount).toBe(1);
    });

    it('已销毁对象在 tick 后被自动移除（getRegisteredCount 减少）', () => {
      manager = new HeartbeatManager(1000);
      manager.onModuleInit();

      const a = new TestEntity('test/a');
      const b = new TestEntity('test/b');
      manager.register(a, 1000);
      manager.register(b, 1000);
      expect(manager.getRegisteredCount()).toBe(2);

      // 销毁 a
      a.destroy();

      // 推进一个 tick，触发自动清理
      jest.advanceTimersByTime(1000);
      expect(manager.getRegisteredCount()).toBe(1);
      expect(manager.isRegistered(a)).toBe(false);
      expect(manager.isRegistered(b)).toBe(true);
    });
  });

  // ================================================================
  //  updateInterval
  // ================================================================

  describe('updateInterval', () => {
    it('修改间隔后按新间隔调度', () => {
      manager = new HeartbeatManager(1000);
      manager.onModuleInit();

      const entity = new TestEntity('test/a');
      manager.register(entity, 2000);

      // 2 tick 触发一次
      jest.advanceTimersByTime(2000);
      expect(entity.heartbeatCount).toBe(1);

      // 改为 1000ms 间隔
      manager.updateInterval(entity, 1000);

      // 接下来每 tick 触发一次
      jest.advanceTimersByTime(3000);
      expect(entity.heartbeatCount).toBe(4); // 1 + 3
    });

    it('修改间隔不重置累积器', () => {
      manager = new HeartbeatManager(1000);
      manager.onModuleInit();

      const entity = new TestEntity('test/a');
      manager.register(entity, 3000);

      // 推进 2 tick, accumulated = 2000
      jest.advanceTimersByTime(2000);
      expect(entity.heartbeatCount).toBe(0);

      // 把间隔改为 2000，此时 accumulated=2000 >= 2000，下次 tick 应触发
      manager.updateInterval(entity, 2000);

      // 下一个 tick: accumulated = 2000 + 1000 = 3000, >= 2000 触发, accumulated = 1000
      jest.advanceTimersByTime(1000);
      expect(entity.heartbeatCount).toBe(1);
    });
  });

  // ================================================================
  //  生命周期
  // ================================================================

  describe('生命周期', () => {
    it('onModuleDestroy 后 tick 停止，注册表清空', () => {
      manager = new HeartbeatManager(1000);
      manager.onModuleInit();

      const entity = new TestEntity('test/a');
      manager.register(entity, 1000);

      jest.advanceTimersByTime(2000);
      expect(entity.heartbeatCount).toBe(2);

      manager.onModuleDestroy();

      // tick 已停止，心跳不再触发
      jest.advanceTimersByTime(5000);
      expect(entity.heartbeatCount).toBe(2);

      // 注册表已清空
      expect(manager.getRegisteredCount()).toBe(0);
    });
  });
});
