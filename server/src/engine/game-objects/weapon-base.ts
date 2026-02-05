/**
 * WeaponBase — 武器基类
 * 所有武器物品的基类，提供伤害、武器类型等属性访问
 */
import { ItemBase } from './item-base';

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

  /** 武器可装备 */
  override getActions(): string[] {
    return ['装备', ...super.getActions()];
  }
}
