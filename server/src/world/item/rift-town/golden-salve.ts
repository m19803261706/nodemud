/**
 * 金疮药 — 药铺常备药品
 * 治疗外伤的基础药品
 */
import { MedicineBase } from '../../../engine/game-objects/medicine-base';

export default class GoldenSalve extends MedicineBase {
  static virtual = false;

  create() {
    this.set('name', '金疮药');
    this.set('short', '一瓶金疮药');
    this.set(
      'long',
      '一个小瓷瓶，里面装着褐色的药膏，散发着淡淡的药香。这是江湖中最常见的疗伤药物，涂抹在伤口上能快速止血消肿。',
    );
    this.set('type', 'medicine');
    this.set('heal_hp', 50);
    this.set('stackable', true);
    this.set('weight', 1);
    this.set('value', 20);
  }
}
