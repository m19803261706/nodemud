/**
 * 朔云关·东箭楼 — 朔云关
 * 坐标: (2, -3, 0)
 * 城墙东端的箭楼，弩床密布，是防御要害
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class FrostPassEastTower extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '朔云关·东箭楼');
    this.set(
      'long',
      '箭楼高出城墙两丈有余，顶部是一个六角形的平台，' +
        '四面垛口各架着一张重型弩床，弩臂比成人手臂还粗。' +
        '每张弩床旁边都放着一捆铁头弩箭，箭头涂了黑漆防锈，' +
        '据说这种弩箭在百步之内可以射穿两层皮甲。' +
        '楼内靠墙摆着几个木箱，里面是备用的弩弦和机括零件。' +
        '地上有一摊干涸的血迹——上次北漠夜袭时，' +
        '一个弩手中了流矢，但他硬撑着又射出了三轮齐射才倒下。' +
        '箭楼的视野极好，向东能望到朔水河，向北能看到草原纵深处，' +
        '是整个关城最重要的火力制高点。',
    );
    this.set('coordinates', { x: 2, y: -3, z: 0 });
    this.set('exits', {
      west: 'area/frost-pass/east-wall',
    });
  }
}
