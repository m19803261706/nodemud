/**
 * 海路·码头外 — 海路·东海段
 * 坐标: (0,0,0)
 * 离开烟雨镇东码头，海味渐浓
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadEasternWestEnd extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '海路·码头外');
    this.set(
      'long',
      '离开烟雨镇东码头不久，路况便明显变差，' +
        '青石板路逐渐被碎石和泥土代替，每走一步都需要注意脚下。' +
        '空气中的水乡气息已渐渐淡去，取而代之的是一股若有若无的咸腥味，' +
        '那是大海独有的气息，随着海风一阵一阵地吹来。' +
        '路边的植被也悄然变化，柳树不见了，' +
        '换成了几丛矮小的滨草，叶片硬而有韧性，经得住海风的反复侵袭。',
    );
    this.set('coordinates', { x: 0, y: 0, z: 0 });
    this.set('exits', {
      west: 'area/jiangnan/east-dock',
      east: 'area/road-eastern/coastal-road',
    });
  }
}
