/**
 * 丝路·古城残垣 — 西域丝路
 * 坐标: (-8, 0, 0)
 * 被沙尘暴侵蚀的古城墙遗址，丝路上的历史遗迹
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadWesternRuinedWall extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '丝路·古城残垣');
    this.set(
      'long',
      '一段残破的城墙横亘在路旁，高处不过两人高，矮处只到膝盖，' +
        '黄泥夯筑的墙体被风沙磨蚀得坑坑洼洼，露出里面的干草和碎石。' +
        '这是某座古城的遗迹，名字已不可考，' +
        '只知道它曾是丝路上的重要节点，商旅云集，驼铃声声。' +
        '如今只剩这段残墙和地基的轮廓还能看出当年的规模。' +
        '城墙根下半埋着几块石碑，上面的西域文字已被风沙磨平，' +
        '只有最深的几道刻痕还能摸出来，却再无人能读懂。' +
        '墙角有几个浅洞，是沙狐或蜥蜴的巢穴，算是这座死城仅存的居民。',
    );
    this.set('coordinates', { x: -8, y: 0, z: 0 });
    this.set('exits', {
      east: 'area/road-western/poplar-deadwood',
      west: 'area/road-western/west-end',
    });
  }
}
