/**
 * 铁锤 — 铁匠的锻造工具
 * 精良品质，既是工具也是武器
 */
import { WeaponBase } from '../../../engine/game-objects/weapon-base';
import { ItemQuality } from '@packages/core';

export default class SmithHammer extends WeaponBase {
  static virtual = false;

  create() {
    this.set('name', '铁锤');
    this.set('short', '一把沉重的铁锤');
    this.set(
      'long',
      '一把铁匠专用的锻造铁锤，锤头由精铁浇铸，分量十足。锤柄是上好的硬木，' +
        '被汗水浸润得油光发亮。这把锤子跟随铁匠多年，每一锤都能精准地落在该落的位置。' +
        '若用来作战，一锤下去恐怕能砸碎铁甲。',
    );
    this.set('type', 'weapon');
    this.set('damage', 18);
    this.set('weapon_type', 'hammer');
    this.set('quality', ItemQuality.FINE);
    this.set('weight', 5);
    this.set('value', 100);
  }
}
