/**
 * 破麻衣 — 乞丐的破烂衣物
 * 凡品，几乎没有防护
 */
import { ArmorBase } from '../../../engine/game-objects/armor-base';

export default class TornRags extends ArmorBase {
  static virtual = false;

  create() {
    this.set('name', '破麻衣');
    this.set('short', '一件破烂不堪的麻衣');
    this.set(
      'long',
      '一件破烂不堪的粗麻衣裳，上面满是补丁和破洞，散发着一股经年累月的酸腐气味。' +
        '虽然已经看不出原来的颜色，但勉强还能遮体御寒。',
    );
    this.set('type', 'armor');
    this.set('defense', 1);
    this.set('wear_position', 'body');
    this.set('weight', 1);
    this.set('value', 2);
  }
}
