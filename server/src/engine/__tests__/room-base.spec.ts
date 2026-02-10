/**
 * RoomBase 房间基类 -- 单元测试
 *
 * 覆盖：
 * - static virtual 标记
 * - getShort / getLong 描述（有值 + 默认值）
 * - getExits / getExit 出口系统
 * - getCoordinates 坐标
 * - broadcast 广播（基本 / exclude / 空房间）
 */
import { RoomBase } from '../game-objects/room-base';
import { BaseEntity } from '../base-entity';
import { PlayerBase } from '../game-objects/player-base';

describe('RoomBase', () => {
  let room: RoomBase;

  beforeEach(() => {
    room = new RoomBase('test/room');
  });

  // ========== static virtual ==========

  it('static virtual = true', () => {
    expect(RoomBase.virtual).toBe(true);
  });

  // ========== getShort ==========

  describe('getShort()', () => {
    it('返回设置的短描述', () => {
      room.set('short', '扬州客栈');
      expect(room.getShort()).toBe('扬州客栈');
    });

    it('未设置时返回默认值', () => {
      expect(room.getShort()).toBe('未知地点');
    });
  });

  // ========== getLong ==========

  describe('getLong()', () => {
    it('返回设置的长描述', () => {
      room.set('long', '这是一间古朴的客栈，空气中弥漫着酒香。');
      expect(room.getLong()).toBe('这是一间古朴的客栈，空气中弥漫着酒香。');
    });

    it('未设置时返回默认值', () => {
      expect(room.getLong()).toBe('这里什么也没有。');
    });
  });

  // ========== getExits / getExit ==========

  describe('getExits()', () => {
    it('返回设置的出口列表', () => {
      const exits = { north: 'yangzhou/street', south: 'yangzhou/gate' };
      room.set('exits', exits);
      expect(room.getExits()).toEqual(exits);
    });

    it('未设置时返回空对象', () => {
      expect(room.getExits()).toEqual({});
    });
  });

  describe('getExit()', () => {
    beforeEach(() => {
      room.set('exits', { north: 'yangzhou/street', south: 'yangzhou/gate' });
    });

    it('返回指定方向的出口路径', () => {
      expect(room.getExit('north')).toBe('yangzhou/street');
    });

    it('方向不存在时返回 undefined', () => {
      expect(room.getExit('west')).toBeUndefined();
    });
  });

  // ========== getCoordinates ==========

  describe('getCoordinates()', () => {
    it('返回设置的坐标（含 z）', () => {
      room.set('coordinates', { x: 10, y: 20, z: 1 });
      expect(room.getCoordinates()).toEqual({ x: 10, y: 20, z: 1 });
    });

    it('返回设置的坐标（不含 z）', () => {
      room.set('coordinates', { x: 5, y: 15 });
      expect(room.getCoordinates()).toEqual({ x: 5, y: 15 });
    });

    it('未设置时返回 undefined', () => {
      expect(room.getCoordinates()).toBeUndefined();
    });
  });

  // ========== broadcast ==========

  describe('broadcast()', () => {
    it('广播消息给房间内所有对象', async () => {
      const npc1 = new BaseEntity('npc/a');
      const npc2 = new BaseEntity('npc/b');
      await npc1.moveTo(room, { quiet: true });
      await npc2.moveTo(room, { quiet: true });

      const received1: any[] = [];
      const received2: any[] = [];
      npc1.on('message', (data) => received1.push(data));
      npc2.on('message', (data) => received2.push(data));

      room.broadcast('天色渐暗。');

      expect(received1).toEqual([{ message: '天色渐暗。' }]);
      expect(received2).toEqual([{ message: '天色渐暗。' }]);
    });

    it('广播时排除指定对象', async () => {
      const player = new BaseEntity('player/zhang');
      const npc = new BaseEntity('npc/guard');
      await player.moveTo(room, { quiet: true });
      await npc.moveTo(room, { quiet: true });

      const playerReceived: any[] = [];
      const npcReceived: any[] = [];
      player.on('message', (data) => playerReceived.push(data));
      npc.on('message', (data) => npcReceived.push(data));

      room.broadcast('张三走了进来。', player);

      expect(playerReceived).toEqual([]);
      expect(npcReceived).toEqual([{ message: '张三走了进来。' }]);
    });

    it('空房间广播不报错', () => {
      expect(() => room.broadcast('寂静无声。')).not.toThrow();
    });

    it('对玩家广播会转发到客户端消息', async () => {
      const player = new PlayerBase('player/test');
      const sent: any[] = [];
      player.bindConnection((data) => sent.push(data));
      await player.moveTo(room, { quiet: true });

      room.broadcast('有人从远处走来。');

      expect(sent).toEqual([
        {
          type: 'message',
          data: { content: '有人从远处走来。' },
        },
      ]);
    });
  });
});
