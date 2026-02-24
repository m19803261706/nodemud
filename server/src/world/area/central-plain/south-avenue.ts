/**
 * 洛阳废都·正街南段 — 废都主街南延段
 * 坐标: (0, 2, 0)
 * 流民地摊与碎石路面，生存气息浓烈
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class CentralPlainSouthAvenue extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '洛阳废都·正街南段');
    this.set(
      'long',
      '从万宗广场往南延伸的主街，路面的青石板多数碎裂或被挖走，' +
        '裸露的黄土在雨后留下一个个浅坑，走起来深一脚浅一脚。' +
        '两侧建筑比北面更残破——有些只剩地基，有些半边墙还立着，' +
        '另半边早已坍塌成一堆砖石，偶有野草从废料堆里拱出来。' +
        '街边有几个流民摆的地摊，破席子上铺着些从废墟里翻出来的杂物：' +
        '残缺的铜器、不知出处的旧衣物，以及叫不上名字的碎玩意儿。' +
        '空气中有烟火气，但不是繁华的那种，是勉强求生的那种。',
    );
    this.set('coordinates', { x: 0, y: 2, z: 0 });
    this.set('exits', {
      north: 'area/central-plain/ruins-square',
      south: 'area/central-plain/south-gate',
      west: 'area/central-plain/blacksmith-alley',
      east: 'area/central-plain/temple-ruins',
    });
  }
}
