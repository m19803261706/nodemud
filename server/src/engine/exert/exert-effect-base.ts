/**
 * ExertEffectBase — 运功效果抽象基类
 *
 * 所有运功效果（recover/heal/regenerate/shield/powerup）的共同基类。
 * 定义效果的名称、属性、执行方法和描述方法。
 *
 * 配合 @ExertEffect 装饰器自动注册到 ExertEffectRegistry。
 */
import type { PlayerBase } from '../game-objects/player-base';

/** 运功效果执行结果（不含 effectName/displayName，由命令层补充） */
export interface ExertExecuteResult {
  success: boolean;
  /** 富文本结果描述 */
  message: string;
  /** 是否引发资源变化 */
  resourceChanged: boolean;
  /** buff 应用信息 */
  buffApplied?: { name: string; duration: number; bonuses: Record<string, number> };
  /** 移除的 buff 名 */
  buffRemoved?: string;
  /** 是否开始持续疗伤 */
  healingStarted?: boolean;
  /** 是否停止持续疗伤 */
  healingStopped?: boolean;
}

/** 运功效果抽象基类 */
export abstract class ExertEffectBase {
  /** 效果标识（如 'recover'） */
  abstract readonly name: string;
  /** 效果中文名（如 '调匀气息'） */
  abstract readonly displayName: string;
  /** 是否通用效果（所有内功共享） */
  abstract readonly isUniversal: boolean;
  /** 是否可在战斗中使用 */
  abstract readonly canUseInCombat: boolean;

  /**
   * 执行运功效果
   * @param player 玩家实例
   * @param forceSkillId 激活内功的技能 ID
   * @param forceLevel 内功等级
   * @param target 可选目标参数
   */
  abstract execute(
    player: PlayerBase,
    forceSkillId: string,
    forceLevel: number,
    target?: string,
  ): ExertExecuteResult;

  /** 获取效果描述（列表展示用） */
  abstract getDescription(): string;
}

/**
 * @ExertEffect 装饰器
 * 自动实例化效果并注册到 ExertEffectRegistry
 */
export function ExertEffect() {
  return function <T extends { new (...args: any[]): ExertEffectBase }>(constructor: T) {
    // 延迟导入避免循环依赖
    const { ExertEffectRegistry } = require('./exert-effect-registry');
    const instance = new constructor();
    ExertEffectRegistry.getInstance().register(instance);
    return constructor;
  };
}
