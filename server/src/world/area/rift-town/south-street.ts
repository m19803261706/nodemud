/**
 * 裂隙镇·南街
 * 坐标: (0, 1, 0)
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RiftTownSouthStreet extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '裂隙镇·南街');
    this.set(
      'long',
      '南街比北街更热闹些，来自中原的商队常在此歇脚。路边有个破旧的告示牌，贴满了各种悬赏和寻人启事。东边的杂货铺门前堆着各式货物，一个瘦小的伙计正在吆喝。',
    );
    this.set('coordinates', { x: 0, y: 1, z: 0 });
    this.set('exits', {
      north: 'area/rift-town/square',
      south: 'area/rift-town/south-road',
      west: 'area/rift-town/notice-board',
      east: 'area/rift-town/general-store',
    });
  }
}
