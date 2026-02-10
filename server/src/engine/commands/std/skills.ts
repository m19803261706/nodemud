/**
 * skills 指令 -- 查看技能列表
 *
 * 在游戏日志中输出已学技能的分类摘要，
 * 同时推送 skillPanelData 消息同步前端技能面板。
 *
 * 对标: LPC skills / 炎黄 skills_cmd
 */
import { Command, type ICommand, type CommandResult } from '../../types/command';
import type { LivingBase } from '../../game-objects/living-base';
import { PlayerBase } from '../../game-objects/player-base';
import {
  MessageFactory,
  SkillCategory,
  type SkillSlotType,
  SKILL_SLOT_NAMES,
  type PlayerSkillInfo,
  type SkillPanelDataResponse,
} from '@packages/core';

/** 分类中文名 */
const CATEGORY_NAMES: Record<string, string> = {
  [SkillCategory.MARTIAL]: '武学',
  [SkillCategory.INTERNAL]: '内功',
  [SkillCategory.SUPPORT]: '辅技',
  [SkillCategory.COGNIZE]: '悟道',
};

/** 格式化单个技能行 */
function formatSkillLine(s: PlayerSkillInfo): string {
  const slotName = SKILL_SLOT_NAMES[s.skillType as SkillSlotType] ?? s.skillType;
  let line = `  ${slotName}: ${s.skillName} (${s.level}级)`;
  if (s.isActiveForce) {
    line += ' [激活]';
  } else if (s.isMapped) {
    line += ' [已装配]';
  }
  return line;
}

@Command({ name: 'skills', aliases: ['技能', '武功'], description: '查看技能列表' })
export class SkillsCommand implements ICommand {
  name = 'skills';
  aliases = ['技能', '武功'];
  description = '查看技能列表';
  directory = 'std';

  execute(executor: LivingBase): CommandResult {
    if (!(executor instanceof PlayerBase)) {
      return { success: false, message: '只有玩家可以查看技能。' };
    }

    const skillManager = executor.skillManager;
    if (!skillManager) {
      return { success: false, message: '技能系统尚未初始化。' };
    }

    // 构建面板数据并推送给前端
    const listData = skillManager.buildSkillListData();
    const bonusSummary = skillManager.getSkillBonusSummary();
    const panelData: SkillPanelDataResponse = {
      skills: listData.skills,
      skillMap: listData.skillMap,
      activeForce: listData.activeForce,
      bonusSummary,
    };
    const msg = MessageFactory.create('skillPanelData', panelData);
    if (msg) {
      executor.sendToClient(MessageFactory.serialize(msg));
    }

    // 无技能时的提示
    if (listData.skills.length === 0) {
      return { success: true, message: '你尚未学会任何技能。' };
    }

    // 按分类分组
    const groups = new Map<string, PlayerSkillInfo[]>();
    for (const s of listData.skills) {
      const cat = s.category || 'unknown';
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat)!.push(s);
    }

    // 生成文本摘要
    const lines: string[] = ['你的技能：'];
    const categoryOrder = [
      SkillCategory.MARTIAL,
      SkillCategory.INTERNAL,
      SkillCategory.SUPPORT,
      SkillCategory.COGNIZE,
    ];

    for (const cat of categoryOrder) {
      const skills = groups.get(cat);
      if (!skills || skills.length === 0) continue;
      const catName = CATEGORY_NAMES[cat] ?? cat;
      lines.push(`【${catName}】`);
      for (const s of skills) {
        lines.push(formatSkillLine(s));
      }
    }

    // 装配统计
    const mapped = listData.skills.filter((s) => s.isMapped).length;
    lines.push(`\n共 ${listData.skills.length} 项技能，已装配 ${mapped} 项。`);

    return {
      success: true,
      message: lines.join('\n'),
      data: { action: 'skills' },
    };
  }
}
