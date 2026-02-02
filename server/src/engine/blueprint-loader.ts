/**
 * BlueprintLoader -- 蓝图扫描加载器
 *
 * 扫描 world/ 目录，动态 require 蓝图文件，注册到 Registry。
 * 支持运行时热更新（update 指令）。
 * 作为 NestJS Injectable 服务，在 EngineModule 中提供单例。
 *
 * 注意：使用 require() 而非 import() 以便于清除 require.cache 实现热更新。
 * NestJS 编译为 CommonJS，require 是标准方式。
 */
import { Injectable, Optional, Inject, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { BlueprintRegistry } from './blueprint-registry';
import { BlueprintFactory } from './blueprint-factory';
import { ObjectManager } from './object-manager';
import { BaseEntity } from './base-entity';
import type { BlueprintMeta } from './types/blueprint-meta';

/** BlueprintLoader 配置注入 token */
export const BLUEPRINT_LOADER_CONFIG = 'BLUEPRINT_LOADER_CONFIG';

/** BlueprintLoader 配置 */
export interface BlueprintLoaderConfig {
  /** world 目录路径（可选，默认在 scanAndLoad 中传入） */
  worldDir?: string;
  /** 扫描的文件后缀（默认 ['.js']，测试环境可设 ['.js', '.ts']） */
  extensions?: string[];
}

/** 默认扫描文件后缀 */
const DEFAULT_EXTENSIONS = ['.js'];

/** 需要排除的文件后缀模式 */
const EXCLUDED_PATTERNS = ['.spec.ts', '.spec.js', '.test.ts', '.test.js', '.d.ts'];

@Injectable()
export class BlueprintLoader {
  private readonly logger = new Logger(BlueprintLoader.name);

  /** world 目录绝对路径 */
  private worldBasePath: string = '';

  /** 允许扫描的文件后缀 */
  private readonly extensions: string[];

  constructor(
    private readonly registry: BlueprintRegistry,
    private readonly factory: BlueprintFactory,
    private readonly objectManager: ObjectManager,
    @Optional() @Inject(BLUEPRINT_LOADER_CONFIG) private readonly config?: BlueprintLoaderConfig,
  ) {
    this.extensions = config?.extensions ?? DEFAULT_EXTENSIONS;
  }

  /**
   * 扫描并加载所有蓝图
   * @param worldDir world 目录绝对路径
   */
  async scanAndLoad(worldDir: string): Promise<void> {
    this.worldBasePath = worldDir;

    // 目录不存在时记录 warning 并跳过
    if (!fs.existsSync(worldDir)) {
      this.logger.warn(`蓝图目录不存在: ${worldDir}，跳过加载`);
      return;
    }

    const filePaths = this.scanDirectory(worldDir);

    for (const filePath of filePaths) {
      try {
        const meta = await this.loadBlueprint(filePath);
        // 虚拟蓝图自动创建单例实例
        if (meta.virtual) {
          this.factory.createVirtual(meta.id);
        }
      } catch (err) {
        this.logger.warn(`加载蓝图失败 ${filePath}: ${err}`);
      }
    }

    this.logger.log(`蓝图加载完成: ${this.registry.getCount()} 个蓝图`);
  }

  /**
   * 加载单个蓝图文件
   * @param filePath 蓝图文件绝对路径
   * @returns 蓝图元数据
   */
  async loadBlueprint(filePath: string): Promise<BlueprintMeta> {
    // 确保 worldBasePath 已设置
    if (!this.worldBasePath) {
      this.worldBasePath = path.dirname(filePath);
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const module = require(filePath);
    const BlueprintClass = module.default || module;

    // 验证: 必须导出有效的构造函数
    if (typeof BlueprintClass !== 'function') {
      throw new Error(`文件 ${filePath} 没有导出有效的类`);
    }

    // 验证: 必须继承 BaseEntity（检查原型链）
    if (!(BlueprintClass.prototype instanceof BaseEntity)) {
      throw new Error(`文件 ${filePath} 导出的类不继承 BaseEntity`);
    }

    const id = this.inferBlueprintId(filePath);
    const virtual = (BlueprintClass as any).virtual ?? false;

    const meta: BlueprintMeta = {
      id,
      filePath,
      blueprintClass: BlueprintClass,
      virtual,
    };

    this.registry.register(meta);
    return meta;
  }

  /**
   * 热更新蓝图
   *
   * 清除 require.cache，重新加载蓝图文件。
   * 虚拟对象：reset dbase + tmpDbase，重新执行 create()
   * 克隆对象：仅更新 Registry 中的蓝图类（已有克隆实例不受影响）
   *
   * @param blueprintId 蓝图 ID
   */
  async update(blueprintId: string): Promise<void> {
    const oldMeta = this.registry.get(blueprintId);
    if (!oldMeta) {
      throw new Error(`BlueprintLoader: 蓝图 "${blueprintId}" 不存在`);
    }

    // 清除 require.cache
    const resolvedPath = require.resolve(oldMeta.filePath);
    delete require.cache[resolvedPath];

    // 重新加载模块
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const module = require(oldMeta.filePath);
    const NewClass = module.default || module;

    if (typeof NewClass !== 'function') {
      throw new Error(`热更新失败: ${oldMeta.filePath} 没有导出有效的类`);
    }

    // 构建新的元数据
    const newMeta: BlueprintMeta = {
      ...oldMeta,
      blueprintClass: NewClass,
    };

    // 虚拟对象 reset：清空属性，用新类的 create() 重设
    if (oldMeta.virtual) {
      const instance = this.objectManager.findById(blueprintId);
      if (instance) {
        instance.setDbase({});
        instance.clearTmpDbase();
        // 用新类的 create() 方法重设属性
        NewClass.prototype.create.call(instance);
      }
    }

    // 更新 Registry（先注销再注册）
    this.registry.unregister(blueprintId);
    this.registry.register(newMeta);

    this.logger.log(`蓝图已更新: ${blueprintId}`);
  }

  /**
   * 从文件路径推断蓝图 ID
   *
   * 规则：取相对于 worldBasePath 的路径，去掉文件后缀，用 "/" 分隔。
   * 示例：{worldDir}/area/yangzhou/inn.js -> "area/yangzhou/inn"
   *
   * @param filePath 蓝图文件绝对路径
   * @returns 蓝图 ID
   */
  inferBlueprintId(filePath: string): string {
    const relative = path.relative(this.worldBasePath, filePath);
    // 去掉后缀（支持 .js 和 .ts）
    const withoutExt = relative.replace(/\.(js|ts)$/, '');
    // 统一用 "/" 分隔（Windows 兼容）
    return withoutExt.split(path.sep).join('/');
  }

  /**
   * 递归扫描目录下所有蓝图文件
   *
   * 排除规则：
   * - .spec.ts / .spec.js / .test.ts / .test.js（测试文件）
   * - .d.ts（类型声明文件）
   *
   * @param dir 扫描目录
   * @returns 蓝图文件绝对路径列表
   */
  private scanDirectory(dir: string): string[] {
    const results: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        const subFiles = this.scanDirectory(fullPath);
        results.push(...subFiles);
      } else if (entry.isFile() && this.isValidBlueprintFile(entry.name)) {
        results.push(fullPath);
      }
    }

    return results;
  }

  /**
   * 判断文件名是否为有效蓝图文件
   */
  private isValidBlueprintFile(filename: string): boolean {
    // 检查是否被排除
    for (const pattern of EXCLUDED_PATTERNS) {
      if (filename.endsWith(pattern)) return false;
    }

    // 检查是否匹配允许的后缀
    for (const ext of this.extensions) {
      if (filename.endsWith(ext)) return true;
    }

    return false;
  }
}
