/**
 * 山间溪涧
 * 山道中段西侧，清溪流淌之处
 * 坐标: (-1, -2, 0)
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class SongyangMountainStream extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '山间溪涧');
    this.set(
      'long',
      '清溪从岩缝间淌出，汇成一潭浅水，水面映着头顶枝叶的碎影。溪畔生着几味野草药，叶片沾着水雾，散出淡淡苦香。石头上长满青苔，踩上去颇为湿滑。',
    );
    this.set('coordinates', { x: -1, y: -2, z: 0 });
    this.set('exits', {
      east: 'area/songyang/mountain-path-middle',
    });
  }
}
