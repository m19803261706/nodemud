import { ItemBase } from '../game-objects/item-base';
import { NpcBase } from '../game-objects/npc-base';
import { PlayerBase } from '../game-objects/player-base';
import { SongyangPolicy } from '../sect/policies/songyang.policy';
import { SectManager } from '../sect/sect-manager';
import { SectRegistry } from '../sect/sect-registry';

function createPlayer(id = 'player/test'): PlayerBase {
  const player = new PlayerBase(id);
  player.set('name', '测试玩家');
  player.set('level', 6);
  return player;
}

function createSongyangNpc(id: string, name: string, role: 'mentor' | 'master' | 'deacon' | 'sparring'): NpcBase {
  const npc = new NpcBase(`${id}#1`);
  npc.set('name', name);
  npc.set('sect_id', 'songyang');
  npc.set('sect_role', role);
  return npc;
}

describe('SectManager', () => {
  let registry: SectRegistry;
  let manager: SectManager;

  beforeEach(() => {
    registry = new SectRegistry();
    registry.register(new SongyangPolicy());
    manager = new SectManager(registry);
  });

  it('可成功拜入嵩阳宗并写入门派状态', () => {
    const player = createPlayer();
    const mentor = createSongyangNpc('npc/songyang/mentor-he', '何教习', 'mentor');

    const result = manager.apprentice(player, mentor);
    const data = manager.getPlayerSectData(player);

    expect(result.success).toBe(true);
    expect(data.current?.sectId).toBe('songyang');
    expect(data.current?.masterNpcId).toBe('npc/songyang/mentor-he');
    expect(data.current?.masterName).toBe('何教习');
    expect(data.current?.rank).toBe('外门弟子');
    expect(data.current?.contribution).toBe(0);
  });

  it('掌门不直接收徒，应先经何教习入门', () => {
    const player = createPlayer();
    const master = createSongyangNpc('npc/songyang/master-li', '李掌门', 'master');

    const result = manager.apprentice(player, master);
    expect(result.success).toBe(false);
    expect(result.message).toContain('何教习');
  });

  it('捐献可增加贡献并触发职位晋升', () => {
    const player = createPlayer();
    const mentor = createSongyangNpc('npc/songyang/mentor-he', '何教习', 'mentor');
    const deacon = createSongyangNpc('npc/songyang/deacon-zhao', '赵执事', 'deacon');
    manager.apprentice(player, mentor);

    const ingot = new ItemBase('item/test/ingot');
    ingot.set('name', '精铁锭');
    ingot.set('type', 'misc');
    ingot.set('value', 600);
    ingot.set('weight', 20);

    const result = manager.donate(player, deacon, ingot);
    const data = manager.getPlayerSectData(player);

    expect(result.success).toBe(true);
    expect(data.current?.contribution).toBeGreaterThanOrEqual(360);
    expect(data.current?.rank).toBe('内门弟子');
  });

  it('已装备物品不能捐献，且不变更贡献', async () => {
    const player = createPlayer();
    const mentor = createSongyangNpc('npc/songyang/mentor-he', '何教习', 'mentor');
    const deacon = createSongyangNpc('npc/songyang/deacon-zhao', '赵执事', 'deacon');
    manager.apprentice(player, mentor);

    const sword = new ItemBase('item/test/sword');
    sword.set('name', '练功剑');
    sword.set('type', 'weapon');
    sword.set('value', 200);
    sword.set('weight', 10);
    await sword.moveTo(player, { quiet: true });
    player.equip(sword, 'weapon');

    const result = manager.donate(player, deacon, sword);
    const data = manager.getPlayerSectData(player);

    expect(result.success).toBe(false);
    expect(result.message).toContain('请先卸下再捐献');
    expect(data.current?.contribution).toBe(0);
    expect(player.getInventory().includes(sword)).toBe(true);
    expect(player.getEquipment().get('weapon')).toBe(sword);
  });

  it('演武每日仅一次，结算后增加贡献', () => {
    const player = createPlayer();
    const mentor = createSongyangNpc('npc/songyang/mentor-he', '何教习', 'mentor');
    const sparring = createSongyangNpc('npc/songyang/sparring-disciple', '陪练弟子', 'sparring');
    manager.apprentice(player, mentor);

    expect(manager.canStartSpar(player, sparring)).toBe(true);
    manager.reserveSparAttempt(player);
    expect(typeof manager.canStartSpar(player, sparring)).toBe('string');

    const messages: string[] = [];
    player.bindConnection((payload) => {
      const content = payload?.data?.content;
      if (typeof content === 'string') messages.push(content);
    });

    manager.onSparFinished(player, sparring, true);
    const data = manager.getPlayerSectData(player);
    expect(data.current?.contribution).toBeGreaterThanOrEqual(120);
    expect(messages.some((x) => x.includes('演武结算'))).toBe(true);
  });

  it('叛门会清空当前门派并加入永久禁入，且移除同门技能', () => {
    const player = createPlayer();
    const mentor = createSongyangNpc('npc/songyang/mentor-he', '何教习', 'mentor');
    const deacon = createSongyangNpc('npc/songyang/deacon-zhao', '赵执事', 'deacon');
    manager.apprentice(player, mentor);

    const removeSkillsByFaction = jest.fn().mockReturnValue(['songyang-strike', 'songyang-force']);
    player.skillManager = { removeSkillsByFaction } as any;

    const result = manager.betray(player, deacon);
    const data = manager.getPlayerSectData(player);

    expect(result.success).toBe(true);
    expect(removeSkillsByFaction).toHaveBeenCalledWith('songyang');
    expect(data.current).toBeNull();
    expect(data.restrictions.bannedSectIds).toContain('songyang');
  });

  it('NPC 动作按身份精细显示', () => {
    const player = createPlayer();
    const mentor = createSongyangNpc('npc/songyang/mentor-he', '何教习', 'mentor');
    const master = createSongyangNpc('npc/songyang/master-li', '李掌门', 'master');
    const deacon = createSongyangNpc('npc/songyang/deacon-zhao', '赵执事', 'deacon');
    const sparring = createSongyangNpc('npc/songyang/sparring-disciple', '陪练弟子', 'sparring');

    expect(manager.getNpcAvailableActions(player, mentor)).toEqual(['apprentice']);
    expect(manager.getNpcAvailableActions(player, master)).toEqual([]);

    manager.apprentice(player, mentor);
    expect(manager.getNpcAvailableActions(player, deacon)).toEqual(['donate', 'betray']);
    expect(manager.getNpcAvailableActions(player, sparring)).toEqual(['spar']);

    manager.reserveSparAttempt(player);
    expect(manager.getNpcAvailableActions(player, sparring)).toEqual([]);
  });
});
