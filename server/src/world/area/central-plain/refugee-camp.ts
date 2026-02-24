/**
 * 洛阳废都·流民棚户 — 城墙根下的棚户区，麻三主政
 * 坐标: (-2, 2, 0)
 * 乱中有序，交保护费方能安身，粗粝江湖的缩影
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class CentralPlainRefugeeCamp extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '洛阳废都·流民棚户');
    this.set(
      'long',
      '城墙根下搭起的大片棚户区，用废木板、油布、破砖和不知从哪拆来的门板拼凑而成，' +
        '高高低低地挤在一起，像是一场没有章法的建筑比赛的结果。' +
        '空气里弥漫着柴烟、汗味和劣酒的气息，三五成群的流民或坐或躺，' +
        '眼神里有麻木，也有一种熬过来了的韧性。' +
        '棚户区的"规矩"由一个叫麻三的人定——交保护费就能住，不交就走人，' +
        '规矩简单粗暴，但比外面的乱劲儿强多了。' +
        '脏乱之中自有一种粗粝的秩序，活下去，是这里唯一的共识。',
    );
    this.set('coordinates', { x: -2, y: 2, z: 0 });
    this.set('exits', {
      north: 'area/central-plain/market-ruins',
      east: 'area/central-plain/blacksmith-alley',
    });
  }
}
