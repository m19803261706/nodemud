/**
 * 船匠老马 — 潮汐港·船坞
 * 干了一辈子造船活的老手艺人，沉默寡言但手艺精湛
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class ShipwrightMa extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '老马');
    this.set('short', '挥斧修船的老船匠');
    this.set(
      'long',
      '老马是个六十来岁的瘦小老头，但两条胳膊上的腱子肉硬得像船缆。' +
        '他的手掌全是厚茧，十根手指有三根是弯的——' +
        '年轻时被船板夹断过，接回来就长歪了。' +
        '他很少说话，干活的时候只听得到斧头劈木和刨子推板的声音。' +
        '在潮汐港，没有人比老马更懂船。' +
        '哪条船能修，哪条船该拆，他看一眼就知道。' +
        '据说他年轻时是朝廷水师的匠头，犯了事才流落到这里——' +
        '但没人敢当面问他。',
    );
    this.set('title', '船匠');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'neutral');
    this.set('level', 16);
    this.set('max_hp', 650);
    this.set('hp', 650);
    this.set('combat_exp', 0);
    this.set('personality', 'taciturn');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 20);
    this.set('chat_msg', [
      '老马抡起斧头，一下劈开一块弯曲的船板，动作干脆利落。',
      '老马蹲在龙骨旁，用粗糙的手掌摸着木纹，微微摇了摇头。',
      '老马闷头刨木，刨花从他脚边堆成了一座小山。',
    ]);
    this.set('inquiry', {
      修船: '老马头也不抬地说：「看船的伤在哪。龙骨断了就别修了，换新的比修便宜。船舷破了好说，两天的活。」',
      造船: '老马停下手里的活，难得多说了几句：「造船？你出得起料钱就行。好木头难找，桐油也贵。不过我手艺你放心。」',
      default: '老马瞥了你一眼，继续干活，嘴里挤出一个字：「忙。」',
    });
  }
}
