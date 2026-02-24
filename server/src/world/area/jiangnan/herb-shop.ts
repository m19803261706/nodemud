/**
 * 烟雨镇·济世药铺 — 百年老药铺
 * 坐标: (1, 3, 0)
 * 药香满屋，老药师坐堂问诊
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class JiangnanHerbShop extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '烟雨镇·济世药铺');
    this.set(
      'long',
      '药铺门口挂着一幅褪色的布幌，上书"济世堂"三字，下面缀着一串干葫芦。' +
        '推门而入，扑面而来的是浓郁的药材气息，甘草的甜、陈皮的酸、' +
        '当归的苦混合在一起，让人精神一振。' +
        '百子柜沿墙排了三面，每个小抽屉上都贴着药名，字迹工整。' +
        '柜台后面坐着一位白发老者，戴着老花镜看药方，' +
        '手边的铜秤用了几十年，秤杆被手汗沁成了深褐色。' +
        '角落里一只铜药罐正咕嘟咕嘟地煎着药，白汽袅袅升起。',
    );
    this.set('coordinates', { x: 1, y: 3, z: 0 });
    this.set('exits', {
      north: 'area/jiangnan/south-street',
      east: 'area/jiangnan/pawn-shop',
      west: 'area/jiangnan/escort-office',
      south: 'area/jiangnan/tavern',
    });
  }
}
