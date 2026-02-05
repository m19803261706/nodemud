/**
 * 军靴 — 制式军用靴
 * 卫兵标配，结实耐穿
 */
import { ArmorBase } from '../../../engine/game-objects/armor-base';

export default class MilitaryBoots extends ArmorBase {
  static virtual = false;

  create() {
    this.set('name', '军靴');
    this.set('short', '一双制式军靴');
    this.set(
      'long',
      '一双制式军靴，靴面用厚牛皮制成，鞋底钉有铁钉以防滑。靴筒高至小腿，' +
        '系带严密。虽然穿久了有些僵硬，但踏在碎石路上稳稳当当，是行军和站岗的可靠装备。',
    );
    this.set('type', 'armor');
    this.set('defense', 2);
    this.set('wear_position', 'feet');
    this.set('weight', 2);
    this.set('value', 30);
  }
}
