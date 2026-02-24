/**
 * 朔云关·演武场 — 朔云关
 * 坐标: (-1, -2, 0)
 * 士兵操练之地，刀光剑影不断，沙地浸透汗水与血
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class FrostPassTrainingGround extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '朔云关·演武场');
    this.set(
      'long',
      '一片开阔的沙地，被踩踏得坚实而平整，四周竖着木桩、沙袋和草靶。' +
        '场地中央插着一面破旧的"令"字旗，旗面被风沙磨得只剩半幅，' +
        '但仍然日日立在此处，是演武场的标记。' +
        '靠墙一侧摆着几排兵器架，上面放着训练用的木刀木枪，' +
        '刀口被劈出了无数豁口，看得出使用频率极高。' +
        '空气里弥漫着汗水和泥土的味道，不时传来士兵对练时的低喝声。' +
        '地面上隐约可见些许暗红色的斑渍——操练起来难免见血，' +
        '在这里，流血是家常便饭，不流血的训练不算训练。',
    );
    this.set('coordinates', { x: -1, y: -2, z: 0 });
    this.set('exits', {
      east: 'area/frost-pass/fortress-hall',
      north: 'area/frost-pass/north-wall',
      south: 'area/frost-pass/watchtower',
      west: 'area/frost-pass/west-tower',
    });
  }
}
