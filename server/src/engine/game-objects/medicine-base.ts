/**
 * MedicineBase — 药品基类
 * 所有药品物品的基类，提供治疗效果、使用次数等属性访问
 */
import { ItemBase } from './item-base';

export class MedicineBase extends ItemBase {
  static virtual = false;

  /** 获取 HP 治疗量 */
  getHealHp(): number {
    return this.get<number>('heal_hp') ?? 0;
  }

  /** 获取 MP 治疗量 */
  getHealMp(): number {
    return this.get<number>('heal_mp') ?? 0;
  }

  /** 获取使用次数 */
  getUseCount(): number {
    return this.get<number>('use_count') ?? 1;
  }

  /** 获取冷却时间（秒） */
  getCooldown(): number {
    return this.get<number>('cooldown') ?? 0;
  }

  /** 药品可使用 */
  override getActions(): string[] {
    return ['使用', ...super.getActions()];
  }
}
