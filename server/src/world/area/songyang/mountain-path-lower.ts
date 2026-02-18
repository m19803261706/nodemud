/**
 * 嵩阳山道·下段
 * 山脚处，视野开阔，远处官道可见
 * 坐标: (0, -1, 0)
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class SongyangMountainPathLower extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '嵩阳山道·下段');
    this.set(
      'long',
      '山道至此已近山脚，石阶换成了夯土路面，两旁杂草没膝。视野豁然开朗，远处官道如带，隐约可见往来的车马行人。山风到这里也变得温和，带着平原上的泥土气息。',
    );
    this.set('coordinates', { x: 0, y: -1, z: 0 });
    this.set('exits', {
      north: 'area/songyang/mountain-path-middle',
      south: 'area/songyang/road-songshan',
    });
  }
}
