/**
 * 嵩阳技能统一解锁评估器
 * 职位/属性/前置技能/解密链/挑战状态全部走同一入口，避免规则分叉。
 */
import type { LivingBase } from '../../game-objects/living-base';
import { normalizePlayerSectData, PuzzleStepState } from '../../sect/types';
import { SongyangPolicy } from '../../sect/policies/songyang.policy';
import { SONGYANG_SKILL_IDS, isSongyangSkillId, type SongyangSkillId } from './songyang-skill-ids';
import {
  SONGYANG_FACTION_ID,
  SONGYANG_SKILL_META,
  type SongyangAttrKey,
  type SongyangChallengeKey,
  type SongyangPuzzleKey,
  type SongyangUnlockRules,
} from './songyang-skill-meta';

export enum UnlockState {
  LOCKED = 'locked',
  AVAILABLE = 'available',
  LEARNED = 'learned',
  CRIPPLED = 'crippled',
}

export type SongyangUnlockReason =
  | 'unlock_rank_required'
  | 'unlock_attr_required'
  | 'unlock_preq_skill_required'
  | 'unlock_puzzle_canju_required'
  | 'unlock_puzzle_duanju_required'
  | 'unlock_puzzle_shiyan_required'
  | 'unlock_challenge_required'
  | 'canon_crippled';

export interface SongyangUnlockResult {
  state: UnlockState;
  reason?: SongyangUnlockReason;
  message: string;
}

const ATTR_NAME_MAP: Record<SongyangAttrKey, string> = {
  strength: '筋骨',
  vitality: '血气',
  perception: '心眼',
  spirit: '气海',
  wisdom: '慧根',
  meridian: '脉络',
};

const PUZZLE_NAME_MAP: Record<SongyangPuzzleKey, string> = {
  canju: '残卷拼合',
  duanju: '碑文断句',
  shiyan: '试演答卷',
};

const CHALLENGE_NAME_MAP: Record<SongyangChallengeKey, string> = {
  chiefDiscipleWin: '首席弟子挑战',
  sparStreakWin: '演武连胜挑战',
  masterApproval: '掌门认可',
};

const SONGYANG_RANKS = new SongyangPolicy().ranks;

function getMinContributionByRank(rank: string): number | null {
  const target = SONGYANG_RANKS.find((item) => item.rank === rank);
  return target ? target.minContribution : null;
}

function getSkillLevel(player: LivingBase, skillId: string): number {
  const manager = (player as any).skillManager;
  if (manager && typeof manager.getSkillLevel === 'function') {
    return manager.getSkillLevel(skillId, true) ?? 0;
  }
  if (typeof (player as any).getSkillLevel === 'function') {
    return (player as any).getSkillLevel(skillId) ?? 0;
  }
  return 0;
}

function hasSkillLearned(player: LivingBase, skillId: string): boolean {
  const manager = (player as any).skillManager;
  if (manager && typeof manager.getAllSkills === 'function') {
    const all = manager.getAllSkills();
    return Array.isArray(all) && all.some((skill: any) => skill?.skillId === skillId);
  }
  return getSkillLevel(player, skillId) > 0;
}

function getFirstMissingAttr(
  player: LivingBase,
  minAttrs: SongyangUnlockRules['minAttrs'],
): { key: SongyangAttrKey; current: number; required: number } | null {
  if (!minAttrs) return null;
  for (const [key, required] of Object.entries(minAttrs) as Array<[SongyangAttrKey, number]>) {
    const current = player.get<number>(key) ?? 0;
    if (current < required) {
      return { key, current, required };
    }
  }
  return null;
}

function getFirstMissingPreSkill(
  player: LivingBase,
  preSkills: SongyangUnlockRules['preSkills'],
): { skillId: SongyangSkillId; current: number; required: number } | null {
  if (!preSkills) return null;
  for (const [skillId, required] of Object.entries(preSkills) as Array<[SongyangSkillId, number]>) {
    const current = getSkillLevel(player, skillId);
    if (current < required) {
      return { skillId, current, required };
    }
  }
  return null;
}

function isPuzzleCompleted(player: LivingBase, puzzleKey: SongyangPuzzleKey): boolean {
  const sect = normalizePlayerSectData(player.get('sect') ?? null);
  const puzzle = sect.songyangSkill?.puzzle;
  if (!puzzle) return false;

  if (puzzleKey === 'canju') {
    return puzzle.canjuCollected >= 3 || puzzle.canjuState === PuzzleStepState.COMPLETED;
  }
  if (puzzleKey === 'duanju') {
    return puzzle.duanjuState === PuzzleStepState.COMPLETED;
  }
  return puzzle.shiyanState === PuzzleStepState.COMPLETED;
}

