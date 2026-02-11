/**
 * research 指令 -- 研究已掌握技能
 *
 * 支持格式:
 *   research <技能名>          -- 研究一次
 *   research <技能名> <次数>   -- 连续研究多次（1-100）
 *
 * 对标: LPC research / 炎黄 research_cmd（一期实现精力+潜能预算链）
 */
import { Command, type CommandResult, type ICommand } from '../../types/command';
import type { LivingBase } from '../../game-objects/living-base';
import { PlayerBase } from '../../game-objects/player-base';
import { MessageFactory, type SkillLearnFailureReason, type SkillLearnResultData } from '@packages/core';

function getAvailablePotential(player: PlayerBase): number {
  const potential = Math.max(0, Math.floor(player.get<number>('potential') ?? 0));
  const learnedPoints = Math.max(0, Math.floor(player.get<number>('learned_points') ?? 0));
  return Math.max(0, potential - learnedPoints);
}

function calcResearchEnergyCost(player: PlayerBase): number {
  const perception = Math.max(1, Math.floor(player.get<number>('perception') ?? 1));
  return Math.max(10, Math.floor(1000 / perception));
}

function getReasonMessage(reason: SkillLearnFailureReason): string {
  switch (reason) {
    case 'insufficient_energy':
      return '精力不足，无法继续研究。';
    case 'insufficient_potential':
      return '潜能不足，无法继续研究。';
    case 'cannot_improve':
      return '你当前境界受限，暂时难以继续参悟。';
    default:
      return '当前条件不足，无法继续研究。';
  }
}

@Command({ name: 'research', aliases: ['yanjiu', '研究'], description: '研究已掌握技能' })
export class ResearchCommand implements ICommand {
  name = 'research';
  aliases = ['yanjiu', '研究'];
  description = '研究已掌握技能';
  directory = 'std';

  execute(executor: LivingBase, args: string[]): CommandResult {
    if (!(executor instanceof PlayerBase)) {
      return { success: false, message: '只有玩家才能研究武学。' };
    }
    if (args.length === 0) {
      return { success: false, message: '研究什么？用法: research <技能名> [次数]' };
    }

    const skillManager = executor.skillManager;
    if (!skillManager) {
      return { success: false, message: '技能系统尚未初始化。' };
    }

    const raw = args.join(' ').trim();
    let skillName = raw;
    let times = 1;

    const lastSpace = raw.lastIndexOf(' ');
    if (lastSpace > 0) {
      const maybeTimes = parseInt(raw.slice(lastSpace + 1), 10);
      if (Number.isFinite(maybeTimes) && maybeTimes > 0) {
        skillName = raw.slice(0, lastSpace).trim();
        times = Math.max(1, Math.min(100, Math.floor(maybeTimes)));
      }
    }

    const all = skillManager.buildSkillListData().skills;
    const target = all.find((s) => s.skillName === skillName || s.skillName.includes(skillName));
    if (!target) {
      return { success: false, message: `你尚未掌握「${skillName}」，无从研究。` };
    }

    const skillId = target.skillId;
    if (target.level < 180) {
      return { success: false, message: '你对这门功夫火候未足，尚未到可自行研究的境地。' };
    }

    let timesCompleted = 0;
    let didLevelUp = false;
    let stopReason: SkillLearnFailureReason | undefined;

    for (let i = 0; i < times; i++) {
      const before = skillManager.getAllSkills().find((s) => s.skillId === skillId);
      const beforeLevel = before?.level ?? 0;
      const beforeLearned = before?.learned ?? 0;

      if (getAvailablePotential(executor) < 1) {
        stopReason = 'insufficient_potential';
        break;
      }

      const energy = executor.get<number>('energy') ?? 0;
      const energyCost = calcResearchEnergyCost(executor);
      if (energy < energyCost) {
        stopReason = 'insufficient_energy';
        break;
      }

      const learnedPointsBefore = Math.max(0, Math.floor(executor.get<number>('learned_points') ?? 0));
      executor.set('energy', energy - energyCost);
      executor.set('learned_points', learnedPointsBefore + 1);

      skillManager.improveSkill(skillId, 1);

      const after = skillManager.getAllSkills().find((s) => s.skillId === skillId);
      const afterLevel = after?.level ?? 0;
      const afterLearned = after?.learned ?? 0;
      const progressed = afterLevel !== beforeLevel || afterLearned !== beforeLearned;
      if (!progressed) {
        executor.set('energy', energy);
        executor.set('learned_points', learnedPointsBefore);
        stopReason = 'cannot_improve';
        break;
      }

      if (afterLevel > beforeLevel) didLevelUp = true;
      timesCompleted++;
    }

    const finalData = skillManager.getAllSkills().find((s) => s.skillId === skillId);
    const finalLevel = finalData?.level ?? 0;
    const learned = finalData?.learned ?? 0;
    const learnedMax = Math.pow(finalLevel + 1, 2);

    if (timesCompleted === 0) {
      const reason = stopReason ?? 'cannot_improve';
      const resultData: SkillLearnResultData = {
        success: false,
        skillId,
        skillName: target.skillName,
        timesCompleted: 0,
        timesRequested: times,
        currentLevel: finalLevel,
        learned,
        learnedMax,
        levelUp: false,
        message: getReasonMessage(reason),
        reason,
      };
      const failMsg = MessageFactory.create('skillLearnResult', resultData);
      if (failMsg) executor.sendToClient(MessageFactory.serialize(failMsg));
      return {
        success: false,
        message: resultData.message,
        data: { action: 'research', skillId, reason },
      };
    }

    const baseMessage = didLevelUp
      ? `你静心推演${timesCompleted}次，对「${target.skillName}」豁然开朗，提升到了 ${finalLevel} 级。`
      : `你静心推演${timesCompleted}次，对「${target.skillName}」多了几分体会。`;
    const message = stopReason
      ? `${baseMessage}（因${getReasonMessage(stopReason).replace(/。$/, '')}中断）`
      : baseMessage;

    const resultData: SkillLearnResultData = {
      success: true,
      skillId,
      skillName: target.skillName,
      timesCompleted,
      timesRequested: times,
      currentLevel: finalLevel,
      learned,
      learnedMax,
      levelUp: didLevelUp,
      message,
      reason: stopReason,
    };
    const msg = MessageFactory.create('skillLearnResult', resultData);
    if (msg) executor.sendToClient(MessageFactory.serialize(msg));

    return {
      success: true,
      message,
      data: { action: 'research', skillId, timesCompleted, reason: stopReason },
    };
  }
}
