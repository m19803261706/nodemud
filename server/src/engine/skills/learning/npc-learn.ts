import type { SkillLearnFailureReason, SkillLearnResultData } from '@packages/core';
import { NpcBase } from '../../game-objects/npc-base';
import { PlayerBase } from '../../game-objects/player-base';
import type { SkillManager } from '../skill-manager';

export interface NpcLearnExecutionParams {
  player: PlayerBase;
  npc: NpcBase;
  skillManager: SkillManager;
  skillId: string;
  skillName: string;
  times: number;
}

export interface NpcLearnExecutionResult {
  data: SkillLearnResultData;
  stopReason?: SkillLearnFailureReason;
}

function getSkillProgress(skillManager: SkillManager, skillId: string) {
  const data = skillManager.getAllSkills().find((s) => s.skillId === skillId);
  const currentLevel = data?.level ?? 0;
  const learned = data?.learned ?? 0;
  return {
    currentLevel,
    learned,
    learnedMax: Math.pow(currentLevel + 1, 2),
  };
}

function getReasonMessage(reason: SkillLearnFailureReason): string {
  switch (reason) {
    case 'insufficient_silver':
      return '银两不足，无法继续学习。';
    case 'insufficient_energy':
      return '精力不足，无法继续学习。';
    case 'insufficient_potential':
      return '潜能不足，无法继续学习。';
    case 'teacher_cap_reached':
      return '师父所授已尽，你需另寻机缘。';
    case 'cannot_improve':
      return '你当前境界无法继续从此法门精进。';
    default:
      return '当前条件不足，无法继续学习。';
  }
}

function getTeachLevelCap(npc: NpcBase, skillId: string): number | null {
  const teachSkillLevels = npc.get<Record<string, number>>('teach_skill_levels') ?? {};
  const cap = teachSkillLevels[skillId];
  if (typeof cap !== 'number' || !Number.isFinite(cap)) return null;
  return Math.max(0, Math.floor(cap));
}

function getAvailablePotential(player: PlayerBase): number {
  const totalPotential = Math.max(0, Math.floor(player.get<number>('potential') ?? 0));
  const learnedPoints = Math.max(0, Math.floor(player.get<number>('learned_points') ?? 0));
  return Math.max(0, totalPotential - learnedPoints);
}

function calcLearnEnergyCost(player: PlayerBase, currentLevel: number): number {
  // 对齐炎黄 learn 语义: (100 + level * 2) / 悟性，首学翻倍
  const perception = Math.max(1, Math.floor(player.get<number>('perception') ?? 1));
  let cost = Math.floor((100 + Math.max(0, currentLevel) * 2) / perception);
  if (currentLevel <= 0) cost *= 2;
  return Math.max(5, cost);
}

function buildFailureResult(
  skillManager: SkillManager,
  skillId: string,
  skillName: string,
  timesRequested: number,
  reason: SkillLearnFailureReason,
): NpcLearnExecutionResult {
  const progress = getSkillProgress(skillManager, skillId);
  return {
    data: {
      success: false,
      skillId,
      skillName,
      timesCompleted: 0,
      timesRequested,
      currentLevel: progress.currentLevel,
      learned: progress.learned,
      learnedMax: progress.learnedMax,
      levelUp: false,
      message: getReasonMessage(reason),
      reason,
    },
  };
}

function buildImmersiveLearnMessage(params: {
  npcName: string;
  skillName: string;
  timesCompleted: number;
  finalLevel: number;
  finalLearned: number;
  finalLearnedMax: number;
  silverSpent: number;
  energySpent: number;
  potentialSpent: number;
  didLevelUp: boolean;
  stopReason?: SkillLearnFailureReason;
}): string {
  const {
    npcName,
    skillName,
    timesCompleted,
    finalLevel,
    finalLearned,
    finalLearnedMax,
    silverSpent,
    energySpent,
    potentialSpent,
    didLevelUp,
    stopReason,
  } = params;

  const lines: string[] = [];
  lines.push(`你向${npcName}抱拳请益「${skillName}」，${npcName}凝神为你拆招点诀。`);
  lines.push(`你前后请教 ${timesCompleted} 次，反复揣摩其间关窍。`);
  lines.push(`此番共耗：银两 ${silverSpent} 两，精力 ${energySpent}，潜能 ${potentialSpent}。`);

  if (didLevelUp) {
    lines.push(`灵台一清，你对「${skillName}」的领悟突破至 Lv.${finalLevel}。`);
  } else {
    lines.push(`招意渐明，你对「${skillName}」又多了几分心得。`);
  }

  lines.push(`当前进境：Lv.${finalLevel}（${finalLearned}/${finalLearnedMax}）。`);

  if (stopReason) {
    lines.push(`行至半途：${getReasonMessage(stopReason).replace(/。$/, '')}。`);
  }

  return lines.join('\n');
}

