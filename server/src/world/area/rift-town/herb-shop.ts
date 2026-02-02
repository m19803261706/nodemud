/**
 * 裂隙镇·济世堂（药铺）
 * 坐标: (-1, -1, 0)
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RiftTownHerbShop extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '裂隙镇·济世堂');
    this.set(
      'long',
      '推开吱呀作响的木门，一股浓郁的草药味扑面而来。药铺不大，四面墙壁上密密麻麻地排满了药柜，每个抽屉上都贴着手写的药名。一个白发老药师正在研磨药材，旁边的炉子上咕嘟嘟地煮着什么。',
    );
    this.set('coordinates', { x: -1, y: -1, z: 0 });
    this.set('exits', {
      east: 'area/rift-town/north-street',
    });
  }
}
