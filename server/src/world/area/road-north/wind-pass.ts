/**
 * 官道·风口关 — 官道北境段
 * 坐标: (0, -1, 0)
 * 两山夹峙的天然隘口，风声如号，是进入北境的第一道险地
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadNorthWindPass extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '官道·风口关');
    this.set(
      'long',
      '两侧山岩如刀削，将官道夹成一条逼仄的走廊，风从缺口中贯穿而过，' +
        '发出长长的啸鸣，仿佛有人在悲泣。路面铺满拳头大小的碎石，' +
        '经年被风打磨得光滑，踩上去极易滑倒。' +
        '山壁上有几处浅浅的刻字，是历代过路人留下的，内容大多是祈求平安的词句，' +
        '最近的一条写道："元康三年，陈福有过此，望北不见归路。"' +
        '此处是进入北境荒原前的最后一处有遮蔽的地形。',
    );
    this.set('coordinates', { x: 0, y: -1, z: 0 });
    this.set('exits', {
      south: 'area/road-north/south-end',
      north: 'area/road-north/frozen-trail',
    });
  }
}
