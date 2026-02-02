/**
 * 裂隙镇·北街
 * 坐标: (0, -1, 0)
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RiftTownNorthStreet extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '裂隙镇·北街');
    this.set(
      'long',
      '北街是裂隙镇的商业街，两侧的铺面靠着断崖岩壁搭建。西边是飘着药香的济世堂，东边传来叮叮当当的打铁声。往北的道路逐渐收窄，通向裂谷深处。',
    );
    this.set('coordinates', { x: 0, y: -1, z: 0 });
    this.set('exits', {
      south: 'area/rift-town/square',
      north: 'area/rift-town/north-road',
      west: 'area/rift-town/herb-shop',
      east: 'area/rift-town/smithy',
    });
  }
}
