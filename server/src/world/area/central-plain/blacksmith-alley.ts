/**
 * 洛阳废都·铁匠巷 — 废都唯一尚在运作的铁匠铺所在
 * 坐标: (-1, 2, 0)
 * 赵铁守着最后一炉火，叮当声是这巷子里仅存的生气
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class CentralPlainBlacksmithAlley extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '洛阳废都·铁匠巷');
    this.set(
      'long',
      '窄巷两侧全是铁匠铺——至少曾经是。' +
        '废弃的炉膛一个挨一个，砖缝里长出了草，炉灰早被风吹散，' +
        '只剩铁砧和打烂的风箱摆在那里，像一排沉默的墓碑。' +
        '唯有最里头那一家还在开工，炉火从黑洞洞的门洞里透出橘红色的光，' +
        '叮叮当当的锤声回荡在空巷里，是这条街唯一的生气。' +
        '赵铁是这条巷子最后的铁匠，也可能是废都里唯一的铁匠，' +
        '一个人撑着一条巷子的魂。' +
        '巷子尽头有一堵倒塌的墙，乱砖堆后隐约能看出一条向下的暗道入口，蛛网遮着，不知通往何处。',
    );
    this.set('coordinates', { x: -1, y: 2, z: 0 });
    this.set('exits', {
      north: 'area/central-plain/old-tavern',
      east: 'area/central-plain/south-avenue',
      south: 'area/central-plain/underground-entrance',
      west: 'area/central-plain/refugee-camp',
    });
  }
}
