/**
 * 裂隙镇·书院藏书斋
 * 坐标: (-3, 1, 0)
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RiftTownAcademyLibrary extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '裂隙镇·书院藏书斋');
    this.set(
      'long',
      '狭长书斋里摆着两排高木架，竹简与旧册按门类分得井井有条。角落炭炉温着一壶淡茶，空气里混着纸墨和草木清香，让人不自觉地放缓呼吸。',
    );
    this.set('coordinates', { x: -3, y: 1, z: 0 });
    this.set('exits', {
      east: 'area/rift-town/academy',
    });
  }
}
