import { SkillCategory, SkillSlotType } from '@packages/core';
import { PlayerBase } from '../../../engine/game-objects/player-base';
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { registerSongyangSkills } from '../../../engine/skills/songyang/register-songyang-skills';
import { SONGYANG_SKILL_IDS } from '../../../engine/skills/songyang/songyang-skill-ids';
import { SkillRegistry } from '../../../engine/skills/skill-registry';
import { PuzzleStepState, normalizePlayerSectData } from '../../../engine/sect/types';
import type { Session } from '../../types/session';
import { SkillHandler } from '../skill.handler';
import { ServiceLocator } from '../../../engine/service-locator';

function createSession(): Session {
  return {
    socketId: 'socket-test',
    authenticated: true,
    playerId: 'player/test',
  };
}

function createPlayer(overrides?: {
  rank?: string;
  contribution?: number;
  puzzle?: Partial<{
    canjuCollected: number;
    canjuState: PuzzleStepState;
    duanjuState: PuzzleStepState;
    shiyanState: PuzzleStepState;
  }>;
  challenges?: Partial<{
    chiefDiscipleWin: boolean;
    sparStreakWin: boolean;
    masterApproval: boolean;
  }>;
}): PlayerBase {
  const player = new PlayerBase('player/test');
  player.set('name', '测试玩家');
  player.set('strength', 30);
  player.set('vitality', 30);
  player.set('perception', 30);
  player.set('spirit', 30);
  player.set('wisdom', 30);
  player.set('meridian', 30);
  player.set('potential', 100);
  player.set('learned_points', 0);
  player.set(
    'sect',
    normalizePlayerSectData({
      current: {
        sectId: 'songyang',
        sectName: '嵩阳宗',
        masterNpcId: 'npc/songyang/master-li',
        masterName: '李掌门',
        rank: overrides?.rank ?? '嵩阳长老',
        contribution: overrides?.contribution ?? 32000,
        joinedAt: 1700000000000,
      },
      restrictions: { bannedSectIds: [], cooldownUntil: null },
      daily: { dateKey: '2026-02-11', sparCount: 0 },
      songyangSkill: {
        puzzle: {
          canjuCollected: overrides?.puzzle?.canjuCollected ?? 3,
          canjuState: overrides?.puzzle?.canjuState ?? PuzzleStepState.COMPLETED,
          duanjuState: overrides?.puzzle?.duanjuState ?? PuzzleStepState.COMPLETED,
          shiyanState: overrides?.puzzle?.shiyanState ?? PuzzleStepState.COMPLETED,
        },
        challenges: {
          chiefDiscipleWin: overrides?.challenges?.chiefDiscipleWin ?? true,
          sparStreakWin: overrides?.challenges?.sparStreakWin ?? true,
          masterApproval: overrides?.challenges?.masterApproval ?? true,
        },
        legacy: { canonCrippled: false },
      },
    }),
  );
  (player as any).sendToClient = jest.fn();
  (player as any).receiveMessage = jest.fn();
  return player;
}

function parseLastSentMessage(player: PlayerBase): any {
  const sendToClient = (player as any).sendToClient as jest.Mock;
  expect(sendToClient).toHaveBeenCalled();
  const raw = sendToClient.mock.calls[sendToClient.mock.calls.length - 1][0];
  return JSON.parse(raw);
}

