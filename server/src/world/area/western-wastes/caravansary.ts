/**
 * 黄沙驿·驿馆 — 旅人客栈
 * 坐标: (-1, -1, 0)
 * 丝路上最重要的歇脚处，各族旅人混居
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class WesternWastesCaravansary extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '黄沙驿·驿馆');
    this.set(
      'long',
      '半石半木搭成的二层驿馆，是方圆百里唯一像样的歇脚处。' +
        '一楼大厅摆着几张低矮的长桌，铺着毡毯，旅人盘腿而坐，' +
        '有的在吃饭，有的在喝茶，有的把头埋在臂弯里打盹。' +
        '空气中混合着羊肉的膻味、茶砖的苦香和远途旅人身上的汗酸味。' +
        '墙上钉着各国的地图和商路标记，有些已经年代久远，纸面泛黄卷边。' +
        '柜台后面站着客栈老板，一个粗壮的西域女人，嗓门大得整条街都听得到。',
    );
    this.set('coordinates', { x: -1, y: -1, z: 0 });
    this.set('exits', {
      south: 'area/western-wastes/bazaar',
      east: 'area/western-wastes/stable',
      west: 'area/western-wastes/kitchen',
      north: 'area/western-wastes/well',
      down: 'area/western-wastes/irrigation-canal',
    });
  }
}
