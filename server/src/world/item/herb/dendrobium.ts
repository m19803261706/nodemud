/**
 * 石斛 — 攀附岩石生长的药草
 * 采集获取，可用于门派日常任务
 */
import { ItemBase } from '../../../engine/game-objects/item-base';

export default class Dendrobium extends ItemBase {
  static virtual = false;

  create() {
    this.set('name', '石斛');
    this.set('short', '一株石斛');
    this.set(
      'long',
      '常攀附在山石和古木上，茎节肥厚，叶片翠绿。晒干后是上好的滋补药材，江湖中常用来调配丹药底料。',
    );
    this.set('type', 'material');
    this.set('stackable', true);
    this.set('weight', 0);
    this.set('value', 5);
  }
}
