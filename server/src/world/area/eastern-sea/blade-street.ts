/**
 * 潮汐港·刀锋街 — 武者与亡命之徒的街道
 * 坐标: (1, 2, 0)
 * 打斗频繁，墙上全是刀痕
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class EasternSeaBladeStreet extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '潮汐港·刀锋街');
    this.set(
      'long',
      '这条窄巷只容两人并肩而过，两侧的土墙上满是深浅不一的刀痕，' +
        '有些新得还泛着白茬，有些旧得已经被雨水冲成了浅沟。' +
        '地上散落着断裂的刀刃碎片和干涸的暗色血渍，' +
        '空气中似乎永远弥漫着一股铁锈般的腥气。' +
        '街道两旁开着几家简陋的铺子：磨刀的、卖护甲的、缝伤口的，' +
        '生意都不错——毕竟在这条街上走一趟，' +
        '三样里至少用得上一样。' +
        '偶尔能听到巷子深处传来金属碰撞的声响，不知是在比武还是在拼命。',
    );
    this.set('coordinates', { x: 1, y: 2, z: 0 });
    this.set('exits', {
      north: 'area/eastern-sea/wharf',
      west: 'area/eastern-sea/tavern',
      east: 'area/eastern-sea/salt-flat',
      south: 'area/eastern-sea/gambling-den',
    });
  }
}
