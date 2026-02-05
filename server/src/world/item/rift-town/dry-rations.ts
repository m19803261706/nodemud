/**
 * 干粮 — 客栈供应的食物
 * 行走江湖的基本口粮
 */
import { FoodBase } from '../../../engine/game-objects/food-base';

export default class DryRations extends FoodBase {
  static virtual = false;

  create() {
    this.set('name', '干粮');
    this.set('short', '一份干粮');
    this.set(
      'long',
      '用油纸包裹的干饼和肉脯，虽然谈不上美味，但能填饱肚子。行走江湖，这种干粮是必备之物。',
    );
    this.set('type', 'food');
    this.set('hunger_restore', 30);
    this.set('stackable', true);
    this.set('weight', 1);
    this.set('value', 5);
  }
}
