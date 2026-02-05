/**
 * 药师布衫 — 药师的素色衣衫
 * 透着淡淡药香的布衫
 */
import { ArmorBase } from '../../../engine/game-objects/armor-base';

export default class HerbShirt extends ArmorBase {
  static virtual = false;

  create() {
    this.set('name', '药师布衫');
    this.set('short', '一件素色布衫');
    this.set(
      'long',
      '一件素色的细布衫子，面料柔软透气，适合长时间穿着。衣襟和袖口处绣有几朵小小的草药纹样，' +
        '衫子上还残留着淡淡的药草清香，显然是药师日常穿着的衣物。',
    );
    this.set('type', 'armor');
    this.set('defense', 3);
    this.set('wear_position', 'body');
    this.set('weight', 1);
    this.set('value', 35);
  }
}
