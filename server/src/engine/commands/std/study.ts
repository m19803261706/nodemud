/**
 * study 指令 -- 研读秘籍学习技能
 *
 * 支持格式:
 *   study <书名>          -- 研读一次
 *   study <书名> <次数>   -- 连续研读多次（1-100）
 *   du <书名>             -- 中文别名
 *
 * 从背包中找到 BookBase 类型的 SKILL 秘籍，消耗精力研读提升技能。
 * 对标: LPC study / 炎黄 study_cmd
 */
import { Command, type ICommand, type CommandResult } from '../../types/command';
import type { LivingBase } from '../../game-objects/living-base';
import { PlayerBase } from '../../game-objects/player-base';
import { BookBase } from '../../game-objects/book-base';
import { ServiceLocator } from '../../service-locator';
import {
  BookType,
  SkillLearnSource,
  SKILL_CONSTANTS,
  MessageFactory,
  rt,
  bold,
  type SkillLearnResultData,
} from '@packages/core';

@Command({ name: 'study', aliases: ['du', '研读', '读书'], description: '研读秘籍学习技能' })
export class StudyCommand implements ICommand {
  name = 'study';
  aliases = ['du', '研读', '读书'];
  description = '研读秘籍学习技能';
  directory = 'std';

  execute(executor: LivingBase, args: string[]): CommandResult {
    if (!(executor instanceof PlayerBase)) {
      return { success: false, message: '只有玩家才能研读秘籍。' };
    }

    if (args.length === 0) {
      return { success: false, message: '研读什么？用法: study <书名> [次数]' };
    }

    const skillManager = executor.skillManager;
    if (!skillManager) {
      return { success: false, message: '技能系统尚未初始化。' };
    }

    const skillRegistry = ServiceLocator.skillRegistry;
    if (!skillRegistry) {
      return { success: false, message: '技能注册表尚未初始化。' };
    }

    // 解析参数：从右侧识别可选次数
    const raw = args.join(' ').trim();
    let bookName = raw;
    let times = 1;

    const lastSpaceIdx = raw.lastIndexOf(' ');
    if (lastSpaceIdx > 0) {
      const maybeNum = parseInt(raw.substring(lastSpaceIdx + 1), 10);
      if (Number.isFinite(maybeNum) && maybeNum > 0) {
        bookName = raw.substring(0, lastSpaceIdx).trim();
        times = Math.max(1, Math.min(SKILL_CONSTANTS.MAX_LEARN_TIMES, Math.floor(maybeNum)));
      }
    }

    // 背包搜索 BookBase 实例
    const book = executor
      .getInventory()
      .filter((e): e is BookBase => e instanceof BookBase)
      .find((b) => b.getName().includes(bookName));

    if (!book) {
      return { success: false, message: `你的背包里没有「${bookName}」。` };
    }

    // 检查 bookType
    if (book.getBookType() !== BookType.SKILL) {
      return { success: false, message: `${book.getName()}不是一本技能秘籍，无法研读。` };
    }

    const skillId = book.getSkillId();
    if (!skillId) {
      return { success: false, message: `${book.getName()}记载的内容残缺不全，无法辨认。` };
    }

    // 从注册表获取技能定义
    const skillDef = skillRegistry.get(skillId);
    if (!skillDef) {
      return {
        success: false,
        message: `${book.getName()}记载的功法已失传，无人能解读。`,
      };
    }

    // 角色等级检查
    const expRequired = book.getExpRequired();
    const playerLevel = executor.get<number>('level') ?? 1;
    if (expRequired > 0 && playerLevel < expRequired) {
      return {
        success: false,
        message: `你的修为尚浅（等级 ${playerLevel}），至少需要 ${expRequired} 级才能参悟此秘籍。`,
      };
    }

    // 前置技能检查
    const needSkills = book.getNeedSkills();
    const allPlayerSkills = skillManager.getAllSkills();
    for (const [needId, needLevel] of Object.entries(needSkills)) {
      const playerSkill = allPlayerSkills.find((s) => s.skillId === needId);
      const needDef = skillRegistry.get(needId);
      const needName = needDef?.skillName ?? needId;
      if (!playerSkill) {
        return {
          success: false,
          message: `研读此秘籍需要先学会「${needName}」。`,
        };
      }
      if (playerSkill.level < needLevel) {
        return {
          success: false,
          message: `研读此秘籍需要「${needName}」达到 ${needLevel} 级（当前 ${playerSkill.level} 级）。`,
        };
      }
    }

    // 技能学习条件校验
    const canLearn = skillDef.validLearn(executor);
    if (canLearn !== true) {
      return { success: false, message: canLearn };
    }

    // 首次学习
    const existingSkill = allPlayerSkills.find((s) => s.skillId === skillId);
    if (!existingSkill) {
      const learnResult = skillManager.learnSkill(skillId, SkillLearnSource.BOOK);
      if (learnResult !== true) {
        return { success: false, message: learnResult };
      }
    }

    // 等级区间检查
    const minLevel = book.getMinLevel();
    const maxLevel = book.getMaxLevel();
    const currentSkill = skillManager.getAllSkills().find((s) => s.skillId === skillId);
    const currentLevel = currentSkill?.level ?? 0;

    if (currentLevel >= maxLevel) {
      return {
        success: false,
        message: `你对${book.getName()}所载的「${skillDef.skillName}」已领悟透彻，再读也无益了。`,
      };
    }

    // 循环研读
    const wisdom = executor.get<number>('wisdom') ?? 10;
    const energyCost = book.calculateEnergyCost(wisdom);
    let timesCompleted = 0;
    let didLevelUp = false;

    for (let i = 0; i < times; i++) {
      // 精力检查
      const energy = executor.get<number>('energy') ?? 0;
      if (energy < energyCost) {
        if (timesCompleted === 0) {
          return {
            success: false,
            message: `精力不足（需要 ${energyCost}，当前 ${energy}），无法研读。`,
          };
        }
        break;
      }

      // 等级上限检查
      const beforeData = skillManager.getAllSkills().find((s) => s.skillId === skillId);
      const beforeLevel = beforeData?.level ?? 0;
      const beforeLearned = beforeData?.learned ?? 0;

      if (beforeLevel >= maxLevel) {
        if (timesCompleted === 0) {
          return {
            success: false,
            message: `你对此秘籍所载内容已领悟透彻，再读也无益了。`,
          };
        }
        break;
      }

      // 扣除精力
      executor.set('energy', energy - energyCost);

      // 提升技能
      skillManager.improveSkill(skillId, 1);

      // 检查是否有进步
      const afterData = skillManager.getAllSkills().find((s) => s.skillId === skillId);
      const afterLevel = afterData?.level ?? 0;
      const afterLearned = afterData?.learned ?? 0;
      const progressed = afterLevel !== beforeLevel || afterLearned !== beforeLearned;

      if (!progressed) {
        // 无进步，回滚精力消耗
        executor.set('energy', energy);
        if (timesCompleted === 0) {
          return {
            success: false,
            message: '你当前境界已无法从这本秘籍中获得更多领悟。',
          };
        }
        break;
      }

      if (afterLevel > beforeLevel) {
        didLevelUp = true;
      }
      timesCompleted++;
    }

    // 获取最终技能数据
    const finalData = skillManager.getAllSkills().find((s) => s.skillId === skillId);
    const finalLevel = finalData?.level ?? 0;
    const learned = finalData?.learned ?? 0;
    const learnedMax = Math.pow(finalLevel + 1, 2);

    // 构建结果消息
    const bookName2 = book.getName();
    let message: string;
    if (didLevelUp) {
      message = `你研读${bookName2}${timesCompleted}次，对「${skillDef.skillName}」的领悟更上一层，提升到了 ${rt('imp', bold(`${finalLevel} 级`))}！`;
    } else {
      message = `你研读${bookName2}${timesCompleted}次，对「${skillDef.skillName}」的理解加深了一些。`;
    }

    // 推送 skillLearnResult 消息
    const resultData: SkillLearnResultData = {
      success: true,
      skillId,
      skillName: skillDef.skillName,
      timesCompleted,
      timesRequested: times,
      currentLevel: finalLevel,
      learned,
      learnedMax,
      levelUp: didLevelUp,
      message,
    };
    const msg = MessageFactory.create('skillLearnResult', resultData);
    if (msg) {
      executor.sendToClient(MessageFactory.serialize(msg));
    }

    return {
      success: true,
      message,
      data: {
        action: 'study',
        skillId,
        bookId: book.id,
        timesCompleted,
      },
    };
  }
}
