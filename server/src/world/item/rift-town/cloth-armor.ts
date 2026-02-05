/**
 * 布衣 — 杂货铺出售的基础防具
 * 普通的粗布衣裳，略有防护效果
 */
import { ArmorBase } from '../../../engine/game-objects/armor-base';

export default class ClothArmor extends ArmorBase {
  static virtual = false;

  create() {
    this.set('name', '布衣');
    this.set('short', '一件粗布衣裳');
    this.set(
      'long',
      '一件用粗麻布缝制的衣裳，做工虽然粗糙，但穿着还算舒适。能挡些风寒，至于防护……聊胜于无吧。',
    );
    this.set('type', 'armor');
    this.set('defense', 5);
    this.set('wear_position', 'body');
    this.set('weight', 2);
    this.set('value', 30);
  }
}
