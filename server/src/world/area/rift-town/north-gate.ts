/**
 * 裂隙镇·北门
 * 坐标: (0, -3, 0)
 * 北门现可前往嵩阳山道（嵩阳宗驻地）
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RiftTownNorthGate extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '裂隙镇·北门');
    this.set(
      'long',
      '裂隙镇的北门是两块巨大的断崖之间勉强搭起的一道石墙，上面站着几个无精打采的卫兵。沿着北坡石阶继续攀行，便能望见嵩阳宗山道的松影。',
    );
    this.set('coordinates', { x: 0, y: -3, z: 0 });
    this.set('exits', {
      south: 'area/rift-town/north-road',
      north: 'area/songyang/mountain-path',
    });
  }
}
