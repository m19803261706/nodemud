/**
 * 官道·裂谷段
 * 官道靠近裂谷镇的一段，集市烟火气渐浓
 * 坐标: (0, 1, 0)
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class SongyangRoadRift extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '官道·裂谷段');
    this.set(
      'long',
      '官道渐入裂谷地界，空气中混着炊烟与牲口的气味。路边多了几个歇脚的货郎，有人支起油布棚卖茶水。前方裂谷镇的城墙轮廓已清晰可见，城门处隐隐传来人声喧嚷。',
    );
    this.set('coordinates', { x: 0, y: 1, z: 0 });
    this.set('exits', {
      north: 'area/songyang/road-songshan',
      south: 'area/rift-town/north-gate',
    });
  }
}
