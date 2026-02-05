/**
 * 牛皮腰带 — 基础腰部防具
 * 结实的牛皮腰带，可挂物品
 */
import { ArmorBase } from '../../../engine/game-objects/armor-base';

export default class LeatherBelt extends ArmorBase {
  static virtual = false;

  create() {
    this.set('name', '牛皮腰带');
    this.set('short', '一条牛皮腰带');
    this.set(
      'long',
      '一条宽厚的牛皮腰带，带扣是铜制的，已经被磨得发亮。腰带上打了几个挂孔，' +
        '可以悬挂刀鞘或荷包。皮面虽有些许裂纹，但依然结实耐用。',
    );
    this.set('type', 'armor');
    this.set('defense', 1);
    this.set('wear_position', 'waist');
    this.set('weight', 1);
    this.set('value', 15);
  }
}
