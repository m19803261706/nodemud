/**
 * 嵩阳山道
 * 坐标: (0, -4, 0)
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class SongyangMountainPath extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '嵩阳山道');
    this.set(
      'long',
      '石阶沿山脊盘旋而上，松风穿林，钟声隐隐。回首南方，裂隙镇的屋脊已沉在山雾里。',
    );
    this.set('coordinates', { x: 0, y: -4, z: 0 });
    this.set('exits', {
      south: 'area/rift-town/north-gate',
      north: 'area/songyang/gate',
    });
  }
}
