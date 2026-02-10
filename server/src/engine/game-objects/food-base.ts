/**
 * FoodBase — 食物基类
 * 所有食物物品的基类，提供饱食度、解渴度、增益效果等属性访问
 */
import type { LivingBase } from './living-base';
import { ItemBase, type ItemActionDefinition } from './item-base';
import type { IUsableItem, UseOption, UseResult } from './usable-item';

export class FoodBase extends ItemBase implements IUsableItem {
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

  /** 食物使用选项（可覆写） */
  getUseOptions(_user?: LivingBase): UseOption[] {
    return [{ key: 'eat', label: '食用' }];
  }

  /** 食物使用逻辑（可覆写） */
  use(user: LivingBase, optionKey = 'eat'): UseResult {
    if (optionKey !== 'eat') {
      return {
        success: false,
        message: `${this.getName()}没有这种食用方式。`,
      };
    }

    const hunger = this.getHungerRestore();
    const thirst = this.getThirstRestore();
    const healHp = this.get<number>('heal_hp') ?? 0;
    const healMp = this.get<number>('heal_mp') ?? 0;

    if (hunger > 0) user.add('food', hunger);
    if (thirst > 0) user.add('water', thirst);
    const hpRecovered = healHp > 0 ? user.recoverHp(healHp) : 0;
    const mpRecovered = healMp > 0 ? user.recoverMp(healMp) : 0;

    const effects: string[] = [];
    if (hunger > 0) effects.push(`饱食度 +${hunger}`);
    if (thirst > 0) effects.push(`水分 +${thirst}`);
    if (hpRecovered > 0) effects.push(`恢复气血 ${hpRecovered}`);
    if (mpRecovered > 0) effects.push(`恢复内力 ${mpRecovered}`);
    if (effects.length === 0) {
      effects.push('感觉稍微好了一些');
    }

    const buffType = this.getBuffType();
    const buffDuration = this.getBuffDuration();
    if (buffType && buffDuration > 0) {
      // 暂存一个轻量 Buff 标记，后续 Buff 系统可直接读取
      user.setTemp(`buffs/${buffType}`, { duration: buffDuration, source: this.id });
      effects.push(`获得 ${buffType} 效果(${buffDuration}s)`);
    }

    return {
      success: true,
      message: `你食用了${this.getName()}，${effects.join('，')}。`,
      consume: this.get<boolean>('consume_on_use') ?? true,
      resourceChanged: hpRecovered > 0 || mpRecovered > 0,
      data: { optionKey, hunger, thirst, hpRecovered, mpRecovered, buffType, buffDuration },
    };
  }

  /** 食物动作定义 */
  override getActionDefinitions(owner?: LivingBase): ItemActionDefinition[] {
    const useActions = this.getUseOptions(owner).map((option) => ({
      label: option.label,
      command:
        option.key === 'eat' ? `use ${this.getName()}` : `use ${this.getName()} ${option.key}`,
    }));
    return [...useActions, ...super.getActionDefinitions(owner)];
  }
}
