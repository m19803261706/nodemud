/**
 * 潮汐港·船坞 — 修船造船之所
 * 坐标: (1, 0, 0)
 * 油脂与木屑的气味弥漫，斧凿声不绝于耳
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class EasternSeaShipyard extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '潮汐港·船坞');
    this.set(
      'long',
      '巨大的木质龙骨架在石墩上，像一副被剥了皮的鱼骨。' +
        '船坞里到处是刨花和木屑，空气中弥漫着桐油与松脂的浓烈气味。' +
        '几个赤膊的船工正挥动斧头修整船板，汗珠顺着黝黑的脊背滚落。' +
        '角落堆满了从各地运来的木材——有些明显是从别人船上拆下来的，' +
        '断口处还能看到焦黑的火烧痕迹。' +
        '一块歪斜的木牌上写着："修船不问来路，付钱即可开工。"',
    );
    this.set('coordinates', { x: 1, y: 0, z: 0 });
    this.set('exits', {
      west: 'area/eastern-sea/harbor-gate',
      south: 'area/eastern-sea/wharf',
      north: 'area/eastern-sea/lighthouse',
      east: 'area/eastern-sea/net-workshop',
    });
  }
}
