/**
 * 朔云关·南门 — 朔云关
 * 坐标: (0, 0, 0)
 * 入关第一道门，甲胄守卫盘查，城门上刻「朔云」二字
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class FrostPassSouthGate extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '朔云关·南门');
    this.set(
      'long',
      '厚重的城门以整块花岗岩砌就，门扇包铁，锈迹与岁月交织在一起。' +
        '城门洞内昏暗，两侧各站着一名全甲的守卫，' +
        '手持长矛，目光冷静地打量每一个进关的人。' +
        '门楣上方，"朔云"二字以大篆深刻，字体方正，笔力遒劲，' +
        '据说是当年建关的将军亲笔所题。' +
        '检查过往行人的士卒态度不算恶劣，但也绝不客气，' +
        '逐一查验路引，没有路引的商旅需缴纳入关费方可通行。' +
        '门洞里夹着过堂风，比外面还要冷上几分。',
    );
    this.set('coordinates', { x: 0, y: 0, z: 0 });
    this.set('exits', {
      south: 'area/road-north/north-end',
      north: 'area/frost-pass/main-street',
    });
  }
}
