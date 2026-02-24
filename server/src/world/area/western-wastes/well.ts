/**
 * 黄沙驿·水井 — 绿洲命脉
 * 坐标: (-1, -2, 0)
 * 整个驿站最珍贵的资源，日夜有人看守
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class WesternWastesWell extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '黄沙驿·水井');
    this.set(
      'long',
      '用砂岩砌成的圆井口，边沿被绳索磨出了深深的沟槽，不知打了多少年的水。' +
        '井口上方搭着一个简陋的木架，挂着辘轳和铁桶，有人正在慢慢往上摇。' +
        '井水清冽甘甜，是方圆百里内唯一可靠的水源，' +
        '因此日夜都有驿站的人在附近看守，防止有人污染水源或过量取水。' +
        '井边的地面被泼洒的水打湿，长出了几丛矮小的绿草，' +
        '在周围一片黄沙中显得格外珍贵。来打水的人自觉排成长队，' +
        '没有人插队——在沙漠里，水比黄金值钱。',
    );
    this.set('coordinates', { x: -1, y: -2, z: 0 });
    this.set('exits', {
      south: 'area/western-wastes/caravansary',
      east: 'area/western-wastes/dune-lookout',
    });
  }
}
