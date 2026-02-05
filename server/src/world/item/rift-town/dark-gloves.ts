/**
 * 黑手套 — 神秘旅人的皮手套
 * 精良品质，轻薄贴合
 */
import { ArmorBase } from '../../../engine/game-objects/armor-base';
import { ItemQuality } from '@packages/core';

export default class DarkGloves extends ArmorBase {
  static virtual = false;

  create() {
    this.set('name', '黑手套');
    this.set('short', '一双黑色皮手套');
    this.set(
      'long',
      '一双裁剪精细的黑色皮手套，手套薄而贴合，丝毫不影响手指的灵活性。' +
        '掌心处经过特殊处理，增加了摩擦力，适合握持武器。手背处隐约可见几道细密的加固缝线。',
    );
    this.set('type', 'armor');
    this.set('defense', 2);
    this.set('quality', ItemQuality.FINE);
    this.set('wear_position', 'hands');
    this.set('weight', 1);
    this.set('value', 80);
  }
}
