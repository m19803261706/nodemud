/**
 * 嵩阳宗·山门
 * 坐标: (0, -5, 0)
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class SongyangGate extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '嵩阳宗·山门');
    this.set(
      'long',
      '山门古木为梁，石匾上“嵩阳宗”三字笔意沉雄。门内戒律碑森然在侧，来客无不收敛心神。',
    );
    this.set('coordinates', { x: 0, y: -5, z: 0 });
    this.set('exits', {
      south: 'area/songyang/mountain-path',
      east: 'area/songyang/drill-ground',
      north: 'area/songyang/hall',
      west: 'area/songyang/disciples-yard',
    });
  }
}
