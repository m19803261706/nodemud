/**
 * donate 指令 -- 向门派执事捐献物资
 *
 * 用法:
 *   donate <物品> to <NPC名>
 *   donate <物品> <NPC名>
 */
import { Command, type ICommand, type CommandResult } from '../../types/command';
import type { LivingBase } from '../../game-objects/living-base';
import { PlayerBase } from '../../game-objects/player-base';
import { RoomBase } from '../../game-objects/room-base';
import { NpcBase } from '../../game-objects/npc-base';
import { ItemBase } from '../../game-objects/item-base';
import { ServiceLocator } from '../../service-locator';

@Command({
  name: 'donate',
  aliases: ['捐献'],
  description: '向门派执事捐献物资',
})
export class DonateCommand implements ICommand {
  name = 'donate';
  aliases = ['捐献'];
  description = '向门派执事捐献物资';
  directory = 'std';

  execute(executor: LivingBase, args: string[]): CommandResult {
    if (!(executor instanceof PlayerBase)) {
      return { success: false, message: '只有玩家才能捐献。' };
    }

    if (args.length < 2) {
      return { success: false, message: '用法: donate <物品> to <NPC名>' };
    }

    const env = executor.getEnvironment();
    if (!env || !(env instanceof RoomBase)) {
      return { success: false, message: '你不在任何地方。' };
    }

    if (!ServiceLocator.sectManager) {
      return { success: false, message: '门派系统尚未初始化。' };
    }

    const { itemName, npcName } = this.parseArgs(args);
    if (!itemName || !npcName) {
      return { success: false, message: '用法: donate <物品> to <NPC名>' };
    }

    const item = executor
      .getInventory()
      .filter((e): e is ItemBase => e instanceof ItemBase)
      .find((it) => it.getName().includes(itemName));
    if (!item) {
      return { success: false, message: '你没有这件物品。' };
    }

    const equipped = executor.findEquipped((equippedItem) => equippedItem.id === item.id);
    if (equipped) {
      return { success: false, message: `你正装备着${item.getName()}，请先卸下再捐献。` };
    }

    const npc = env
      .getInventory()
      .find((e) => e instanceof NpcBase && (e as NpcBase).getName().includes(npcName)) as
      | NpcBase
      | undefined;
    if (!npc) {
      return { success: false, message: '这里没有这个人。' };
    }

    return ServiceLocator.sectManager.donate(executor, npc, item);
  }

  private parseArgs(args: string[]): { itemName: string; npcName: string } {
    const raw = args.join(' ');
    const toIdx = raw.indexOf(' to ');
    if (toIdx !== -1) {
      return {
        itemName: raw.substring(0, toIdx).trim(),
        npcName: raw.substring(toIdx + 4).trim(),
      };
    }

    if (args.length >= 2) {
      return {
        itemName: args.slice(0, -1).join(' ').trim(),
        npcName: args[args.length - 1].trim(),
      };
    }

    return { itemName: '', npcName: '' };
  }
}
