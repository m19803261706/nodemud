/**
 * 逃兵 — 洛阳废都·倒塌角楼
 * 从某处战场上逃跑的年轻士兵，藏身断墙后的窝棚，
 * 惊弓之鸟，见人就当敌，随时准备动手
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class Deserter extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '逃兵');
    this.set('short', '一个面色苍白、衣衫褴褛的年轻人');
    this.set(
      'long',
      '一个看起来不过二十岁出头的年轻人，身上穿着一件破烂的旧军服，袖口和前襟染着洗不掉的暗红色痕迹。' +
        '他面色蜡黄，眼圈乌青，像是很多天没睡过好觉，眼神却极度警惕，随时在扫视四周的动静。' +
        '腰间别着一把短刀，刀鞘已经磨损，但他的手一直搭在刀柄上，随时准备拔出来。' +
        '他缩在断墙的阴影里，尽量让自己不引人注意，但那种根植于骨髓的惊惶反而让他显得格外扎眼。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('attitude', 'hostile');
    this.set('level', 7);
    this.set('max_hp', 250);
    this.set('hp', 250);
    this.set('combat_exp', 55);
    this.set('chat_chance', 8);
    this.set('chat_msg', [
      '逃兵缩在断墙后，神经质地张望着四周，手始终没有离开刀柄。',
      '逃兵啃着一块干硬的饼，手在发抖，饼渣落在脏兮兮的衣襟上他也没有察觉。',
    ]);
  }
}
