/**
 * look 指令 -- 查看当前位置或指定对象
 *
 * 无参数时显示当前房间信息（描述、出口、房间内对象列表）。
 * 有参数时在当前环境中搜索目标并显示其详细描述。
 *
 * 对标: LPC look / 炎黄 look_cmd
 */
import { Command, type ICommand, type CommandResult } from '../../types/command';
import { LivingBase } from '../../game-objects/living-base';
import { NpcBase } from '../../game-objects/npc-base';
import { RoomBase } from '../../game-objects/room-base';
import { BaseEntity } from '../../base-entity';
import { rt, bold } from '@packages/core';

@Command({ name: 'look', aliases: ['l', '看'], description: '查看当前位置或指定对象' })
export class LookCommand implements ICommand {
  name = 'look';
  aliases = ['l', '看'];
  description = '查看当前位置或指定对象';
  directory = 'std';

  /**
   * 执行 look 指令
   * @param executor 执行者（LivingBase）
   * @param args 指令参数，空数组表示查看房间，否则查看指定对象
   */
  execute(executor: LivingBase, args: string[]): CommandResult {
    const env = executor.getEnvironment();

    // 不在任何环境中
    if (!env) {
      return { success: false, message: '你不在任何地方。' };
    }

    // 有参数 → 查看指定对象
    if (args.length > 0) {
      return this.lookAtTarget(executor, env, args.join(' '));
    }

    // 无参数 → 查看当前房间
    return this.lookAtRoom(executor, env);
  }

  /** 查看当前房间 */
  private lookAtRoom(executor: LivingBase, env: BaseEntity): CommandResult {
    // 判断是否为 RoomBase
    const isRoom = env instanceof RoomBase;
    const short = isRoom ? (env as RoomBase).getShort() : env.id;
    const long = isRoom ? (env as RoomBase).getLong() : '';
    const exits = isRoom ? (env as RoomBase).getExits() : {};
    const exitNames = Object.keys(exits);

    // 房间内其他对象（排除自己）
    const inventory = env.getInventory().filter((e) => e !== executor);
    const items = inventory.map((e) => {
      // 优先使用 getShort（LivingBase），否则用 id
      if (typeof (e as any).getShort === 'function') {
        return (e as any).getShort() as string;
      }
      return e.id;
    });

    // 根据类型包裹富文本标记
    const taggedItems = inventory.map((e) => {
      const name =
        typeof (e as any).getShort === 'function' ? ((e as any).getShort() as string) : e.id;
      // LivingBase 实例用 npc 标记，其他用 item 标记
      return e instanceof LivingBase ? rt('npc', name) : rt('item', name);
    });

    // 构建消息文本（富文本标记）
    const lines: string[] = [];
    lines.push(rt('rn', bold(short)));
    if (long) lines.push(rt('rd', long));
    if (exitNames.length > 0) {
      lines.push(rt('exit', `出口: ${exitNames.join('、')}`));
    } else {
      lines.push(rt('sys', '这里没有出口。'));
    }
    if (taggedItems.length > 0) {
      lines.push(`${rt('sys', '这里有: ')}${taggedItems.join('、')}`);
    }

    return {
      success: true,
      message: lines.join('\n'),
      data: { short, long, exits: exitNames, items },
    };
  }

  /** 查看指定对象 */
  private lookAtTarget(executor: LivingBase, env: BaseEntity, target: string): CommandResult {
    // 优先在 NPC 中查找（模糊匹配 getName）
    const inventory = env.getInventory().filter((e) => e !== executor);
    const npc = inventory.find(
      (e) => e instanceof NpcBase && (e as NpcBase).getName().includes(target),
    );
    if (npc) {
      return this.lookAtNpc(npc as NpcBase);
    }

    // 精确匹配其他对象（按 getName / getShort / id）
    const lowerTarget = target.toLowerCase();
    const found = env.findInInventory((entity) => {
      if (entity === executor) return false;
      if (entity.id.toLowerCase() === lowerTarget) return true;
      if (typeof (entity as any).getName === 'function') {
        if ((entity as any).getName().toLowerCase() === lowerTarget) return true;
      }
      if (typeof (entity as any).getShort === 'function') {
        if ((entity as any).getShort().toLowerCase() === lowerTarget) return true;
      }
      return false;
    });

    if (!found) {
      return { success: false, message: '这里没有这个人。' };
    }

    // 获取详细描述
    const long =
      typeof (found as any).getLong === 'function'
        ? (found as any).getLong()
        : `你看到了 ${found.id}。`;

    return {
      success: true,
      message: rt('rd', long),
      data: { target: found.id, long },
    };
  }

  /** 查看 NPC 详细信息 */
  private lookAtNpc(npc: NpcBase): CommandResult {
    const name = npc.getName();
    const title = npc.get<string>('title') || '';
    const long = npc.getLong();
    const gender = npc.get<string>('gender') === 'male' ? '男' : '女';

    const header = title ? `${title}·${name}` : name;
    const lines: string[] = [];
    lines.push(rt('rn', bold(header)));
    lines.push(title ? `「${title}」${name} [${gender}]` : `${name} [${gender}]`);
    lines.push(rt('rd', long));

    return {
      success: true,
      message: lines.join('\n'),
      data: {
        action: 'look',
        target: 'npc',
        npcId: npc.id,
        name,
        title,
        gender: npc.get<string>('gender') || 'male',
        faction: npc.get<string>('visible_faction') || '',
        level: npc.get<number>('level') || 1,
        hpPct: Math.round(
          ((npc.get<number>('hp') || 0) / (npc.get<number>('max_hp') || 1)) * 100,
        ),
        attitude: npc.get<string>('attitude') || 'neutral',
        short: npc.getShort(),
        long,
      },
    };
  }
}
