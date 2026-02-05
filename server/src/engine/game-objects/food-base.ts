/**
 * FoodBase — 食物基类
 * 所有食物物品的基类，提供饱食度、解渴度、增益效果等属性访问
 */
import { ItemBase } from './item-base';

export class FoodBase extends ItemBase {
  static virtual = false;

  /** 获取饱食度恢复量 */
  getHungerRestore(): number {
    return this.get<number>('hunger_restore') ?? 0;
  }

  /** 获取解渴度恢复量 */
  getThirstRestore(): number {
    return this.get<number>('thirst_restore') ?? 0;
  }

  /** 获取增益类型 */
  getBuffType(): string {
    return this.get<string>('buff_type') ?? '';
  }

  /** 获取增益持续时间（秒） */
  getBuffDuration(): number {
    return this.get<number>('buff_duration') ?? 0;
  }

  /** 食物可使用 */
  override getActions(): string[] {
    return ['使用', ...super.getActions()];
  }
}
