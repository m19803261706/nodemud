/**
 * read 指令 -- 阅读书籍
 *
 * 支持格式:
 *   read <书名>                    -- 阅读内容 / 查看秘籍概述 / 列出配方
 *   read <配方名> from <书名>      -- 从配方书学习配方
 *
 * 对标: LPC read / 炎黄 book.c
 */
import { Command, type ICommand, type CommandResult } from '../../types/command';
import type { LivingBase } from '../../game-objects/living-base';
import { PlayerBase } from '../../game-objects/player-base';
import { BookBase } from '../../game-objects/book-base';
import { ServiceLocator } from '../../service-locator';
import { BookType, rt, bold } from '@packages/core';

@Command({ name: 'read', aliases: ['阅读'], description: '阅读书籍' })
export class ReadCommand implements ICommand {
  name = 'read';
  aliases = ['阅读'];
  description = '阅读书籍';
  directory = 'std';

  execute(executor: LivingBase, args: string[]): CommandResult {
    if (!(executor instanceof PlayerBase)) {
      return { success: false, message: '只有玩家才能阅读书籍。' };
    }

    if (args.length === 0) {
      return { success: false, message: '阅读什么？用法: read <书名>' };
    }

    const raw = args.join(' ').trim();

    // 检查是否是 "read <配方名> from <书名>" 格式
    const fromIdx = raw.indexOf(' from ');
    if (fromIdx !== -1) {
      return this.learnRecipe(executor, raw, fromIdx);
    }

    // 普通阅读
    return this.readBook(executor, raw);
  }

  /** 阅读书籍内容 */
  private readBook(executor: PlayerBase, bookName: string): CommandResult {
    const book = this.findBook(executor, bookName);
    if (!book) {
      return { success: false, message: `你的背包里没有「${bookName}」。` };
    }

    const bookType = book.getBookType();
    const name = book.getName();

    switch (bookType) {
      case BookType.SKILL:
        return this.readSkillBook(book);

      case BookType.TEXT:
        return this.readTextBook(book);

      case BookType.RECIPE:
        return this.readRecipeBook(executor, book);

      default:
        return {
          success: true,
          message: `你翻阅了${name}。`,
          data: { action: 'read', bookId: book.id },
        };
    }
  }

  /** 阅读技能秘籍 — 显示概述信息 */
  private readSkillBook(book: BookBase): CommandResult {
    const name = book.getName();
    const skillName = book.getSkillName();
    const skillId = book.getSkillId();
    const difficulty = book.getDifficulty();
    const minLevel = book.getMinLevel();
    const maxLevel = book.getMaxLevel();
    const expRequired = book.getExpRequired();
    const needSkills = book.getNeedSkills();

    const lines: string[] = [];
    lines.push(rt('item', bold(name)));
    lines.push('');
    lines.push(`记载内容: ${rt('imp', `「${skillName}」`)}`);
    lines.push(`研习难度: ${difficulty}`);
    lines.push(`研习范围: ${minLevel} ~ ${maxLevel} 级`);

    if (expRequired > 0) {
      lines.push(`要求修为: ${expRequired} 级`);
    }

    const skillRegistry = ServiceLocator.skillRegistry;
    if (Object.keys(needSkills).length > 0 && skillRegistry) {
      const parts: string[] = [];
      for (const [needId, needLevel] of Object.entries(needSkills)) {
        const def = skillRegistry.get(needId);
        const needName = def?.skillName ?? needId;
        parts.push(`${needName} ${needLevel}级`);
      }
      lines.push(`前置要求: ${parts.join('、')}`);
    }

    lines.push('');
    lines.push(rt('sys', `可用「study ${name}」命令研读此秘籍。`));

    return {
      success: true,
      message: lines.join('\n'),
      data: {
        action: 'read',
        bookType: BookType.SKILL,
        bookId: book.id,
        skillId,
        skillName,
      },
    };
  }

