/**
 * ExertEffectRegistry — 运功效果注册表（单例）
 *
 * 管理所有已注册的运功效果实例，提供按名称查找、获取全部和获取通用效果的方法。
 * 效果通过 @ExertEffect 装饰器自动注册。
 */
import type { ExertEffectBase } from './exert-effect-base';

export class ExertEffectRegistry {
  private static instance: ExertEffectRegistry;
  private effects: Map<string, ExertEffectBase> = new Map();

  /** 获取单例 */
  static getInstance(): ExertEffectRegistry {
    if (!ExertEffectRegistry.instance) {
      ExertEffectRegistry.instance = new ExertEffectRegistry();
    }
    return ExertEffectRegistry.instance;
  }

  /** 注册效果实例 */
  register(effect: ExertEffectBase): void {
    this.effects.set(effect.name, effect);
  }

  /** 按名称获取效果 */
  get(name: string): ExertEffectBase | undefined {
    return this.effects.get(name);
  }

  /** 获取全部已注册效果 */
  getAll(): ExertEffectBase[] {
    return Array.from(this.effects.values());
  }

  /** 获取所有通用效果（isUniversal === true） */
  getUniversal(): ExertEffectBase[] {
    return this.getAll().filter((e) => e.isUniversal);
  }
}
