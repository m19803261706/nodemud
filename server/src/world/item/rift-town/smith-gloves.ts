/**
 * 铁匠手套 — 厚实的工作手套
 * 防护铁屑和高温的手套
 */
import { ArmorBase } from '../../../engine/game-objects/armor-base';

export default class SmithGloves extends ArmorBase {
  static virtual = false;

  create() {
    this.set('name', '铁匠手套');
    this.set('short', '一双厚实的铁匠手套');
    this.set(
      'long',
      '一双用多层牛皮缝制的厚手套，掌心和指尖处额外加了一层硬皮。' +
        '手套上满是火星灼烧的小洞和铁锈污渍，但依然结实耐用，是铁匠打铁时的必备之物。',
    );
    this.set('type', 'armor');
    this.set('defense', 2);
    this.set('wear_position', 'hands');
    this.set('weight', 1);
    this.set('value', 15);
  }
}
