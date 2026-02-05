/**
 * 小包裹 — 杂货铺出售的容器
 * 可以装一些随身小物件
 */
import { ContainerBase } from '../../../engine/game-objects/container-base';

export default class SmallPouch extends ContainerBase {
  static virtual = false;

  create() {
    this.set('name', '小包裹');
    this.set('short', '一个小布包');
    this.set(
      'long',
      '一个用粗布缝制的小包裹，上面系着一根麻绳，可以挂在腰间或背在身上。容量不大，但放些零碎小物件倒也够用。',
    );
    this.set('type', 'container');
    this.set('capacity', 5);
    this.set('weight', 1);
    this.set('value', 15);
  }
}
