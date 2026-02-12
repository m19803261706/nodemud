/**
 * 裂隙镇·武馆演练场
 * 坐标: (3, -1, 0)
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RiftTownTrainingYard extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '裂隙镇·武馆演练场');
    this.set(
      'long',
      '一片夯实黄土的演练场，立着木人桩和沙包。地上划着粗白圈线，显然是教头给新手练步用的。场边木桶里泡着药草水，供弟子练完擦伤。',
    );
    this.set('coordinates', { x: 3, y: -1, z: 0 });
    this.set('exits', {
      west: 'area/rift-town/martial-hall',
    });
  }
}
