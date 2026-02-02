/**
 * BaseEntity Events 心跳与延迟调用 单元测试
 */
import { BaseEntity } from '../base-entity';
import { GameEvents } from '../types/events';

/** 测试用子类，覆写 onHeartbeat */
class TestEntity extends BaseEntity {
  heartbeatCount = 0;

  constructor(id: string) {
    super(id);
  }

  protected onHeartbeat(): void {
    this.heartbeatCount++;
  }
}

describe('BaseEntity Events 心跳与延迟调用', () => {
  let entity: TestEntity;

  beforeEach(() => {
    jest.useFakeTimers();
    entity = new TestEntity('test/entity');
  });

  afterEach(() => {
    entity.destroy();
    jest.useRealTimers();
  });

  describe('心跳系统', () => {
    it('enableHeartbeat 按间隔触发 onHeartbeat', () => {
      entity.enableHeartbeat(1000);

      jest.advanceTimersByTime(3000);
      expect(entity.heartbeatCount).toBe(3);
    });

    it('enableHeartbeat 触发 heartbeat 事件', () => {
      let eventCount = 0;
      entity.on(GameEvents.HEARTBEAT, () => eventCount++);

      entity.enableHeartbeat(500);
      jest.advanceTimersByTime(2000);

      expect(eventCount).toBe(4);
    });

    it('disableHeartbeat 停止心跳', () => {
      entity.enableHeartbeat(1000);
      jest.advanceTimersByTime(2000);
      expect(entity.heartbeatCount).toBe(2);

      entity.disableHeartbeat();
      jest.advanceTimersByTime(3000);
      expect(entity.heartbeatCount).toBe(2); // 不再增加
    });

    it('重复 enableHeartbeat 先清除旧心跳', () => {
      entity.enableHeartbeat(1000);
      jest.advanceTimersByTime(1500);
      expect(entity.heartbeatCount).toBe(1);

      // 重新注册，间隔改为 500ms
      entity.enableHeartbeat(500);
      jest.advanceTimersByTime(1000);
      expect(entity.heartbeatCount).toBe(3); // 1 + 2
    });

    it('getHeartbeatInterval 返回当前间隔', () => {
      expect(entity.getHeartbeatInterval()).toBe(0);

      entity.enableHeartbeat(2000);
      expect(entity.getHeartbeatInterval()).toBe(2000);

      entity.disableHeartbeat();
      expect(entity.getHeartbeatInterval()).toBe(0);
    });

    it('未注册心跳时 disableHeartbeat 不报错', () => {
      expect(() => entity.disableHeartbeat()).not.toThrow();
    });
  });

  describe('延迟调用 (callOut)', () => {
    it('callOut 延迟执行回调', () => {
      let called = false;
      entity.callOut(() => {
        called = true;
      }, 1000);

      expect(called).toBe(false);
      jest.advanceTimersByTime(1000);
      expect(called).toBe(true);
    });

    it('callOut 返回唯一 ID', () => {
      const id1 = entity.callOut(() => {}, 1000);
      const id2 = entity.callOut(() => {}, 2000);

      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
    });

    it('removeCallOut 取消未执行的延迟调用', () => {
      let called = false;
      const id = entity.callOut(() => {
        called = true;
      }, 1000);

      entity.removeCallOut(id);
      jest.advanceTimersByTime(2000);

      expect(called).toBe(false);
    });

    it('removeCallOut 对不存在的 ID 不报错', () => {
      expect(() => entity.removeCallOut('nonexistent')).not.toThrow();
    });

    it('callOut 执行后自动从注册表移除', () => {
      let count = 0;
      entity.callOut(() => {
        count++;
      }, 500);

      jest.advanceTimersByTime(500);
      expect(count).toBe(1);

      // 再过 500ms 不会重复执行
      jest.advanceTimersByTime(500);
      expect(count).toBe(1);
    });

    it('clearCallOuts 清除所有延迟调用', () => {
      let count = 0;
      entity.callOut(() => count++, 1000);
      entity.callOut(() => count++, 2000);
      entity.callOut(() => count++, 3000);

      entity.clearCallOuts();
      jest.advanceTimersByTime(5000);

      expect(count).toBe(0);
    });

    it('多个 callOut 各自独立触发', () => {
      const results: number[] = [];
      entity.callOut(() => results.push(1), 100);
      entity.callOut(() => results.push(2), 200);
      entity.callOut(() => results.push(3), 300);

      jest.advanceTimersByTime(300);
      expect(results).toEqual([1, 2, 3]);
    });
  });

  describe('destroy 清理', () => {
    it('destroy 停止心跳', () => {
      entity.enableHeartbeat(1000);
      jest.advanceTimersByTime(1000);
      expect(entity.heartbeatCount).toBe(1);

      entity.destroy();
      jest.advanceTimersByTime(5000);
      expect(entity.heartbeatCount).toBe(1);
    });

    it('destroy 清除延迟调用', () => {
      let called = false;
      entity.callOut(() => {
        called = true;
      }, 1000);

      entity.destroy();
      jest.advanceTimersByTime(2000);

      expect(called).toBe(false);
    });

    it('destroy 清除事件监听器', () => {
      entity.on(GameEvents.HEARTBEAT, () => {});
      entity.on(GameEvents.MESSAGE, () => {});
      entity.on('custom', () => {});

      entity.destroy();

      expect(entity.listenerCount(GameEvents.HEARTBEAT)).toBe(0);
      expect(entity.listenerCount(GameEvents.MESSAGE)).toBe(0);
      expect(entity.listenerCount('custom')).toBe(0);
    });
  });

  describe('EventEmitter 基础功能', () => {
    it('emit / on 正常工作', () => {
      let received: string | null = null;
      entity.on(GameEvents.MESSAGE, (msg) => {
        received = msg;
      });

      entity.emit(GameEvents.MESSAGE, '你好');
      expect(received).toBe('你好');
    });

    it('多个监听器都触发', () => {
      let count = 0;
      entity.on(GameEvents.SAY, () => count++);
      entity.on(GameEvents.SAY, () => count++);

      entity.emit(GameEvents.SAY, '说话');
      expect(count).toBe(2);
    });

    it('off 移除监听器', () => {
      let count = 0;
      const handler = () => count++;
      entity.on(GameEvents.LOOK, handler);
      entity.off(GameEvents.LOOK, handler);

      entity.emit(GameEvents.LOOK);
      expect(count).toBe(0);
    });
  });
});
