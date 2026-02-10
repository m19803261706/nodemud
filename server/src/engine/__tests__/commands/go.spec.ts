/**
 * GoCommand go 指令 单元测试
 *
 * 覆盖: 无参数提示、有出口成功、无出口错误、不在房间、方向别名映射
 */
import { GoCommand } from '../../commands/std/go';
import { RoomBase } from '../../game-objects/room-base';
import { LivingBase } from '../../game-objects/living-base';
import { ServiceLocator } from '../../service-locator';
import { ObjectManager } from '../../object-manager';

describe('GoCommand go 指令', () => {
  let goCmd: GoCommand;
  let executor: LivingBase;
  let objectManager: ObjectManager;

  beforeEach(() => {
    goCmd = new GoCommand();
    executor = new LivingBase('test/player');
    objectManager = new ObjectManager();
    ServiceLocator.objectManager = objectManager;
  });

  afterEach(() => {
    ServiceLocator.reset();
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

    // 注册目标房间以便 go 指令解析中文名
    const targetRoom = new RoomBase('room/target');
    targetRoom.set('short', '北方小路');
    objectManager.register(targetRoom);

    const result = goCmd.execute(executor, ['north']);
    expect(result.success).toBe(true);
    // 显示目标房间中文名
    expect(result.message).toBe('[sys]你向[/sys][exit]北方小路[/exit][sys]走去。[/sys]');
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

    const targetRoom = new RoomBase('room/north-target');
    targetRoom.set('short', '北方');
    objectManager.register(targetRoom);

    const result = goCmd.execute(executor, ['北']);
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ direction: 'north', targetId: 'room/north-target' });
  });

  it('缩写 n 映射到 north', async () => {
    const room = new RoomBase('room/start');
    room.set('exits', { north: 'room/north-target' });
    await executor.moveTo(room, { quiet: true });

    const targetRoom = new RoomBase('room/north-target');
    targetRoom.set('short', '北方');
    objectManager.register(targetRoom);

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

  it('go 指令只负责返回移动意图，不处理房间门禁事件', async () => {
    const room = new RoomBase('area/songyang/mountain-path');
    room.set('exits', { north: 'area/songyang/gate' });
    await executor.moveTo(room, { quiet: true });

    const result = goCmd.execute(executor, ['north']);
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ direction: 'north', targetId: 'area/songyang/gate' });
  });
});
