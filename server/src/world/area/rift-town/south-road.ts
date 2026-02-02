/**
 * 裂谷南道
 * 坐标: (0, 2, 0)
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RiftTownSouthRoad extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '裂谷南道');
    this.set(
      'long',
      '往南走出裂隙镇，裂谷逐渐变宽，视野也开阔了些。远处隐约可见中原平原的轮廓。路边的岩壁上长着一些耐旱的灌木，偶尔有鸟雀掠过。',
    );
    this.set('coordinates', { x: 0, y: 2, z: 0 });
    this.set('exits', {
      north: 'area/rift-town/south-street',
      south: 'area/rift-town/south-gate',
    });
  }
}
