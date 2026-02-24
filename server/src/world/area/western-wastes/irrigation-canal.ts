/**
 * 黄沙驿·灌溉渠 — 引水灌溉的生命线
 * 坐标: (-1, -1, 1) — 地下层
 * 从绿洲湖引水至驿站的暗渠，兼具储水和灌溉功能
 * 注：坐标使用 z=1 表示地下空间，通过驿馆的 down 出口进入
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class WesternWastesIrrigationCanal extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '黄沙驿·灌溉渠');
    this.set(
      'long',
      '从驿馆地板下的一个石盖掀开，沿着石阶向下走十几步，' +
        '就进入了一条用砂岩砌成的暗渠。渠道不宽，勉强能容一人侧身通过，' +
        '脚下是浅浅的流水，从看不见的远处缓缓淌来，水声在石壁间回响。' +
        '这条渠连接着绿洲湖和驿站的水井，是先人修建的水利工程，' +
        '年代已不可考，但至今仍在运转。' +
        '渠壁上长着薄薄的苔藓，在火把的光照下泛着幽绿色的光。' +
        '有些地方的石壁上刻着维护记录，最早的可以追溯到数百年前。',
    );
    this.set('coordinates', { x: -1, y: -1, z: 1 });
    this.set('exits', {
      up: 'area/western-wastes/caravansary',
    });
  }
}
