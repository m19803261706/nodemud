import { PlayerBase } from '../../../engine/game-objects/player-base';
import type { Character } from '../../../character/character.entity';
import { derivePlayerStats, loadCharacterToPlayer, savePlayerData } from '../stats.utils';

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
    sectData: null,
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

  it('银两优先使用运行时字段，并保证非负整数', () => {
    const player = new PlayerBase('player/test');
    const character = makeCharacter({ silver: 200 });

    player.set('silver', -8.9);
    let stats = derivePlayerStats(character, player);
    expect(stats.silver).toBe(0);

    player.set('silver', 123.9);
    stats = derivePlayerStats(character, player);
    expect(stats.silver).toBe(123);
  });

  it('登录加载会补齐关键运行时字段并规范化资源', () => {
    const player = new PlayerBase('player/test');
    const character = makeCharacter({
      id: 'char-99',
      name: '泡泡',
      vitality: 5,
      spirit: 4,
      wisdom: 3,
      perception: 3,
      exp: 456,
      silver: 188.8,
      questData: { active: {}, completed: [] },
    });

    player.set('hp', 999);
    player.set('mp', -3);
    player.set('energy', 999);

    loadCharacterToPlayer(player, character);

    expect(player.get<string>('name')).toBe('泡泡');
    expect(player.get<string>('characterId')).toBe('char-99');
    expect(player.get<number>('exp')).toBe(456);
    expect(player.get<number>('combat_exp')).toBe(456);
    expect(player.get<number>('hp')).toBe(500);
    expect(player.get<number>('mp')).toBe(0);
    expect(player.get<number>('energy')).toBe(300);
    expect(player.get<number>('hp_current')).toBe(500);
    expect(player.get<number>('mp_current')).toBe(0);
    expect(player.get<number>('energy_current')).toBe(300);
    expect(player.get<number>('silver')).toBe(188);
    expect(player.get<any>('quests')).toEqual({ active: {}, completed: [] });
    expect(player.get<string>('origin')).toBe('wanderer');
    expect(player.get<number>('fortune')).toBe(3);
    expect(player.get<string>('wuxingju')).toBe('水二局');
    expect(player.get<string>('last_room')).toBe('area/rift-town/square');

    const astrolabe = player.get<any>('astrolabeJson');
    astrolabe.extra = 'runtime-only';
    expect((character.astrolabeJson as any).extra).toBeUndefined();

    const quests = player.get<any>('quests');
    quests.active.rift = { progress: 1 };
    expect((character.questData as any)?.active?.rift).toBeUndefined();
  });

  it('playerStats 的 hp/mp 上限优先使用运行时 max_* 并叠加技能加成', () => {
    const player = new PlayerBase('player/test');
    const character = makeCharacter({ vitality: 5, spirit: 4 });

    player.set('max_hp', 900);
    player.set('max_mp', 700);
    jest.spyOn(player, 'getSkillBonusSummary').mockReturnValue({
      attack: 0,
      defense: 0,
      dodge: 0,
      parry: 0,
      maxHp: 120,
      maxMp: 80,
      critRate: 0,
      hitRate: 0,
    });

    const stats = derivePlayerStats(character, player);
    expect(stats.hp.max).toBe(1020);
    expect(stats.mp.max).toBe(780);
  });

  it('保存玩家数据时 exp 缺失会回退 combat_exp', () => {
    const player = new PlayerBase('player/test');
    const character = makeCharacter({ exp: 10 });

    player.set('combat_exp', 888);
    savePlayerData(player, character);

    expect(character.exp).toBe(888);
  });

  it('登录加载应归一化并挂载 sect 数据', () => {
    const player = new PlayerBase('player/test');
    const character = makeCharacter({
      sectData: {
        current: {
          sectId: 'songyang',
          sectName: '嵩阳宗',
          masterNpcId: 'npc/songyang/master-li',
          masterName: '李掌门',
          rank: '外门弟子',
          contribution: 120,
          joinedAt: 1700000000000,
        },
        restrictions: { bannedSectIds: ['yunyue'], cooldownUntil: null },
        daily: { dateKey: '2026-02-10', sparCount: 1 },
      },
    });

    loadCharacterToPlayer(player, character);
    const sect = player.get<any>('sect');

    expect(sect.current.sectId).toBe('songyang');
    expect(sect.current.contribution).toBe(120);
    expect(sect.restrictions.bannedSectIds).toEqual(['yunyue']);
    expect(sect.daily.sparCount).toBe(1);
  });

  it('保存玩家数据应回写 sect 状态', () => {
    const player = new PlayerBase('player/test');
    const character = makeCharacter({ sectData: null });
    player.set('sect', {
      current: {
        sectId: 'songyang',
        sectName: '嵩阳宗',
        masterNpcId: 'npc/songyang/master-li',
        masterName: '李掌门',
        rank: '内门弟子',
        contribution: 360,
        joinedAt: 1700000000000,
      },
      restrictions: { bannedSectIds: ['tianlie'], cooldownUntil: null },
      daily: { dateKey: '2026-02-10', sparCount: 0 },
    });

    savePlayerData(player, character);

    expect(character.sectData?.current?.sectId).toBe('songyang');
    expect(character.sectData?.current?.rank).toBe('内门弟子');
    expect(character.sectData?.current?.contribution).toBe(360);
    expect(character.sectData?.restrictions.bannedSectIds).toEqual(['tianlie']);
  });
});
