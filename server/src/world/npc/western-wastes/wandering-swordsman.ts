/**
 * 流浪剑客燕无归 — 黄沙驿·棕榈林
 * 从中原流落西域的落魄武者，身世成谜
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class WanderingSwordsman extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '燕无归');
    this.set('short', '一个背靠棕榈树闭目养神的落魄剑客');
    this.set(
      'long',
      '他靠在棕榈树干上，长剑横放在膝头，闭着眼睛，像是在睡觉。' +
        '但只要有人走近，他的右手就会不动声色地搭上剑柄。' +
        '中原人的面相，三十出头，颧骨高，下巴瘦削，嘴唇干裂，' +
        '显然在西域的日头下晒了不少日子。' +
        '衣服原本是灰色的长袍，现在已经被风沙磨成了土黄色，' +
        '但衣领和袖口的针脚精细，看得出原本是好衣服。' +
        '他身上有一种说不出的落寞，像是一个走了很远的路、' +
        '却不知道要去哪里的人。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'neutral');
    this.set('level', 17);
    this.set('max_hp', 680);
    this.set('hp', 680);
    this.set('personality', 'melancholic');
    this.set('speech_style', 'poetic');
    this.set('chat_chance', 20);
    this.set('chat_msg', [
      '燕无归闭着眼睛，手指在剑鞘上轻轻叩击，节奏缓慢而忧伤。',
      '燕无归睁开眼，看了看天色，又闭上了。似乎在等什么，又似乎什么都不在等。',
      '燕无归从怀里摸出一只酒壶，仰头灌了一口，酒水沿着嘴角流下来，他也不擦。',
      '燕无归忽然站起来，拔剑，在空中划了几道弧线，然后收剑，重新靠回树上。',
    ]);
    this.set('inquiry', {
      来历: '燕无归看了你一眼，淡淡道：「中原来的。走了多远？远到不想回去了。」他又闭上眼，不再说话。',
      武学: '燕无归拔出剑，在沙地上划了一横：「剑术这东西，练到极处就是一条直线。问题是你能不能走到那个极处。」他把剑收回去，「我还没到。」',
      西域: '燕无归叹了口气：「西域好。人少，话少，没人管你是谁。」他停了停，「不过也没人在意你是谁——这大概是同一件事。」',
      default: '燕无归微微点头，声音懒散：「有事就说，没事就坐。这棵树的阴凉够两个人。」',
    });
  }
}
