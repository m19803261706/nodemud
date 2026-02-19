/**
 * 巫医玲珑 — 雾岚寨·祖灵树
 * 雾岚寨巫医，精通草药与蛊虫之术，狡黠而神秘的女性权威
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class WitchDoctor extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '玲珑');
    this.set('short', '一个坐在古树下配药的年轻女子');
    this.set(
      'long',
      '她的年纪难以判断——面容年轻，但眼神里有一种与年龄不相符的深邃。' +
        '发间插着几根骨簪，手腕上缠着用细线串成的蛊虫标本，看起来既像装饰，又像是某种记录。' +
        '她总是在配药，面前摊着各种小瓶小罐，偶尔低声吟唱，像是在唱给蛊虫听的催眠曲。' +
        '族人都叫她「玲珑」，据说是因为她的心思玲珑剔透，什么都能看穿，' +
        '也有人说是因为她的药像玲珑木雕一样精巧，分量稍差便是天壤之别。' +
        '见到陌生人，她通常先看一眼，再微微歪头，好像在用某种她独有的方式打量你。',
    );
    this.set('title', '巫医');
    this.set('gender', 'female');
    this.set('faction', Factions.BAI_MAN);
    this.set('visible_faction', '雾岚寨');
    this.set('attitude', 'friendly');
    this.set('level', 18);
    this.set('max_hp', 700);
    this.set('hp', 700);
    this.set('personality', 'cunning');
    this.set('speech_style', 'scholarly');
    this.set('chat_chance', 35);
    this.set('chat_msg', [
      '玲珑从一排小瓶里取出几粒细小的东西，放在手心端详，对着光一粒粒数清楚。',
      '玲珑低声吟唱，旋律悠长，像是蛊虫才能听懂的语言。',
      '玲珑侧过头，端详着面前的蛊虫，嘴角挂着一丝若有若无的笑意。',
      '玲珑把一味草药研成细末，粉末落进瓷碗时发出细微的声音，她的神情专注而平静。',
    ]);
    this.set('inquiry', {
      治病: '玲珑歪了歪头，打量你一眼：「药价随病而定。治好后，你需给我一件往事作为报酬——一件你没告诉过任何人的事。」她顿了顿，「往事是珍贵的东西，有时比金子更值钱。」',
      毒: '玲珑眼神一亮，像是提到了她最喜欢的话题：「南疆之毒千种，解法万般。世人总是怕毒，却不知毒与药不过是剂量的差别。」',
      蛊: '玲珑把玩着手腕上的蛊虫标本：「你对蛊感兴趣？有趣。大多数中原人听到这个字就逃了。」',
      玲珑: '她侧过头，用那双有些过于通透的眼睛看你：「你想知道我的什么？」',
      default: '玲珑抬起头，歪头打量你，沉默片刻：「有趣的气息。」她的语气说不清是褒是贬。',
    });
  }
}
