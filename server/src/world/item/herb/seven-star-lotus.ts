/**
 * 七星莲 — 溪畔湿地药草
 * 采集获取，可用于门派日常任务
 */
import { ItemBase } from '../../../engine/game-objects/item-base';

export default class SevenStarLotus extends ItemBase {
  static virtual = false;

  create() {
    this.set('name', '七星莲');
    this.set('short', '一株七星莲');
    this.set(
      'long',
      '叶面有七颗星状白斑，喜生于溪涧湿润之处。入药后清热解毒，是炼制解毒丹的常用材料。',
    );
    this.set('type', 'material');
    this.set('stackable', true);
    this.set('weight', 0);
    this.set('value', 8);
  }
}
