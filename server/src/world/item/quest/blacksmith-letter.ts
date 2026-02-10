/**
 * 铁匠的信 -- 任务物品
 * 老周铁匠托你带给白发药师的一封信
 */
import { ItemBase } from '../../../engine/game-objects/item-base';

export default class BlacksmithLetter extends ItemBase {
  static virtual = false;

  create() {
    this.set('name', '铁匠的信');
    this.set('short', '一封用油纸包好的信');
    this.set(
      'long',
      '一封用厚实油纸仔细包好的信，封口处滴了一团粗糙的火漆。' +
        '信封上用炭笔歪歪扭扭地写着"药师亲启"四个字，' +
        '看得出写信的人并不擅长笔墨。信里似乎夹着什么东西，摸起来硬硬的。',
    );
    this.set('type', 'quest');
    this.set('weight', 0);
    this.set('value', 0);
    this.set('droppable', false);
    this.set('tradeable', false);
  }
}
