import { ResearchCommand } from '../../commands/std/research';
import { PlayerBase } from '../../game-objects/player-base';
import { RoomBase } from '../../game-objects/room-base';

describe('ResearchCommand', () => {
  let room: RoomBase;
  let player: PlayerBase;
  let command: ResearchCommand;
  let level: number;
  let learned: number;

  beforeEach(async () => {
    room = new RoomBase('room/test');
    player = new PlayerBase('player/test');
    player.set('name', '测试玩家');
    player.set('energy', 500);
    player.set('potential', 50);
    player.set('learned_points', 0);
    player.set('perception', 30);
    await player.moveTo(room, { quiet: true });

    level = 180;
    learned = 0;
    (player as any).skillManager = {
      buildSkillListData: jest.fn(() => ({
        skills: [
          {
            skillId: 'test-force',
            skillName: '测试内功',
            level,
          },
        ],
      })),
      getAllSkills: jest.fn(() => [{ skillId: 'test-force', level, learned }]),
      improveSkill: jest.fn(() => {
        learned += 1;
        if (learned >= Math.pow(level + 1, 2)) {
          level += 1;
          learned = 0;
          return true;
        }
        return false;
      }),
    };
    (player as any).sendToClient = jest.fn();

    command = new ResearchCommand();
  });

  it('技能等级不足 180 时拒绝研究', () => {
    level = 179;
    const result = command.execute(player, ['测试内功']);
    expect(result.success).toBe(false);
    expect(result.message).toContain('尚未到可自行研究');
  });

  it('潜能预算不足时返回 insufficient_potential', () => {
    player.set('potential', 10);
    player.set('learned_points', 10);

    const result = command.execute(player, ['测试内功']);
    expect(result.success).toBe(false);
    expect((result.data as any)?.reason).toBe('insufficient_potential');
  });

  it('研究成功会消耗精力与 learned_points', () => {
    const beforeEnergy = player.get<number>('energy') ?? 0;
    const beforeLearnedPoints = player.get<number>('learned_points') ?? 0;

    const result = command.execute(player, ['测试内功', '1']);
    expect(result.success).toBe(true);
    expect((result.data as any)?.timesCompleted).toBe(1);
    expect(player.get<number>('energy')).toBeLessThan(beforeEnergy);
    expect(player.get<number>('learned_points')).toBe(beforeLearnedPoints + 1);
  });

  it('批量研究中途精力不足时应返回部分成功', () => {
    player.set('energy', 70);

    const result = command.execute(player, ['测试内功', '3']);
    expect(result.success).toBe(true);
    expect((result.data as any)?.timesCompleted).toBe(2);
    expect((result.data as any)?.reason).toBe('insufficient_energy');
    expect(player.get<number>('learned_points')).toBe(2);
  });
});
