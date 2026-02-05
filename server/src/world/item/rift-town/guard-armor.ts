/**
 * 制式铁甲 — 承天朝军用铠甲
 * 精良品质，卫兵标准配置
 */
import { ArmorBase } from '../../../engine/game-objects/armor-base';
import { ItemQuality } from '@packages/core';

export default class GuardArmor extends ArmorBase {
  static virtual = false;

  create() {
    this.set('name', '制式铁甲');
    this.set('short', '一套承天朝制式铠甲');
    this.set(
      'long',
      '一套制式铁甲，甲片层叠有序，胸口铸有承天朝的日纹徽记。铠甲虽非上品，但做工规整，' +
        '每一片甲叶都经过严格的淬火处理，防护性能可靠。肩甲处有磨损的痕迹，显然是久经使用的军用品。',
    );
    this.set('type', 'armor');
    this.set('defense', 12);
    this.set('quality', ItemQuality.FINE);
    this.set('wear_position', 'body');
    this.set('weight', 8);
    this.set('value', 200);
  }
}
