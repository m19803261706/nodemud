/**
 * 裂谷北道
 * 坐标: (0, -2, 0)
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RiftTownNorthRoad extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '裂谷北道');
    this.set(
      'long',
      '离开裂隙镇的街道，道路变得崎岖起来。两侧的断崖越来越高，裂谷在此收窄，只容两人并行。岩壁上偶尔可见天裂留下的奇异纹路，在阳光下隐隐泛着微光。',
    );
    this.set('coordinates', { x: 0, y: -2, z: 0 });
    this.set('exits', {
      south: 'area/rift-town/north-street',
      north: 'area/rift-town/north-gate',
    });
  }
}
