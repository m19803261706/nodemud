/**
 * 洛阳废都·南城门 — 废都南侧出入口
 * 坐标: (0, 3, 0)
 * 城门已塌，茶摊收过路费，无人驻守
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class CentralPlainSouthGate extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '洛阳废都·南城门');
    this.set(
      'long',
      '与北门相比，南城门更为破败——城门的木结构早已腐烂坍塌，' +
        '青砖拱洞也在某次地动后垮了大半，' +
        '只余两根石柱孤零零地立在原地，标记着曾经门洞的宽度。' +
        '向南望去，是通往蛮疆的山路，山路蜿蜒向下，不见尽头。' +
        '两根石柱旁，有人用几块木板和一张油布搭了个简易茶摊，' +
        '摊主是个裹着头巾的中年汉子，摆了几碗浑水，自称是茶，' +
        '但进出的人都要"意思意思"，不给的话他也不动手，只是盯着你看，让人不自在。' +
        '承天朝的守卫人手不够，这里没有驻军，过路全凭各自运气。',
    );
    this.set('coordinates', { x: 0, y: 3, z: 0 });
    this.set('exits', {
      north: 'area/central-plain/south-avenue',
      south: 'area/road-nanjiang/north-end',
      east: 'area/central-plain/meditation-garden',
      west: 'area/central-plain/underground-entrance',
    });
  }
}
