/**
 * get 指令 -- 捡起地面物品 / 从容器取出物品
 *
 * 从当前房间地面捡起指定物品或所有物品到背包。
 * 支持 `get <物品> from <容器>` 语法从容器中取出物品。
 * 支持模糊匹配物品名称。
 *
 * 对标: LPC get / 炎黄 get_cmd
 */
import { Command, type ICommand, type CommandResult } from '../../types/command';
import type { LivingBase } from '../../game-objects/living-base';
import { ItemBase } from '../../game-objects/item-base';
import { ContainerBase } from '../../game-objects/container-base';
import { rt } from '@packages/core';

@Command({ name: 'get', aliases: ['take', '拿', '捡'], description: '捡起物品' })
export class GetCommand implements ICommand {
  name = 'get';
  aliases = ['take', '拿', '捡'];
  description = '捡起物品';
  directory = 'std';

  execute(executor: LivingBase, args: string[]): CommandResult {
    const env = executor.getEnvironment();
    if (!env) {
      return { success: false, message: '你不在任何地方。' };
    }

    // 无参数 → 提示格式
    if (args.length === 0) {
      return { success: false, message: '捡什么？用法: get <物品名> 或 get all' };
    }

    // 检测 from / 从 关键词（从右往左搜索，避免物品名含关键词冲突）
    const fromIdx = this.findKeywordIndex(args, ['from', '从']);
    if (fromIdx > 0) {
      const itemName = args.slice(0, fromIdx).join(' ');
      const containerName = args.slice(fromIdx + 1).join(' ');
      if (!containerName) {
        return { success: false, message: '从哪里取？用法: get <物品> from <容器>' };
      }
      return this.getFromContainer(executor, itemName, containerName);
    }

    const target = args.join(' ').trim();

    // get all → 捡起所有地面物品
    if (target === 'all' || target === '全部') {
      return this.getAll(executor);
    }

    // 模糊匹配房间地面的 ItemBase
    return this.getItem(executor, target);
  }

  /** 捡起指定物品 */
  private getItem(executor: LivingBase, target: string): CommandResult {
    const env = executor.getEnvironment()!;
    const items = env.getInventory().filter((e): e is ItemBase => e instanceof ItemBase);

    const item = items.find(
      (i) => i.getName().includes(target) || i.getName().toLowerCase() === target.toLowerCase(),
    );

    if (!item) {
      return { success: false, message: '这里没有这个东西。' };
    }

    item.moveTo(executor, { quiet: true });
    const name = item.getName();

    return {
      success: true,
      message: `你捡起了${rt('item', name)}。`,
      data: { action: 'get', itemId: item.id, itemName: name },
    };
  }

  /** 从容器中取出物品 */
  private getFromContainer(
    executor: LivingBase,
    itemName: string,
    containerName: string,
  ): CommandResult {
    const container = this.findContainer(executor, containerName);
    if (!container) {
      return { success: false, message: `这里没有${containerName}。` };
    }

    const item = container
      .getContents()
      .find(
        (i) =>
          i.getName().includes(itemName) || i.getName().toLowerCase() === itemName.toLowerCase(),
      );
    if (!item) {
      return { success: false, message: `${container.getName()}中没有${itemName}。` };
    }

    item.moveTo(executor, { quiet: true });

    return {
      success: true,
      message: `你从${rt('item', container.getName())}中取出了${rt('item', item.getName())}。`,
      data: {
        action: 'get_from',
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

  /** 从右往左查找关键词索引（避免物品名含关键词冲突） */
  private findKeywordIndex(args: string[], keywords: string[]): number {
    for (let i = args.length - 1; i >= 0; i--) {
      if (keywords.includes(args[i].toLowerCase())) return i;
    }
    return -1;
  }

  /** 捡起所有物品 */
  private getAll(executor: LivingBase): CommandResult {
    const env = executor.getEnvironment()!;
    const items = env.getInventory().filter((e): e is ItemBase => e instanceof ItemBase);

    if (items.length === 0) {
      return { success: false, message: '这里没有可以捡起的东西。' };
    }

    const names: string[] = [];
    for (const item of items) {
      item.moveTo(executor, { quiet: true });
      names.push(item.getName());
    }

    return {
      success: true,
      message: `你捡起了${names.map((n) => rt('item', n)).join('、')}。`,
      data: { action: 'get', all: true, count: names.length },
    };
  }
}
