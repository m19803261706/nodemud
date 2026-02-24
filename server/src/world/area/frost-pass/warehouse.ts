/**
 * 朔云关·战备仓库 — 朔云关
 * 坐标: (2, -1, 0)
 * 储存攻城器械和战备物资的大型仓库
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class FrostPassWarehouse extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '朔云关·战备仓库');
    this.set(
      'long',
      '一座比普通房屋高出一倍的石砌大仓，门口常年有卫兵把守。' +
        '仓内存放着守城用的重型器械：拆卸后的投石车部件、' +
        '成捆的檑木、大桶的火油和几十坛硫磺。' +
        '靠墙一侧码着铁盾和备用长矛，数量可观但远不如从前。' +
        '仓库深处还有几个上了铁锁的木箱，里面装的是火药和火箭，' +
        '是朝廷上次拨发的——距今已过了大半年。' +
        '仓管在门口的木板上记着出入库的日期和数目，' +
        '近几个月只有"出"没有"入"，数字一天天在减少。' +
        '空气里弥漫着硫磺和铁锈的味道，干燥而刺鼻。',
    );
    this.set('coordinates', { x: 2, y: -1, z: 0 });
    this.set('exits', {
      west: 'area/frost-pass/armory',
    });
  }
}
