/**
 * 烟雨镇·水边人家 — 运河旁的普通民居
 * 坐标: (0, -1, 0)
 * 粉墙黛瓦，晾着衣物，炊烟袅袅的生活气息
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class JiangnanWatersideHouse extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '烟雨镇·水边人家');
    this.set(
      'long',
      '几户人家的后门直接开在运河边上，石阶一级一级没入水中，' +
        '妇人蹲在最下面那级台阶上浣洗衣裳，棒槌声有节奏地响着。' +
        '粉墙上爬着薜荔，黛瓦间长出了几丛野草，' +
        '窗台上摆着一盆蔫头蔫脑的菊花，大概是忘了浇水。' +
        '屋檐下挂着几串干辣椒和腊肉，色泽暗红，油光发亮。' +
        '一只花猫蜷在门槛上打盹，尾巴偶尔甩一下，赶走落在鼻尖的飞虫。',
    );
    this.set('coordinates', { x: 0, y: -1, z: 0 });
    this.set('exits', {
      north: 'area/jiangnan/poem-gallery',
      east: 'area/jiangnan/teahouse',
      south: 'area/jiangnan/west-dock',
    });
  }
}
