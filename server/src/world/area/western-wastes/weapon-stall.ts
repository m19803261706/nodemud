/**
 * 黄沙驿·兵器摊 — 西域兵刃与中原铁器
 * 坐标: (-3, 1, 0)
 * 各式兵器汇聚之处，丝路上的武人常来此寻觅趁手兵刃
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class WesternWastesWeaponStall extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '黄沙驿·兵器摊');
    this.set(
      'long',
      '摊位上横七竖八地摆着各种兵器，有西域弯刀、草原短弓、中原长剑，' +
        '还有几把叫不出名字的奇形兵刃，大概是从极西之地流传过来的。' +
        '摊主是个瘸了一条腿的老兵，据说年轻时在边境打过仗，' +
        '退下来后靠修兵器和卖兵器为生，手艺一流。' +
        '他把刀架在磨刀石上慢慢磨，火星偶尔迸出，像是在铁与石之间讲述旧事。' +
        '来看兵器的人不少，有商人防身，有武者寻宝，也有纯粹好奇的过客。',
    );
    this.set('coordinates', { x: -3, y: 1, z: 0 });
    this.set('exits', {
      north: 'area/western-wastes/silk-shop',
      east: 'area/western-wastes/curio-shop',
      south: 'area/western-wastes/money-changer',
    });
  }
}
