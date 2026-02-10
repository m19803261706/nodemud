import { PlayerBase } from '../../../engine/game-objects/player-base';
import type { Character } from '../../../character/character.entity';
import { derivePlayerStats } from '../stats.utils';

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
    createdAt: new Date(),
    ...partial,
  } as Character;
}

describe('stats.utils derivePlayerStats', () => {
  it('优先使用运行时 hp，而不是 legacy hp_current', () => {
    const player = new PlayerBase('player/test');
    const character = makeCharacter({ vitality: 5 });
    player.set('hp', 320);
    player.set('hp_current', 499);

    const stats = derivePlayerStats(character, player);

    expect(stats.hp.max).toBe(500);
    expect(stats.hp.current).toBe(320);
  });

  it('当运行时 hp 不存在时，回退使用 legacy hp_current', () => {
    const player = new PlayerBase('player/test');
    const character = makeCharacter({ vitality: 5 });
    player.set('hp_current', 410);

    const stats = derivePlayerStats(character, player);

    expect(stats.hp.current).toBe(410);
  });

  it('资源值会被钳制到 [0, max] 区间', () => {
    const player = new PlayerBase('player/test');
    const character = makeCharacter({
      vitality: 5, // hpMax = 500
      spirit: 4, // mpMax = 320
      wisdom: 3,
      perception: 3, // energyMax = 300
    });

    player.set('hp', -1);
    player.set('mp', 999);
    player.set('energy', 999);

    const stats = derivePlayerStats(character, player);

    expect(stats.hp.current).toBe(0);
    expect(stats.mp.current).toBe(320);
    expect(stats.energy.current).toBe(300);
  });
});
