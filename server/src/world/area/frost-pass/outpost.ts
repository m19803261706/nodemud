/**
 * 朔云关·关外哨所 — 朔云关
 * 坐标: (0, -5, 0)
 * 城墙以北的前哨站，北漠草原的边缘，危险地带
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class FrostPassOutpost extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '朔云关·关外哨所');
    this.set(
      'long',
      '出了北门，走过一片碎石滩，便到了这处简陋的哨所。' +
        '说是哨所，不过是几根木桩围成的栅栏，中间搭了个遮风的棚子，' +
        '棚顶盖的是毡布，被风吹得东倒西歪。' +
        '哨所前方就是广袤的北漠草原，枯草齐膝，随风起伏如同灰色的海浪。' +
        '地上散落着马蹄印和箭头，有些是自己人留下的巡逻痕迹，' +
        '有些则来历不明，指向远方。' +
        '空气干冷而空旷，没有城墙的遮挡，北风毫无阻隔地扑面而来。' +
        '远处偶尔能看到一两个黑点在草原上移动，' +
        '可能是北漠的游骑，也可能是流浪的野马——' +
        '但在这里，没人会把任何移动的东西当成无害的。',
    );
    this.set('coordinates', { x: 0, y: -5, z: 0 });
    this.set('exits', {
      south: 'area/frost-pass/north-gate',
    });
  }
}
