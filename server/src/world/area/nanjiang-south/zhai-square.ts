/**
 * 雾岚寨·寨中空地 — 苗疆山寨中心广场
 * 坐标: (0, 1, 0)
 * 篝火、族人生活场景，寨主和少寨主在此活动
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class NanjiangSouthZhaiSquare extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '雾岚寨·寨中空地');
    this.set(
      'long',
      '空地中央燃着一堆低矮的篝火，火焰在山风里轻轻摇曳，橘红的光晕染在周围的木屋上。' +
        '几个族人围坐在篝火旁，手里编织着竹器，竹篾翻飞，动作娴熟，偶尔低声交谈几句，' +
        '用的是外人听不懂的苗语，节奏悠长，像是歌谣。' +
        '空气中混着草药的苦香和烟熏肉的咸香，是这里特有的气味。' +
        '东边有一座竹棚搭成的药铺，晾晒着各色草药。' +
        '南边是一条小路，通往寨子最深处的一棵古树。',
    );
    this.set('coordinates', { x: 0, y: 1, z: 0 });
    this.set('exits', {
      north: 'area/nanjiang-south/zhai-gate',
      east: 'area/nanjiang-south/herb-hut',
      south: 'area/nanjiang-south/spirit-tree',
    });
  }
}
