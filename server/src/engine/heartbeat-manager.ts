/**
 * HeartbeatManager - 全局心跳调度器
 *
 * 使用单一 setInterval 主循环，通过累积器模式调度所有注册对象的心跳。
 * 替代每个对象各自持有 setInterval 的方式，降低定时器数量，提升性能。
 *
 * 核心机制：
 * - 单 tick 主循环，默认每 1000ms 触发一次
 * - 每个注册对象维护独立的累积器（accumulated）
 * - 当 accumulated >= intervalMs 时触发心跳（while 循环，支持补偿）
 * - 已销毁对象自动清理，异常隔离不影响其他对象
 */
import { Injectable, Optional, Inject, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { GameEvents } from './types/events';
import type { BaseEntity } from './base-entity';

/** HeartbeatManager 配置注入 token */
export const HEARTBEAT_CONFIG = 'HEARTBEAT_CONFIG';

/** HeartbeatManager 配置 */
export interface HeartbeatConfig {
  tickIntervalMs?: number;
}

/** 心跳注册条目 */
interface HeartbeatEntry {
  /** 注册的游戏对象 */
  entity: BaseEntity;
  /** 心跳间隔（毫秒） */
  intervalMs: number;
  /** 累积时间（毫秒） */
  accumulated: number;
}

@Injectable()
export class HeartbeatManager implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(HeartbeatManager.name);

  /** 注册表，key 为 entity.id */
  private readonly entries: Map<string, HeartbeatEntry> = new Map();

  /** 主循环定时器 */
  private tickTimer: ReturnType<typeof setInterval> | null = null;

  /** 主循环 tick 间隔（毫秒） */
  private readonly tickIntervalMs: number;

  constructor(@Optional() @Inject(HEARTBEAT_CONFIG) config?: HeartbeatConfig) {
    this.tickIntervalMs = config?.tickIntervalMs ?? 1000;
  }

  // ================================================================
  //  生命周期
  // ================================================================

  /** 模块初始化时启动主循环 */
  onModuleInit(): void {
    this.startTick();
  }

  /** 模块销毁时停止主循环并清空注册表 */
  onModuleDestroy(): void {
    this.stopTick();
    this.entries.clear();
  }

  // ================================================================
  //  公共 API
  // ================================================================

  /**
   * 注册对象心跳
   * @param entity 游戏对象
   * @param intervalMs 心跳间隔（毫秒），必须大于 0
   * @throws intervalMs <= 0 时抛出错误
   */
  register(entity: BaseEntity, intervalMs: number): void {
    if (intervalMs <= 0) {
      throw new Error(`intervalMs must be greater than 0, got ${intervalMs}`);
    }
    this.entries.set(entity.id, {
      entity,
      intervalMs,
      accumulated: 0,
    });
  }

  /**
   * 注销对象心跳
   * 不存在时静默忽略
   * @param entity 游戏对象
   */
  unregister(entity: BaseEntity): void {
    this.entries.delete(entity.id);
  }

  /**
   * 更新心跳间隔，不重置累积器
   * @param entity 游戏对象
   * @param intervalMs 新的心跳间隔（毫秒），必须大于 0
   * @throws intervalMs <= 0 时抛出错误
   */
  updateInterval(entity: BaseEntity, intervalMs: number): void {
    if (intervalMs <= 0) {
      throw new Error(`intervalMs must be greater than 0, got ${intervalMs}`);
    }
    const entry = this.entries.get(entity.id);
    if (entry) {
      entry.intervalMs = intervalMs;
    }
  }

  /** 检查对象是否已注册 */
  isRegistered(entity: BaseEntity): boolean {
    return this.entries.has(entity.id);
  }

  /** 获取当前注册对象数量 */
  getRegisteredCount(): number {
    return this.entries.size;
  }

  /** 获取对象的心跳间隔，未注册返回 undefined */
  getInterval(entity: BaseEntity): number | undefined {
    return this.entries.get(entity.id)?.intervalMs;
  }

  /** 获取主循环 tick 间隔 */
  getTickInterval(): number {
    return this.tickIntervalMs;
  }

  // ================================================================
  //  私有方法
  // ================================================================

  /** 启动主循环 */
  private startTick(): void {
    this.tickTimer = setInterval(() => {
      this.tick();
    }, this.tickIntervalMs);
  }

  /** 停止主循环 */
  private stopTick(): void {
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
  }

  /** 单次 tick 处理 */
  private tick(): void {
    for (const [id, entry] of this.entries) {
      const { entity } = entry;

      // 已销毁对象自动移除
      if (entity.destroyed) {
        this.entries.delete(id);
        continue;
      }

      // 累积时间
      entry.accumulated += this.tickIntervalMs;

      // while 循环：支持补偿（interval < tick 或累积超过多个周期）
      while (entry.accumulated >= entry.intervalMs) {
        entry.accumulated -= entry.intervalMs;

        // 调用 onHeartbeat，错误隔离
        try {
          (entity as any).onHeartbeat();
        } catch (err) {
          this.logger.error(`onHeartbeat error for entity [${id}]: ${err}`);
        }

        // 触发 HEARTBEAT 事件，错误隔离
        try {
          entity.emit(GameEvents.HEARTBEAT);
        } catch (err) {
          this.logger.error(`emit HEARTBEAT error for entity [${id}]: ${err}`);
        }
      }
    }
  }
}
