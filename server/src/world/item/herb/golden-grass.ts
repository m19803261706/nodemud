/**
 * 金线草 — 常见山野药草
 * 采集获取，可用于门派日常任务
 */
import { ItemBase } from '../../../engine/game-objects/item-base';

export default class GoldenGrass extends ItemBase {
  static virtual = false;

  create() {
    this.set('name', '金线草');
    this.set('short', '一株金线草');
    this.set(
      'long',
      '细长的茎叶上有一道金色纹路，是山间最常见的药草之一。虽然不算珍贵，但用途广泛，药铺里常年收购。',
    );
    this.set('type', 'material');
    this.set('stackable', true);
    this.set('weight', 0);
    this.set('value', 3);
  }
}
