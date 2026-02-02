/**
 * 裂隙镇·南门
 * 坐标: (0, 3, 0)
 * 南方出口（通往中原）暂不开放，留给后续区域扩展
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RiftTownSouthGate extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '裂隙镇·南门');
    this.set(
      'long',
      '南门比北门气派些，用规整的石块砌成拱门，门楣上刻着"裂隙镇"三个大字。门外是一条黄土大道，通往承天朝的腹地。来往的商队和行人在此进出，卫兵例行检查路引。',
    );
    this.set('coordinates', { x: 0, y: 3, z: 0 });
    this.set('exits', {
      north: 'area/rift-town/south-road',
    });
  }
}
