/**
 * 雾岚寨·药棚 — 苗疆草药铺
 * 坐标: (1, 1, 0)
 * 竹棚草药铺，采集点：七彩蘑菇
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class NanjiangSouthHerbHut extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '雾岚寨·药棚');
    this.set(
      'long',
      '竹棚低矮而宽阔，屋顶用棕榈叶铺成，能挡雨却挡不住风。' +
        '横梁上吊挂着各种晒干的草药，有的已经辨不出原形，只剩一团干缩的枯黄；' +
        '有的颜色鲜艳，像是才采来不久，还带着山间的气息。' +
        '架子上摆着几个大肚罐子，罐口用厚布封着，偶尔可以听见里面细微的声响——' +
        '是活的蛊虫还是什么，不得而知。' +
        '角落的竹筐里堆着一些颜色斑斓的蘑菇，伞盖上有奇异的纹路，' +
        '是南疆山林中独有的七彩蘑菇，据说既能入药，也能入毒。',
    );
    this.set('coordinates', { x: 1, y: 1, z: 0 });
    this.set('exits', {
      west: 'area/nanjiang-south/zhai-square',
    });
  }
}
