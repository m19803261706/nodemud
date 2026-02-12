/**
 * work 指令 -- 新手打工
 *
 * 用法：
 *   work list <npc>
 *   work start <jobId> <1|5|20|auto> <npc>
 *   work stop
 *
 * 兼容：work <npc>（等价于 work list <npc>）
 */
import { Command, type ICommand, type CommandResult } from '../../types/command';
import type { LivingBase } from '../../game-objects/living-base';
import { PlayerBase } from '../../game-objects/player-base';
import { NpcBase } from '../../game-objects/npc-base';
import { RoomBase } from '../../game-objects/room-base';
import { ServiceLocator } from '../../service-locator';

@Command({ name: 'work', aliases: ['打工', '活计'], description: '查看并执行新手打工' })
export class WorkCommand implements ICommand {
  name = 'work';
  aliases = ['打工', '活计'];
  description = '查看并执行新手打工';
  directory = 'std';

  execute(executor: LivingBase, args: string[]): CommandResult {
    if (!(executor instanceof PlayerBase)) {
      return { success: false, message: '只有玩家才能打工。' };
    }

    if (!ServiceLocator.workManager) {
      return { success: false, message: '打工系统暂未开启。' };
    }

    const env = executor.getEnvironment();
    if (!(env instanceof RoomBase)) {
      return { success: false, message: '你不在任何房间中。' };
    }

    if (args.length === 0) {
      return this.buildUsageHint(executor, env);
    }

    const sub = args[0].toLowerCase();

    if (sub === 'stop' || sub === '停工' || sub === 'halt') {
      return ServiceLocator.workManager.stopWork(executor, 'manual');
    }

    if (sub === 'list') {
      const target = args.slice(1).join(' ').trim();
      if (!target) {
        return { success: false, message: '格式: work list <npc>' };
      }

      const npc = this.findNpc(env, target);
      if (!npc) {
        return { success: false, message: '这里没有这个人。' };
      }

      return ServiceLocator.workManager.openWorkList(executor, npc);
    }

    if (sub === 'start') {
      if (args.length < 4) {
        return {
          success: false,
          message: '格式: work start <jobId> <1|5|20|auto> <npc>',
        };
      }

      const jobId = args[1];
      const plan = args[2];
      const target = args.slice(3).join(' ').trim();
      if (!target) {
        return { success: false, message: '格式: work start <jobId> <1|5|20|auto> <npc>' };
      }

      const npc = this.findNpc(env, target);
      if (!npc) {
        return { success: false, message: '这里没有这个人。' };
      }

      return ServiceLocator.workManager.startWork(executor, {
        npc,
        jobId,
        plan,
      });
    }

    // 兼容：work <npc>
    const target = args.join(' ').trim();
    const npc = this.findNpc(env, target);
    if (!npc) {
      return { success: false, message: '这里没有这个人。' };
    }

    return ServiceLocator.workManager.openWorkList(executor, npc);
  }

  private buildUsageHint(executor: PlayerBase, room: RoomBase): CommandResult {
    const npcs = room
      .getInventory()
      .filter((e): e is NpcBase => e instanceof NpcBase)
      .filter((npc) => ServiceLocator.workManager!.getNpcAvailableActions(executor, npc).length > 0)
      .map((npc) => npc.getName());

    if (npcs.length === 0) {
      return {
        success: false,
        message: '这附近暂无可接的打工活计。',
      };
    }

    return {
      success: true,
      message:
        `可打工的对象：${npcs.join('、')}。\n` +
        '用法：work list <npc> / work start <jobId> <1|5|20|auto> <npc> / work stop',
      data: {
        action: 'work_hint',
        npcs,
      },
    };
  }

  private findNpc(room: RoomBase, target: string): NpcBase | undefined {
    const normalized = target.trim().toLowerCase();
    if (!normalized) return undefined;

    const inventory = room.getInventory();

    // 1. 先按完整实例 ID 命中（前端可直接传 detail.npcId）
    const byId = inventory.find(
      (entity) => entity instanceof NpcBase && entity.id.toLowerCase() === normalized,
    );
    if (byId instanceof NpcBase) return byId;

    // 2. 按蓝图 ID 命中
    const byBlueprintId = inventory.find(
      (entity) =>
        entity instanceof NpcBase && entity.id.split('#')[0].toLowerCase() === normalized,
    );
    if (byBlueprintId instanceof NpcBase) return byBlueprintId;

    // 3. 按名字模糊命中
    return inventory.find(
      (entity) => entity instanceof NpcBase && entity.getName().toLowerCase().includes(normalized),
    ) as NpcBase | undefined;
  }
}
