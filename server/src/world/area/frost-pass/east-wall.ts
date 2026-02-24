/**
 * 朔云关·东段城墙 — 朔云关
 * 坐标: (1, -3, 0)
 * 城墙东段巡逻道，靠近箭楼，视野开阔
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class FrostPassEastWall extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '朔云关·东段城墙');
    this.set(
      'long',
      '东段城墙比西段略高半丈，因为这里地势稍低，' +
        '建关时特意加高以弥补地形的劣势。' +
        '垛口之间挂着冻硬的牛皮盾，用来挡箭，' +
        '盾面上扎满了箭头——上一次北漠试探进攻留下的痕迹。' +
        '城墙上每隔二十步放着一口大缸，里面装满了水，' +
        '但这个季节全结成了冰，得等到守城时再烧火融化，泼向攻城的敌人。' +
        '脚下的石板被冻得发白，走在上面必须小心，否则一滑就可能摔下城墙。' +
        '东面远处隐约可见一条河的轮廓，那是冻了大半的朔水河，' +
        '河面上偶有黑影移动，是巡逻的斥候在冰面上侦察。',
    );
    this.set('coordinates', { x: 1, y: -3, z: 0 });
    this.set('exits', {
      west: 'area/frost-pass/war-camp',
      south: 'area/frost-pass/infirmary',
      east: 'area/frost-pass/east-tower',
    });
  }
}
