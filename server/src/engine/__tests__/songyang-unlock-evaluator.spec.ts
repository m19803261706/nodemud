import { PlayerBase } from '../game-objects/player-base';
import { SongyangPolicy } from '../sect/policies/songyang.policy';
import { PuzzleStepState, normalizePlayerSectData } from '../sect/types';
import { createSongyangSkills } from '../skills/songyang/register-songyang-skills';
import { SONGYANG_SKILL_IDS } from '../skills/songyang/songyang-skill-ids';
import { SONGYANG_SKILL_META, SkillTier } from '../skills/songyang/songyang-skill-meta';
import {
  UnlockState,
  evaluateSongyangSkillUnlock,
} from '../skills/songyang/songyang-unlock-evaluator';

function makePlayer(options?: {
  sectId?: string;
  contribution?: number;
  rank?: string;
  attrs?: Partial<Record<'strength' | 'vitality' | 'perception' | 'spirit' | 'wisdom' | 'meridian', number>>;
  skillLevels?: Record<string, number>;
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
  canonCrippled?: boolean;
}) {
  const player = new PlayerBase('player/test');
  const skillLevels = options?.skillLevels ?? {};

  player.set('strength', options?.attrs?.strength ?? 30);
  player.set('vitality', options?.attrs?.vitality ?? 30);
  player.set('perception', options?.attrs?.perception ?? 30);
  player.set('spirit', options?.attrs?.spirit ?? 30);
  player.set('wisdom', options?.attrs?.wisdom ?? 30);
  player.set('meridian', options?.attrs?.meridian ?? 30);

  const sectData = normalizePlayerSectData({
    current: {
      sectId: options?.sectId ?? 'songyang',
      sectName: '嵩阳宗',
      masterNpcId: 'npc/songyang/master-li',
      masterName: '李掌门',
      rank: options?.rank ?? '嵩阳长老',
      contribution: options?.contribution ?? 20000,
      joinedAt: 1700000000000,
    },
    restrictions: { bannedSectIds: [], cooldownUntil: null },
    daily: { dateKey: '2026-02-11', sparCount: 0 },
    songyangSkill: {
      puzzle: {
        canjuCollected: options?.puzzle?.canjuCollected ?? 3,
        canjuState: options?.puzzle?.canjuState ?? PuzzleStepState.COMPLETED,
        duanjuState: options?.puzzle?.duanjuState ?? PuzzleStepState.COMPLETED,
        shiyanState: options?.puzzle?.shiyanState ?? PuzzleStepState.COMPLETED,
      },
      challenges: {
        chiefDiscipleWin: options?.challenges?.chiefDiscipleWin ?? true,
        sparStreakWin: options?.challenges?.sparStreakWin ?? true,
        masterApproval: options?.challenges?.masterApproval ?? true,
      },
      legacy: {
        canonCrippled: options?.canonCrippled ?? false,
      },
    },
  });
  player.set('sect', sectData);

  (player as any).skillManager = {
    getSkillLevel: (skillId: string) => skillLevels[skillId] ?? 0,
    getAllSkills: () =>
      Object.entries(skillLevels).map(([skillId, level]) => ({
        skillId,
        level,
      })),
  };

  return player;
}

