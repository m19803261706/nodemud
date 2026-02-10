/**
 * CommandLoader 指令扫描加载器 单元测试
 *
 * 使用临时目录和 fixture 文件测试扫描加载功能。
 */
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { CommandLoader } from '../command-loader';
import { CommandManager } from '../command-manager';
import { Permission } from '../types/command';

/** 临时测试目录 */
let tmpDir: string;

/** 获取模块绝对路径（用于 fixture 文件中的 require） */
const reflectMetadataPath = require.resolve('reflect-metadata').replace(/\\/g, '/');
const commandTypesPath = require.resolve('../types/command').replace(/\\/g, '/');

/** 创建临时目录结构和 fixture 文件 */
function setupFixtures(): string {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cmd-loader-test-'));
  const stdDir = path.join(tmpDir, 'std');
  fs.mkdirSync(stdDir, { recursive: true });

  // 有 @Command 装饰器的指令文件
  fs.writeFileSync(
    path.join(stdDir, 'look.js'),
    `
"use strict";
require("${reflectMetadataPath}");
const { COMMAND_META_KEY } = require("${commandTypesPath}");

class LookCommand {
  execute(executor, args) {
    return { success: true, message: "look executed" };
  }
}

Reflect.defineMetadata(COMMAND_META_KEY, {
  name: "look",
  aliases: ["l"],
  description: "look around"
}, LookCommand);

module.exports = LookCommand;
`,
  );

  // 无 @Command 装饰器的文件
  fs.writeFileSync(
    path.join(stdDir, 'helper.js'),
    `
"use strict";
class Helper {}
module.exports = Helper;
`,
  );

  // 非类导出的文件
  fs.writeFileSync(
    path.join(stdDir, 'config.js'),
    `
"use strict";
module.exports = { key: "value" };
`,
  );

  return tmpDir;
}

/** 添加多指令导出 fixture（同文件 2 个 @Command） */
function addMultiCommandFixture(rootDir: string): void {
  const stdDir = path.join(rootDir, 'std');
  fs.writeFileSync(
    path.join(stdDir, 'practice.js'),
    `
"use strict";
require("${reflectMetadataPath}");
const { COMMAND_META_KEY } = require("${commandTypesPath}");

class PracticeCommand {
  execute() { return { success: true, message: "practice executed" }; }
}
class DazuoCommand {
  execute() { return { success: true, message: "dazuo executed" }; }
}

Reflect.defineMetadata(COMMAND_META_KEY, {
  name: "practice",
  aliases: ["练习"],
  description: "practice"
}, PracticeCommand);

Reflect.defineMetadata(COMMAND_META_KEY, {
  name: "dazuo",
  aliases: ["打坐"],
  description: "dazuo"
}, DazuoCommand);

module.exports = { PracticeCommand, DazuoCommand };
`,
  );
}

/** 清理临时目录 */
function cleanupFixtures(): void {
  if (tmpDir && fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

/** 清除 fixture 文件的 require 缓存 */
function clearRequireCache(): void {
  if (!tmpDir) return;
  for (const key of Object.keys(require.cache)) {
    if (key.startsWith(tmpDir)) {
      delete require.cache[key];
    }
  }
}

describe('CommandLoader 指令扫描加载器', () => {
  let manager: CommandManager;
  let loader: CommandLoader;

  beforeEach(() => {
    manager = new CommandManager();
    loader = new CommandLoader(manager);
  });

  afterEach(() => {
    clearRequireCache();
    cleanupFixtures();
  });

  it('scanAndLoad 扫描目录并加载有装饰器的指令', () => {
    const dir = setupFixtures();
    loader.scanAndLoad(dir);

    // 只有 look.js 有 @Command 装饰器，应加载 1 个指令
    expect(manager.getCount()).toBe(1);
    const all = manager.getAll();
    expect(all[0].name).toBe('look');
    expect(all[0].aliases).toEqual(['l']);
    expect(all[0].directory).toBe('std');
  });

  it('loadCommand 有 @Command 装饰器的文件成功加载', () => {
    const dir = setupFixtures();
    const filePath = path.join(dir, 'std', 'look.js');
    const cmd = loader.loadCommand(filePath, 'std');

    expect(cmd).not.toBeNull();
    expect(cmd!.name).toBe('look');
    expect(cmd!.aliases).toEqual(['l']);
  });

  it('loadCommand 无装饰器的文件返回 null', () => {
    const dir = setupFixtures();
    const filePath = path.join(dir, 'std', 'helper.js');
    const cmd = loader.loadCommand(filePath, 'std');

    expect(cmd).toBeNull();
  });

  it('scanAndLoad 目录不存在时不报错', () => {
    const nonexistent = path.join(os.tmpdir(), 'nonexistent-cmd-dir-12345');
    expect(() => loader.scanAndLoad(nonexistent)).not.toThrow();
    expect(manager.getCount()).toBe(0);
  });

  it('loadCommand 非类导出的文件返回 null', () => {
    const dir = setupFixtures();
    const filePath = path.join(dir, 'std', 'config.js');
    const cmd = loader.loadCommand(filePath, 'std');

    expect(cmd).toBeNull();
  });

  it('同文件多个 @Command 导出会全部注册', () => {
    const dir = setupFixtures();
    addMultiCommandFixture(dir);

    loader.scanAndLoad(dir);

    expect(manager.getCount()).toBe(3);
    expect(manager.findCommand('look', Permission.PLAYER)).toBeDefined();
    expect(manager.findCommand('practice', Permission.PLAYER)).toBeDefined();
    expect(manager.findCommand('dazuo', Permission.PLAYER)).toBeDefined();
  });
});
