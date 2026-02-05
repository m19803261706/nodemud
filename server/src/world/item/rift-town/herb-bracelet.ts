/**
 * 药囊手环 — 药师的灵力护腕
 * 精良品质，附带灵力加成
 */
import { ArmorBase } from '../../../engine/game-objects/armor-base';
import { ItemQuality } from '@packages/core';

export default class HerbBracelet extends ArmorBase {
  static virtual = false;

  create() {
    this.set('name', '药囊手环');
    this.set('short', '一只系着药囊的手环');
    this.set(
      'long',
      '一只用药草编织而成的手环，上面系着一个精巧的小药囊，散发着沁人的药草清香。' +
        '据说药囊中封存着特殊的灵草精华，佩戴时能微微提振精神，对修炼者颇有裨益。',
    );
    this.set('type', 'armor');
    this.set('defense', 1);
    this.set('quality', ItemQuality.FINE);
    this.set('wear_position', 'wrist');
    this.set('weight', 0);
    this.set('value', 60);
    this.set('attribute_bonus', { spirit: 3 });
  }
}
