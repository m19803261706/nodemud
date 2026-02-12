import type { Character } from '../../character/character.entity';
import { ExpManager } from '../quest/exp-manager';
import { PlayerBase } from '../game-objects/player-base';
import { sendPlayerStats } from '../../websocket/handlers/stats.utils';

jest.mock('../../websocket/handlers/stats.utils', () => ({
  sendPlayerStats: jest.fn(),
}));

describe('ExpManager.allocatePoints', () => {
  let manager: ExpManager;
  let player: PlayerBase;
  let character: Character;

  beforeEach(() => {
    manager = new ExpManager();
    player = new PlayerBase('player/test');
    player.set('name', '测试玩家');
    player.set('free_points', 3);

    character = {
      wisdom: 8,
      perception: 8,
      spirit: 8,
      meridian: 8,
      strength: 8,
      vitality: 8,
      wisdomCap: 8,
      perceptionCap: 8,
      spiritCap: 8,
      meridianCap: 8,
      strengthCap: 8,
      vitalityCap: 8,
      freePoints: 3,
    } as Character;

    jest.clearAllMocks();
  });

  it('允许属性分配突破先天上限', () => {
    const result = manager.allocatePoints(player, character, {
      allocations: { wisdom: 2 },
    });

    expect(result.success).toBe(true);
    expect(character.wisdom).toBe(10);
    expect(player.get<number>('wisdom')).toBe(10);
    expect(character.freePoints).toBe(1);
    expect(player.get<number>('free_points')).toBe(1);
    expect(sendPlayerStats).toHaveBeenCalledTimes(1);
  });

  it('总分配点数超过 free_points 时仍应失败', () => {
    const result = manager.allocatePoints(player, character, {
      allocations: { wisdom: 4 },
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain('属性点不足');
    expect(character.wisdom).toBe(8);
    expect(player.get<number>('wisdom')).toBeUndefined();
    expect(sendPlayerStats).not.toHaveBeenCalled();
  });

  it('分配值为负数时应失败', () => {
    const result = manager.allocatePoints(player, character, {
      allocations: { wisdom: -1 },
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain('非负整数');
    expect(sendPlayerStats).not.toHaveBeenCalled();
  });
});
