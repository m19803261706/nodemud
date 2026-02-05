/**
 * 铁匠围裙 — 铁匠的工作防具
 * 厚实耐高温的皮革围裙
 */
import { ArmorBase } from '../../../engine/game-objects/armor-base';

export default class SmithApron extends ArmorBase {
  static virtual = false;

  create() {
    this.set('name', '铁匠围裙');
    this.set('short', '一条厚实的铁匠围裙');
    this.set(
      'long',
      '一条用多层牛皮缝制的铁匠围裙，表面布满了火星灼烧的痕迹和铁锈的污渍。' +
        '围裙厚实耐用，能有效防护飞溅的铁屑和火花，是铁匠铺中不可或缺的装备。',
    );
    this.set('type', 'armor');
    this.set('defense', 4);
    this.set('wear_position', 'body');
    this.set('weight', 3);
    this.set('value', 40);
  }
}
