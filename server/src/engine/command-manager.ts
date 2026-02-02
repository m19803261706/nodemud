/**
 * CommandManager -- 指令管理器 (Layer 4)
 *
 * 管理所有游戏指令的注册、查找和执行。
 * 按目录分类存储指令，支持别名索引和权限搜索。
 *
 * 对标: LPC command system / 炎黄 MUD 指令管理
 */
import { Injectable, Logger } from '@nestjs/common';
import type { ICommand, CommandResult } from './types/command';
import { PERMISSION_PATHS } from './types/command';
import type { Permission } from './types/command';
import type { LivingBase } from './game-objects/living-base';

@Injectable()
export class CommandManager {
  private readonly logger = new Logger(CommandManager.name);

  /** 按目录分类的指令: directory -> (name -> ICommand) */
  private dirCommands: Map<string, Map<string, ICommand>> = new Map();

  /** 全局别名索引: alias -> { command, directory } */
  private aliasIndex: Map<
    string,
    { command: ICommand; directory: string }
  > = new Map();

  /**
   * 注册指令到指定目录
   * @param command 指令实例
   * @param directory 目录名（如 "std", "usr", "wiz"）
   */
  register(command: ICommand, directory: string): void {
    if (!this.dirCommands.has(directory)) {
      this.dirCommands.set(directory, new Map());
    }
    const dirMap = this.dirCommands.get(directory)!;
    dirMap.set(command.name, command);

    // 建立别名索引（含指令名本身）
    this.aliasIndex.set(command.name, { command, directory });
    for (const alias of command.aliases) {
      this.aliasIndex.set(alias, { command, directory });
    }

    command.directory = directory;
    this.logger.log(`指令已注册: ${directory}/${command.name}`);
  }

  /**
   * 注销指令（按名称或别名）
   * @param name 指令名或别名
   */
  unregister(name: string): void {
    const entry = this.aliasIndex.get(name);
    if (!entry) return;
    const { command, directory } = entry;

    // 从目录中移除
    const dirMap = this.dirCommands.get(directory);
    if (dirMap) dirMap.delete(command.name);

    // 清除所有别名索引
    this.aliasIndex.delete(command.name);
    for (const alias of command.aliases) {
      this.aliasIndex.delete(alias);
    }
  }

  /**
   * 解析用户输入为指令名和参数
   * @param input 原始输入字符串
   * @returns { name, args }
   */
  parse(input: string): { name: string; args: string[] } {
    const trimmed = input.trim();
    const parts = trimmed.split(/\s+/);
    return { name: parts[0] ?? '', args: parts.slice(1) };
  }

  /**
   * 执行指令
   * @param executor 执行者（LivingBase）
   * @param input 原始输入字符串
   * @returns 指令执行结果
   */
  execute(executor: LivingBase, input: string): CommandResult {
    const { name, args } = this.parse(input);
    if (!name) return { success: false, message: '请输入指令。' };

    const permission = executor.getPermission();
    const command = this.findCommand(name, permission);

    if (!command) return { success: false, message: `未知指令: ${name}` };

    return command.execute(executor, args);
  }

  /**
   * 按权限等级搜索指令
   *
   * 根据权限对应的目录列表，按顺序搜索指令名或别名。
   * 高权限包含低权限目录（如 WIZARD 可搜索 wiz/imm/usr/std）。
   *
   * @param name 指令名或别名
   * @param permission 权限等级
   * @returns 匹配的指令，未找到返回 undefined
   */
  findCommand(name: string, permission: Permission): ICommand | undefined {
    const paths = PERMISSION_PATHS[permission];
    if (!paths) return undefined;

    for (const dir of paths) {
      const dirMap = this.dirCommands.get(dir);
      if (!dirMap) continue;

      // 先精确匹配指令名
      if (dirMap.has(name)) return dirMap.get(name);

      // 再匹配别名
      for (const cmd of dirMap.values()) {
        if (cmd.aliases.includes(name)) return cmd;
      }
    }

    return undefined;
  }

  /** 获取所有已注册的指令 */
  getAll(): ICommand[] {
    const all: ICommand[] = [];
    for (const dirMap of this.dirCommands.values()) {
      for (const cmd of dirMap.values()) all.push(cmd);
    }
    return all;
  }

  /** 获取已注册指令总数 */
  getCount(): number {
    let count = 0;
    for (const dirMap of this.dirCommands.values()) count += dirMap.size;
    return count;
  }

  /** 清空所有指令（测试用） */
  clear(): void {
    this.dirCommands.clear();
    this.aliasIndex.clear();
  }
}
