/**
 * 朔云关·守将府 — 朔云关
 * 坐标: (0, -2, 0)
 * 关令贺孟川的办公之地，军报堆积，北境舆图挂壁
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class FrostPassFortressHall extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '朔云关·守将府');
    this.set(
      'long',
      '守将府的正堂不大，却透着一股压抑的肃杀气息。' +
        '案几上堆满了军报和塘报，最上面的一份墨迹还未干透，' +
        '边角压着一块沉甸甸的铁镇纸，刻的是"镇北"二字。' +
        '正面墙上挂着一幅北境舆图，详细标注了各处烽燧、水源和游牧营地的位置，' +
        '几处已用朱笔圈出，旁边批注着简短的军事判断。' +
        '墙角摆着一副兵器架，上面挂着一柄缺口的长刀——' +
        '那是关令贺孟川当年亲历的某场硬仗留下的痕迹，他至今未修，以作警示。',
    );
    this.set('coordinates', { x: 0, y: -2, z: 0 });
    this.set('exits', {
      south: 'area/frost-pass/main-street',
    });
  }
}
