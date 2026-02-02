/**
 * CommandManager 指令管理器 单元测试
 */
import { CommandManager } from '../command-manager';
import type { ICommand, CommandResult } from '../types/command';
import { Permission } from '../types/command';
import type { LivingBase } from '../game-objects/living-base';

/** 创建 mock 指令 */
function createMockCommand(
  name: string,
  aliases: string[] = [],
  executeFn?: (executor: LivingBase, args: string[]) => CommandResult,
): ICommand {
  return {
    name,
    aliases,
    description: `${name} 指令`,
    directory: '',
    execute: executeFn ?? ((_executor, _args) => ({ success: true, message: `${name} 执行成功` })),
  };
}

/** 创建 mock 执行者 */
function createMockExecutor(permission: Permission = Permission.PLAYER): LivingBase {
  return {
    getPermission: () => permission,
  } as unknown as LivingBase;
}

describe('CommandManager 指令管理器', () => {
  let manager: CommandManager;

  beforeEach(() => {
    manager = new CommandManager();
  });

  // ---- register / unregister ----

  describe('register / unregister', () => {
    it('注册指令到指定目录', () => {
      const cmd = createMockCommand('look', ['l']);
      manager.register(cmd, 'std');

      expect(manager.getCount()).toBe(1);
      expect(cmd.directory).toBe('std');
    });

    it('注销指令后无法再查找', () => {
      const cmd = createMockCommand('look', ['l']);
      manager.register(cmd, 'std');
      manager.unregister('look');

      expect(manager.getCount()).toBe(0);
      const found = manager.findCommand('look', Permission.PLAYER);
      expect(found).toBeUndefined();
    });

    it('通过别名注销指令', () => {
      const cmd = createMockCommand('look', ['l']);
      manager.register(cmd, 'std');
      manager.unregister('l');

      expect(manager.getCount()).toBe(0);
    });

    it('注销不存在的指令不会报错', () => {
      expect(() => manager.unregister('nonexistent')).not.toThrow();
    });
  });

  // ---- parse ----

  describe('parse()', () => {
    it('解析简单指令', () => {
      const result = manager.parse('look');
      expect(result).toEqual({ name: 'look', args: [] });
    });

    it('解析带参数的指令', () => {
      const result = manager.parse('say hello world');
      expect(result).toEqual({ name: 'say', args: ['hello', 'world'] });
    });

    it('处理前后空格', () => {
      const result = manager.parse('  go north  ');
      expect(result).toEqual({ name: 'go', args: ['north'] });
    });

    it('空输入返回空名称', () => {
      const result = manager.parse('');
      expect(result).toEqual({ name: '', args: [] });
    });
  });

  // ---- execute ----

  describe('execute()', () => {
    it('成功执行已注册的指令', () => {
      const cmd = createMockCommand('look', ['l'], (_executor, _args) => ({
        success: true,
        message: '你环顾四周...',
      }));
      manager.register(cmd, 'std');

      const executor = createMockExecutor(Permission.PLAYER);
      const result = manager.execute(executor, 'look');

      expect(result.success).toBe(true);
      expect(result.message).toBe('你环顾四周...');
    });

    it('空输入返回提示', () => {
      const executor = createMockExecutor();
      const result = manager.execute(executor, '');

      expect(result.success).toBe(false);
      expect(result.message).toBe('请输入指令。');
    });

    it('未知指令返回错误', () => {
      const executor = createMockExecutor();
      const result = manager.execute(executor, 'fly');

      expect(result.success).toBe(false);
      expect(result.message).toContain('未知指令');
    });

    it('将参数传递给指令', () => {
      let receivedArgs: string[] = [];
      const cmd = createMockCommand('say', [], (_executor, args) => {
        receivedArgs = args;
        return { success: true };
      });
      manager.register(cmd, 'std');

      const executor = createMockExecutor();
      manager.execute(executor, 'say hello world');

      expect(receivedArgs).toEqual(['hello', 'world']);
    });
  });

  // ---- findCommand 权限搜索 ----

  describe('findCommand() 权限搜索', () => {
    it('PLAYER 可搜索 usr 和 std 目录', () => {
      const stdCmd = createMockCommand('look');
      const usrCmd = createMockCommand('score');
      manager.register(stdCmd, 'std');
      manager.register(usrCmd, 'usr');

      expect(manager.findCommand('look', Permission.PLAYER)).toBe(stdCmd);
      expect(manager.findCommand('score', Permission.PLAYER)).toBe(usrCmd);
    });

    it('通过别名查找指令', () => {
      const cmd = createMockCommand('look', ['l', 'see']);
      manager.register(cmd, 'std');

      expect(manager.findCommand('l', Permission.PLAYER)).toBe(cmd);
      expect(manager.findCommand('see', Permission.PLAYER)).toBe(cmd);
    });

    it('PLAYER 无法搜索 wiz 目录', () => {
      const wizCmd = createMockCommand('shutdown');
      manager.register(wizCmd, 'wiz');

      const found = manager.findCommand('shutdown', Permission.PLAYER);
      expect(found).toBeUndefined();
    });

    it('WIZARD 可搜索 wiz/imm/usr/std 所有目录', () => {
      const stdCmd = createMockCommand('look');
      const wizCmd = createMockCommand('shutdown');
      manager.register(stdCmd, 'std');
      manager.register(wizCmd, 'wiz');

      expect(manager.findCommand('look', Permission.WIZARD)).toBe(stdCmd);
      expect(manager.findCommand('shutdown', Permission.WIZARD)).toBe(wizCmd);
    });

    it('无效权限返回 undefined', () => {
      const cmd = createMockCommand('look');
      manager.register(cmd, 'std');

      const found = manager.findCommand('look', 999 as Permission);
      expect(found).toBeUndefined();
    });
  });

  // ---- getAll / getCount / clear ----

  describe('getAll / getCount / clear', () => {
    it('getAll 返回所有已注册指令', () => {
      manager.register(createMockCommand('look'), 'std');
      manager.register(createMockCommand('say'), 'std');
      manager.register(createMockCommand('shutdown'), 'wiz');

      const all = manager.getAll();
      expect(all).toHaveLength(3);
      expect(all.map((c) => c.name).sort()).toEqual(['look', 'say', 'shutdown']);
    });

    it('getCount 返回正确的指令总数', () => {
      expect(manager.getCount()).toBe(0);

      manager.register(createMockCommand('look'), 'std');
      manager.register(createMockCommand('shutdown'), 'wiz');

      expect(manager.getCount()).toBe(2);
    });

    it('clear 清空所有指令', () => {
      manager.register(createMockCommand('look'), 'std');
      manager.register(createMockCommand('shutdown'), 'wiz');
      manager.clear();

      expect(manager.getCount()).toBe(0);
      expect(manager.getAll()).toEqual([]);
    });
  });
});
