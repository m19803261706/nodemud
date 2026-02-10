/**
 * apprentice 指令 -- 向门派师父申请拜师
 *
 * 用法:
 *   apprentice <NPC名>
 *   bai <NPC名>
 */
import { Command, type ICommand, type CommandResult } from '../../types/command';
import type { LivingBase } from '../../game-objects/living-base';
import { NpcBase } from '../../game-objects/npc-base';
import { RoomBase } from '../../game-objects/room-base';
import { PlayerBase } from '../../game-objects/player-base';
import { ServiceLocator } from '../../service-locator';

@Command({
  name: 'apprentice',
  aliases: ['bai', '拜师'],
  description: '向门派师父申请拜师',
})
export class ApprenticeCommand implements ICommand {
  name = 'apprentice';
  aliases = ['bai', '拜师'];
  description = '向门派师父申请拜师';
  directory = 'std';

  execute(executor: LivingBase, args: string[]): CommandResult {
    if (!(executor instanceof PlayerBase)) {
      return { success: false, message: '只有玩家才能拜师。' };
    }

    if (args.length === 0) {
      return { success: false, message: '你想拜谁为师？用法: apprentice <NPC名>' };
    }

    const env = executor.getEnvironment();
    if (!env || !(env instanceof RoomBase)) {
      return { success: false, message: '你不在任何地方。' };
    }

    const targetName = args.join(' ').trim();
    const npc = env
      .getInventory()
      .find((e) => e instanceof NpcBase && (e as NpcBase).getName().includes(targetName)) as
      | NpcBase
      | undefined;
    if (!npc) {
      return { success: false, message: '这里没有这个人。' };
    }

    if (!ServiceLocator.sectManager) {
      return { success: false, message: '门派系统尚未初始化。' };
    }

    return ServiceLocator.sectManager.apprentice(executor, npc);
  }
}
