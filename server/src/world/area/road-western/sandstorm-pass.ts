/**
 * 丝路·风沙隘口 — 西域丝路第三段
 * 坐标: (-2, 0, 0)
 * 两块巨岩间的隘口，风沙旋成漏斗
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadWesternSandstormPass extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '丝路·风沙隘口');
    this.set(
      'long',
      '两块巨岩如门神般对立，将丝路挤压成一条仅容两人并行的狭道。' +
        '风在此处被地形捕捉，旋成一股漏斗状的沙柱，' +
        '细沙在空中盘旋，打在岩壁上发出沙沙的摩擦声。' +
        '穿越这段隘口需要低头，用衣袖遮住口鼻，快步通过，' +
        '否则沙子会钻进耳朵和牙缝里。' +
        '岩壁上有前人用尖石刻下的图案，是各种语言的字迹和路标，' +
        '叠在一起看不懂，却证明无数人曾在此经过。',
    );
    this.set('coordinates', { x: -2, y: 0, z: 0 });
    this.set('exits', {
      east: 'area/road-western/dusty-wasteland',
      west: 'area/road-western/oasis-ruin',
    });
  }
}
