/**
 * 潮汐港·破旧灯塔 — 海港制高点
 * 坐标: (1, -1, 0)
 * 年久失修的灯塔，是瞭望与密谋之所
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class EasternSeaLighthouse extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '潮汐港·破旧灯塔');
    this.set(
      'long',
      '一座石砌灯塔孤零零地矗立在礁石上，塔身长满了藤壶和海苔，' +
        '外墙的石灰早已被海风剥蚀殆尽，露出里面灰黑的条石。' +
        '灯塔顶部的铜灯已经锈死，很久没有人点亮过了——' +
        '在这个港口，黑暗比光明更受欢迎。' +
        '塔基处有人搭了个简易的棚子，棚里放着几只装满淡水的木桶，' +
        '和一张被盐渍浸透的旧海图。' +
        '站在塔前，能看到整个港湾的全貌：' +
        '远处的船帆，近处的码头，以及那些在阴影中穿行的可疑身影。',
    );
    this.set('coordinates', { x: 1, y: -1, z: 0 });
    this.set('exits', {
      south: 'area/eastern-sea/shipyard',
    });
  }
}
