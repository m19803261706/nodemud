/**
 * 嵩阳宗·演武场
 * 坐标: (1, -5, 0)
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class SongyangDrillGround extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '嵩阳宗·演武场');
    this.set(
      'long',
      '演武场四角插着旧旗，地面被千百次步法磨得平整。石台旁立着一面铜锣，专为同门切磋鸣响。',
    );
    this.set('coordinates', { x: 1, y: -5, z: 0 });
    this.set('exits', {
      west: 'area/songyang/gate',
    });
  }
}
