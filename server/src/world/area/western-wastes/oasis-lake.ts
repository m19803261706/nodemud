/**
 * 黄沙驿·绿洲湖畔 — 沙漠中的生命之水
 * 坐标: (0, 3, 0)
 * 绿洲的核心，一汪碧水在沙漠中静静流淌
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class WesternWastesOasisLake extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '黄沙驿·绿洲湖畔');
    this.set(
      'long',
      '一汪碧蓝的湖水卧在沙丘之间，水面平静得像一面铜镜，' +
        '倒映着西域高远的天空和岸边几棵弯弯曲曲的胡杨。' +
        '湖水不深，站在岸边能看到水底的沙石和偶尔游过的小鱼。' +
        '岸边长着一圈矮小的芦苇和碱草，在干燥的风中轻轻摇摆。' +
        '有几个西域妇人在湖边浣衣，衣物在水中散开，像是水里开出的花。' +
        '这里是整个绿洲的命脉所在，没有这汪水，就没有黄沙驿，' +
        '没有集市，没有丝路上的这一站歇息。' +
        '傍晚时分，晚霞把湖面染成金红色，美得让人一时忘了这是沙漠。',
    );
    this.set('coordinates', { x: 0, y: 3, z: 0 });
    this.set('exits', {
      north: 'area/western-wastes/palm-grove',
      west: 'area/western-wastes/ascetic-cliff',
    });
  }
}
