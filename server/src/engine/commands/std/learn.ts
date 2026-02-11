/**
 * learn 指令 -- 向 NPC 学艺
 *
 * 支持格式:
 *   learn <技能名> from <NPC名>          -- 指定 NPC 学习
 *   learn <技能名> from <NPC名> <次数>   -- 连续学习多次
 *   xue <技能名> from <NPC名>            -- 中文别名
 *
 * 学习消耗银两和精力，NPC 必须在同一房间且教授该技能。
 *
 * 对标: LPC learn / 炎黄 learn_cmd
 */
import { Command, type ICommand, type CommandResult } from '../../types/command';
import type { LivingBase } from '../../game-objects/living-base';
import { PlayerBase } from '../../game-objects/player-base';
import { NpcBase } from '../../game-objects/npc-base';
import { RoomBase } from '../../game-objects/room-base';
import { ServiceLocator } from '../../service-locator';
import { SkillLearnSource, MessageFactory } from '@packages/core';
import {
  evaluateSongyangSkillUnlockById,
  UnlockState,
} from '../../skills/songyang/songyang-unlock-evaluator';
import { executeNpcTeachLearning } from '../../skills/learning/npc-learn';

@Command({ name: 'learn', aliases: ['学艺', 'xue', '学习'], description: '向 NPC 学习技能' })
export class LearnCommand implements ICommand {
  name = 'learn';
  aliases = ['学艺', 'xue', '学习'];
  description = '向 NPC 学习技能';
  directory = 'std';

  execute(executor: LivingBase, args: string[]): CommandResult {
    if (!(executor instanceof PlayerBase)) {
      return { success: false, message: '只有玩家才能学艺。' };
    }

    if (args.length < 3) {
      return { success: false, message: '用法: learn <技能名> from <NPC名> [次数]' };
    }

    const skillManager = executor.skillManager;
    if (!skillManager) {
      return { success: false, message: '技能系统尚未初始化。' };
    }

    const skillRegistry = ServiceLocator.skillRegistry;
    if (!skillRegistry) {
      return { success: false, message: '技能注册表尚未初始化。' };
    }

    // 解析参数：按 "from" 分割
    const raw = args.join(' ');
    const fromIdx = raw.indexOf(' from ');
    if (fromIdx === -1) {
      return { success: false, message: '用法: learn <技能名> from <NPC名> [次数]' };
    }

    const skillName = raw.substring(0, fromIdx).trim();
    const afterFrom = raw.substring(fromIdx + 6).trim();

    // 解析 NPC 名和可选次数
    const afterParts = afterFrom.split(/\s+/);
    const npcName = afterParts[0];
    const timesArg = afterParts[1] ? parseInt(afterParts[1], 10) : 1;
    const times = Number.isFinite(timesArg) ? Math.max(1, Math.min(100, Math.floor(timesArg))) : 1;

    if (!skillName || !npcName) {
      return { success: false, message: '用法: learn <技能名> from <NPC名> [次数]' };
    }

    // 查找房间中的 NPC
    const env = executor.getEnvironment();
    if (!env || !(env instanceof RoomBase)) {
      return { success: false, message: '你不在任何房间中。' };
    }

    const npc = env
      .getInventory()
      .find((e) => e instanceof NpcBase && (e as NpcBase).getName().includes(npcName)) as
      | NpcBase
      | undefined;

    if (!npc) {
      return { success: false, message: '这里没有这个人。' };
    }

    // 校验 NPC 是否教授技能
    const teachSkills = npc.get<string[]>('teach_skills');
    if (!teachSkills || teachSkills.length === 0) {
      return { success: false, message: `${npc.getName()}不是一个师父。` };
    }

    // 在注册表中按技能名查找技能 ID
    const allRegistered = skillRegistry.getAll();
    const skillDef = allRegistered.find(
      (s) => s.skillName === skillName || s.skillName.includes(skillName),
    );

    if (!skillDef) {
      return { success: false, message: `未知的技能「${skillName}」。` };
    }

    // 校验 NPC 是否教授该技能
    if (!teachSkills.includes(skillDef.skillId)) {
      return { success: false, message: `${npc.getName()}不教授「${skillDef.skillName}」。` };
    }

    // 嵩阳技能统一判定：失败时回传 reason，便于前端提示
    const unlockResult = evaluateSongyangSkillUnlockById(executor, skillDef.skillId);
    if (
      unlockResult &&
      unlockResult.state !== UnlockState.AVAILABLE &&
      unlockResult.state !== UnlockState.LEARNED
    ) {
      return {
        success: false,
        message: unlockResult.message,
        data: {
          action: 'learn',
          skillId: skillDef.skillId,
          reason: unlockResult.reason,
        },
      };
    }

    // 检查是否已学会，未学会则先学习
    const existingSkill = skillManager.getAllSkills().find((s) => s.skillId === skillDef.skillId);
    if (!existingSkill) {
      const learnResult = skillManager.learnSkill(skillDef.skillId, SkillLearnSource.NPC);
      if (learnResult !== true) {
        const failedUnlock = evaluateSongyangSkillUnlockById(executor, skillDef.skillId);
        return {
          success: false,
          message: failedUnlock?.message ?? learnResult,
          data: {
            action: 'learn',
            skillId: skillDef.skillId,
            reason: failedUnlock?.reason,
          },
        };
      }
    }

    const { data: resultData } = executeNpcTeachLearning({
      player: executor,
      npc,
      skillManager,
      skillId: skillDef.skillId,
      skillName: skillDef.skillName,
      times,
    });

    // 推送 skillLearnResult 消息给前端同步
    const msg = MessageFactory.create('skillLearnResult', resultData);
    if (msg) {
      executor.sendToClient(MessageFactory.serialize(msg));
    }

    if (!resultData.success) {
      return {
        success: false,
        message: resultData.message,
        data: {
          action: 'learn',
          skillId: skillDef.skillId,
          npcId: npc.id,
          reason: resultData.reason,
        },
      };
    }

    return {
      success: true,
      message: resultData.message,
      data: {
        action: 'learn',
        skillId: skillDef.skillId,
        npcId: npc.id,
        timesCompleted: resultData.timesCompleted,
        reason: resultData.reason,
      },
    };
  }
}
