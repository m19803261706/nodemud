/**
 * 铁盔 — 卫兵标配头部防具
 * 生铁打制，做工粗糙但实用
 */
import { ArmorBase } from '../../../engine/game-objects/armor-base';

export default class IronHelmet extends ArmorBase {
  static virtual = false;

  create() {
    this.set('name', '铁盔');
    this.set('short', '一顶铁制头盔');
    this.set(
      'long',
      '一顶用生铁打制的头盔，虽然做工粗糙，但足以挡住一般的劈砍。盔沿处有几道划痕，显然经历过战斗的洗礼。',
    );
    this.set('type', 'armor');
    this.set('defense', 3);
    this.set('wear_position', 'head');
    this.set('weight', 2);
    this.set('value', 25);
  }
}
