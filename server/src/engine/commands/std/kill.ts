/**
 * kill 指令 -- 对目标发起攻击
 *
 * 在当前房间中查找指定 NPC 并发起战斗。
 * 检查玩家和目标是否已在战斗中，防止重复开战。
 *
 * 对标: LPC kill / 炎黄 kill_cmd
 */
import { Command, type ICommand, type CommandResult } from '../../types/command';
import type { LivingBase } from '../../game-objects/living-base';
import { NpcBase } from '../../game-objects/npc-base';
import { ServiceLocator } from '../../service-locator';
import { rt } from '@packages/core';

@Command({ name: 'kill', aliases: ['k', '杀', '攻击'], description: '对目标发起攻击' })
export class KillCommand implements ICommand {
  name = 'kill';
  aliases = ['k', '杀', '攻击'];
  description = '对目标发起攻击';
  directory = 'std';

  /**
   * 执行 kill 指令
   * @param executor 执行者（LivingBase）
   * @param args 指令参数，args[0] 为目标名称关键词
   */
  execute(executor: LivingBase, args: string[]): CommandResult {
    // 无目标参数
    if (args.length === 0 || !args[0].trim()) {
      return { success: false, message: '攻击谁？请指定目标。' };
    }

    // 检查玩家是否已在战斗中
    if (executor.isInCombat()) {
      return { success: false, message: '你正在战斗中。' };
    }

    // 检查执行者是否在房间中
    const env = executor.getEnvironment();
    if (!env) {
      return { success: false, message: '你不在任何地方。' };
    }

    // 在房间 inventory 中查找 NPC 目标（模糊匹配名字关键词）
    const target = args.join(' ').trim();
    const inventory = env.getInventory().filter((e) => e !== executor);
    const npc = inventory.find(
      (e) => e instanceof NpcBase && (e as NpcBase).getName().includes(target),
    );

    if (!npc) {
      return { success: false, message: '这里没有这个目标。' };
    }

    const npcEntity = npc as NpcBase;

    // 检查目标是否已在战斗中
    if (npcEntity.isInCombat()) {
      return { success: false, message: '对方正在战斗中。' };
    }

    // 通过 CombatManager 创建战斗
    ServiceLocator.combatManager.startCombat(executor, npcEntity);

    return {
      success: true,
      message: `你向${rt('npc', npcEntity.getName())}发起了攻击！`,
    };
  }
}
