/**
 * 朔云关·西角楼 — 朔云关
 * 坐标: (-2, -2, 0)
 * 城墙西北角的角楼，位置偏僻，是走私客接头之地
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class FrostPassWestTower extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '朔云关·西角楼');
    this.set(
      'long',
      '角楼位于城墙西端尽头，三面环墙，只有一条窄窄的通道连接城墙主体。' +
        '因为位置偏僻，巡逻的士兵很少走到这里，' +
        '楼内常年积着灰尘，角落里有老鼠啃咬过的干粮残渣。' +
        '墙壁上有几处用炭条画的暗号，懂的人一看便知这是什么地方——' +
        '走私客、逃兵和情报贩子的接头点。' +
        '从角楼的窗口望出去，能看到城墙外侧有一处低矮的暗门，' +
        '门上挂着锁，但锁芯早就被人暗中换过，用特定的钥匙就能打开。' +
        '这里白天安静得只听见风声，但到了夜里，' +
        '据说总有人影在此出没，来去无声。',
    );
    this.set('coordinates', { x: -2, y: -2, z: 0 });
    this.set('exits', {
      east: 'area/frost-pass/training-ground',
      north: 'area/frost-pass/stable',
    });
  }
}
