/**
 * 皮帽 — 轻型头部防具
 * 皮质帽子，轻便灵活
 */
import { ArmorBase } from '../../../engine/game-objects/armor-base';

export default class LeatherCap extends ArmorBase {
  static virtual = false;

  create() {
    this.set('name', '皮帽');
    this.set('short', '一顶皮质帽子');
    this.set(
      'long',
      '一顶用硝制皮革缝制的帽子，轻便合头，帽檐略微下弯，能遮挡些许风雨。帽沿缝有一圈细密的走线。',
    );
    this.set('type', 'armor');
    this.set('defense', 1);
    this.set('wear_position', 'head');
    this.set('weight', 1);
    this.set('value', 10);
  }
}
