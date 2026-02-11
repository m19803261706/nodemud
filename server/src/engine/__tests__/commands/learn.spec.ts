import { LearnCommand } from '../../commands/std/learn';
import { NpcBase } from '../../game-objects/npc-base';
import { PlayerBase } from '../../game-objects/player-base';
import { RoomBase } from '../../game-objects/room-base';
import { ServiceLocator } from '../../service-locator';

describe('LearnCommand', () => {
  const skillId = 'test-blade';
  const skillName = '测试刀法';

  let room: RoomBase;
  let player: PlayerBase;
  let npc: NpcBase;
  let command: LearnCommand;

  beforeEach(async () => {
    room = new RoomBase('room/test');
    player = new PlayerBase('player/test');
    player.set('name', '测试玩家');
    player.set('silver', 500);
    player.set('energy', 500);
    player.set('potential', 50);
    player.set('learned_points', 0);
    player.set('perception', 30);
    await player.moveTo(room, { quiet: true });

    npc = new NpcBase('npc/test-master');
    npc.set('name', '李掌门');
    npc.set('teach_skills', [skillId]);
    npc.set('teach_cost', 10);
    await npc.moveTo(room, { quiet: true });

    let level = 0;
    let learned = 0;
    (player as any).skillManager = {
      getAllSkills: jest.fn(() => [{ skillId, level, learned }]),
      improveSkill: jest.fn(() => {
        learned += 1;
        if (learned >= Math.pow(level + 1, 2)) {
          level += 1;
          learned = 0;
          return true;
        }
        return false;
      }),
      learnSkill: jest.fn(() => true),
    };

    ServiceLocator.skillRegistry = {
      getAll: () => [
        {
          skillId,
          skillName,
        },
      ],
    } as any;

    command = new LearnCommand();
  });

  afterEach(() => {
    ServiceLocator.reset();
  });

  it('teach_skill_levels 缺失时返回 teacher_cap_reached', () => {
    const result = command.execute(player, [skillName, 'from', '李掌门']);
    expect(result.success).toBe(false);
    expect((result.data as any)?.reason).toBe('teacher_cap_reached');
  });

  it('潜能预算不足时返回 insufficient_potential', () => {
    npc.set('teach_skill_levels', { [skillId]: 100 });
    player.set('potential', 10);
    player.set('learned_points', 10);

    const result = command.execute(player, [skillName, 'from', '李掌门']);
    expect(result.success).toBe(false);
    expect((result.data as any)?.reason).toBe('insufficient_potential');
  });

  it('成功学习时会增加 learned_points 并返回完成次数', () => {
    npc.set('teach_skill_levels', { [skillId]: 100 });

    const result = command.execute(player, [skillName, 'from', '李掌门']);
    expect(result.success).toBe(true);
    expect((result.data as any)?.timesCompleted).toBe(1);
    expect(player.get<number>('learned_points')).toBe(1);
  });
});
