/**
 * 嵩阳宗·兵械库
 * 坐标: (2, -5, 0)
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class SongyangArmory extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '嵩阳宗·兵械库');
    this.set(
      'long',
      '木架上陈列着制式长剑与木刀，墙角挂着磨到发亮的护臂。铁器气味夹着桐油香，像一段未出鞘的沉默。',
    );
    this.set('coordinates', { x: 2, y: -5, z: 0 });
    this.set('exits', {
      west: 'area/songyang/drill-ground',
    });
  }
}
