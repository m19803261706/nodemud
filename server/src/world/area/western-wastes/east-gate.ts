/**
 * 黄沙驿·驿门 — 黄沙驿入口
 * 坐标: (0, 0, 0)
 * 绿洲边缘的简易驿门，驼队商人交接货物
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class WesternWastesEastGate extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '黄沙驿·驿门');
    this.set(
      'long',
      '绿洲边缘用木桩和绳索搭成的简易驿门，实用多于威仪。' +
        '门边拴着几头骆驼，正低头咀嚼着草料，偶尔甩甩头，驱赶飞虫。' +
        '驼队商人在此交接货物，用各种语言大声报数，偶尔发生争执，' +
        '又迅速在驿门守卫的眼神下平息。' +
        '走进驿门，脚下的沙地逐渐被拍实的土地取代，绿洲里的植物散发着潮湿的气息，' +
        '与外面的干燥形成鲜明对比，让人情不自禁地深吸一口气。',
    );
    this.set('coordinates', { x: 0, y: 0, z: 0 });
    this.set('exits', {
      east: 'area/road-western/west-end',
      west: 'area/western-wastes/bazaar',
    });
  }
}