export function executeNpcTeachLearning(params: NpcLearnExecutionParams): NpcLearnExecutionResult {
  const { player, npc, skillManager, skillId, skillName, times } = params;
  const teachCost = Math.max(0, Math.floor(npc.get<number>('teach_cost') ?? 10));
  const teacherCap = getTeachLevelCap(npc, skillId);
  if (teacherCap == null) {
    return buildFailureResult(skillManager, skillId, skillName, times, 'teacher_cap_reached');
  }

  let timesCompleted = 0;
  let didLevelUp = false;
  let stopReason: SkillLearnFailureReason | undefined;
  let silverSpent = 0;
  let energySpent = 0;
  let potentialSpent = 0;

  for (let i = 0; i < times; i++) {
    const before = getSkillProgress(skillManager, skillId);
    if (before.currentLevel >= teacherCap) {
      if (timesCompleted === 0) {
        return buildFailureResult(skillManager, skillId, skillName, times, 'teacher_cap_reached');
      }
      stopReason = 'teacher_cap_reached';
      break;
    }

    if (player.getSilver() < teachCost) {
      if (timesCompleted === 0) {
        return buildFailureResult(skillManager, skillId, skillName, times, 'insufficient_silver');
      }
      stopReason = 'insufficient_silver';
      break;
    }

    const energy = player.get<number>('energy') ?? 0;
    const energyCost = calcLearnEnergyCost(player, before.currentLevel);
    if (energy < energyCost) {
      if (timesCompleted === 0) {
        return buildFailureResult(skillManager, skillId, skillName, times, 'insufficient_energy');
      }
      stopReason = 'insufficient_energy';
      break;
    }

    if (getAvailablePotential(player) < 1) {
      if (timesCompleted === 0) {
        return buildFailureResult(
          skillManager,
          skillId,
          skillName,
          times,
          'insufficient_potential',
        );
      }
      stopReason = 'insufficient_potential';
      break;
    }

    const learnedPointsBefore = Math.max(0, Math.floor(player.get<number>('learned_points') ?? 0));

    player.spendSilver(teachCost);
    player.set('energy', energy - energyCost);
    player.set('learned_points', learnedPointsBefore + 1);
    silverSpent += teachCost;
    energySpent += energyCost;
    potentialSpent += 1;

    const improved = skillManager.improveSkill(skillId, 1);
    const after = getSkillProgress(skillManager, skillId);
    const progressed =
      after.currentLevel !== before.currentLevel || after.learned !== before.learned;

    if (!progressed) {
      // 没有成长时回滚当前轮资源，避免玩家无收益扣费
      player.addSilver(teachCost);
      player.set('energy', energy);
      player.set('learned_points', learnedPointsBefore);
      silverSpent -= teachCost;
      energySpent -= energyCost;
      potentialSpent -= 1;
      if (timesCompleted === 0) {
        return buildFailureResult(skillManager, skillId, skillName, times, 'cannot_improve');
      }
      stopReason = 'cannot_improve';
      break;
    }

    if (improved || after.currentLevel > before.currentLevel) {
      didLevelUp = true;
    }
    timesCompleted++;
  }

  const finalProgress = getSkillProgress(skillManager, skillId);
  const message = buildImmersiveLearnMessage({
    npcName: npc.getName(),
    skillName,
    timesCompleted,
    finalLevel: finalProgress.currentLevel,
    finalLearned: finalProgress.learned,
    finalLearnedMax: finalProgress.learnedMax,
    silverSpent,
    energySpent,
    potentialSpent,
    didLevelUp,
    stopReason,
  });

  return {
    data: {
      success: true,
      skillId,
      skillName,
      timesCompleted,
      timesRequested: times,
      currentLevel: finalProgress.currentLevel,
      learned: finalProgress.learned,
      learnedMax: finalProgress.learnedMax,
      levelUp: didLevelUp,
      message,
      reason: stopReason,
    },
    stopReason,
  };
}
