/**
 * practice 指令 -- 修炼技能
 *
 * 三种模式：
 *   practice <技能名>         -- 单次练习（消耗资源，立即提升经验）
 *   dazuo <技能名>            -- 打坐修炼（持续，低消耗低效率）
 *   jingzuo <技能名>          -- 静坐修炼（持续，正常消耗正常效率）
 *
 * 对标: LPC practice / 炎黄 practice_cmd
 */
import { Command, type ICommand, type CommandResult } from '../../types/command';
import type { LivingBase } from '../../game-objects/living-base';
import { PlayerBase } from '../../game-objects/player-base';
import { ServiceLocator } from '../../service-locator';
import { PracticeMode } from '@packages/core';

@Command({ name: 'practice', aliases: ['练习', 'lian'], description: '练习技能（单次）' })
export class PracticeCommand implements ICommand {
  name = 'practice';
  aliases = ['练习', 'lian'];
  description = '练习技能（单次）';
  directory = 'std';

  execute(executor: LivingBase, args: string[]): CommandResult {
    return executePractice(executor, args, PracticeMode.PRACTICE);
  }
}

@Command({ name: 'dazuo', aliases: ['打坐'], description: '打坐修炼（持续）' })
export class DazuoCommand implements ICommand {
  name = 'dazuo';
  aliases = ['打坐'];
  description = '打坐修炼（持续）';
  directory = 'std';

  execute(executor: LivingBase, args: string[]): CommandResult {
    return executePractice(executor, args, PracticeMode.DAZUO);
  }
}

@Command({ name: 'jingzuo', aliases: ['静坐'], description: '静坐修炼（持续）' })
export class JingzuoCommand implements ICommand {
  name = 'jingzuo';
  aliases = ['静坐'];
  description = '静坐修炼（持续）';
  directory = 'std';

  execute(executor: LivingBase, args: string[]): CommandResult {
    return executePractice(executor, args, PracticeMode.JINGZUO);
  }
}

/** 统一修炼执行逻辑 */
function executePractice(executor: LivingBase, args: string[], mode: PracticeMode): CommandResult {
  if (!(executor instanceof PlayerBase)) {
    return { success: false, message: '只有玩家才能修炼。' };
  }

  if (args.length === 0) {
    const modeText =
      mode === PracticeMode.PRACTICE ? '练习' : mode === PracticeMode.DAZUO ? '打坐' : '静坐';
    return { success: false, message: `${modeText}什么？用法: ${modeText} <技能名>` };
  }

  const skillManager = executor.skillManager;
  if (!skillManager) {
    return { success: false, message: '技能系统尚未初始化。' };
  }

  const practiceManager = ServiceLocator.practiceManager;
  if (!practiceManager) {
    return { success: false, message: '修炼系统尚未初始化。' };
  }

  const target = args.join(' ').trim();

  // 从技能列表中查找匹配的技能（buildSkillListData 返回含 skillName 的 PlayerSkillInfo）
  const listData = skillManager.buildSkillListData();
  const skill = listData.skills.find((s) => s.skillName === target || s.skillName.includes(target));

  if (!skill) {
    return { success: false, message: `你没有学过「${target}」。` };
  }

  // 调用 PracticeManager 开始修炼
  const result = practiceManager.startPractice(executor, skill.skillId, mode);

  if (result !== true) {
    return { success: false, message: result };
  }

  // PracticeManager 会推送 practiceUpdate 消息，这里返回空消息避免重复
  return {
    success: true,
    data: { action: 'practice', mode, skillId: skill.skillId },
  };
}
