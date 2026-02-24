/**
 * 海路·海边栈道 — 海路·东海段
 * 坐标: (7,0,0)
 * 沿海架设的木质栈道，最后一段路通往潮汐港
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadEasternSeasideBoardwalk extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '海路·海边栈道');
    this.set(
      'long',
      '一条用厚木板铺成的栈道沿着海岸延伸，木板下面是嶙峋的礁石和浅滩。' +
        '栈道年久失修，有几块木板已经腐烂塌落，走在上面吱嘎作响，' +
        '需要小心避开那些摇摇欲坠的地方。' +
        '栈道一侧用粗绳拉着扶手，绳子上结满了白色的盐霜，摸上去粗糙刺手。' +
        '海水在脚下涌动，透过木板缝隙能看到碧绿的海水中游动的鱼影。' +
        '前方已能看到潮汐港的轮廓，港口的灯塔在雾中闪烁。',
    );
    this.set('coordinates', { x: 7, y: 0, z: 0 });
    this.set('exits', {
      west: 'area/road-eastern/fishing-village',
      east: 'area/road-eastern/reef-path',
    });
  }
}
