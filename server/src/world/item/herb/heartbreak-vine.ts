/**
 * 断肠藤 — 带毒性的攀岩药草
 * 采集获取，可用于门派日常任务
 */
import { ItemBase } from '../../../engine/game-objects/item-base';

export default class HeartbreakVine extends ItemBase {
  static virtual = false;

  create() {
    this.set('name', '断肠藤');
    this.set('short', '一截断肠藤');
    this.set(
      'long',
      '暗紫色的藤蔓，断口处渗出乳白汁液，有微毒。虽名字可怖，却是制毒和解毒的双用药材，在江湖中颇有价值。',
    );
    this.set('type', 'material');
    this.set('stackable', true);
    this.set('weight', 0);
    this.set('value', 10);
  }
}
