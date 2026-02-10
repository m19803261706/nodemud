/**
 * 嵩阳宗·执事院
 * 坐标: (1, -6, 0)
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class SongyangDeaconCourt extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '嵩阳宗·执事院');
    this.set(
      'long',
      '这里摆着数张账案，竹简与账册分门别类堆放。檐下铜铃细响，执事弟子往来其间，步子快而不乱。',
    );
    this.set('coordinates', { x: 1, y: -6, z: 0 });
    this.set('exits', {
      west: 'area/songyang/hall',
    });
  }
}
