/**
 * 铁臂甲 — 卫兵手部防具
 * 铁制臂甲，防护前臂
 */
import { ArmorBase } from '../../../engine/game-objects/armor-base';

export default class IronVambrace extends ArmorBase {
  static virtual = false;

  create() {
    this.set('name', '铁臂甲');
    this.set('short', '一副铁制臂甲');
    this.set(
      'long',
      '一副用铁片铆接而成的臂甲，覆盖从手腕到肘部的前臂。铁片表面打磨得较为平整，' +
        '内衬了一层粗布以减少磨损。虽非精品，但能有效防护刀剑的劈砍。',
    );
    this.set('type', 'armor');
    this.set('defense', 2);
    this.set('wear_position', 'hands');
    this.set('weight', 1);
    this.set('value', 20);
  }
}
