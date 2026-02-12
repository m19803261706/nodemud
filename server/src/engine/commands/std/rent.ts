/**
 * rent 指令 -- 客栈付费住店
 *
 * 用法：
 *   rent <店小二名>
 *   rent      （默认找当前房间可收房钱的伙计）
 */
import { Command, type ICommand, type CommandResult } from '../../types/command';
import type { LivingBase } from '../../game-objects/living-base';
import { PlayerBase } from '../../game-objects/player-base';
import { RoomBase } from '../../game-objects/room-base';
import { NpcBase } from '../../game-objects/npc-base';

const INN_RENT_PASS_TEMP_KEY = 'inn/rift_town_rent_pass_until';
const DEFAULT_RENT_PRICE = 18;
const RENT_PASS_DURATION_MS = 2 * 60 * 1000;

@Command({ name: 'rent', aliases: ['住店', '投宿'], description: '向店小二付钱住店休息' })
export class RentCommand implements ICommand {
  name = 'rent';
  aliases = ['住店', '投宿'];
  description = '向店小二付钱住店休息';
  directory = 'std';

  execute(executor: LivingBase, args: string[]): CommandResult {
    if (!(executor instanceof PlayerBase)) {
      return { success: false, message: '只有玩家才能住店。' };
    }

    if (executor.isInCombat()) {
      return { success: false, message: '你正被人缠斗，哪有空住店歇息。' };
    }

    const env = executor.getEnvironment();
    if (!(env instanceof RoomBase)) {
      return { success: false, message: '你不在任何房间中。' };
    }

    const targetText = args.join(' ').trim();
    const waiter = this.findRentNpc(env, targetText);
    if (!waiter) {
      return { success: false, message: '这里没人能替你安排住店。' };
    }

    const targetRoomId = waiter.get<string>('rent_target_room') ?? env.getExit('up');
    if (!targetRoomId) {
      return {
        success: false,
        message: `${waiter.getName()}摊手道：「楼上房间还没收拾妥当，暂时住不了。」`,
      };
    }

    const price = this.resolveRentPrice(waiter);
    if (!executor.spendSilver(price)) {
      const current = executor.getSilver();
      return {
        success: false,
        message: `${waiter.getName()}拱手道：「客官，包间房钱 ${price} 两，您身上只剩 ${current} 两。」`,
      };
    }

    executor.setTemp(INN_RENT_PASS_TEMP_KEY, Date.now() + RENT_PASS_DURATION_MS);

    return {
      success: true,
      message:
        `${waiter.getName()}收下银两，侧身让开楼梯：「客官请上楼安歇。」\n` +
        '你付了房钱，沿木梯向二楼包间走去。',
      data: {
        action: 'rent_room',
        npcId: waiter.id,
        targetId: targetRoomId,
        direction: 'up',
        silverSpent: price,
      },
    };
  }

  private resolveRentPrice(waiter: NpcBase): number {
    const value = waiter.get<number>('rent_price');
    if (typeof value !== 'number' || !Number.isFinite(value)) return DEFAULT_RENT_PRICE;
    return Math.max(1, Math.floor(value));
  }

  private findRentNpc(room: RoomBase, target: string): NpcBase | undefined {
    const npcs = room
      .getInventory()
      .filter((entity): entity is NpcBase => entity instanceof NpcBase)
      .filter((npc) => npc.get<boolean>('can_rent_room') === true);

    if (npcs.length === 0) return undefined;

    const normalized = target.trim().toLowerCase();
    if (!normalized) return npcs[0];

    return npcs.find((npc) => {
      const name = npc.getName().toLowerCase();
      const short = npc.getShort().toLowerCase();
      return name.includes(normalized) || short.includes(normalized) || npc.id.toLowerCase() === normalized;
    });
  }
}
