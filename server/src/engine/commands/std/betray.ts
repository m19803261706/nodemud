/**
 * betray 指令 -- 叛出当前门派
 *
 * 用法:
 *   betray <NPC名>
 */
import { Command, type ICommand, type CommandResult } from '../../types/command';
import type { LivingBase } from '../../game-objects/living-base';
import { PlayerBase } from '../../game-objects/player-base';
import { RoomBase } from '../../game-objects/room-base';
import { NpcBase } from '../../game-objects/npc-base';
import { ServiceLocator } from '../../service-locator';

@Command({
  name: 'betray',
  aliases: ['叛门'],
  description: '叛出当前门派',
})
export class BetrayCommand implements ICommand {
  name = 'betray';
  aliases = ['叛门'];
  description = '叛出当前门派';
  directory = 'std';

  execute(executor: LivingBase, args: string[]): CommandResult {
    if (!(executor instanceof PlayerBase)) {
      return { success: false, message: '只有玩家可以叛门。' };
    }

    if (args.length === 0) {
      return { success: false, message: '你需当着门中长辈立誓。用法: betray <NPC名>' };
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

    return ServiceLocator.sectManager.betray(executor, npc);
  }
}
