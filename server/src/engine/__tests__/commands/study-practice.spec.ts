import { StudyCommand } from '../../commands/std/study';
import { PracticeCommand } from '../../commands/std/practice';
import { BookBase } from '../../game-objects/book-base';
import { PlayerBase } from '../../game-objects/player-base';
import { RoomBase } from '../../game-objects/room-base';
import { ServiceLocator } from '../../service-locator';
import { BookType } from '@packages/core';

describe('study/practice 潜能语义', () => {
  let room: RoomBase;
  let player: PlayerBase;

  beforeEach(async () => {
    room = new RoomBase('room/test');
    player = new PlayerBase('player/test');
    player.set('name', '测试玩家');
    player.set('level', 50);
    player.set('energy', 500);
    player.set('potential', 100);
    player.set('learned_points', 7);
    player.set('perception', 30);
    await player.moveTo(room, { quiet: true });
  });

  afterEach(() => {
    ServiceLocator.reset();
  });

  it('study 成功后不增加 learned_points', async () => {
    const command = new StudyCommand();

    const book = new BookBase('item/test-book');
    book.set('name', '测试秘籍');
    book.set('book_type', BookType.SKILL);
    book.set('skill/skill_id', 'test-force');
    book.set('skill/name', '测试内功');
    book.set('skill/jing_cost', 5);
    book.set('skill/difficulty', 10);
    book.set('skill/max_level', 999);
    book.set('skill/min_level', 0);
    await book.moveTo(player, { quiet: true });

    let level = 200;
    let learned = 0;
    (player as any).skillManager = {
      getAllSkills: jest.fn(() => [{ skillId: 'test-force', level, learned }]),
      learnSkill: jest.fn(() => true),
      improveSkill: jest.fn(() => {
        learned += 1;
      }),
    };
    ServiceLocator.skillRegistry = {
      get: (skillId: string) =>
        skillId === 'test-force'
          ? {
              skillId: 'test-force',
              skillName: '测试内功',
              validLearn: () => true,
            }
          : null,
    } as any;

    const before = player.get<number>('learned_points');
    const result = command.execute(player, ['测试秘籍', '1']);

    expect(result.success).toBe(true);
    expect(player.get<number>('learned_points')).toBe(before);
  });

  it('practice 成功后不增加 learned_points', () => {
    const command = new PracticeCommand();
    (player as any).skillManager = {
      buildSkillListData: jest.fn(() => ({
        skills: [{ skillId: 'test-blade', skillName: '测试刀法' }],
      })),
    };

    const startPractice = jest.fn(() => true);
    ServiceLocator.practiceManager = {
      startPractice,
    } as any;

    const before = player.get<number>('learned_points');
    const result = command.execute(player, ['测试刀法']);

    expect(result.success).toBe(true);
    expect(startPractice).toHaveBeenCalledWith(player, 'test-blade', 'practice');
    expect(player.get<number>('learned_points')).toBe(before);
  });
});
