/**
 * 短刀 — 轻型近战武器
 * 凡品，灵活但杀伤有限
 */
import { WeaponBase } from '../../../engine/game-objects/weapon-base';

export default class ShortKnife extends WeaponBase {
  static virtual = false;

  create() {
    this.set('name', '短刀');
    this.set('short', '一把短刀');
    this.set(
      'long',
      '一把尺余长的短刀，刀身厚实，适合劈砍和近身搏斗。刀柄包着一层粗糙的麻布，' +
        '虽不起眼，但在近战中十分趁手。刀鞘简单朴素，挂在腰间不引人注目。',
    );
    this.set('type', 'weapon');
    this.set('damage', 12);
    this.set('weapon_type', 'dagger');
    this.set('weight', 1);
    this.set('value', 40);
  }
}
