import type { Character } from '../../../character/character.entity';
import { RoomBase } from '../../../engine/game-objects/room-base';
import { PlayerBase } from '../../../engine/game-objects/player-base';
import { enterWorldWithCharacter } from '../enter-world.utils';
import type { Session } from '../../types/session';

function makeCharacter(partial?: Partial<Character>): Character {
  return {
    id: 'char-1',
    accountId: 'acc-1',
    name: '测试角色',
    origin: 'wanderer',
    gender: 'male',
    fateName: '天机化变',
    fateType: 'tianji',
    fatePoem: '命格诗句',
    destiny: 3,
    benefactor: 3,
    calamity: 3,
    fortune: 3,
    wisdom: 3,
    perception: 3,
    spirit: 4,
    meridian: 3,
    strength: 3,
    vitality: 5,
    wisdomCap: 8,
    perceptionCap: 8,
    spiritCap: 8,
    meridianCap: 8,
    strengthCap: 8,
    vitalityCap: 8,
    astrolabeJson: {},
    wuxingju: '水二局',
    mingzhuStar: '天机',
    shenzhuStar: '天梁',
    lastRoom: 'area/rift-town/square',
    silver: 150,
    exp: 200,
    level: 3,
    potential: 40,
    score: 12,
    freePoints: 2,
    questData: null,
    createdAt: new Date(),
    ...partial,
  } as Character;
}

describe('enterWorldWithCharacter', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('登录模式会优先尝试 lastRoom，不存在时回退默认房间', async () => {
    const defaultRoom = new RoomBase('area/rift-town/square');
    const getVirtual = jest.fn((id: string) => {
      if (id === 'area/rift-town/square') return defaultRoom;
      return undefined;
    });

    const objectManager = {
      nextInstanceId: jest.fn(() => 'player/test#1'),
      register: jest.fn(),
    } as any;
    const blueprintFactory = { getVirtual } as any;
    const client = { send: jest.fn() };
    const session: Session = { socketId: 'sock-1', authenticated: true };
    const logger = { warn: jest.fn() };
    const setupSpy = jest.spyOn(PlayerBase.prototype, 'setupOnEnterWorld').mockResolvedValue();

    const character = makeCharacter({ lastRoom: 'area/not-exists' });
    await enterWorldWithCharacter({
      client,
      session,
      character,
      objectManager,
      blueprintFactory,
      defaultRoomId: 'area/rift-town/square',
      entryBroadcastText: '有人上线了。',
      useLastRoom: true,
      logger,
    });

    expect(getVirtual).toHaveBeenCalledWith('area/not-exists');
    expect(getVirtual).toHaveBeenCalledWith('area/rift-town/square');
    expect(setupSpy).toHaveBeenCalledWith('char-1');
    expect(session.playerId).toBe('player/test#1');
    expect(session.characterId).toBe('char-1');
    expect(defaultRoom.getInventory().some((e) => e.id === 'player/test#1')).toBe(true);
  });

  it('创角模式直接进入默认房间', async () => {
    const defaultRoom = new RoomBase('area/rift-town/square');
    const getVirtual = jest.fn((id: string) => {
      if (id === 'area/rift-town/square') return defaultRoom;
      return undefined;
    });

    const objectManager = {
      nextInstanceId: jest.fn(() => 'player/test#2'),
      register: jest.fn(),
    } as any;
    const blueprintFactory = { getVirtual } as any;
    const client = { send: jest.fn() };
    const session: Session = { socketId: 'sock-2', authenticated: true };
    const setupSpy = jest.spyOn(PlayerBase.prototype, 'setupOnEnterWorld').mockResolvedValue();

    await enterWorldWithCharacter({
      client,
      session,
      character: makeCharacter(),
      objectManager,
      blueprintFactory,
      defaultRoomId: 'area/rift-town/square',
      entryBroadcastText: '有人来到此处。',
      useLastRoom: false,
    });

    expect(getVirtual).toHaveBeenCalledTimes(1);
    expect(getVirtual).toHaveBeenCalledWith('area/rift-town/square');
    expect(setupSpy).toHaveBeenCalledWith('char-1');
    expect(defaultRoom.getInventory().some((e) => e.id === 'player/test#2')).toBe(true);
  });
});
