/**
 * quest 指令 -- 查看任务
 *
 * 不输出日志文本，纯消息推送：向前端发送 questUpdate 消息。
 *
 * 支持格式:
 *   quest
 *
 * 对标: LPC quest / 炎黄 quest_cmd
 */
import { Command, type ICommand, type CommandResult } from '../../types/command';
import { LivingBase } from '../../game-objects/living-base';
import { ServiceLocator } from '../../service-locator';
import { PlayerBase } from '../../game-objects/player-base';

@Command({ name: 'quest', aliases: ['任务'], description: '查看任务' })
export class QuestCommand implements ICommand {
  name = 'quest';
  aliases = ['任务'];
  description = '查看任务';
  directory = 'std';

  execute(executor: LivingBase): CommandResult {
    // 只有玩家可以查看任务
    if (!(executor instanceof PlayerBase)) {
      return { success: false, message: '只有玩家可以查看任务。' };
    }

    const player = executor as PlayerBase;

    // 通过 QuestManager 推送任务数据到前端
    if (ServiceLocator.questManager) {
      ServiceLocator.questManager.sendQuestUpdate(player);
    }

    // 不输出文本，纯消息推送
    return { success: true, message: '' };
  }
}
