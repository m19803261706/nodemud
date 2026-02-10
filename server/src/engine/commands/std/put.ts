/**
 * put 指令 -- 将物品放入容器
 *
 * 从背包中取出物品放入指定容器（房间地面或背包中的容器）。
 * 语法: put <物品> in <容器>
 *
 * 对标: LPC put / 炎黄 put_cmd
 */
import { Command, type ICommand, type CommandResult } from '../../types/command';
import type { LivingBase } from '../../game-objects/living-base';
import { ItemBase } from '../../game-objects/item-base';
import { ContainerBase } from '../../game-objects/container-base';
import { rt } from '@packages/core';

@Command({ name: 'put', aliases: ['放', '放入'], description: '放入容器' })
export class PutCommand implements ICommand {
  name = 'put';
  aliases = ['放', '放入'];
  description = '放入容器';
  directory = 'std';

  execute(executor: LivingBase, args: string[]): CommandResult {
    if (args.length === 0) {
      return { success: false, message: '用法: put <物品> in <容器>' };
    }

    // 检测 in / 进 / 里 关键词（从右往左搜索）
    const inIdx = this.findKeywordIndex(args, ['in', '进', '里']);
    if (inIdx <= 0) {
      return { success: false, message: '用法: put <物品> in <容器>' };
    }

    const itemName = args.slice(0, inIdx).join(' ');
    const containerName = args.slice(inIdx + 1).join(' ');

    if (!itemName || !containerName) {
      return { success: false, message: '用法: put <物品> in <容器>' };
    }

    // 查找物品：玩家背包
    const item = executor
      .getInventory()
      .filter((e): e is ItemBase => e instanceof ItemBase)
      .find(
        (i) =>
          i.getName().includes(itemName) || i.getName().toLowerCase() === itemName.toLowerCase(),
      );
    if (!item) {
      return { success: false, message: `你没有${itemName}。` };
    }

    // 查找容器：房间地面 → 背包
    const container = this.findContainer(executor, containerName);
    if (!container) {
      return { success: false, message: `这里没有${containerName}。` };
    }

    // 不能把容器放进自身
    if (item === container) {
      return { success: false, message: '你不能把容器放进自身。' };
    }

    // 容量检查
    const check = container.canAccept(item);
    if (!check.ok) {
      return { success: false, message: check.reason! };
    }

    // 物品移入容器
    item.moveTo(container, { quiet: true });

    return {
      success: true,
      message: `你把${rt('item', item.getName())}放入了${rt('item', container.getName())}。`,
      data: {
        action: 'put',
        itemId: item.id,
        itemName: item.getName(),
        containerId: container.id,
        containerName: container.getName(),
      },
    };
  }

  /** 在房间地面和背包中查找容器 */
  private findContainer(executor: LivingBase, name: string): ContainerBase | undefined {
    const env = executor.getEnvironment();
    // 先搜房间地面
    if (env) {
      const ground = env
        .getInventory()
        .filter((e): e is ContainerBase => e instanceof ContainerBase)
        .find(
          (c) => c.getName().includes(name) || c.getName().toLowerCase() === name.toLowerCase(),
        );
      if (ground) return ground;
    }
    // 再搜背包
    return executor
      .getInventory()
      .filter((e): e is ContainerBase => e instanceof ContainerBase)
      .find((c) => c.getName().includes(name) || c.getName().toLowerCase() === name.toLowerCase());
  }

  /** 从右往左查找关键词索引 */
  private findKeywordIndex(args: string[], keywords: string[]): number {
    for (let i = args.length - 1; i >= 0; i--) {
      if (keywords.includes(args[i].toLowerCase())) return i;
    }
    return -1;
  }
}
