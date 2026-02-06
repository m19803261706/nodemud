/**
 * wear 指令 -- 穿戴防具
 *
 * 将背包中的防具穿戴到对应槽位。
 *
 * 对标: LPC wear / 炎黄 wear_cmd
 */
import { Command, type ICommand, type CommandResult } from '../../types/command';
import type { LivingBase } from '../../game-objects/living-base';
import { ItemBase } from '../../game-objects/item-base';
import { ArmorBase } from '../../game-objects/armor-base';
import { PlayerBase } from '../../game-objects/player-base';
import { rt } from '@packages/core';

@Command({ name: 'wear', aliases: ['穿', '穿戴'], description: '穿戴防具' })
export class WearCommand implements ICommand {
  name = 'wear';
  aliases = ['穿', '穿戴'];
  description = '穿戴防具';
  directory = 'std';

  execute(executor: LivingBase, args: string[]): CommandResult {
    if (!(executor instanceof PlayerBase)) {
      return { success: false, message: '只有玩家才能穿戴装备。' };
    }

    if (args.length === 0) {
      return { success: false, message: '穿戴什么？用法: wear <防具名>' };
    }

    const target = args.join(' ').trim();

    // 从背包查找防具
    const items = executor.getInventory().filter((e): e is ItemBase => e instanceof ItemBase);
    const item = items.find(
      (i) => i.getName().includes(target) || i.getName().toLowerCase() === target.toLowerCase(),
    );

    if (!item) {
      return { success: false, message: '你没有这个东西。' };
    }

    if (!(item instanceof ArmorBase)) {
      return { success: false, message: `${item.getName()}不是防具。` };
    }

    // 等级需求检查
    const levelReq = item.getLevelReq();
    if (levelReq > 0) {
      const playerLevel = executor.get<number>('level') ?? 1;
      if (playerLevel < levelReq) {
        return {
          success: false,
          message: `你的等级不足，需要 ${levelReq} 级才能穿戴${item.getName()}。`,
        };
      }
    }

    const position = item.getWearPosition();
    const equipped = executor.equip(item, position);

    if (!equipped) {
      return { success: false, message: `你的${position}位置已有装备，请先卸下。` };
    }

    const name = item.getName();
    return {
      success: true,
      message: `你穿上了${rt('item', name)}。`,
      data: { action: 'wear', itemId: item.id, position },
    };
  }
}
