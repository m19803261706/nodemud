/**
 * gather 指令 -- 采集当前房间的资源（药草、矿石等）
 *
 * 检查房间是否有 gatherables 配置，随机采集一种资源。
 * 无冷却、无限采集，对玩家友好。
 * 返回 itemBlueprintId 触发门派任务进度追踪。
 *
 * 用法: gather / 采集
 */
import { Command, type ICommand, type CommandResult } from '../../types/command';
import type { LivingBase } from '../../game-objects/living-base';
import { rt } from '@packages/core';

/** 可采集资源定义 */
export interface Gatherable {
  /** 资源 ID，用于任务目标匹配（如 herb-金线草） */
  id: string;
  /** 显示名称 */
  name: string;
  /** 采集成功描述（多条随机） */
  messages?: string[];
}

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

    // 随机采集描述
    const messages = target.messages ?? DEFAULT_MESSAGES;
    const template = messages[Math.floor(Math.random() * messages.length)];
    const msg = template.replace(/\{name\}/g, rt('item', target.name));

    return {
      success: true,
      message: msg,
      data: {
        action: 'gather',
        itemBlueprintId: target.id,
        itemName: target.name,
      },
    };
  }
}
