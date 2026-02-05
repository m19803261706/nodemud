/**
 * flee 指令 -- 逃离战斗
 *
 * 尝试从当前战斗中逃跑，逃跑成功率受速度属性影响。
 * 结果通过 combatUpdate / combatEnd 消息推送给客户端。
 *
 * 对标: LPC flee / 炎黄 flee_cmd
 */
import { Command, type ICommand, type CommandResult } from '../../types/command';
import type { LivingBase } from '../../game-objects/living-base';
import { ServiceLocator } from '../../service-locator';

@Command({ name: 'flee', aliases: ['逃', '逃跑'], description: '逃离战斗' })
export class FleeCommand implements ICommand {
  name = 'flee';
  aliases = ['逃', '逃跑'];
  description = '逃离战斗';
  directory = 'std';

  /**
   * 执行 flee 指令
   * @param executor 执行者（LivingBase）
   * @param args 无参数
   */
  execute(executor: LivingBase, args: string[]): CommandResult {
    // 检查玩家是否在战斗中
    if (!executor.isInCombat()) {
      return { success: false, message: '你不在战斗中。' };
    }

    // 获取战斗 ID
    const combatId = ServiceLocator.combatManager.getCombatId(executor);
    if (!combatId) {
      return { success: false, message: '你不在战斗中。' };
    }

    // 尝试逃跑（结果通过 combatUpdate/combatEnd 推送）
    ServiceLocator.combatManager.attemptFlee(combatId, executor);

    return { success: true, message: '' };
  }
}
