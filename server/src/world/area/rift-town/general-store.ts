/**
 * 裂隙镇·万宝杂货
 * 坐标: (1, 1, 0)
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RiftTownGeneralStore extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '裂隙镇·万宝杂货');
    this.set(
      'long',
      '杂货铺里堆满了各式各样的货物——从中原来的布匹、北漠的皮毛、西南的干果、甚至东海的贝壳。老板是个精明的矮胖商人，笑眯眯地对每个顾客说着同样的话："便宜卖了便宜卖了。"',
    );
    this.set('coordinates', { x: 1, y: 1, z: 0 });
    this.set('exits', {
      west: 'area/rift-town/south-street',
    });
  }
}
