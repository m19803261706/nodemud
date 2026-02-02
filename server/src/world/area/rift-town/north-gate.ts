/**
 * 裂隙镇·北门
 * 坐标: (0, -3, 0)
 * 北方出口（通往北境）暂不开放，留给后续区域扩展
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RiftTownNorthGate extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '裂隙镇·北门');
    this.set(
      'long',
      '裂隙镇的北门是两块巨大的断崖之间勉强搭起的一道石墙，上面站着几个无精打采的卫兵。门外是通往北境霜疆的荒路，寒风从门缝中灌进来，带着草原的腥膻味。',
    );
    this.set('coordinates', { x: 0, y: -3, z: 0 });
    this.set('exits', {
      south: 'area/rift-town/north-road',
    });
  }
}
