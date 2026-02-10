/**
 * spar 指令 -- 与门派陪练进行演武
 *
 * 用法:
 *   spar <NPC名>
 */
import { Command, type ICommand, type CommandResult } from '../../types/command';
import type { LivingBase } from '../../game-objects/living-base';
import { PlayerBase } from '../../game-objects/player-base';
import { RoomBase } from '../../game-objects/room-base';
import { NpcBase } from '../../game-objects/npc-base';
import { ServiceLocator } from '../../service-locator';
import { rt } from '@packages/core';

@Command({
  name: 'spar',
  aliases: ['演武', '切磋'],
  description: '与门派陪练进行演武',
})
export class SparCommand implements ICommand {
  name = 'spar';
  aliases = ['演武', '切磋'];
  description = '与门派陪练进行演武';
  directory = 'std';

  execute(executor: LivingBase, args: string[]): CommandResult {
    if (!(executor instanceof PlayerBase)) {
      return { success: false, message: '只有玩家可以进行演武。' };
    }

    if (args.length === 0) {
      return { success: false, message: '你要和谁演武？用法: spar <NPC名>' };
    }

    if (executor.isInCombat()) {
      return { success: false, message: '你正在战斗中。' };
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

    if (npc.isInCombat()) {
      return { success: false, message: '对方正在战斗中。' };
    }

    if (!ServiceLocator.sectManager) {
      return { success: false, message: '门派系统尚未初始化。' };
    }

    const canSpar = ServiceLocator.sectManager.canStartSpar(executor, npc);
    if (canSpar !== true) {
      return { success: false, message: canSpar };
    }

    ServiceLocator.sectManager.reserveSparAttempt(executor);
    ServiceLocator.combatManager.startSparCombat(executor, npc);

    return {
      success: true,
      message: `你向${rt('npc', npc.getName())}抱拳道：「请赐教。」`,
      data: {
        action: 'spar',
        targetNpcId: npc.id,
      },
    };
  }
}