function getMissingChallenge(player: LivingBase, challenge: SongyangChallengeKey): boolean {
  const sect = normalizePlayerSectData(player.get('sect') ?? null);
  const state = sect.songyangSkill?.challenges;
  if (!state) return true;
  return !state[challenge];
}

function evaluateByRules(
  player: LivingBase,
  skillId: SongyangSkillId,
  rules: SongyangUnlockRules,
): SongyangUnlockResult {
  if (rules.minRank) {
    const requiredContribution = getMinContributionByRank(rules.minRank);
    const currentContribution = Math.max(0, player.get<number>('sect/current/contribution') ?? 0);
    if (requiredContribution !== null && currentContribution < requiredContribution) {
      return {
        state: UnlockState.LOCKED,
        reason: 'unlock_rank_required',
        message: `需达到门中职位「${rules.minRank}」（贡献 ${requiredContribution}）后方可修习。`,
      };
    }
  }

  const missingAttr = getFirstMissingAttr(player, rules.minAttrs);
  if (missingAttr) {
    return {
      state: UnlockState.LOCKED,
      reason: 'unlock_attr_required',
      message: `${ATTR_NAME_MAP[missingAttr.key]}不足（当前 ${missingAttr.current}，需要 ${missingAttr.required}）。`,
    };
  }

  const missingPreSkill = getFirstMissingPreSkill(player, rules.preSkills);
  if (missingPreSkill) {
    const preMeta = SONGYANG_SKILL_META[missingPreSkill.skillId];
    return {
      state: UnlockState.LOCKED,
      reason: 'unlock_preq_skill_required',
      message: `前置「${preMeta.skillName}」需达到 ${missingPreSkill.required} 级（当前 ${missingPreSkill.current}）。`,
    };
  }

  for (const puzzleKey of rules.puzzle ?? []) {
    if (isPuzzleCompleted(player, puzzleKey)) continue;
    if (puzzleKey === 'canju') {
      return {
        state: UnlockState.LOCKED,
        reason: 'unlock_puzzle_canju_required',
        message: `你尚未完成「${PUZZLE_NAME_MAP[puzzleKey]}」。`,
      };
    }
    if (puzzleKey === 'duanju') {
      return {
        state: UnlockState.LOCKED,
        reason: 'unlock_puzzle_duanju_required',
        message: `你尚未通过「${PUZZLE_NAME_MAP[puzzleKey]}」。`,
      };
    }
    return {
      state: UnlockState.LOCKED,
      reason: 'unlock_puzzle_shiyan_required',
      message: `你尚未通过「${PUZZLE_NAME_MAP[puzzleKey]}」。`,
    };
  }

  for (const challenge of rules.challenges ?? []) {
    if (!getMissingChallenge(player, challenge)) continue;
    return {
      state: UnlockState.LOCKED,
      reason: 'unlock_challenge_required',
      message: `需先完成「${CHALLENGE_NAME_MAP[challenge]}」。`,
    };
  }

  return {
    state: UnlockState.AVAILABLE,
    message: '条件已满足，可以学习。',
  };
}

export function evaluateSongyangSkillUnlock(
  player: LivingBase,
  skillId: SongyangSkillId,
): SongyangUnlockResult {
  const sect = normalizePlayerSectData(player.get('sect') ?? null);

  if (sect.current?.sectId !== SONGYANG_FACTION_ID) {
    return {
      state: UnlockState.LOCKED,
      reason: 'unlock_rank_required',
      message: '你并非嵩阳弟子，无法修习此法。',
    };
  }

  if (
    skillId === SONGYANG_SKILL_IDS.CANON_ESSENCE &&
    sect.songyangSkill?.legacy.canonCrippled === true
  ) {
    return {
      state: UnlockState.CRIPPLED,
      reason: 'canon_crippled',
      message: '此传承已残缺，无法再精进。',
    };
  }

  if (hasSkillLearned(player, skillId)) {
    return {
      state: UnlockState.LEARNED,
      message: '你已经掌握此技能。',
    };
  }

  return evaluateByRules(player, skillId, SONGYANG_SKILL_META[skillId].unlockRules);
}

export function evaluateSongyangSkillUnlockById(
  player: LivingBase,
  skillId: string,
): SongyangUnlockResult | null {
  if (!isSongyangSkillId(skillId)) return null;
  return evaluateSongyangSkillUnlock(player, skillId);
}

export function validateSongyangSkillLearn(player: LivingBase, skillId: SongyangSkillId): true | string {
  const result = evaluateSongyangSkillUnlock(player, skillId);
  if (result.state === UnlockState.AVAILABLE || result.state === UnlockState.LEARNED) {
    return true;
  }
  return result.message;
}
