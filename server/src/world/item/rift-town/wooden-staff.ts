/**
 * 木棍 — 路边随处可见的武器
 * 一根结实的木棍，聊胜于无
 */
import { WeaponBase } from '../../../engine/game-objects/weapon-base';

export default class WoodenStaff extends WeaponBase {
  static virtual = false;

  create() {
    this.set('name', '木棍');
    this.set('short', '一根结实的木棍');
    this.set(
      'long',
      '一根手臂粗细的硬木棍，表面被磨得光滑，握在手中倒也趁手。虽然谈不上什么武器，但用来防身绰绰有余。',
    );
    this.set('type', 'weapon');
    this.set('damage', 5);
    this.set('weapon_type', 'staff');
    this.set('weight', 2);
    this.set('value', 10);
  }
}
