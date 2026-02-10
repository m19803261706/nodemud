/**
 * WeaponBase — 武器基类
 * 所有武器物品的基类，提供伤害、武器类型等属性访问
 */
import { parseRawBonus, type EquipmentBonus } from '@packages/core';
import type { LivingBase } from './living-base';
import { ItemBase, type ItemActionDefinition } from './item-base';

export class WeaponBase extends ItemBase {
  static virtual = false;

  /** 获取武器伤害 */
  getDamage(): number {
    return this.get<number>('damage') ?? 0;
  }

  /** 获取武器类型（sword/blade/spear/staff 等） */
  getWeaponType(): string {
    return this.get<string>('weapon_type') ?? 'fist';
  }

  /** 是否双手武器 */
  isTwoHanded(): boolean {
    return this.get<boolean>('two_handed') ?? false;
  }

  /** 获取属性加成（武器伤害自动进入 combat.attack） */
  getAttributeBonus(): EquipmentBonus {
    const raw = this.get<Record<string, number>>('attribute_bonus') ?? {};
    const bonus = parseRawBonus(raw);
    const damage = this.getDamage();
    if (damage > 0) {
      bonus.combat = bonus.combat ?? {};
      bonus.combat.attack = (bonus.combat.attack ?? 0) + damage;
    }
    return bonus;
  }

  /** 武器动作定义 */
  override getActionDefinitions(owner?: LivingBase): ItemActionDefinition[] {
    return [{ label: '装备', command: `wield ${this.getName()}` }, ...super.getActionDefinitions(owner)];
  }
}
