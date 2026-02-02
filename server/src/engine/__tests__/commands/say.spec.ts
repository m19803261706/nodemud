/**
 * SayCommand 说话指令 单元测试
 */
import { SayCommand } from '../../commands/std/say';
import type { LivingBase } from '../../game-objects/living-base';
import { RoomBase } from '../../game-objects/room-base';

/** 创建 mock 执行者 */
function createMockExecutor(options?: { name?: string; environment?: any }): LivingBase {
  const { name = '张三', environment = null } = options ?? {};
  return {
    getName: () => name,
    getEnvironment: () => environment,
  } as unknown as LivingBase;
}

/** 创建 mock 房间 */
function createMockRoom(): RoomBase & { broadcast: jest.Mock } {
  const room = Object.create(RoomBase.prototype);
  room.broadcast = jest.fn();
  return room;
}

describe('SayCommand 说话指令', () => {
  let command: SayCommand;

  beforeEach(() => {
    command = new SayCommand();
  });

  it('无参数时返回提示"说什么？"', () => {
    const room = createMockRoom();
    const executor = createMockExecutor({ environment: room });

    const result = command.execute(executor, []);

    expect(result.success).toBe(false);
    expect(result.message).toBe('说什么？');
  });

  it('say <message> 广播消息并返回确认', () => {
    const room = createMockRoom();
    const executor = createMockExecutor({ name: '李白', environment: room });

    const result = command.execute(executor, ['大家好']);

    expect(result.success).toBe(true);
    // 富文本标记: [sys]你说道: 「[/sys][chat]大家好[/chat][sys]」[/sys]
    expect(result.message).toBe('[sys]你说道: 「[/sys][chat]大家好[/chat][sys]」[/sys]');
  });

  it('不在房间时返回错误提示', () => {
    // environment 为 null，不在任何房间中
    const executor = createMockExecutor({ environment: null });

    const result = command.execute(executor, ['你好']);

    expect(result.success).toBe(false);
    expect(result.message).toBe('你不在任何房间中。');
  });

  it('broadcast 被正确调用（排除自己，消息格式正确）', () => {
    const room = createMockRoom();
    const executor = createMockExecutor({ name: '杜甫', environment: room });

    command.execute(executor, ['月落', '乌啼', '霜满天']);

    // 验证 broadcast 调用参数
    expect(room.broadcast).toHaveBeenCalledTimes(1);
    // 富文本标记: [player]杜甫[/player][sys]说道: 「[/sys][chat]月落 乌啼 霜满天[/chat][sys]」[/sys]
    expect(room.broadcast).toHaveBeenCalledWith(
      '[player]杜甫[/player][sys]说道: 「[/sys][chat]月落 乌啼 霜满天[/chat][sys]」[/sys]',
      executor,
    );
  });
});
