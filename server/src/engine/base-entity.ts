/**
 * BaseEntity — 游戏引擎核心基类
 *
 * 所有游戏运行时对象（Room、NPC、Player、Item、Exit）的基类。
 * 提供三大核心能力：
 * 1. Dbase 动态属性系统（持久化 + 临时）
 * 2. Environment 环境/容器系统（树形包含关系）
 * 3. Events 事件系统（EventEmitter + 心跳 + 延迟调用）
 *
 * 对标: 炎黄 MUD dbase.c + LPC environment/inventory + RanvierMUD GameEntity
 */
import { EventEmitter } from 'events';
import {
  getNestedValue,
  setNestedValue,
  deleteNestedValue,
} from './utils/nested-value';
import type { Blueprint } from './types/dbase';
import type { MoveOptions } from './types/move-options';
import type { CancellableEvent } from './types/events';
import { GameEvents } from './types/events';

export abstract class BaseEntity extends EventEmitter {
  /** 唯一标识，路径式（如 "yangzhou/inn", "npc/dianxiaoer#1"） */
  readonly id: string;

  // ========== Dbase 动态属性系统 ==========

  /** 持久化属性（对应 LPC dbase mapping） */
  private dbase: Map<string, any> = new Map();

  /** 临时属性（对应 LPC tmp_dbase，重启丢失） */
  private tmpDbase: Map<string, any> = new Map();

  /** 蓝图引用（原型链回退） */
  protected blueprint: Blueprint | null = null;

  // ========== Environment 环境/容器系统 ==========

  /** 所在容器（对应 LPC environment()） */
  private _environment: BaseEntity | null = null;

  /** 包含的对象（对应 LPC all_inventory()） */
  private _inventory: Set<BaseEntity> = new Set();

  // ========== Events 心跳 + 延迟调用 ==========

  /** 心跳定时器 */
  private _heartbeatTimer: ReturnType<typeof setInterval> | null = null;

  /** 心跳间隔（毫秒） */
  private _heartbeatInterval: number = 0;

  /** 延迟调用注册表 */
  private _callOuts: Map<string, ReturnType<typeof setTimeout>> = new Map();

  /** 延迟调用 ID 计数器 */
  private _callOutCounter: number = 0;

  /** 是否已销毁 */
  private _destroyed: boolean = false;

  // ========== 构造函数 ==========

  constructor(id: string, blueprint?: Blueprint) {
    super();
    this.id = id;
    this.blueprint = blueprint ?? null;
  }

  /** 是否已销毁 */
  get destroyed(): boolean {
    return this._destroyed;
  }

  // ================================================================
  //  Dbase 动态属性 API
  // ================================================================

  /** 设置属性（支持 "/" 路径嵌套） */
  set(path: string, value: any): void {
    const parts = path.split('/');
    setNestedValue(this.dbase, parts, value);
  }

  /** 获取属性（本地无则回退蓝图） */
  get<T = any>(path: string): T | undefined {
    const parts = path.split('/');
    const local = getNestedValue(this.dbase, parts);
    if (local !== undefined) return local as T;
    // 蓝图原型链回退
    return this.blueprint?.getDbaseValue<T>(path);
  }

  /** 累加数值属性 */
  add(path: string, delta: number): void {
    const old = this.get<number>(path) ?? 0;
    this.set(path, old + delta);
  }

  /** 删除属性 */
  del(path: string): boolean {
    const parts = path.split('/');
    return deleteNestedValue(this.dbase, parts);
  }

  /** 设置临时属性 */
  setTemp(path: string, value: any): void {
    const parts = path.split('/');
    setNestedValue(this.tmpDbase, parts, value);
  }

  /** 获取临时属性（不走蓝图原型链） */
  getTemp<T = any>(path: string): T | undefined {
    const parts = path.split('/');
    return getNestedValue(this.tmpDbase, parts) as T | undefined;
  }

  /** 累加临时属性 */
  addTemp(path: string, delta: number): void {
    const old = this.getTemp<number>(path) ?? 0;
    this.setTemp(path, old + delta);
  }

  /** 删除临时属性 */
  delTemp(path: string): boolean {
    const parts = path.split('/');
    return deleteNestedValue(this.tmpDbase, parts);
  }

