/**
 * 官道·风化石堆 — 官道北境段
 * 坐标: (0, -4, 0)
 * 路旁矗立着一堆风化的巨石，传说是古人垒砌的路标
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadNorthStoneCairn extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '官道·风化石堆');
    this.set(
      'long',
      '路旁矗立着一堆人工垒砌的巨石，最高处约有两人高，' +
        '石面被经年的风沙打磨得坑坑洼洼，纹路如同老人脸上的皱纹。' +
        '据说这是前朝军队北征时垒的路标，每隔三十里一座，' +
        '如今大多已经倒塌，只剩这一处还勉强立着。' +
        '石缝间塞满了过路人投掷的铜钱和布条，是祈求平安的习俗。' +
        '石堆脚下的泥土被冻得硬邦邦的，寸草不生，' +
        '风从石缝中穿过，呜呜作响，像是石头在低声叹息。',
    );
    this.set('coordinates', { x: 0, y: -4, z: 0 });
    this.set('exits', {
      south: 'area/road-north/frozen-trail',
      north: 'area/road-north/hunter-camp',
    });
  }
}
