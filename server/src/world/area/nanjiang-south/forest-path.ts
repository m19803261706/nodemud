/**
 * 雾岚寨·密林小径 — 通往山林深处的隐秘通道
 * 坐标: (1, 3, 0)
 * 从寨子后方通向深山密林的小路
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class NanjiangSouthForestPath extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '雾岚寨·密林小径');
    this.set(
      'long',
      '一条勉强能看出痕迹的小路蜿蜒伸入密林深处，' +
        '两旁的灌木和藤蔓几乎要将路完全遮蔽。' +
        '头顶的树冠层层叠叠，只有零星的光斑漏下来，' +
        '让这条小径显得阴暗而幽静。' +
        '脚下的泥土松软潮湿，踩上去几乎没有声音，' +
        '只有偶尔折断枯枝的脆响。' +
        '林中鸟鸣此起彼伏，却看不到鸟的影子，' +
        '不知名的虫子在腐叶间穿行，留下一条条细小的痕迹。' +
        '空气中弥漫着潮湿的腐叶气息和某种淡淡的花香，' +
        '那花香里带着一丝甜腻，像是有什么植物正在不远处开花。',
    );
    this.set('coordinates', { x: 1, y: 3, z: 0 });
    this.set('exits', {
      north: 'area/nanjiang-south/gu-room',
      south: 'area/nanjiang-south/deep-forest',
    });
  }
}
