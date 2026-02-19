/**
 * 潮汐港·海风客栈 — 潮汐港
 * 坐标: (-1,1,0)
 * 盐渍木板客栈，船医秋棠在角落
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class EasternSeaHarborInn extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '潮汐港·海风客栈');
    this.set(
      'long',
      '用盐渍木板搭建的客栈，每块木料都被海盐腌得发黑，' +
        '散发着一股混合了鱼腥与酒气的独特气味。' +
        '房间低矮，床铺简陋，却是整个潮汐港最"安全"的地方，' +
        '因为老板不许在里面动手，违者逐出港口。' +
        '角落里，一个身材清瘦的女子坐在昏黄油灯下，' +
        '正用细针穿线，为面前坐着的海盗缝合一道触目惊心的伤口。' +
        '她动作平静而精准，仿佛这只是一件再寻常不过的事。' +
        '客栈的墙上挂着一幅褪色的海图，标注的都是礁石和暗流。',
    );
    this.set('coordinates', { x: -1, y: 1, z: 0 });
    this.set('exits', {
      east: 'area/eastern-sea/harbor-square',
    });
  }
}
