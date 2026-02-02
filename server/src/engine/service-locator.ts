/**
 * 服务定位器
 * BaseEntity 通过此类访问 NestJS 管理的引擎服务
 * 在 EngineModule 启动时初始化
 */
export class ServiceLocator {
  // Layer 1 服务（后续添加）
  // static objectManager: ObjectManager;
  // static heartbeatManager: HeartbeatManager;

  // Layer 2 服务（后续添加）
  // static blueprintLoader: BlueprintLoader;

  private static _initialized = false;

  /** 初始化服务定位器（由 EngineModule 调用） */
  static initialize(providers: Record<string, any>): void {
    // 后续按需注入服务
    // this.objectManager = providers.objectManager;
    // this.heartbeatManager = providers.heartbeatManager;
    this._initialized = true;
  }

  /** 检查是否已初始化 */
  static get initialized(): boolean {
    return this._initialized;
  }

  /** 重置（测试用） */
  static reset(): void {
    this._initialized = false;
  }
}
