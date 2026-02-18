/**
 * 嵩阳宗·静思堂
 * 坐标: (0, -7, 0)
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class SongyangMeditationRoom extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '嵩阳宗·静思堂');
    this.set(
      'long',
      '堂内只置蒲团与木鱼，墙上悬着“戒躁”二字。山风穿过竹帘，吹得烛火微晃，连呼吸都显得格外清楚。',
    );
    this.set('coordinates', { x: 0, y: -7, z: 0 });
    this.set('exits', {
      south: 'area/songyang/hall',
      north: 'area/songyang/practice-cliff',
    });
  }
}
