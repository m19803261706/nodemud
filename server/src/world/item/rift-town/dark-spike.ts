/**
 * 暗刺 — 神秘旅人的匕首
 * 稀有品质，锋利无比
 */
import { WeaponBase } from '../../../engine/game-objects/weapon-base';
import { ItemQuality } from '@packages/core';

export default class DarkSpike extends WeaponBase {
  static virtual = false;

  create() {
    this.set('name', '暗刺');
    this.set('short', '一把漆黑的匕首');
    this.set(
      'long',
      '一把通体漆黑的匕首，刃身狭长如蛇信，不反射任何光线。握柄处嵌着一颗暗红色的小珠，' +
        '触手微温。刀刃锋利得近乎诡异，轻轻划过空气似乎都能听到嘶嘶声。来历绝非寻常之物。',
    );
    this.set('type', 'weapon');
    this.set('damage', 25);
    this.set('weapon_type', 'dagger');
    this.set('quality', ItemQuality.RARE);
    this.set('weight', 1);
    this.set('value', 400);
  }
}
