/**
 * CommandLoader -- 指令扫描加载器 (Layer 4)
 *
 * 扫描 commands/ 目录，动态 require 指令文件，注册到 CommandManager。
 * 支持运行时热更新（清除 require 缓存 + 重新加载）。
 *
 * 目录结构约定:
 *   commands/
 *   ├── std/      # 标准指令（所有人可用）
 *   ├── usr/      # 玩家指令
 *   ├── imm/      # 仙人指令
 *   ├── wiz/      # 巫师指令
 *   ├── arch/     # 大巫师指令
 *   └── adm/      # 管理员指令
 *
 * 注意：使用 require() 而非 import() 以便于清除 require.cache 实现热更新。
 */
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { CommandManager } from './command-manager';
import { COMMAND_META_KEY } from './types/command';
import type { ICommand, CommandMeta } from './types/command';

/** 需要排除的文件后缀模式 */
const EXCLUDED_PATTERNS = ['.spec.ts', '.spec.js', '.test.ts', '.test.js', '.d.ts'];

@Injectable()
export class CommandLoader {
  private readonly logger = new Logger(CommandLoader.name);

  constructor(private readonly commandManager: CommandManager) {}

  /**
   * 扫描并加载指令目录
   *
   * 遍历 commandsDir 下的子目录（每个子目录对应一个权限等级），
   * 加载其中所有有 @Command 装饰器的类文件。
   *
   * @param commandsDir 指令根目录绝对路径
   */
  scanAndLoad(commandsDir: string): void {
    if (!fs.existsSync(commandsDir)) {
      this.logger.warn(`指令目录不存在: ${commandsDir}`);
      return;
    }

    const subDirs = fs
      .readdirSync(commandsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    let total = 0;
    for (const dir of subDirs) {
      const dirPath = path.join(commandsDir, dir);
      const files = fs
        .readdirSync(dirPath)
        .filter((f) => f.endsWith('.js') || f.endsWith('.ts'))
        .filter((f) => !EXCLUDED_PATTERNS.some((p) => f.endsWith(p)));

      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const commands = this.loadCommands(filePath, dir);
        total += commands.length;
      }
    }

    this.logger.log(`指令加载完成: ${total} 个指令`);
  }

  /**
   * 加载单个指令文件
   *
   * 通过 require 加载模块，检查 @Command 装饰器元数据，
   * 创建实例并注册到 CommandManager。
   *
   * @param filePath 指令文件绝对路径
   * @param directory 所属目录名
   * @returns 指令实例，加载失败返回 null
   */
  loadCommand(filePath: string, directory: string): ICommand | null {
    const commands = this.loadCommands(filePath, directory);
    return commands[0] ?? null;
  }

  /**
   * 加载并注册单个文件中的全部指令类
   *
   * 支持一个文件导出多个 @Command 类（named exports）。
   *
   * @param filePath 指令文件绝对路径
   * @param directory 所属目录名
   * @returns 已注册的指令实例列表
   */
  loadCommands(filePath: string, directory: string): ICommand[] {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mod = require(filePath);
      const commandClasses = this.extractCommandClasses(mod);
      if (commandClasses.length === 0) {
        const hasClassExport =
          typeof mod === 'function' ||
          (mod &&
            typeof mod === 'object' &&
            Object.values(mod).some((v) => typeof v === 'function'));

        if (hasClassExport) {
          this.logger.warn(`跳过无 @Command 装饰器: ${filePath}`);
        } else {
          this.logger.warn(`跳过非类导出: ${filePath}`);
        }
        return [];
      }

      const loaded: ICommand[] = [];
      for (const CommandClass of commandClasses) {
        const meta: CommandMeta | undefined = Reflect.getMetadata(COMMAND_META_KEY, CommandClass);
        if (!meta) continue;

        const instance = new (CommandClass as any)() as ICommand;
        instance.name = meta.name;
        instance.aliases = meta.aliases ?? [];
        instance.description = meta.description ?? '';
        instance.directory = directory;

        this.commandManager.register(instance, directory);
        loaded.push(instance);
      }
      return loaded;
    } catch (err) {
      this.logger.warn(`加载指令失败 ${filePath}: ${(err as Error).message}`);
      return [];
    }
  }

  /** 从模块导出中提取全部带 @Command 装饰器的类 */
  private extractCommandClasses(mod: any): Function[] {
    const classes = new Set<Function>();
    const collect = (candidate: unknown) => {
      if (typeof candidate !== 'function') return;
      if (!Reflect.getMetadata(COMMAND_META_KEY, candidate)) return;
      classes.add(candidate);
    };

    collect(mod);
    if (mod && typeof mod === 'object') {
      collect(mod.default);
      for (const value of Object.values(mod)) {
        collect(value);
      }
    }

    return [...classes];
  }

  /**
   * 热更新指令
   *
   * 注销指定指令（后续可扩展为清除 require.cache + 重新加载）。
   *
   * @param commandName 指令名称
   */
  update(commandName: string): void {
    this.commandManager.unregister(commandName);
  }
}
