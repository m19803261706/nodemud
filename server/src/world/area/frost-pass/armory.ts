/**
 * 朔云关·军械库 — 朔云关
 * 坐标: (1, -1, 0)
 * 铁匠范大锤的领地，边关特制兵甲
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class FrostPassArmory extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '朔云关·军械库');
    this.set(
      'long',
      '炉火整日通红，热浪扑面，与室外的严寒形成截然的对比。' +
        '墙上挂满了兵甲：加厚的鱼鳞甲、专为骑射设计的轻便皮甲、' +
        '和适合北境苦寒天气的棉甲衬里，一件件排列得整整齐齐。' +
        '兵器架上摆着边关特制的宽刃斩马刀和重型弩机，' +
        '都是为了应对北漠骑兵而特别锻造的样式。' +
        '铁砧上放着一件打了一半的护心镜，铁锤搭在旁边，' +
        '显然主人刚刚离开片刻。' +
        '空气里是铁、炭和汗水混合的气息，对于熟悉战场的人来说，' +
        '这反而是一种令人安心的味道。',
    );
    this.set('coordinates', { x: 1, y: -1, z: 0 });
    this.set('exits', {
      west: 'area/frost-pass/main-street',
    });
  }
}
