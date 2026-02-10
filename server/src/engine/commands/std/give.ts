/**
 * give 指令 -- 给予 NPC 物品
 *
 * 将背包中的物品交给当前房间中的 NPC，触发 NPC 的 onReceiveItem 钩子。
 * NPC 可通过蓝图覆写钩子来接受或拒绝物品。
 *
 * 支持格式:
 *   give <物品名> to <NPC名>
 *   give <物品名> <NPC名>
 *
 * 对标: LPC give / 炎黄 give_cmd
 */
import { Command, type ICommand, type CommandResult } from '../../types/command';
import { LivingBase } from '../../game-objects/living-base';
import { NpcBase } from '../../game-objects/npc-base';
import { ItemBase } from '../../game-objects/item-base';
import { rt } from '@packages/core';

@Command({
  name: 'give',
  aliases: ['给', '交给'],
  description: '给予 NPC 物品',
})
export class GiveCommand implements ICommand {
  name = 'give';
  aliases = ['给', '交给'];
  description = '给予 NPC 物品';
  directory = 'std';

  execute(executor: LivingBase, args: string[]): CommandResult {
    if (args.length < 2) {
      return {
        success: false,
        message: '给什么？给谁？用法: give <物品> to <NPC名>',
      };
    }

    const env = executor.getEnvironment();
    if (!env) {
      return { success: false, message: '你不在任何地方。' };
    }

    // 解析参数：物品名 + NPC 名
    const { itemName, npcName } = this.parseArgs(args);
    if (!itemName || !npcName) {
      return {
        success: false,
        message: '给什么？给谁？用法: give <物品> to <NPC名>',
      };
    }

    // 1. 从背包查找物品
    const items = executor.getInventory().filter((e): e is ItemBase => e instanceof ItemBase);
    const item = items.find(
      (i) => i.getName().includes(itemName) || i.getName().toLowerCase() === itemName.toLowerCase(),
    );
    if (!item) {
      return { success: false, message: '你没有这个东西。' };
    }

    // 2. 检查物品是否可给予
    // 任务物品通常不可交易（tradeable=false），但需要允许用于任务交付
    const isQuestItem = item.getType() === 'quest';
    if (!item.isTradeable() && !isQuestItem) {
      return {
        success: false,
        message: `${item.getName()}不能被交易。`,
      };
    }

    // 3. 在房间中查找 NPC
    const inventory = env.getInventory().filter((e) => e !== executor);
    const npc = inventory.find(
      (e) => e instanceof NpcBase && (e as NpcBase).getName().includes(npcName),
    ) as NpcBase | undefined;
    if (!npc) {
      return { success: false, message: '这里没有这个人。' };
    }

    // 4. 触发 NPC 接收钩子
    const result = npc.onReceiveItem(executor, item);
    const iName = rt('item', item.getName());
    const nName = rt('npc', npc.getName());

    if (result.accept) {
      // NPC 接受 → 物品移至 NPC
      item.moveTo(npc, { quiet: true });
      const msg = result.message
        ? `你把${iName}交给了${nName}。\n${result.message}`
        : `你把${iName}交给了${nName}。`;
      return {
        success: true,
        message: msg,
        data: {
          action: 'give',
          itemId: item.id,
          itemName: item.getName(),
          npcId: npc.id,
          npcName: npc.getName(),
          accepted: true,
        },
      };
    }

    // NPC 拒绝 → 物品留在玩家背包
    const rejectMsg = result.message || `${npc.getName()}不需要这个东西。`;
    return {
      success: true,
      message: `你试图把${iName}交给${nName}。\n${rejectMsg}`,
      data: {
        action: 'give',
        itemId: item.id,
        itemName: item.getName(),
        npcId: npc.id,
        npcName: npc.getName(),
        accepted: false,
      },
    };
  }

  /**
   * 解析参数，分离物品名和 NPC 名
   * 支持: "铁剑 to 铁匠" / "铁剑 铁匠"
   */
  private parseArgs(args: string[]): {
    itemName: string;
    npcName: string;
  } {
    const raw = args.join(' ');

    // 优先按 " to " 分割
    const toIdx = raw.indexOf(' to ');
    if (toIdx !== -1) {
      return {
        itemName: raw.substring(0, toIdx).trim(),
        npcName: raw.substring(toIdx + 4).trim(),
      };
    }

    // 无 "to" 时：最后一个词为 NPC 名，其余为物品名
    if (args.length >= 2) {
      return {
        itemName: args.slice(0, -1).join(' '),
        npcName: args[args.length - 1],
      };
    }

    return { itemName: '', npcName: '' };
  }
}
