/**
 * 嵩阳宗·议事堂
 * 坐标: (0, -6, 0)
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class SongyangHall extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '嵩阳宗·议事堂');
    this.set(
      'long',
      '堂中青砖铺地，香烟淡淡。正中挂着“守正笃行”四字匾额，左右两列案几记着门中功过与贡献。',
    );
    this.set('coordinates', { x: 0, y: -6, z: 0 });
    this.set('exits', {
      south: 'area/songyang/gate',
      west: 'area/songyang/scripture-pavilion',
      east: 'area/songyang/deacon-court',
      north: 'area/songyang/meditation-room',
    });
  }
}