  /** 阅读文本书籍 */
  private readTextBook(book: BookBase): CommandResult {
    const name = book.getName();
    const content = book.getContent();
    const pages = book.getPages();

    const lines: string[] = [];
    lines.push(rt('item', bold(name)));
    lines.push('');

    if (pages.length > 0) {
      // 分页内容
      for (let i = 0; i < pages.length; i++) {
        lines.push(`${rt('sys', `【第${i + 1}页】`)}`);
        lines.push(pages[i]);
        lines.push('');
      }
    } else if (content) {
      lines.push(content);
    } else {
      lines.push('这本书的内容似乎已经模糊不清了。');
    }

    return {
      success: true,
      message: lines.join('\n'),
      data: { action: 'read', bookType: BookType.TEXT, bookId: book.id },
    };
  }

  /** 阅读配方书 — 列出配方 */
  private readRecipeBook(executor: PlayerBase, book: BookBase): CommandResult {
    const name = book.getName();
    const recipes = book.getRecipes();
    const recipeEntries = Object.entries(recipes);

    if (recipeEntries.length === 0) {
      return {
        success: true,
        message: `${name}中没有记载任何配方。`,
        data: { action: 'read', bookType: BookType.RECIPE, bookId: book.id },
      };
    }

    const lines: string[] = [];
    lines.push(rt('item', bold(name)));
    lines.push('');
    lines.push('记载配方:');

    for (const [recipeName, recipe] of recipeEntries) {
      const learned = executor.get<string>(`recipes/${recipeName}`);
      const status = learned ? rt('sys', '（已学会）') : '';
      lines.push(`  ${rt('imp', recipeName)} — 需要辅技 ${recipe.skillLevel} 级 ${status}`);
    }

    lines.push('');
    lines.push(rt('sys', `可用「read <配方名> from ${name}」命令学习配方。`));

    return {
      success: true,
      message: lines.join('\n'),
      data: {
        action: 'read',
        bookType: BookType.RECIPE,
        bookId: book.id,
        recipes: recipeEntries.map(([n]) => n),
      },
    };
  }

  /** 从配方书学习配方 */
  private learnRecipe(executor: PlayerBase, raw: string, fromIdx: number): CommandResult {
    const recipeName = raw.substring(0, fromIdx).trim();
    const bookName = raw.substring(fromIdx + 6).trim();

    if (!recipeName || !bookName) {
      return { success: false, message: '用法: read <配方名> from <书名>' };
    }

    const book = this.findBook(executor, bookName);
    if (!book) {
      return { success: false, message: `你的背包里没有「${bookName}」。` };
    }

    if (book.getBookType() !== BookType.RECIPE) {
      return { success: false, message: `${book.getName()}不是一本配方典籍。` };
    }

    const recipes = book.getRecipes();
    const recipe = recipes[recipeName];
    if (!recipe) {
      return { success: false, message: `${book.getName()}中没有记载「${recipeName}」配方。` };
    }

    // 检查是否已学会
    const alreadyLearned = executor.get<string>(`recipes/${recipeName}`);
    if (alreadyLearned) {
      return { success: false, message: `你已经学会了「${recipeName}」配方。` };
    }

    // 检查精力
    const energy = executor.get<number>('energy') ?? 0;
    if (energy < recipe.jingCost) {
      return {
        success: false,
        message: `精力不足（需要 ${recipe.jingCost}，当前 ${energy}），无法学习配方。`,
      };
    }

    // 扣除精力
    executor.set('energy', energy - recipe.jingCost);

    // 学习配方
    executor.set(`recipes/${recipeName}`, recipe.blueprintId);

    return {
      success: true,
      message: `你仔细研读了${book.getName()}，学会了${rt('imp', `「${recipeName}」`)}配方！`,
      data: {
        action: 'learnRecipe',
        bookId: book.id,
        recipeName,
        blueprintId: recipe.blueprintId,
      },
    };
  }

  /** 在背包中查找书籍 */
  private findBook(executor: PlayerBase, bookName: string): BookBase | undefined {
    return executor
      .getInventory()
      .filter((e): e is BookBase => e instanceof BookBase)
      .find((b) => b.getName().includes(bookName));
  }
}
