/**
 * 安神药囊 -- 任务物品
 * 白发药师托人送往断崖酒馆的药囊
 */
import { ItemBase } from '../../../engine/game-objects/item-base';

export default class HerbalSachet extends ItemBase {
  static virtual = false;

  create() {
    this.set('name', '安神药囊');
    this.set('short', '一只缀着青线的药囊');
    this.set(
      'long',
      '一只针脚细密的青布药囊，系口打着极规整的活结。' +
        '凑近时能闻到安神草、柏子仁与淡淡酒曲混在一起的气味，' +
        '像是给常年夜醒之人准备的方子。',
    );
    this.set('type', 'quest');
    this.set('weight', 0);
    this.set('value', 0);
    this.set('droppable', false);
    this.set('tradeable', false);
  }
}
