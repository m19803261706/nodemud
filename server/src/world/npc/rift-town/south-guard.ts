/**
 * 南门卫兵 — 裂隙镇南门
 * 承天朝驻镇卫兵，守卫南门通往外界
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class SouthGuard extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '南门卫兵');
    this.set('short', '一个年轻的卫兵');
    this.set(
      'long',
      '南门前站着一名年轻的卫兵，看起来二十出头，脸上还带着几分稚嫩。' +
        '他同样身着承天朝的制式铠甲，但铠甲上还崭新发亮，' +
        '显然是不久前才分配到这个岗位。' +
        '相比北门的老兵，他的眼神里多了些好奇和紧张。',
    );
    this.set('title', '承天朝');
    this.set('gender', 'male');
    this.set('faction', Factions.CHENG_TIAN);
    this.set('visible_faction', '承天朝');
    this.set('attitude', 'neutral');
    this.set('level', 18);
    this.set('max_hp', 750);
    this.set('hp', 750);
    this.set('chat_chance', 10);
    this.set('chat_msg', [
      '南门卫兵好奇地打量着来往的行人。',
      '南门卫兵打了个哈欠，赶紧又挺直了腰。',
      '南门卫兵学着北门那位老兵的样子，努力做出严肃的表情。',
    ]);
    this.set('inquiry', {
      '南方':
        '南门卫兵说：「南边是通往中原的官道，还算太平。不过路上偶尔也有山贼出没，走夜路的话要小心。」',
      '承天朝':
        '南门卫兵认真地说：「我是今年刚从军营调过来的，能驻守裂隙镇，说明上头看重这里。」',
      '北门':
        '南门卫兵小声说：「北门那位张大哥是老兵了，在裂隙镇守了三年。听说北边最近有点不太平，你要是好奇就去问问他。」',
      default:
        '南门卫兵挠了挠头：「这个我真不太清楚，你去镇里问问别人吧。」',
    });
  }
}
