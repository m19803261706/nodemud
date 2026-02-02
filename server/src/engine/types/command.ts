/**
 * 指令系统类型定义 (Layer 4)
 *
 * 定义权限等级、指令元数据、指令接口和 @Command 装饰器。
 * 对标炎黄 MUD command.h，按权限等级分目录搜索指令。
 */
import 'reflect-metadata';
import type { LivingBase } from '../game-objects/living-base';

/** 权限等级（对标炎黄 MUD command.h） */
export enum Permission {
  NPC = -1,
  GUEST = 0,
  PLAYER = 1,
  IMMORTAL = 2,
  WIZARD = 3,
  ARCH = 4,
  ADMIN = 5,
}

/** 各权限可搜索的目录列表（高权限包含低权限目录） */
export const PERMISSION_PATHS: Record<number, string[]> = {
  [Permission.NPC]: ['std'],
  [Permission.GUEST]: ['std'],
  [Permission.PLAYER]: ['usr', 'std'],
  [Permission.IMMORTAL]: ['imm', 'usr', 'std'],
  [Permission.WIZARD]: ['wiz', 'imm', 'usr', 'std'],
  [Permission.ARCH]: ['arch', 'wiz', 'imm', 'usr', 'std'],
  [Permission.ADMIN]: ['adm', 'arch', 'wiz', 'imm', 'usr', 'std'],
};

/** 指令元数据（@Command 装饰器参数） */
export interface CommandMeta {
  name: string;
  aliases?: string[];
  description?: string;
}

/** 指令执行结果 */
export interface CommandResult {
  success: boolean;
  message?: string;
  data?: any;
}

/** 指令接口 */
export interface ICommand {
  name: string;
  aliases: string[];
  description: string;
  directory: string;
  execute(executor: LivingBase, args: string[]): CommandResult;
}

/** @Command 装饰器元数据 key */
export const COMMAND_META_KEY = 'command:meta';

/** @Command 装饰器 */
export function Command(meta: CommandMeta): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata(COMMAND_META_KEY, meta, target);
  };
}
