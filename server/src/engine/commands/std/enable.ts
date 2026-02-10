/**
 * enable 指令 -- 装配技能
 *
 * 将已学会的技能装配到对应槽位，使其在战斗中生效。
 * 每个槽位只能装配一个技能，装配新技能会自动替换旧技能。
 *
 * 对标: LPC enable / 炎黄 enable_cmd
 */
import { Command, type ICommand, type CommandResult } from '../../types/command';
import type { LivingBase } from '../../game-objects/living-base';
import { PlayerBase } from '../../game-objects/player-base';
import { type SkillSlotType, SKILL_SLOT_NAMES } from '@packages/core';

@Command({ name: 'enable', aliases: ['装配', '启用'], description: '装配技能' })
export class EnableCommand implements ICommand {
  name = 'enable';
  aliases = ['装配', '启用'];
  description = '装配技能';
  directory = 'std';

  execute(executor: LivingBase, args: string[]): CommandResult {
    if (!(executor instanceof PlayerBase)) {
      return { success: false, message: '只有玩家才能装配技能。' };
    }

    if (args.length === 0) {
      return { success: false, message: '装配什么？用法: enable <技能名>' };
    }

    const skillManager = executor.skillManager;
    if (!skillManager) {
      return { success: false, message: '技能系统尚未初始化。' };
    }

    const target = args.join(' ').trim();

    // 从技能列表中查找匹配的技能
    const listData = skillManager.buildSkillListData();
    const skill = listData.skills.find(
      (s) => s.skillName === target || s.skillName.includes(target),
    );

    if (!skill) {
      return { success: false, message: `你没有学过「${target}」。` };
    }

    // 已装配则提示
    if (skill.isMapped) {
      const slotName = SKILL_SLOT_NAMES[skill.skillType as SkillSlotType] ?? skill.skillType;
      return { success: false, message: `「${skill.skillName}」已经装配在${slotName}槽位。` };
    }

    // 使用技能自身的 skillType 作为目标槽位
    const slotType = skill.skillType as SkillSlotType;
    const result = skillManager.mapSkill(slotType, skill.skillId);

    if (result !== true) {
      return { success: false, message: result };
    }

    const slotName = SKILL_SLOT_NAMES[slotType] ?? slotType;
    return {
      success: true,
      message: `你将「${skill.skillName}」装配到了${slotName}槽位。`,
      data: {
        action: 'enable',
        slotType,
        skillId: skill.skillId,
        skillName: skill.skillName,
      },
    };
  }
}
