/**
 * 潮汐港·瞭望塔 — 港口防御与情报站
 * 坐标: (-2, 2, 0)
 * 高处望远，港口尽收眼底
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class EasternSeaWatchtower extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '潮汐港·瞭望塔');
    this.set(
      'long',
      '一座用条石和船木混搭建造的瞭望塔，高约四丈，' +
        '外壁上钉着铁环和绳索，方便快速攀爬。' +
        '塔顶是一个简易的平台，四面通风，' +
        '站在上面能将整个港湾和远处的海面尽收眼底。' +
        '平台上架着一面铜锣和一杆破旧的望远镜，' +
        '铜锣用来示警，望远镜用来观察远方来船的旗号。' +
        '塔下散落着一些空酒坛和啃剩的鱼骨头，' +
        '看得出值守的人并不怎么认真。' +
        '不过在潮汐港，瞭望塔的真正价值不在于防守，' +
        '而在于提前知道谁来了——好做准备，是迎接还是躲藏。',
    );
    this.set('coordinates', { x: -2, y: 2, z: 0 });
    this.set('exits', {
      north: 'area/eastern-sea/drunk-alley',
      east: 'area/eastern-sea/sailor-dorm',
      south: 'area/eastern-sea/pirate-den',
    });
  }
}
