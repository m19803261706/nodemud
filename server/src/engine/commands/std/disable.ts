/**
 * disable 指令 -- 卸下技能
 *
 * 将已装配的技能从槽位中移除，技能不会消失，只是不再生效。
 *
 * 对标: LPC disable / 炎黄 disable_cmd
 */
import { Command, type ICommand, type CommandResult } from '../../types/command';
import type { LivingBase } from '../../game-objects/living-base';
import { PlayerBase } from '../../game-objects/player-base';
import { type SkillSlotType, SKILL_SLOT_NAMES } from '@packages/core';

@Command({ name: 'disable', aliases: ['停用', '卸载'], description: '卸下技能' })
export class DisableCommand implements ICommand {
  name = 'disable';
  aliases = ['停用', '卸载'];
  description = '卸下技能';
  directory = 'std';

  execute(executor: LivingBase, args: string[]): CommandResult {
    if (!(executor instanceof PlayerBase)) {
      return { success: false, message: '只有玩家才能卸下技能。' };
    }

    if (args.length === 0) {
      return { success: false, message: '卸下什么？用法: disable <技能名>' };
    }

    const skillManager = executor.skillManager;
    if (!skillManager) {
      return { success: false, message: '技能系统尚未初始化。' };
    }

    const target = args.join(' ').trim();

    // 从技能列表中查找匹配的技能
    const listData = skillManager.buildSkillListData();
    const skill = listData.skills.find(
      (s) => (s.skillName === target || s.skillName.includes(target)) && s.isMapped,
    );

    if (!skill) {
      // 检查是否有这个技能但未装配
      const hasSkill = listData.skills.find(
        (s) => s.skillName === target || s.skillName.includes(target),
      );
      if (hasSkill) {
        return { success: false, message: `「${hasSkill.skillName}」当前未装配。` };
      }
      return { success: false, message: `你没有学过「${target}」。` };
    }

    // 使用已装配的槽位
    const slotType = (skill.mappedSlot ?? skill.skillType) as SkillSlotType;
    const result = skillManager.mapSkill(slotType, null);

    if (result !== true) {
      return { success: false, message: result };
    }

    const slotName = SKILL_SLOT_NAMES[slotType] ?? slotType;
    return {
      success: true,
      message: `你卸下了${slotName}槽位的「${skill.skillName}」。`,
      data: {
        action: 'disable',
        slotType,
        skillId: skill.skillId,
        skillName: skill.skillName,
      },
    };
  }
}
