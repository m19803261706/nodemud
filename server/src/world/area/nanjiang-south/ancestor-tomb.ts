/**
 * 雾岚寨·先祖墓穴 — 苗疆古墓遗迹
 * 坐标: (0, 6, 0)
 * 部落先祖安息之地，最深处的秘境
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class NanjiangSouthAncestorTomb extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '雾岚寨·先祖墓穴');
    this.set(
      'long',
      '藤蔓掩映的洞口之后，是一个宽阔的天然石室。' +
        '石室穹顶极高，几十根钟乳石从顶部垂下，' +
        '尖端滴着水珠，落在地面的石坑里，发出清脆的滴答声。' +
        '石室中央是一座石台，台上放着几件古老的器物——' +
        '一柄锈蚀的铜剑、一只破碎的陶壶、一块刻满符文的龟甲。' +
        '石台周围的地面上画着一个巨大的圆形图案，' +
        '用红泥和兽血绘成，虽然年代久远，颜色却依然鲜艳如新。' +
        '石壁上密密麻麻地刻着苗文，有些是祭文，有些像是记载，' +
        '最古老的那些已经无人能够读懂。' +
        '石室深处有几个石棺，棺盖上雕着蛇身人面的图案，' +
        '那是苗疆先祖的形象，面容安详而威严。',
    );
    this.set('coordinates', { x: 0, y: 6, z: 0 });
    this.set('exits', {
      north: 'area/nanjiang-south/poison-valley',
    });
  }
}
