/**
 * stop 指令 -- 停止当前活动
 *
 * 当前支持停止：
 * - 修炼（打坐/静坐）
 * - 打工（新手杂役）
 *
 * 对标: LPC halt / 炎黄 stop_cmd
 */
import { Command, type ICommand, type CommandResult } from '../../types/command';
import type { LivingBase } from '../../game-objects/living-base';
import { PlayerBase } from '../../game-objects/player-base';
import { ServiceLocator } from '../../service-locator';

@Command({ name: 'stop', aliases: ['停止', '停'], description: '停止当前活动' })
export class StopCommand implements ICommand {
  name = 'stop';
  aliases = ['停止', '停'];
  description = '停止当前活动';
  directory = 'std';

  execute(executor: LivingBase): CommandResult {
    if (!(executor instanceof PlayerBase)) {
      return { success: false, message: '只有玩家才能使用此指令。' };
    }

    const activityManager = ServiceLocator.activityManager;
    const practiceManager = ServiceLocator.practiceManager;
    const workManager = ServiceLocator.workManager;

    // 检查是否有通用活动（采集等），由 ActivityManager 统一管理
    if (activityManager?.isActive(executor as any)) {
      const activity = activityManager.getActivity(executor as any);
      activityManager.stopActivity(executor as any);
      // ActivityManager 会推送 activityUpdate（stopped），前端自动移除停止按钮
      return {
        success: true,
        message: `你停止了${activity?.label ?? '当前活动'}。`,
        data: { action: 'stop', activity: activity?.type },
      };
    }

    // 检查是否在修炼中
    if (practiceManager?.isInPractice(executor)) {
      practiceManager.stopPractice(executor);
      // PracticeManager 会推送 practiceUpdate（stopped=true），这里返回空消息避免重复
      return {
        success: true,
        data: { action: 'stop', activity: 'practice' },
      };
    }

    // 检查是否在打工中
    if (workManager?.isInWork(executor)) {
      workManager.stopWork(executor, 'manual');
      return {
        success: true,
        data: { action: 'stop', activity: 'work' },
      };
    }

    return { success: false, message: '你当前没有在进行任何活动。' };
  }
}