describe('SkillHandler contract regression', () => {
  let skillRegistry: SkillRegistry;
  let objectManager: { findById: jest.Mock; findAll: jest.Mock };
  let combatManager: { executeSkillAction: jest.Mock };
  let practiceManager: { startPractice: jest.Mock; stopPractice: jest.Mock };
  let handler: SkillHandler;

  beforeEach(() => {
    skillRegistry = new SkillRegistry();
    registerSongyangSkills(skillRegistry);

    objectManager = { findById: jest.fn(), findAll: jest.fn(() => []) };
    combatManager = { executeSkillAction: jest.fn() };
    practiceManager = { startPractice: jest.fn(), stopPractice: jest.fn() };

    (ServiceLocator as any).sectManager = {
      getPlayerSectData: jest.fn((player: PlayerBase) => player.get('sect')),
    };

    handler = new SkillHandler(
      objectManager as any,
      {} as any,
      skillRegistry,
      combatManager as any,
      practiceManager as any,
    );
  });

  afterEach(() => {
    delete (ServiceLocator as any).sectManager;
  });

  it('skillPanelData 应返回契约字段并包含四段详情文案', async () => {
    const player = createPlayer();
    const skillManager = {
      buildSkillListData: jest.fn(() => ({
        skills: [
          {
            skillId: SONGYANG_SKILL_IDS.ENTRY_BLADE,
            skillName: '嵩阳入门刀法',
            skillType: SkillSlotType.BLADE,
            category: SkillCategory.MARTIAL,
            level: 12,
            learned: 56,
            learnedMax: 169,
            isMapped: true,
            mappedSlot: SkillSlotType.BLADE,
            isActiveForce: false,
            isLocked: false,
          },
        ],
        skillMap: { blade: SONGYANG_SKILL_IDS.ENTRY_BLADE },
        activeForce: null,
      })),
      getSkillBonusSummary: jest.fn(() => ({
        attack: 10,
        defense: 8,
        dodge: 6,
        parry: 6,
        maxHp: 30,
        maxMp: 20,
        critRate: 0,
        hitRate: 0,
      })),
      getAllSkills: jest.fn(() => [
        {
          skillId: SONGYANG_SKILL_IDS.ENTRY_BLADE,
          level: 12,
          learned: 56,
        },
      ]),
    };
    (player as any).skillManager = skillManager;
    objectManager.findById.mockReturnValue(player);

    await handler.handleSkillPanelRequest(createSession(), {
      detailSkillId: SONGYANG_SKILL_IDS.ENTRY_BLADE,
    });

    const payload = parseLastSentMessage(player);
    expect(payload.type).toBe('skillPanelData');
    expect(payload.data.skills[0]).toMatchObject({
      skillId: SONGYANG_SKILL_IDS.ENTRY_BLADE,
      skillType: SkillSlotType.BLADE,
      level: 12,
      learned: 56,
      isMapped: true,
      mappedSlot: SkillSlotType.BLADE,
      isActiveForce: false,
      isLocked: false,
    });
    expect(payload.data.detail.skillId).toBe(SONGYANG_SKILL_IDS.ENTRY_BLADE);
    expect(payload.data.detail.description).toContain('【背景】');
    expect(payload.data.detail.description).toContain('【学习条件】');
    expect(payload.data.detail.description).toContain('【战斗公式】');
    expect(payload.data.detail.description).toContain('【扩展】');
  });

  it('skillPanelData 未学会技能也应可返回详情（用于 NPC 武学面板）', async () => {
    const player = createPlayer();
    const skillManager = {
      buildSkillListData: jest.fn(() => ({
        skills: [],
        skillMap: {},
        activeForce: null,
      })),
      getSkillBonusSummary: jest.fn(() => ({
        attack: 0,
        defense: 0,
        dodge: 0,
        parry: 0,
        maxHp: 0,
        maxMp: 0,
        critRate: 0,
        hitRate: 0,
      })),
      getAllSkills: jest.fn(() => []),
    };
    (player as any).skillManager = skillManager;
    objectManager.findById.mockReturnValue(player);

    await handler.handleSkillPanelRequest(createSession(), {
      detailSkillId: SONGYANG_SKILL_IDS.ENTRY_BLADE,
    });

    const payload = parseLastSentMessage(player);
    expect(payload.type).toBe('skillPanelData');
    expect(payload.data.detail).toBeDefined();
    expect(payload.data.detail.skillId).toBe(SONGYANG_SKILL_IDS.ENTRY_BLADE);
    expect(payload.data.detail.actions.length).toBeGreaterThan(0);
    expect(
      payload.data.detail.actions.every(
        (action: { unlocked: boolean }) => action.unlocked === false,
      ),
    ).toBe(true);
  });

  it('skillPanelData 应附带当前师父可传授目录（用于技能页快捷学艺）', async () => {
    const player = createPlayer();
    const masterNpc = new NpcBase('npc/songyang/master-li#2');
    masterNpc.set('name', '李掌门');
    masterNpc.set('teach_skills', [SONGYANG_SKILL_IDS.ENTRY_BLADE]);

    const skillManager = {
      buildSkillListData: jest.fn(() => ({
        skills: [],
        skillMap: {},
        activeForce: null,
      })),
      getSkillBonusSummary: jest.fn(() => ({
        attack: 0,
        defense: 0,
        dodge: 0,
        parry: 0,
        maxHp: 0,
        maxMp: 0,
        critRate: 0,
        hitRate: 0,
      })),
      getAllSkills: jest.fn(() => []),
    };
    (player as any).skillManager = skillManager;
    objectManager.findById.mockReturnValue(player);
    objectManager.findAll.mockImplementation((predicate: (entity: unknown) => boolean) =>
      [masterNpc].filter(predicate),
    );

    await handler.handleSkillPanelRequest(createSession(), {});

    const payload = parseLastSentMessage(player);
    expect(payload.type).toBe('skillPanelData');
    expect(payload.data.masterTeach).toMatchObject({
      npcId: 'npc/songyang/master-li',
      npcName: '李掌门',
      sectId: 'songyang',
      sectName: '嵩阳宗',
    });
    expect(payload.data.masterTeach.skills).toEqual([
      expect.objectContaining({
        skillId: SONGYANG_SKILL_IDS.ENTRY_BLADE,
        skillName: '嵩阳入门刀法',
      }),
    ]);
  });

  it('skillMapResult 应返回 slotType/skillId/updatedMap 契约字段', async () => {
    const player = createPlayer();
    const skillManager = {
      mapSkill: jest.fn().mockReturnValue(true),
      getSkillMap: jest.fn().mockReturnValue({ blade: SONGYANG_SKILL_IDS.ENTRY_BLADE }),
    };
    (player as any).skillManager = skillManager;
    objectManager.findById.mockReturnValue(player);

    await handler.handleSkillMapRequest(createSession(), {
      slotType: SkillSlotType.BLADE,
      skillId: SONGYANG_SKILL_IDS.ENTRY_BLADE,
    });

    const payload = parseLastSentMessage(player);
    expect(payload.type).toBe('skillMapResult');
    expect(payload.data).toMatchObject({
      success: true,
      slotType: SkillSlotType.BLADE,
      skillId: SONGYANG_SKILL_IDS.ENTRY_BLADE,
      skillName: '嵩阳入门刀法',
      updatedMap: { blade: SONGYANG_SKILL_IDS.ENTRY_BLADE },
    });
  });

  it('skillLearnResult 失败应透传规范 reason 值', async () => {
    const player = createPlayer({
      rank: '嵩阳长老',
      contribution: 32000,
      puzzle: {
        canjuCollected: 3,
        canjuState: PuzzleStepState.COMPLETED,
        duanjuState: PuzzleStepState.NOT_STARTED,
        shiyanState: PuzzleStepState.COMPLETED,
      },
      challenges: {
        chiefDiscipleWin: true,
        sparStreakWin: true,
        masterApproval: true,
      },
    });

    const npc = new NpcBase('npc/songyang/mentor-he#1');
    npc.set('name', '何教习');
    npc.set('teach_skills', [SONGYANG_SKILL_IDS.ULTIMATE_FORCE]);
    npc.set('teach_cost', 120);

    const room = {
      getInventory: () => [npc],
    };
    (player as any).getEnvironment = jest.fn(() => room);

    const skillLevels: Record<string, number> = {
      [SONGYANG_SKILL_IDS.ADVANCED_FORCE]: 180,
    };
    const skillManager = {
      getAllSkills: jest.fn(() => []),
      getSkillLevel: jest.fn((skillId: string) => skillLevels[skillId] ?? 0),
      learnSkill: jest.fn(),
      improveSkill: jest.fn(),
    };
    (player as any).skillManager = skillManager;
    objectManager.findById.mockReturnValue(player);

    await handler.handleSkillLearnRequest(createSession(), {
      npcId: npc.id,
      skillId: SONGYANG_SKILL_IDS.ULTIMATE_FORCE,
      times: 1,
    });

    const payload = parseLastSentMessage(player);
    expect(payload.type).toBe('skillLearnResult');
    expect(payload.data).toMatchObject({
      success: false,
      skillId: SONGYANG_SKILL_IDS.ULTIMATE_FORCE,
      skillName: '乾元一气功',
      timesCompleted: 0,
      timesRequested: 1,
      levelUp: false,
      reason: 'unlock_puzzle_duanju_required',
    });

    const allowedReasons = new Set([
      'unlock_rank_required',
      'unlock_attr_required',
      'unlock_preq_skill_required',
      'unlock_puzzle_canju_required',
      'unlock_puzzle_duanju_required',
      'unlock_puzzle_shiyan_required',
      'unlock_challenge_required',
      'canon_crippled',
    ]);
    expect(allowedReasons.has(payload.data.reason)).toBe(true);
  });

  it('当前师父不在同房间时，仍可通过蓝图 ID 远程学艺', async () => {
    const player = createPlayer();
    player.set('silver', 999);
    player.set('energy', 80);

    const masterNpc = new NpcBase('npc/songyang/master-li#1');
    masterNpc.set('name', '李掌门');
    masterNpc.set('teach_skills', [SONGYANG_SKILL_IDS.ENTRY_BLADE]);
    masterNpc.set('teach_skill_levels', { [SONGYANG_SKILL_IDS.ENTRY_BLADE]: 120 });
    masterNpc.set('teach_cost', 10);

    const room = {
      getInventory: () => [],
    };
    (player as any).getEnvironment = jest.fn(() => room);

    let currentLevel = 0;
    let learned = 0;
    const skillManager = {
      getAllSkills: jest.fn(() => [
        {
          skillId: SONGYANG_SKILL_IDS.ENTRY_BLADE,
          level: currentLevel,
          learned,
        },
      ]),
      improveSkill: jest.fn(() => {
        learned += 1;
        return false;
      }),
      learnSkill: jest.fn(),
    };
    (player as any).skillManager = skillManager;
    objectManager.findById.mockReturnValue(player);
    objectManager.findAll.mockImplementation((predicate: (entity: unknown) => boolean) =>
      [masterNpc].filter(predicate),
    );

    await handler.handleSkillLearnRequest(createSession(), {
      npcId: 'npc/songyang/master-li',
      skillId: SONGYANG_SKILL_IDS.ENTRY_BLADE,
      times: 1,
    });

    const payload = parseLastSentMessage(player);
    expect(payload.type).toBe('skillLearnResult');
    expect(payload.data.success).toBe(true);
    expect(payload.data.skillId).toBe(SONGYANG_SKILL_IDS.ENTRY_BLADE);
  });

  it('skillLearnResult 在潜能不足时应返回 insufficient_potential', async () => {
    const player = createPlayer();
    player.set('silver', 999);
    player.set('energy', 999);
    player.set('potential', 10);
    player.set('learned_points', 10);

    const npc = new NpcBase('npc/songyang/master-li#9');
    npc.set('name', '李掌门');
    npc.set('teach_skills', [SONGYANG_SKILL_IDS.ENTRY_BLADE]);
    npc.set('teach_skill_levels', { [SONGYANG_SKILL_IDS.ENTRY_BLADE]: 120 });
    npc.set('teach_cost', 10);

    const room = {
      getInventory: () => [npc],
    };
    (player as any).getEnvironment = jest.fn(() => room);

    let level = 0;
    let learned = 0;
    (player as any).skillManager = {
      getAllSkills: jest.fn(() => [{ skillId: SONGYANG_SKILL_IDS.ENTRY_BLADE, level, learned }]),
      improveSkill: jest.fn(() => {
        learned += 1;
        return false;
      }),
      learnSkill: jest.fn(),
    };
    objectManager.findById.mockReturnValue(player);

    await handler.handleSkillLearnRequest(createSession(), {
      npcId: npc.id,
      skillId: SONGYANG_SKILL_IDS.ENTRY_BLADE,
      times: 1,
    });

    const payload = parseLastSentMessage(player);
    expect(payload.type).toBe('skillLearnResult');
    expect(payload.data.success).toBe(false);
    expect(payload.data.reason).toBe('insufficient_potential');
  });

  it('skillLearnResult 在达到师父上限时应返回 teacher_cap_reached', async () => {
    const player = createPlayer();
    player.set('silver', 999);
    player.set('energy', 999);

    const npc = new NpcBase('npc/songyang/master-li#8');
    npc.set('name', '李掌门');
    npc.set('teach_skills', [SONGYANG_SKILL_IDS.ENTRY_BLADE]);
    npc.set('teach_skill_levels', { [SONGYANG_SKILL_IDS.ENTRY_BLADE]: 5 });
    npc.set('teach_cost', 10);

    const room = {
      getInventory: () => [npc],
    };
    (player as any).getEnvironment = jest.fn(() => room);

    const skillManager = {
      getAllSkills: jest.fn(() => [
        { skillId: SONGYANG_SKILL_IDS.ENTRY_BLADE, level: 5, learned: 0 },
      ]),
      improveSkill: jest.fn(),
      learnSkill: jest.fn(),
    };
    (player as any).skillManager = skillManager;
    objectManager.findById.mockReturnValue(player);

    await handler.handleSkillLearnRequest(createSession(), {
      npcId: npc.id,
      skillId: SONGYANG_SKILL_IDS.ENTRY_BLADE,
      times: 1,
    });

    const payload = parseLastSentMessage(player);
    expect(payload.type).toBe('skillLearnResult');
    expect(payload.data.success).toBe(false);
    expect(payload.data.reason).toBe('teacher_cap_reached');
  });

  it('非当前师父即便在线，也不能跨房间远程学艺', async () => {
    const player = createPlayer();
    const npc = new NpcBase('npc/songyang/mentor-he#1');
    npc.set('name', '何教习');
    npc.set('teach_skills', [SONGYANG_SKILL_IDS.ENTRY_BLADE]);

    const room = {
      getInventory: () => [],
    };
    (player as any).getEnvironment = jest.fn(() => room);
    (player as any).skillManager = {
      getAllSkills: jest.fn(() => []),
      learnSkill: jest.fn(),
      improveSkill: jest.fn(),
    };
    objectManager.findById.mockReturnValue(player);
    objectManager.findAll.mockImplementation((predicate: (entity: unknown) => boolean) =>
      [npc].filter(predicate),
    );

    await handler.handleSkillLearnRequest(createSession(), {
      npcId: 'npc/songyang/mentor-he',
      skillId: SONGYANG_SKILL_IDS.ENTRY_BLADE,
      times: 1,
    });

    expect((player as any).receiveMessage).toHaveBeenCalledWith('附近找不到这个人。');
    expect((player as any).sendToClient).not.toHaveBeenCalled();
  });
});