describe('SongyangSkillUnlockEvaluator', () => {
  it('进阶技能职位阈值严格读取 SongyangPolicy.ranks', () => {
    const rankThreshold = new SongyangPolicy().ranks.find((x) => x.rank === '执礼弟子');
    const player = makePlayer({
      contribution: (rankThreshold?.minContribution ?? 1200) - 1,
      rank: '内门弟子',
      skillLevels: {
        [SONGYANG_SKILL_IDS.ENTRY_BLADE]: 90,
      },
    });

    const result = evaluateSongyangSkillUnlock(player, SONGYANG_SKILL_IDS.ADVANCED_BLADE);
    expect(result.state).toBe(UnlockState.LOCKED);
    expect(result.reason).toBe('unlock_rank_required');
    expect(result.message).toContain(String(rankThreshold?.minContribution ?? 1200));
  });

  it('属性不足返回 unlock_attr_required', () => {
    const player = makePlayer({
      attrs: { strength: 9 },
      skillLevels: {},
    });

    const result = evaluateSongyangSkillUnlock(player, SONGYANG_SKILL_IDS.ENTRY_BLADE);
    expect(result.state).toBe(UnlockState.LOCKED);
    expect(result.reason).toBe('unlock_attr_required');
  });

  it('前置技能不足返回 unlock_preq_skill_required', () => {
    const player = makePlayer({
      contribution: 5000,
      rank: '亲传弟子',
      skillLevels: {
        [SONGYANG_SKILL_IDS.ENTRY_BLADE]: 20,
      },
    });

    const result = evaluateSongyangSkillUnlock(player, SONGYANG_SKILL_IDS.ADVANCED_BLADE);
    expect(result.state).toBe(UnlockState.LOCKED);
    expect(result.reason).toBe('unlock_preq_skill_required');
  });

  it('解密链未完成返回 puzzle 对应 reason', () => {
    const player = makePlayer({
      contribution: 30000,
      rank: '嵩阳长老',
      skillLevels: {
        [SONGYANG_SKILL_IDS.ADVANCED_FORCE]: 180,
      },
      puzzle: {
        canjuCollected: 2,
        canjuState: PuzzleStepState.IN_PROGRESS,
      },
    });

    const result = evaluateSongyangSkillUnlock(player, SONGYANG_SKILL_IDS.ULTIMATE_FORCE);
    expect(result.state).toBe(UnlockState.LOCKED);
    expect(result.reason).toBe('unlock_puzzle_canju_required');
  });

  it('碑文断句未完成返回 unlock_puzzle_duanju_required', () => {
    const player = makePlayer({
      contribution: 30000,
      rank: '嵩阳长老',
      skillLevels: {
        [SONGYANG_SKILL_IDS.ADVANCED_BLADE]: 180,
      },
      puzzle: {
        canjuCollected: 3,
        canjuState: PuzzleStepState.COMPLETED,
        duanjuState: PuzzleStepState.NOT_STARTED,
        shiyanState: PuzzleStepState.COMPLETED,
      },
      challenges: {
        chiefDiscipleWin: true,
      },
    });

    const result = evaluateSongyangSkillUnlock(player, SONGYANG_SKILL_IDS.ULTIMATE_BLADE);
    expect(result.state).toBe(UnlockState.LOCKED);
    expect(result.reason).toBe('unlock_puzzle_duanju_required');
  });

  it('试演答卷未完成返回 unlock_puzzle_shiyan_required', () => {
    const player = makePlayer({
      contribution: 30000,
      rank: '嵩阳长老',
      skillLevels: {
        [SONGYANG_SKILL_IDS.ADVANCED_DODGE]: 180,
      },
      puzzle: {
        canjuCollected: 3,
        canjuState: PuzzleStepState.COMPLETED,
        shiyanState: PuzzleStepState.NOT_STARTED,
      },
      challenges: {
        sparStreakWin: true,
      },
    });

    const result = evaluateSongyangSkillUnlock(player, SONGYANG_SKILL_IDS.ULTIMATE_DODGE);
    expect(result.state).toBe(UnlockState.LOCKED);
    expect(result.reason).toBe('unlock_puzzle_shiyan_required');
  });

  it('挑战未完成返回 unlock_challenge_required', () => {
    const player = makePlayer({
      contribution: 30000,
      rank: '嵩阳长老',
      skillLevels: {
        [SONGYANG_SKILL_IDS.ADVANCED_DODGE]: 180,
      },
      challenges: {
        sparStreakWin: false,
      },
    });

    const result = evaluateSongyangSkillUnlock(player, SONGYANG_SKILL_IDS.ULTIMATE_DODGE);
    expect(result.state).toBe(UnlockState.LOCKED);
    expect(result.reason).toBe('unlock_challenge_required');
  });

  it('总纲残缺态返回 canon_crippled', () => {
    const player = makePlayer({
      contribution: 70000,
      rank: '副掌门',
      canonCrippled: true,
      skillLevels: {
        [SONGYANG_SKILL_IDS.ULTIMATE_BLADE]: 220,
        [SONGYANG_SKILL_IDS.ULTIMATE_DODGE]: 220,
        [SONGYANG_SKILL_IDS.ULTIMATE_PARRY]: 220,
        [SONGYANG_SKILL_IDS.ULTIMATE_FORCE]: 220,
      },
    });

    const result = evaluateSongyangSkillUnlock(player, SONGYANG_SKILL_IDS.CANON_ESSENCE);
    expect(result.state).toBe(UnlockState.CRIPPLED);
    expect(result.reason).toBe('canon_crippled');
  });

  it('13 门技能应遵循 entry/advanced/ultimate/canon 分层解锁', () => {
    const entryIds = Object.values(SONGYANG_SKILL_META)
      .filter((meta) => meta.tier === SkillTier.ENTRY)
      .map((meta) => meta.skillId);
    const advancedIds = Object.values(SONGYANG_SKILL_META)
      .filter((meta) => meta.tier === SkillTier.ADVANCED)
      .map((meta) => meta.skillId);
    const ultimateIds = Object.values(SONGYANG_SKILL_META)
      .filter((meta) => meta.tier === SkillTier.ULTIMATE)
      .map((meta) => meta.skillId);
    const canonIds = Object.values(SONGYANG_SKILL_META)
      .filter((meta) => meta.tier === SkillTier.CANON)
      .map((meta) => meta.skillId);

    const entryPlayer = makePlayer({
      contribution: 0,
      rank: '外门弟子',
      skillLevels: {},
    });
    for (const skillId of entryIds) {
      expect(evaluateSongyangSkillUnlock(entryPlayer, skillId).state).toBe(UnlockState.AVAILABLE);
    }
    for (const skillId of [...advancedIds, ...ultimateIds, ...canonIds]) {
      expect(evaluateSongyangSkillUnlock(entryPlayer, skillId).state).toBe(UnlockState.LOCKED);
    }

    const advancedPlayer = makePlayer({
      contribution: 2000,
      rank: '执礼弟子',
      skillLevels: {
        [SONGYANG_SKILL_IDS.ENTRY_BLADE]: 80,
        [SONGYANG_SKILL_IDS.ENTRY_DODGE]: 80,
        [SONGYANG_SKILL_IDS.ENTRY_PARRY]: 80,
        [SONGYANG_SKILL_IDS.ENTRY_FORCE]: 80,
      },
    });
    for (const skillId of advancedIds) {
      expect(evaluateSongyangSkillUnlock(advancedPlayer, skillId).state).toBe(UnlockState.AVAILABLE);
    }
    for (const skillId of [...ultimateIds, ...canonIds]) {
      expect(evaluateSongyangSkillUnlock(advancedPlayer, skillId).state).toBe(UnlockState.LOCKED);
    }

    const ultimatePlayer = makePlayer({
      contribution: 32000,
      rank: '嵩阳长老',
      skillLevels: {
        [SONGYANG_SKILL_IDS.ADVANCED_BLADE]: 160,
        [SONGYANG_SKILL_IDS.ADVANCED_DODGE]: 160,
        [SONGYANG_SKILL_IDS.ADVANCED_PARRY]: 160,
        [SONGYANG_SKILL_IDS.ADVANCED_FORCE]: 160,
      },
      puzzle: {
        canjuCollected: 3,
        canjuState: PuzzleStepState.COMPLETED,
        duanjuState: PuzzleStepState.COMPLETED,
        shiyanState: PuzzleStepState.COMPLETED,
      },
      challenges: {
        chiefDiscipleWin: true,
        sparStreakWin: true,
        masterApproval: true,
      },
    });
    for (const skillId of ultimateIds) {
      expect(evaluateSongyangSkillUnlock(ultimatePlayer, skillId).state).toBe(UnlockState.AVAILABLE);
    }
    expect(evaluateSongyangSkillUnlock(ultimatePlayer, canonIds[0]).state).toBe(UnlockState.LOCKED);

    const canonPlayer = makePlayer({
      contribution: 70000,
      rank: '副掌门',
      skillLevels: {
        [SONGYANG_SKILL_IDS.ULTIMATE_BLADE]: 200,
        [SONGYANG_SKILL_IDS.ULTIMATE_DODGE]: 200,
        [SONGYANG_SKILL_IDS.ULTIMATE_PARRY]: 200,
        [SONGYANG_SKILL_IDS.ULTIMATE_FORCE]: 220,
      },
      puzzle: {
        canjuCollected: 3,
        canjuState: PuzzleStepState.COMPLETED,
        duanjuState: PuzzleStepState.COMPLETED,
        shiyanState: PuzzleStepState.COMPLETED,
      },
      challenges: {
        chiefDiscipleWin: true,
        sparStreakWin: true,
        masterApproval: true,
      },
    });
    expect(evaluateSongyangSkillUnlock(canonPlayer, canonIds[0]).state).toBe(UnlockState.AVAILABLE);
  });

  it('13 门技能 validLearn 全部复用统一评估器', () => {
    const outsider = makePlayer({ sectId: 'other-sect' });
    const all = createSongyangSkills();

    for (const skill of all) {
      expect(skill.validLearn(outsider)).toBe('你并非嵩阳弟子，无法修习此法。');
    }
  });
});
