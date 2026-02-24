/**
 * 潮汐港·骰子赌坊 — 赌徒的天堂与地狱
 * 坐标: (1, 3, 0)
 * 骰声不断，有人一夜暴富，有人倾家荡产
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class EasternSeaGamblingDen extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '潮汐港·骰子赌坊');
    this.set(
      'long',
      '赌坊藏在一座石砌的矮楼里，门口没有招牌，只挂着一对铜骰子。' +
        '推门进去，烟雾缭绕中是密密麻麻的赌桌，' +
        '每张桌上都围着一圈红了眼的赌徒，摇骰声和叫喊声此起彼伏。' +
        '角落里有人输光了银两，正拿腰间的刀抵押；' +
        '另一桌有人赢得盆满钵满，身后已经多了两个不怀好意的跟班。' +
        '赌坊老板是个精瘦的独眼老头，坐在高台上不紧不慢地拨弄算盘，' +
        '每一注输赢都逃不过那只独眼。' +
        '墙上贴着一张歪歪扭扭的告示：' +
        '"赢了是本事，输了莫怪命。动手者，断手。"',
    );
    this.set('coordinates', { x: 1, y: 3, z: 0 });
    this.set('exits', {
      north: 'area/eastern-sea/blade-street',
    });
  }
}
