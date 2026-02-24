/**
 * 山路·猎户棚屋 — 蛮疆山路
 * 坐标: (0, 7, 0)
 * 苗人猎户搭建的临时棚屋，是山路上难得的歇脚处
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadNanjiangHunterShed extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '山路·猎户棚屋');
    this.set(
      'long',
      '乱石坡的尽头，靠着一块巨岩搭了一间简陋的棚屋，' +
        '用竹竿做骨架，蒲叶铺顶，三面透风，只有背岩的一面算是墙。' +
        '棚下铺着一张兽皮，旁边的火塘里还有未灭的灰烬，' +
        '几块熏得发黑的肉条挂在横梁上，散发着烟火和山椒的味道。' +
        '这是苗人猎户进山打猎时的落脚点，' +
        '过路的行旅也会在此歇脚，讨碗热水，打听前方山路的状况。',
    );
    this.set('coordinates', { x: 0, y: 7, z: 0 });
    this.set('exits', {
      north: 'area/road-nanjiang/rocky-slope',
      south: 'area/road-nanjiang/south-end',
    });
  }
}
