/**
 * BaseEntity Environment 环境/容器系统 单元测试
 */
import { BaseEntity } from '../base-entity';
import { GameEvents } from '../types/events';

/** 测试用具体子类 */
class TestEntity extends BaseEntity {
  constructor(id: string) {
    super(id);
  }
}

describe('BaseEntity Environment 环境/容器系统', () => {
  let room1: TestEntity;
  let room2: TestEntity;
  let player: TestEntity;
  let npc: TestEntity;
  let item: TestEntity;

  beforeEach(() => {
    room1 = new TestEntity('room/inn');
    room2 = new TestEntity('room/street');
    player = new TestEntity('player/test');
    npc = new TestEntity('npc/guard#1');
    item = new TestEntity('item/sword#1');
  });

  describe('基础容器操作', () => {
    it('初始状态无环境', () => {
      expect(player.getEnvironment()).toBeNull();
      expect(room1.getInventory()).toEqual([]);
    });

    it('moveTo 移动到容器', async () => {
      const result = await player.moveTo(room1);
      expect(result).toBe(true);
      expect(player.getEnvironment()).toBe(room1);
      expect(room1.getInventory()).toContain(player);
    });

    it('moveTo 从一个容器移到另一个', async () => {
      await player.moveTo(room1);
      await player.moveTo(room2);

      expect(player.getEnvironment()).toBe(room2);
      expect(room1.getInventory()).not.toContain(player);
      expect(room2.getInventory()).toContain(player);
    });

    it('getInventory 返回所有直接子对象', async () => {
      await player.moveTo(room1);
      await npc.moveTo(room1);

      const inv = room1.getInventory();
      expect(inv).toHaveLength(2);
      expect(inv).toContain(player);
      expect(inv).toContain(npc);
    });

    it('getDeepInventory 递归获取', async () => {
      await player.moveTo(room1);
      await item.moveTo(player);

      const deep = room1.getDeepInventory();
      expect(deep).toHaveLength(2);
      expect(deep).toContain(player);
      expect(deep).toContain(item);
    });

    it('findInInventory 按条件搜索', async () => {
      await player.moveTo(room1);
      await npc.moveTo(room1);
      player.set('name', '玩家');
      npc.set('name', '守卫');

      const found = room1.findInInventory((e) => e.get('name') === '守卫');
      expect(found).toBe(npc);
    });

    it('findInInventory 找不到返回 undefined', () => {
      const found = room1.findInInventory(() => false);
      expect(found).toBeUndefined();
    });
  });

  describe('moveTo 事件链（quiet=false）', () => {
    it('触发完整 7 步事件链', async () => {
      await player.moveTo(room1); // 先放到 room1
      const events: string[] = [];

      player.on(GameEvents.PRE_MOVE, () => events.push('pre:move'));
      room1.on(GameEvents.PRE_LEAVE, () => events.push('pre:leave'));
      room2.on(GameEvents.PRE_RECEIVE, () => events.push('pre:receive'));
      room1.on(GameEvents.POST_LEAVE, () => events.push('post:leave'));
      room2.on(GameEvents.POST_RECEIVE, () => events.push('post:receive'));
      player.on(GameEvents.POST_MOVE, () => events.push('post:move'));

      await player.moveTo(room2);

      expect(events).toEqual([
        'pre:move',
        'pre:leave',
        'pre:receive',
        'post:leave',
        'post:receive',
        'post:move',
      ]);
    });

    it('pre:move 取消阻止移动', async () => {
      player.on(GameEvents.PRE_MOVE, (event) => {
        event.cancel();
      });

      const result = await player.moveTo(room1);
      expect(result).toBe(false);
      expect(player.getEnvironment()).toBeNull();
    });

    it('pre:leave 取消阻止离开', async () => {
      await player.moveTo(room1);

      room1.on(GameEvents.PRE_LEAVE, (event) => {
        event.cancel();
      });

      const result = await player.moveTo(room2);
      expect(result).toBe(false);
      expect(player.getEnvironment()).toBe(room1);
    });

    it('pre:receive 取消阻止进入', async () => {
      room1.on(GameEvents.PRE_RECEIVE, (event) => {
        event.cancel();
      });

      const result = await player.moveTo(room1);
      expect(result).toBe(false);
      expect(player.getEnvironment()).toBeNull();
    });

    it('pre:receive 基于条件判断', async () => {
      player.set('level', 5);
      room1.on(GameEvents.PRE_RECEIVE, (event) => {
        if ((event.who.get('level') as number) < 10) {
          event.cancel();
        }
      });

      const result = await player.moveTo(room1);
      expect(result).toBe(false);

      // 升级后可以进入
      player.set('level', 15);
      const result2 = await player.moveTo(room1);
      expect(result2).toBe(true);
    });

    it('触发 encounter 事件', async () => {
      await npc.moveTo(room1);
      const encountered: string[] = [];
      npc.on(GameEvents.ENCOUNTER, (event) => {
        encountered.push(event.who.id);
      });

      await player.moveTo(room1);
      expect(encountered).toContain(player.id);
    });

    it('首次放置（无 source）不触发 pre:leave', async () => {
      const events: string[] = [];
      player.on(GameEvents.PRE_MOVE, () => events.push('pre:move'));
      room1.on(GameEvents.PRE_RECEIVE, () => events.push('pre:receive'));
      room1.on(GameEvents.POST_RECEIVE, () => events.push('post:receive'));
      player.on(GameEvents.POST_MOVE, () => events.push('post:move'));

      await player.moveTo(room1);

      expect(events).toEqual(['pre:move', 'pre:receive', 'post:receive', 'post:move']);
    });
  });

  describe('moveTo 静默模式（quiet=true）', () => {
    it('静默移动不触发任何事件', async () => {
      const events: string[] = [];
      player.on(GameEvents.PRE_MOVE, () => events.push('pre:move'));
      room1.on(GameEvents.PRE_RECEIVE, () => events.push('pre:receive'));
      room1.on(GameEvents.POST_RECEIVE, () => events.push('post:receive'));
      player.on(GameEvents.POST_MOVE, () => events.push('post:move'));

      await player.moveTo(room1, { quiet: true });

      expect(events).toEqual([]);
      expect(player.getEnvironment()).toBe(room1);
    });

    it('静默移动不触发 encounter', async () => {
      await npc.moveTo(room1);
      const encountered: string[] = [];
      npc.on(GameEvents.ENCOUNTER, (event) => {
        encountered.push(event.who.id);
      });

      await player.moveTo(room1, { quiet: true });
      expect(encountered).toEqual([]);
    });
  });

  describe('destroy 销毁', () => {
    it('销毁触发 destroyed 事件', async () => {
      let fired = false;
      player.on(GameEvents.DESTROYED, () => {
        fired = true;
      });

      player.destroy();
      expect(fired).toBe(true);
    });

    it('销毁后从环境中移除', async () => {
      await player.moveTo(room1);
      player.destroy();

      expect(room1.getInventory()).not.toContain(player);
    });

    it('销毁时内容物移到上层环境', async () => {
      await player.moveTo(room1);
      await item.moveTo(player);

      player.destroy();

      // item 应该被移到 room1
      expect(item.getEnvironment()).toBe(room1);
      expect(room1.getInventory()).toContain(item);
    });

    it('重复销毁不报错', () => {
      player.destroy();
      expect(() => player.destroy()).not.toThrow();
    });

    it('销毁标记', () => {
      expect(player.destroyed).toBe(false);
      player.destroy();
      expect(player.destroyed).toBe(true);
    });

    it('销毁清除所有监听器', async () => {
      player.on('custom', () => {});
      player.on(GameEvents.MESSAGE, () => {});

      player.destroy();
      expect(player.listenerCount('custom')).toBe(0);
      expect(player.listenerCount(GameEvents.MESSAGE)).toBe(0);
    });
  });
});
