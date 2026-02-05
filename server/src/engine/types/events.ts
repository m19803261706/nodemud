/**
 * 标准事件名常量
 * 定义游戏引擎中所有标准事件的名称
 */
export const GameEvents = {
  // 环境事件
  PRE_MOVE: 'pre:move',
  POST_MOVE: 'post:move',
  PRE_RECEIVE: 'pre:receive',
  POST_RECEIVE: 'post:receive',
  PRE_LEAVE: 'pre:leave',
  POST_LEAVE: 'post:leave',
  ENCOUNTER: 'encounter',

  // 生命周期
  CREATED: 'created',
  DESTROYED: 'destroyed',
  HEARTBEAT: 'heartbeat',
  RESET: 'reset',

  // 交互
  LOOK: 'look',
  GET: 'get',
  DROP: 'drop',
  USE: 'use',

  // 通信
  MESSAGE: 'message',
  SAY: 'say',

  // 战斗事件
  COMBAT_START: 'combat_start',
  COMBAT_END: 'combat_end',
  PRE_ATTACK: 'pre_attack',
  POST_ATTACK: 'post_attack',
  DEATH: 'death',
} as const;

/** 事件名类型 */
export type GameEventName = (typeof GameEvents)[keyof typeof GameEvents];

/**
 * 可取消事件的参数接口
 * 用于 pre: 系列事件，允许处理器阻止后续行为
 */
export interface CancellableEvent {
  /** 调用此方法阻止行为 */
  cancel(): void;
  /** 是否已被取消 */
  cancelled: boolean;
}

// 注意: MoveEvent 和 ContainerEvent 需要引用 BaseEntity
// 但 BaseEntity 尚未创建，这里先用前置声明方式
// 在 base-entity.ts 中会直接使用 CancellableEvent

/** 移动事件参数（泛型，避免循环依赖） */
export interface MoveEventData {
  /** 移动的对象 */
  who: any;
  /** 来源容器（首次放置时为 null） */
  source: any | null;
  /** 目标容器 */
  dest: any;
}

/** 容器事件参数 */
export interface ContainerEventData {
  /** 进入/离开的对象 */
  who: any;
  /** 来源容器 */
  source?: any | null;
  /** 目标容器 */
  dest?: any;
}
