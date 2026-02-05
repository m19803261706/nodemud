/**
 * 黑衣 — 神秘旅人的劲装
 * 稀有品质，轻便而坚韧
 */
import { ArmorBase } from '../../../engine/game-objects/armor-base';
import { ItemQuality } from '@packages/core';

export default class DarkRobe extends ArmorBase {
  static virtual = false;

  create() {
    this.set('name', '黑衣');
    this.set('short', '一件黑色劲装');
    this.set(
      'long',
      '一件裁剪合体的黑色劲装，面料看似普通，触手却感觉异常坚韧。衣料上隐约可见细密的纹路，' +
        '似乎经过某种特殊处理。穿上后行动自如，丝毫不影响身法施展，显然出自高明裁缝之手。',
    );
    this.set('type', 'armor');
    this.set('defense', 6);
    this.set('quality', ItemQuality.RARE);
    this.set('wear_position', 'body');
    this.set('weight', 2);
    this.set('value', 300);
  }
}
