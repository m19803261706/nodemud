/**
 * 潮汐港·淡水井 — 珍贵的淡水水源
 * 坐标: (-1, 3, 0)
 * 港口最重要的资源，有专人看守
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class EasternSeaFreshwaterWell extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '潮汐港·淡水井');
    this.set(
      'long',
      '一口用青石砌成的水井孤零零地立在一片空地上，' +
        '井口被磨得光滑，上面罩着一个简易的木棚防止海水倒灌。' +
        '井边摆着一排排空木桶，等着被灌满后运到各条船上去。' +
        '在海边，淡水比酒还金贵——' +
        '霍三刀专门派了人看守这口井，打水按桶收钱，' +
        '价格随季节浮动，旱季的时候翻三倍都有人抢。' +
        '井台旁的石碑上刻着"潮汐泉"三个字，' +
        '据说这口井通着地下暗河，从不枯竭，' +
        '潮汐港能存在至今，多半靠的就是这口井。',
    );
    this.set('coordinates', { x: -1, y: 3, z: 0 });
    this.set('exits', {
      north: 'area/eastern-sea/sailor-dorm',
      south: 'area/eastern-sea/arena',
    });
  }
}
