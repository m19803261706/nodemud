/**
 * wield 指令 -- 装备武器
 *
 * 将背包中的武器装备到主手（weapon）槽位。
 * 双手武器同时占据主手和副手。
 *
 * 对标: LPC wield / 炎黄 wield_cmd
 */
import { Command, type ICommand, type CommandResult } from '../../types/command';
import type { LivingBase } from '../../game-objects/living-base';
import { ItemBase } from '../../game-objects/item-base';
import { WeaponBase } from '../../game-objects/weapon-base';
import { PlayerBase, WearPositions } from '../../game-objects/player-base';
import { rt } from '@packages/core';

@Command({ name: 'wield', aliases: ['持', '装备'], description: '装备武器' })
export class WieldCommand implements ICommand {
  name = 'wield';
  aliases = ['持', '装备'];
  description = '装备武器';
  directory = 'std';

  execute(executor: LivingBase, args: string[]): CommandResult {
    if (!(executor instanceof PlayerBase)) {
      return { success: false, message: '只有玩家才能装备武器。' };
    }

    if (args.length === 0) {
      return { success: false, message: '装备什么？用法: wield <武器名>' };
    }

    const target = args.join(' ').trim();

    // 从背包查找武器
    const items = executor.getInventory().filter((e): e is ItemBase => e instanceof ItemBase);
    const item = items.find(
      (i) => i.getName().includes(target) || i.getName().toLowerCase() === target.toLowerCase(),
    );

    if (!item) {
      return { success: false, message: '你没有这个东西。' };
    }

    if (!(item instanceof WeaponBase)) {
      return { success: false, message: `${item.getName()}不是武器。` };
    }

    const position = WearPositions.WEAPON;
    const equipped = executor.equip(item, position);

    if (!equipped) {
      return { success: false, message: '你的主手已有武器，请先卸下。' };
    }

    const name = item.getName();
    return {
      success: true,
      message: `你手持${rt('item', name)}。`,
      data: { action: 'wield', itemId: item.id, position },
    };
  }
}
