/**
 * look 指令 -- 查看当前位置或指定对象
 *
 * 无参数时显示当前房间信息（描述、出口、房间内对象列表）。
 * 有参数时在当前环境中搜索目标并显示其详细描述。
 *
 * 对标: LPC look / 炎黄 look_cmd
 */
import { Command, type ICommand, type CommandResult } from '../../types/command';
import type { LivingBase } from '../../game-objects/living-base';
import { RoomBase } from '../../game-objects/room-base';
import { BaseEntity } from '../../base-entity';

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
    const items = env
      .getInventory()
      .filter((e) => e !== executor)
      .map((e) => {
        // 优先使用 getShort（LivingBase），否则用 id
        if (typeof (e as any).getShort === 'function') {
          return (e as any).getShort() as string;
        }
        return e.id;
      });

    // 构建消息文本
    const lines: string[] = [];
    lines.push(short);
    if (long) lines.push(long);
    if (exitNames.length > 0) {
      lines.push(`出口: ${exitNames.join('、')}`);
    } else {
      lines.push('这里没有出口。');
    }
    if (items.length > 0) {
      lines.push(`这里有: ${items.join('、')}`);
    }

    return {
      success: true,
      message: lines.join('\n'),
      data: { short, long, exits: exitNames, items },
    };
  }

  /** 查看指定对象 */
  private lookAtTarget(executor: LivingBase, env: BaseEntity, target: string): CommandResult {
    const lowerTarget = target.toLowerCase();

    // 在环境 inventory 中搜索（按 getName / getShort / id 匹配）
    const found = env.findInInventory((entity) => {
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
      return { success: false, message: `这里没有 ${target}。` };
    }

    // 获取详细描述
    const long =
      typeof (found as any).getLong === 'function'
        ? (found as any).getLong()
        : `你看到了 ${found.id}。`;

    return {
      success: true,
      message: long,
      data: { target: found.id, long },
    };
  }
}
