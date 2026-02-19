/**
 * 官道·黄土路 — 官道中原段
 * 坐标: (0, 1, 0)
 * 野怪房，官道盗匪出没
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadCentralDustyRoad extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '官道·黄土路');
    this.set(
      'long',
      '黄土漫天飞扬，远处几棵枯槐斜立在路边，树冠被常年风吹得偏向一侧。' +
        '路旁有一处歇脚的石墩，据说是早年信使驿站的遗迹，石面上刻满了过客的名字。' +
        '偶尔有零散商贩在路边兜售干粮，警惕地打量每一个经过的陌生人。' +
        '据说这段路是盗匪最猖獗的地方，天黑后更要小心。',
    );
    this.set('coordinates', { x: 0, y: 1, z: 0 });
    this.set('exits', {
      north: 'area/road-central/north-end',
      south: 'area/road-central/old-bridge',
    });
  }
}
