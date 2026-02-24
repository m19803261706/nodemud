/**
 * 黄沙驿·废弃营地 — 沙匪遗留的据点
 * 坐标: (0, -3, 0)
 * 沙漠中被遗弃的营地，现在是沙匪出没的危险区域
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class WesternWastesAbandonedCamp extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '黄沙驿·废弃营地');
    this.set(
      'long',
      '沙丘之间的一片洼地，散落着倒塌的帐篷残骸和半埋在沙里的木桩。' +
        '看痕迹，这里曾经是一支驼队或者军队的扎营地，但已经废弃很久了。' +
        '帐篷的破布在风中啪啪作响，像是在向经过的人挥手示警。' +
        '地上有新鲜的脚印和马蹄印，方向杂乱，不像是正经的商队路线。' +
        '一些骨头和碎陶片半露在沙面上，不知是人还是牲畜的。' +
        '空气中有一股淡淡的腐败气味，被干燥的风吹散后若有若无。' +
        '这里是驿站地界之外的灰色地带，没有人管，也没有人愿意管。',
    );
    this.set('coordinates', { x: 0, y: -3, z: 0 });
    this.set('exits', {
      south: 'area/western-wastes/dune-lookout',
      west: 'area/western-wastes/sand-cave',
    });
  }
}
