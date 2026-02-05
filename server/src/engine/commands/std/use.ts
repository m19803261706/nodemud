/**
 * use 指令 -- 使用物品
 *
 * 使用消耗品（药品/食物）或研读秘籍。
 * 消耗品使用后销毁，秘籍不销毁。
 *
 * 对标: LPC use / 炎黄 use_cmd
 */
import { Command, type ICommand, type CommandResult } from '../../types/command';
import type { LivingBase } from '../../game-objects/living-base';
import { ItemBase } from '../../game-objects/item-base';
import { MedicineBase } from '../../game-objects/medicine-base';
import { FoodBase } from '../../game-objects/food-base';
import { BookBase } from '../../game-objects/book-base';
import { rt } from '@packages/core';

@Command({ name: 'use', aliases: ['使用'], description: '使用物品' })
export class UseCommand implements ICommand {
  name = 'use';
  aliases = ['使用'];
  description = '使用物品';
  directory = 'std';

  execute(executor: LivingBase, args: string[]): CommandResult {
    if (args.length === 0) {
      return { success: false, message: '使用什么？用法: use <物品名>' };
    }

    const target = args.join(' ').trim();

    // 从背包查找物品
    const items = executor.getInventory().filter((e): e is ItemBase => e instanceof ItemBase);
    const item = items.find(
      (i) => i.getName().includes(target) || i.getName().toLowerCase() === target.toLowerCase(),
    );

    if (!item) {
      return { success: false, message: '你没有这个东西。' };
    }

    // 药品
    if (item instanceof MedicineBase) {
      return this.useMedicine(executor, item);
    }

    // 食物
    if (item instanceof FoodBase) {
      return this.useFood(executor, item);
    }

    // 书籍
    if (item instanceof BookBase) {
      return this.readBook(executor, item);
    }

    return { success: false, message: `${item.getName()}不能被使用。` };
  }

  /** 使用药品 */
  private useMedicine(executor: LivingBase, item: MedicineBase): CommandResult {
    const name = item.getName();
    const healHp = item.getHealHp();
    const healMp = item.getHealMp();

    const effects: string[] = [];
    if (healHp > 0) effects.push(`恢复了 ${healHp} 点生命`);
    if (healMp > 0) effects.push(`恢复了 ${healMp} 点内力`);

    // 消耗物品
    item.destroy();

    return {
      success: true,
      message: `你使用了${rt('item', name)}。${effects.join('，')}。`,
      data: { action: 'use', itemId: item.id, consumed: true },
    };
  }

  /** 使用食物 */
  private useFood(executor: LivingBase, item: FoodBase): CommandResult {
    const name = item.getName();

    // 消耗食物
    item.destroy();

    return {
      success: true,
      message: `你吃了${rt('item', name)}，感觉好多了。`,
      data: { action: 'use', itemId: item.id, consumed: true },
    };
  }

  /** 研读书籍 */
  private readBook(executor: LivingBase, item: BookBase): CommandResult {
    const name = item.getName();
    const skillName = item.getSkillName();

    const msg = skillName
      ? `你仔细研读了${rt('item', name)}，领悟了${skillName}的奥秘。`
      : `你翻阅了${rt('item', name)}。`;

    return {
      success: true,
      message: msg,
      data: { action: 'use', itemId: item.id, consumed: false },
    };
  }
}
