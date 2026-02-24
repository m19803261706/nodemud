/**
 * 朔云关·伤兵营 — 朔云关
 * 坐标: (1, -2, 0)
 * 关城军医驻地，药草气味浓重，伤兵呻吟不绝
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class FrostPassInfirmary extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '朔云关·伤兵营');
    this.set(
      'long',
      '一间由石屋改建的伤兵营，低矮的屋顶下排列着十几张简陋的木板床。' +
        '大部分床上都躺着人，有的裹着渗血的绷带闭目休息，' +
        '有的失去了手臂或腿，靠在墙角沉默地望着天花板。' +
        '空气中弥漫着浓烈的草药味，夹杂着血腥和腐烂的气息，' +
        '角落的炉子上正煎着一锅药，咕嘟咕嘟地冒着泡。' +
        '墙上挂着几幅人体经络图，用墨笔标注了箭创、刀伤的止血穴位。' +
        '一位白发军医正弯腰给一个年轻士兵换药，手法熟练而稳定，' +
        '但他脸上的疲惫遮掩不住——伤员太多，药材太少。',
    );
    this.set('coordinates', { x: 1, y: -2, z: 0 });
    this.set('exits', {
      west: 'area/frost-pass/fortress-hall',
      north: 'area/frost-pass/east-wall',
    });
  }
}
