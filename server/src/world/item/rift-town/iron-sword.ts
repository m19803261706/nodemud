/**
 * 铁剑 — 铁匠铺常见武器
 * 普通铁质长剑，适合初学者使用
 */
import { WeaponBase } from '../../../engine/game-objects/weapon-base';

export default class IronSword extends WeaponBase {
  static virtual = false;

  create() {
    this.set('name', '铁剑');
    this.set('short', '一把普通的铁剑');
    this.set('long', '一把铁质长剑，剑身略有锈迹，但刃口依然锋利。普通铁匠所制，适合初学者使用。');
    this.set('type', 'weapon');
    this.set('damage', 15);
    this.set('weapon_type', 'sword');
    this.set('weight', 3);
    this.set('value', 50);
  }
}
