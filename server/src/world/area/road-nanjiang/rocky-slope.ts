/**
 * 山路·乱石坡 — 蛮疆山路
 * 坐标: (0, 6, 0)
 * 碎石遍布的山坡，蛇虫出没，行走艰难
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadNanjiangRockySlope extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '山路·乱石坡');
    this.set(
      'long',
      '山路在此变成一段陡峭的碎石坡，大大小小的石块从山壁上崩落，' +
        '堆积成一片灰白色的乱石阵，脚踩上去碎石松动，稍不留神就会滑出好几步。' +
        '石缝间生着低矮的荆棘和杂草，不时有蜥蜴和蛇虫从石块下钻出，' +
        '在阳光碎片中一闪而没。这里是蛇蝮最喜欢的栖息地，' +
        '石头白天被晒得发烫，夜里又迅速凉下来，温差正合它们的脾性。' +
        '坡顶能看见远处山峦起伏的轮廓，林海苍茫，偶尔有鹰在气流中盘旋。',
    );
    this.set('coordinates', { x: 0, y: 6, z: 0 });
    this.set('exits', {
      north: 'area/road-nanjiang/mist-valley',
      south: 'area/road-nanjiang/hunter-shed',
    });
  }
}
