/**
 * MedicineBase — 药品基类
 * 所有药品物品的基类，提供治疗效果、使用次数等属性访问
 */
import type { LivingBase } from './living-base';
import { ItemBase, type ItemActionDefinition } from './item-base';
import type { IUsableItem, UseOption, UseResult } from './usable-item';

export class MedicineBase extends ItemBase implements IUsableItem {
  static virtual = false;

  /** 获取 HP 治疗量 */
  getHealHp(): number {
    return this.get<number>('heal_hp') ?? 0;
  }

  /** 获取 MP 治疗量 */
  getHealMp(): number {
    return this.get<number>('heal_mp') ?? 0;
  }

  /** 获取精力治疗量 */
  getHealEnergy(): number {
    return this.get<number>('heal_energy') ?? 0;
  }

  /** 获取使用次数 */
  getUseCount(): number {
    return this.get<number>('use_count') ?? 1;
  }

  /** 获取冷却时间（秒） */
  getCooldown(): number {
    return this.get<number>('cooldown') ?? 0;
  }

  /** 使用选项（可由子类覆写为多按钮模式） */
  getUseOptions(_user?: LivingBase): UseOption[] {
    return [{ key: 'default', label: '使用' }];
  }

  /** 默认使用逻辑（可由子类覆写） */
  use(user: LivingBase, optionKey = 'default'): UseResult {
    if (optionKey !== 'default') {
      return {
        success: false,
        message: `${this.getName()}没有这种使用方式。`,
      };
    }

    const healHp = this.getHealHp();
    const healMp = this.getHealMp();
    const healEnergy = this.getHealEnergy();
    const hpRecovered = healHp > 0 ? user.recoverHp(healHp) : 0;
    const mpRecovered = healMp > 0 ? user.recoverMp(healMp) : 0;
    const energyRecovered = healEnergy > 0 ? user.recoverEnergy(healEnergy) : 0;

    const effects: string[] = [];
    if (hpRecovered > 0) effects.push(`恢复了 ${hpRecovered} 点气血`);
    if (mpRecovered > 0) effects.push(`恢复了 ${mpRecovered} 点内力`);
    if (energyRecovered > 0) effects.push(`恢复了 ${energyRecovered} 点精力`);

    if (effects.length === 0) {
      return {
        success: false,
        message: `${this.getName()}对你现在没有效果。`,
      };
    }

    return {
      success: true,
      message: `你使用了${this.getName()}，${effects.join('，')}。`,
      consume: this.get<boolean>('consume_on_use') ?? true,
      resourceChanged: hpRecovered > 0 || mpRecovered > 0 || energyRecovered > 0,
      data: { hpRecovered, mpRecovered, energyRecovered, optionKey },
    };
  }

  /** 药品动作定义（按钮文案 + 指令） */
  override getActionDefinitions(owner?: LivingBase): ItemActionDefinition[] {
    const useActions = this.getUseOptions(owner).map((option) => ({
      label: option.label,
      command:
        option.key === 'default' ? `use ${this.getName()}` : `use ${this.getName()} ${option.key}`,
    }));
    return [...useActions, ...super.getActionDefinitions(owner)];
  }
}
