/**
 * 嵩阳宗·弟子院
 * 坐标: (-1, -5, 0)
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class SongyangDisciplesYard extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '嵩阳宗·弟子院');
    this.set(
      'long',
      '院中青砖平整，木架上晾着练功衫。几名年轻弟子低声背诵门规，见你经过便收声抱拳，神情里尽是拘谨。',
    );
    this.set('coordinates', { x: -1, y: -5, z: 0 });
    this.set('exits', {
      east: 'area/songyang/gate',
      north: 'area/songyang/scripture-pavilion',
      south: 'area/songyang/herb-garden',
    });
  }
}
