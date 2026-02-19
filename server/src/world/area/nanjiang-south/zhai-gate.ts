/**
 * 雾岚寨·寨门 — 苗疆山寨入口
 * 坐标: (0, 0, 0)
 * 原木搭建的寨门，骨制风铃，哨兵警戒
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class NanjiangSouthZhaiGate extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '雾岚寨·寨门');
    this.set(
      'long',
      '粗大的原木横竖搭建成寨门，木头已经变得乌黑，不知道是年月侵蚀还是刻意熏烤。' +
        '门顶挂着一串骨制风铃，大小不一，形状各异，山风一吹，发出清脆而空灵的碰撞声。' +
        '门框两侧各站着一名苗疆哨兵，身着蜡染短衣，腰间挂着竹制短弩，' +
        '他们不开口说话，只是沉默地打量每一个到来的人，眼神中有一种根深蒂固的警惕。' +
        '寨门内可以听见生活的声音——说话声、柴火噼啪声、偶尔的笑声。',
    );
    this.set('coordinates', { x: 0, y: 0, z: 0 });
    this.set('exits', {
      north: 'area/road-nanjiang/south-end',
      south: 'area/nanjiang-south/zhai-square',
    });
  }
}
