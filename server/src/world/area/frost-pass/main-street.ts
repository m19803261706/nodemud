/**
 * 朔云关·关城主街 — 朔云关
 * 坐标: (0, -1, 0)
 * 关城唯一主干道，两侧军需铺面与兵营
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class FrostPassMainStreet extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '朔云关·关城主街');
    this.set(
      'long',
      '窄长的主街贯穿关城南北，青石板路被无数靴底磨得锃亮。' +
        '两侧是军需铺面和兵营，铺子里摆着加厚棉甲、北境特制的短弓和干粮包裹。' +
        '空气中弥漫着金属、皮革与马粪混合的气息——这里是边关的气味，' +
        '任何一个在此驻守过的人都会记得一辈子。' +
        '士兵们三三两两地走过，步伐有力，眼神警惕。' +
        '偶有伤兵拄着拐杖慢慢挪动，身上的伤口是北漠弯刀留下的纪念。' +
        '街道尽头可以看见守将府的旗杆，旗上是关令贺孟川的将旗。',
    );
    this.set('coordinates', { x: 0, y: -1, z: 0 });
    this.set('exits', {
      south: 'area/frost-pass/south-gate',
      east: 'area/frost-pass/armory',
      west: 'area/frost-pass/watchtower',
      north: 'area/frost-pass/fortress-hall',
    });
  }
}
