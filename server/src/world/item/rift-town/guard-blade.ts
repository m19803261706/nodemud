/**
 * 制式长刀 — 承天朝卫兵佩刀
 * 精良品质，军用制式武器
 */
import { WeaponBase } from '../../../engine/game-objects/weapon-base';
import { ItemQuality } from '@packages/core';

export default class GuardBlade extends WeaponBase {
  static virtual = false;

  create() {
    this.set('name', '制式长刀');
    this.set('short', '一把制式长刀');
    this.set(
      'long',
      '一把承天朝制式长刀，刀身修长微弯，刃口锋利。刀柄缠着牛筋绳，握感扎实。' +
        '刀鞘上刻有承天朝的编号铭文，表明这是正规军械库发放的制式武器。',
    );
    this.set('type', 'weapon');
    this.set('damage', 20);
    this.set('weapon_type', 'blade');
    this.set('quality', ItemQuality.FINE);
    this.set('weight', 4);
    this.set('value', 150);
  }
}
