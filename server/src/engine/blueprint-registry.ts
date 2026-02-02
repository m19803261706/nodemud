/**
 * BlueprintRegistry -- 蓝图注册表
 *
 * 内存中的蓝图元数据存储，管理所有已加载蓝图的信息。
 * 作为 NestJS Injectable 服务，在 EngineModule 中提供单例。
 */
import { Injectable, Logger } from '@nestjs/common';
import type { BlueprintMeta } from './types/blueprint-meta';

@Injectable()
export class BlueprintRegistry {
  private readonly logger = new Logger(BlueprintRegistry.name);

  /** 蓝图注册表：id -> BlueprintMeta */
  private readonly blueprints: Map<string, BlueprintMeta> = new Map();

  /** 注册蓝图，ID 重复时抛出错误 */
  register(meta: BlueprintMeta): void {
    if (this.blueprints.has(meta.id)) {
      throw new Error(`BlueprintRegistry: 蓝图 ID "${meta.id}" 已存在，不允许重复注册`);
    }
    this.blueprints.set(meta.id, meta);
    this.logger.log(`蓝图已注册: ${meta.id}`);
  }

  /** 注销蓝图，不存在时静默忽略 */
  unregister(id: string): void {
    this.blueprints.delete(id);
  }

  /** 按 ID 查询蓝图元数据 */
  get(id: string): BlueprintMeta | undefined {
    return this.blueprints.get(id);
  }

  /** 是否已注册 */
  has(id: string): boolean {
    return this.blueprints.has(id);
  }

  /** 获取所有蓝图元数据 */
  getAll(): BlueprintMeta[] {
    return [...this.blueprints.values()];
  }

  /** 已注册蓝图数量 */
  getCount(): number {
    return this.blueprints.size;
  }

  /** 清空注册表 */
  clear(): void {
    this.blueprints.clear();
    this.logger.log('蓝图注册表已清空');
  }
}
