/**
 * 嵩阳宗·藏卷阁
 * 坐标: (-1, -6, 0)
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class SongyangScripturePavilion extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '嵩阳宗·藏卷阁');
    this.set(
      'long',
      '阁中木架层层，旧卷依次编号，案上搁着抄录到一半的剑谱。窗外松影摇动，墨香与药草香混在一起，令人心神沉静。',
    );
    this.set('coordinates', { x: -1, y: -6, z: 0 });
    this.set('exits', {
      south: 'area/songyang/disciples-yard',
      east: 'area/songyang/hall',
    });
  }
}
