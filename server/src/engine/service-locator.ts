/**
 * 服务定位器
 * BaseEntity 通过此类访问 NestJS 管理的引擎服务
 * 在 EngineModule 启动时初始化
 */
import type { HeartbeatManager } from './heartbeat-manager';
import type { ObjectManager } from './object-manager';

export class ServiceLocator {
  // Layer 1 服务
  static heartbeatManager: HeartbeatManager;
  static objectManager: ObjectManager;

  // Layer 2 服务（后续添加）
  // static blueprintLoader: BlueprintLoader;

  private static _initialized = false;

  /** 初始化服务定位器（由 EngineModule 调用） */
  static initialize(providers: {
    heartbeatManager: HeartbeatManager;
    objectManager: ObjectManager;
  }): void {
    this.heartbeatManager = providers.heartbeatManager;
    this.objectManager = providers.objectManager;
    this._initialized = true;
  }

  /** 检查是否已初始化 */
  static get initialized(): boolean {
    return this._initialized;
  }

  /** 重置（测试用） */
  static reset(): void {
    this._initialized = false;
    this.heartbeatManager = undefined as any;
    this.objectManager = undefined as any;
  }
}
