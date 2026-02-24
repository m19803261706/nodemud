/**
 * 烟雨镇·暗巷 — 黑市入口，危险地带
 * 坐标: (2, 5, 0)
 * 灯光昏暗，黑市打手游荡，不速之客的试炼场
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class JiangnanDarkAlley extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '烟雨镇·暗巷');
    this.set(
      'long',
      '巷子到这里突然变宽了些，但光线反而更暗，' +
        '头顶搭着几块破旧的油布，把天光遮了个严实。' +
        '墙根下蹲着两个纹了花臂的汉子，手里把玩着匕首，' +
        '目光冰冷地打量着每一个路过的人。' +
        '巷子尽头有一扇不起眼的铁门，门上没有招牌，' +
        '只在门框上钉了一枚铜钱，据说这就是烟雨镇黑市的暗号。' +
        '空气中混杂着劣质酒和某种说不清的腥味，' +
        '让人本能地想要攥紧手中的武器。',
    );
    this.set('coordinates', { x: 2, y: 5, z: 0 });
    this.set('exits', {
      west: 'area/jiangnan/dock-alley',
      down: 'area/jiangnan/underground-passage',
    });
  }
}
