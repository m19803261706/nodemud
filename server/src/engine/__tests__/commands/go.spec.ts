/**
 * GoCommand go 指令 单元测试
 *
 * 覆盖: 无参数提示、有出口成功、无出口错误、不在房间、方向别名映射
 */
import { GoCommand } from '../../commands/std/go';
import { RoomBase } from '../../game-objects/room-base';
import { LivingBase } from '../../game-objects/living-base';

describe('GoCommand go 指令', () => {
  let goCmd: GoCommand;
  let executor: LivingBase;

  beforeEach(() => {
    goCmd = new GoCommand();
    executor = new LivingBase('test/player');
  });

  it('无参数时返回提示', () => {
    const result = goCmd.execute(executor, []);
    expect(result.success).toBe(false);
    expect(result.message).toBe('去哪里？请指定方向。');
  });

  it('go north 有出口时返回成功', async () => {
    const room = new RoomBase('room/start');
    room.set('exits', { north: 'room/target' });
    await executor.moveTo(room, { quiet: true });

    const result = goCmd.execute(executor, ['north']);
    expect(result.success).toBe(true);
    expect(result.message).toContain('north');
    expect(result.data).toEqual({ direction: 'north', targetId: 'room/target' });
  });

  it('无出口方向返回错误', async () => {
    const room = new RoomBase('room/deadend');
    room.set('exits', {});
    await executor.moveTo(room, { quiet: true });

    const result = goCmd.execute(executor, ['north']);
    expect(result.success).toBe(false);
    expect(result.message).toBe('这个方向没有出口。');
  });

  it('不在房间时返回错误', () => {
    // executor 没有 moveTo 任何房间，environment 为 null
    const result = goCmd.execute(executor, ['north']);
    expect(result.success).toBe(false);
    expect(result.message).toBe('你不在任何房间中。');
  });

  it('中文方向 "北" 映射到 north', async () => {
    const room = new RoomBase('room/start');
    room.set('exits', { north: 'room/north-target' });
    await executor.moveTo(room, { quiet: true });

    const result = goCmd.execute(executor, ['北']);
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ direction: 'north', targetId: 'room/north-target' });
  });

  it('缩写 n 映射到 north', async () => {
    const room = new RoomBase('room/start');
    room.set('exits', { north: 'room/north-target' });
    await executor.moveTo(room, { quiet: true });

    const result = goCmd.execute(executor, ['n']);
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ direction: 'north', targetId: 'room/north-target' });
  });

  it('未知方向返回错误', async () => {
    const room = new RoomBase('room/start');
    room.set('exits', { north: 'room/target' });
    await executor.moveTo(room, { quiet: true });

    const result = goCmd.execute(executor, ['飞']);
    expect(result.success).toBe(false);
    expect(result.message).toContain('未知方向');
  });
});
