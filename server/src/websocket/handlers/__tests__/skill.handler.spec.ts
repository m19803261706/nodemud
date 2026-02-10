import { SkillCategory, SkillSlotType } from '@packages/core';
import { PlayerBase } from '../../../engine/game-objects/player-base';
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { registerSongyangSkills } from '../../../engine/skills/songyang/register-songyang-skills';
import { SONGYANG_SKILL_IDS } from '../../../engine/skills/songyang/songyang-skill-ids';
import { SkillRegistry } from '../../../engine/skills/skill-registry';
import { PuzzleStepState, normalizePlayerSectData } from '../../../engine/sect/types';
import type { Session } from '../../types/session';
import { SkillHandler } from '../skill.handler';

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
  let objectManager: { findById: jest.Mock };
  let combatManager: { executeSkillAction: jest.Mock };
  let practiceManager: { startPractice: jest.Mock; stopPractice: jest.Mock };
  let handler: SkillHandler;

  beforeEach(() => {
    skillRegistry = new SkillRegistry();
    registerSongyangSkills(skillRegistry);

    objectManager = { findById: jest.fn() };
    combatManager = { executeSkillAction: jest.fn() };
    practiceManager = { startPractice: jest.fn(), stopPractice: jest.fn() };

    handler = new SkillHandler(
      objectManager as any,
      {} as any,
      skillRegistry,
      combatManager as any,
      practiceManager as any,
    );
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
});
