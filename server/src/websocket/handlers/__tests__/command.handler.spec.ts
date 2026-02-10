import type { Session } from '../../types/session';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

jest.mock('../room-utils', () => ({
  sendRoomInfo: jest.fn(),
  sendInventoryUpdate: jest.fn(),
  sendEquipmentUpdate: jest.fn(),
  getDirectionCN: (direction: string) => (direction === 'north' ? '北' : direction),
  getOppositeDirectionCN: (direction: string) => (direction === 'north' ? '南方' : '远方'),
}));

const { CommandHandler } = require('../command.handler');

describe('CommandHandler go 广播', () => {
  it('移动成功时，旧房间与新房间广播都应排除当前玩家', async () => {
    const oldRoom = {
      id: 'room/old',
      broadcast: jest.fn(),
    };
    const newRoom = {
      id: 'room/new',
      broadcast: jest.fn(),
    };

    const player = {
      getName: jest.fn(() => '测试玩家'),
      executeCommand: jest.fn(() => ({
        success: true,
        message: '你向北走去。',
        data: { direction: 'north', targetId: 'room/new' },
      })),
      getEnvironment: jest.fn().mockReturnValueOnce(oldRoom).mockReturnValueOnce(newRoom),
      go: jest.fn(async () => true),
    };

    const objectManager = {
      findById: jest.fn(() => player),
    };

    const handler = new CommandHandler(objectManager as any, {} as any, {} as any);
    const client = { send: jest.fn() };
    const session: Session = {
      socketId: 'socket-1',
      authenticated: true,
      playerId: 'player/test',
    };

    await handler.handleCommand(client, session, { input: 'go north' });

    expect(oldRoom.broadcast).toHaveBeenCalledWith('测试玩家向北离去。', player);
    expect(newRoom.broadcast).toHaveBeenCalledWith('测试玩家从南方来到此处。', player);
  });
});
