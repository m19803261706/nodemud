/**
 * wield 指令 -- 装备武器
 *
 * 将背包中的武器装备到主手（weapon）槽位。
 * 双手武器同时占据主手和副手，自动卸下已有装备。
 * 包含等级需求检查。
 *
 * 对标: LPC wield / 炎黄 wield_cmd
 */
import { Command, type ICommand, type CommandResult } from '../../types/command';
import type { LivingBase } from '../../game-objects/living-base';
import { ItemBase } from '../../game-objects/item-base';
import { WeaponBase } from '../../game-objects/weapon-base';
import { PlayerBase } from '../../game-objects/player-base';
import { rt, WearPositions } from '@packages/core';

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

    // 等级需求检查
    const levelReq = item.getLevelReq();
    if (levelReq > 0) {
      const playerLevel = executor.get<number>('level') ?? 1;
      if (playerLevel < levelReq) {
        return {
          success: false,
          message: `你的等级不足，需要 ${levelReq} 级才能装备${item.getName()}。`,
        };
      }
    }

    const name = item.getName();
    const twoHanded = item.isTwoHanded();

    if (twoHanded) {
      // 双手武器：需要主手和副手都空闲，或者自动卸下
      const weapon = executor.getEquipment().get(WearPositions.WEAPON);
      const offhand = executor.getEquipment().get(WearPositions.OFFHAND);

      // 卸下主手已有武器
      if (weapon) {
        executor.unequip(WearPositions.WEAPON);
      }
      // 卸下副手已有装备
      if (offhand) {
        executor.unequip(WearPositions.OFFHAND);
      }

      // 装备到主手和副手
      executor.equip(item, WearPositions.WEAPON);
      executor.equip(item, WearPositions.OFFHAND);

      const msgs: string[] = [];
      if (weapon) msgs.push(`卸下了${weapon.getName()}`);
      if (offhand && offhand !== weapon) msgs.push(`卸下了${offhand.getName()}`);
      const prefix = msgs.length > 0 ? msgs.join('，') + '，' : '';

      return {
        success: true,
        message: `${prefix}你双手持${rt('item', name)}。`,
        data: { action: 'wield', itemId: item.id, position: WearPositions.WEAPON, twoHanded: true },
      };
    }

    // 单手武器
    const equipped = executor.equip(item, WearPositions.WEAPON);

    if (!equipped) {
      return { success: false, message: '你的主手已有武器，请先卸下。' };
    }

    return {
      success: true,
      message: `你手持${rt('item', name)}。`,
      data: { action: 'wield', itemId: item.id, position: WearPositions.WEAPON },
    };
  }
}