  /** 获取整个 dbase（序列化用） */
  getDbase(): Record<string, any> {
    const result: Record<string, any> = {};
    this.dbase.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  /** 批量加载 dbase（反序列化用） */
  setDbase(data: Record<string, any>): void {
    this.dbase.clear();
    for (const [key, value] of Object.entries(data)) {
      this.dbase.set(key, value);
    }
  }

  // ================================================================
  //  Environment 环境/容器 API
  // ================================================================

  /** 获取所在容器 */
  getEnvironment(): BaseEntity | null {
    return this._environment;
  }

  /** 获取直接子对象列表 */
  getInventory(): BaseEntity[] {
    return [...this._inventory];
  }

  /** 递归获取所有子对象 */
  getDeepInventory(): BaseEntity[] {
    const result: BaseEntity[] = [];
    for (const child of this._inventory) {
      result.push(child);
      result.push(...child.getDeepInventory());
    }
    return result;
  }

  /** 按条件搜索子对象 */
  findInInventory(
    predicate: (entity: BaseEntity) => boolean,
  ): BaseEntity | undefined {
    for (const child of this._inventory) {
      if (predicate(child)) return child;
    }
    return undefined;
  }

  /**
   * 移动到目标容器
   * @param dest 目标容器
   * @param opts quiet=true 静默移动，不触发事件链
   * @returns 是否移动成功
   */
  async moveTo(dest: BaseEntity, opts?: MoveOptions): Promise<boolean> {
    const quiet = opts?.quiet ?? false;
    const source = this._environment;

    if (!quiet) {
      // Step 1: pre:move — 自身确认
      const moveEvent = this.createCancellableEvent({
        who: this,
        source,
        dest,
      });
      this.emit(GameEvents.PRE_MOVE, moveEvent);
      if (moveEvent.cancelled) return false;

      // Step 2: pre:leave — 旧环境确认放行
      if (source) {
        const leaveEvent = this.createCancellableEvent({
          who: this,
          source,
          dest,
        });
        source.emit(GameEvents.PRE_LEAVE, leaveEvent);
        if (leaveEvent.cancelled) return false;
      }

      // Step 3: pre:receive — 新环境确认接收
      const receiveEvent = this.createCancellableEvent({
        who: this,
        source,
        dest,
      });
      dest.emit(GameEvents.PRE_RECEIVE, receiveEvent);
      if (receiveEvent.cancelled) return false;
    }

    // Step 4: 执行移动
    if (source) {
      source._inventory.delete(this);
    }
    this._environment = dest;
    dest._inventory.add(this);

    if (!quiet) {
      // Step 5: post:leave
      if (source) {
        source.emit(GameEvents.POST_LEAVE, { who: this, dest });
      }
      // Step 6: post:receive
      dest.emit(GameEvents.POST_RECEIVE, { who: this, source });
      // Step 7: post:move
      this.emit(GameEvents.POST_MOVE, { source, dest });
      // 触发 encounter（通知容器内其他对象）
      for (const obj of dest._inventory) {
        if (obj !== this) {
          obj.emit(GameEvents.ENCOUNTER, { who: this });
        }
      }
    }

    return true;
  }

  /** 销毁对象 */
  destroy(): void {
    if (this._destroyed) return;
    this._destroyed = true;

    // 1. 注销心跳
    this.disableHeartbeat();
    // 2. 清除延迟调用
    this.clearCallOuts();
    // 3. 处理 inventory
    this.handleInventoryOnDestroy();
    // 4. 从环境中移除
    if (this._environment) {
      this._environment._inventory.delete(this);
      this._environment = null;
    }
    // 5. 触发销毁事件
    this.emit(GameEvents.DESTROYED);
    // 6. 清除所有监听器
    this.removeAllListeners();
  }

  /**
   * 销毁时处理 inventory 子对象
   * 默认行为：内容物移到上层环境
   * 子类可覆写（如 Room 需要特殊处理玩家）
   */
  protected handleInventoryOnDestroy(): void {
    for (const child of [...this._inventory]) {
      if (this._environment) {
        child.moveTo(this._environment, { quiet: true });
      }
    }
  }

  // ================================================================
  //  Events 心跳 + 延迟调用 API
  // ================================================================

  /** 注册心跳 */
  enableHeartbeat(intervalMs: number): void {
    this.disableHeartbeat();
    this._heartbeatInterval = intervalMs;
    this._heartbeatTimer = setInterval(() => {
      this.onHeartbeat();
      this.emit(GameEvents.HEARTBEAT);
    }, intervalMs);
  }

  /** 注销心跳 */
  disableHeartbeat(): void {
    if (this._heartbeatTimer) {
      clearInterval(this._heartbeatTimer);
      this._heartbeatTimer = null;
      this._heartbeatInterval = 0;
    }
  }

  /** 心跳回调（子类覆写） */
  protected onHeartbeat(): void {}

  /** 延迟调用 */
  callOut(fn: () => void, delayMs: number): string {
    const id = `co_${++this._callOutCounter}`;
    const timer = setTimeout(() => {
      this._callOuts.delete(id);
      fn();
    }, delayMs);
    this._callOuts.set(id, timer);
    return id;
  }

  /** 取消延迟调用 */
  removeCallOut(id: string): void {
    const timer = this._callOuts.get(id);
    if (timer) {
      clearTimeout(timer);
      this._callOuts.delete(id);
    }
  }

  /** 清除所有延迟调用 */
  clearCallOuts(): void {
    for (const timer of this._callOuts.values()) {
      clearTimeout(timer);
    }
    this._callOuts.clear();
  }

  /** 获取心跳间隔 */
  getHeartbeatInterval(): number {
    return this._heartbeatInterval;
  }

  // ================================================================
  //  内部工具方法
  // ================================================================

  /** 创建可取消事件对象 */
  private createCancellableEvent<T extends Record<string, any>>(
    data: T,
  ): T & CancellableEvent {
    let _cancelled = false;
    return {
      ...data,
      get cancelled() {
        return _cancelled;
      },
      cancel() {
        _cancelled = true;
      },
    };
  }
}
