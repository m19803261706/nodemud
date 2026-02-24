/**
 * 走私客"影子" — 朔云关·暗道
 * 神秘的走私客，真实身份不明，在暗道中来去自如
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class Smuggler extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '影子');
    this.set('short', '一个缩在暗处、面目模糊的人影');
    this.set(
      'long',
      '看不清面目——不是因为光线暗，而是他刻意用一块黑布蒙着下半张脸。' +
        '身形瘦长，穿着深色的紧身衣裤，脚上是软底布鞋，' +
        '走路没有一点声音。' +
        '腰间挂着一个鼓鼓囊囊的皮包，不知道装着什么。' +
        '他靠在暗道的墙壁上，双手抱臂，像是在等什么人。' +
        '据说"影子"不是他的名字，只是别人这么叫他，' +
        '因为没人见过他的真面目，也没人知道他的来历。' +
        '他出现的时候总是在暗处，消失的时候更快，' +
        '唯一确定的是——他手上能弄到很多外面弄不到的东西。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'neutral');
    this.set('level', 10);
    this.set('max_hp', 350);
    this.set('hp', 350);
    this.set('personality', 'cunning');
    this.set('speech_style', 'terse');
    this.set('chat_chance', 20);
    this.set('chat_msg', [
      '影子靠在墙上一动不动，只有眼睛在暗处微微闪光。',
      '影子翻开皮包检查了一下里面的东西，然后迅速合上，重新挂回腰间。',
      '影子偏了偏头，像是听到了什么远处的声响，但很快又恢复了平静。',
    ]);
    this.set('inquiry', {
      交易: '影子的声音从黑布后面传出来，又低又哑：「要什么？说。北漠的马奶酒、狼庭的弯刀、朝廷的军报抄本，甚至是某些人的行踪——都有价格。但有一条规矩：从我这里买的东西，不许问来路。问了，就再也没有下次。」',
      暗道: '影子微微摇头：「这条道的事，你知道得越少越好。能走到这里的人，要么是有路子的，要么是活腻了的。你是哪种？」他停顿片刻，「走的时候记得把痕迹抹掉。」',
      default: '影子看了你一眼，没出声，只是微微点了点头，算是打过招呼。',
    });
  }
}
