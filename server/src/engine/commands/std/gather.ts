/**
 * gather 指令 -- 采集当前房间的资源（药草、矿石等）
 *
 * 检查房间是否有 gatherables 配置，随机采集一种资源。
 * 返回 gather_start，由 command.handler 延迟执行物品产出。
 * 采集期间设置 activity 临时状态，阻止重复采集。
 *
 * 用法: gather / 采集
 */
import { Command, type ICommand, type CommandResult } from '../../types/command';
import type { LivingBase } from '../../game-objects/living-base';
import { PlayerBase } from '../../game-objects/player-base';
import { ServiceLocator } from '../../service-locator';
import { rt } from '@packages/core';

/** 可采集资源定义 */
export interface Gatherable {
  /** 资源 ID，用于任务目标匹配（如 herb-金线草） */
  id: string;
  /** 物品蓝图 ID，用于创建实际物品（如 item/herb/golden-grass） */
  blueprintId: string;
  /** 显示名称 */
  name: string;
  /** 采集成功描述（多条随机） */
  messages?: string[];
}

/** 采集延迟（毫秒） */
const GATHER_DELAY_MS = 3000;

/** 默认采集描述 */
const DEFAULT_MESSAGES = [
  '你蹲下身，仔细辨认后摘下了一株{name}。',
  '你在附近搜寻片刻，找到了一株{name}。',
  '你小心翼翼地采下一株{name}，抖去上面的露水。',
];

@Command({ name: 'gather', aliases: ['采集', 'pick', '采'], description: '采集资源' })
export class GatherCommand implements ICommand {
  name = 'gather';
  aliases = ['采集', 'pick', '采'];
  description = '采集资源';
  directory = 'std';

  execute(executor: LivingBase, _args: string[]): CommandResult {
    // 忙碌检查
    if (executor.isInCombat()) {
      return { success: false, message: '战斗中无法采集。' };
    }
    if (executor instanceof PlayerBase) {
      // 通过 ActivityManager 检查通用活动（采集等）
      if (ServiceLocator.activityManager?.isActive(executor)) {
        const activity = ServiceLocator.activityManager.getActivity(executor);
        return { success: false, message: `你正在${activity?.label ?? '忙碌'}中，稍安勿躁。` };
      }
      if (ServiceLocator.practiceManager?.isInPractice(executor)) {
        return { success: false, message: '你正在修炼中，无法同时采集。' };
      }
      if (ServiceLocator.workManager?.isWorking(executor)) {
        return { success: false, message: '你正在打工中，无法同时采集。' };
      }
    }

    const env = executor.getEnvironment();
    if (!env) {
      return { success: false, message: '你不在任何地方。' };
    }

    const gatherables = env.get<Gatherable[]>('gatherables');
    if (!gatherables || gatherables.length === 0) {
      return { success: false, message: '这里没有可以采集的资源。' };
    }

    // 随机选一种资源
    const target = gatherables[Math.floor(Math.random() * gatherables.length)];

    // 注意：不在此处设置忙碌状态，由 ActivityManager.startActivity() 统一管理

    // 随机采集描述
    const messages = target.messages ?? DEFAULT_MESSAGES;
    const template = messages[Math.floor(Math.random() * messages.length)];
    const msg = template.replace(/\{name\}/g, rt('item', target.name));

    return {
      success: true,
      message: `${rt('sys', '你开始采集...')}\n${msg}`,
      data: {
        action: 'gather_start',
        gatherableId: target.id,
        blueprintId: target.blueprintId,
        itemName: target.name,
        delay: GATHER_DELAY_MS,
      },
    };
  }
}
