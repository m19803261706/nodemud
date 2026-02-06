/**
 * inventory 指令 -- 查看背包物品
 *
 * 列出执行者背包中的所有物品。
 *
 * 对标: LPC inventory / 炎黄 inventory_cmd
 */
import { Command, type ICommand, type CommandResult } from '../../types/command';
import type { LivingBase } from '../../game-objects/living-base';
import { ItemBase } from '../../game-objects/item-base';
import { rt } from '@packages/core';

/** 物品类型中文映射 */
const ItemTypeLabel: Record<string, string> = {
  weapon: '武器',
  armor: '防具',
  medicine: '药品',
  book: '秘籍',
  container: '容器',
  food: '食物',
  key: '钥匙',
  misc: '杂物',
};

@Command({ name: 'inventory', aliases: ['i', '背包', '物品'], description: '查看背包' })
export class InventoryCommand implements ICommand {
  name = 'inventory';
  aliases = ['i', '背包', '物品'];
  description = '查看背包';
  directory = 'std';

  execute(executor: LivingBase, _args: string[]): CommandResult {
    const items = executor.getInventory().filter((e): e is ItemBase => e instanceof ItemBase);

    if (items.length === 0) {
      return {
        success: true,
        message: '你什么都没有。',
        data: { action: 'inventory', items: [] },
      };
    }

    const lines: string[] = ['你的随身物品：'];
    const itemData: Array<{ id: string; name: string; type: string }> = [];

    for (const item of items) {
      const name = item.getName();
      const type = item.getType();
      const label = ItemTypeLabel[type] || type;
      lines.push(`  ${rt('item', name)}（${label}）`);
      itemData.push({ id: item.id, name, type });
    }

    return {
      success: true,
      message: lines.join('\n'),
      data: { action: 'inventory', items: itemData },
    };
  }
}
