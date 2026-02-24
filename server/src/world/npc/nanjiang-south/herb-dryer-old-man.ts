/**
 * 晒药老农石伯 — 雾岚寨·晒药场
 * 负责晒制草药的老农，话不多，干活踏实
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class HerbDryerOldMan extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '石伯');
    this.set('short', '一个弓着腰翻晒草药的老农');
    this.set(
      'long',
      '他弓着腰站在一排排竹匾之间，手里拿着一把竹耙子，' +
        '不紧不慢地把铺在竹匾上的草药翻过来晒另一面。' +
        '他的背已经弯得直不起来了，像一棵被山风吹歪的老松。' +
        '粗布短褂被汗浸透了，贴在背上，能看出肩胛骨的形状。' +
        '他的脚趾粗壮地抓着地面，脚板宽大得像两把蒲扇，' +
        '那是一辈子不穿鞋在山路上走出来的。' +
        '他很少说话，偶尔抬头看看太阳的位置，估摸着什么时候该收药。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.BAI_MAN);
    this.set('visible_faction', '雾岚寨');
    this.set('attitude', 'friendly');
    this.set('level', 8);
    this.set('max_hp', 280);
    this.set('hp', 280);
    this.set('personality', 'stoic');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 15);
    this.set('chat_msg', [
      '石伯用竹耙翻了翻草药，凑近闻了闻，点了点头。',
      '石伯抬头看了看太阳，然后默默地把几匾草药搬到阳光更足的地方。',
      '石伯蹲下身，从竹匾里挑出一根发了霉的草梗，皱着眉扔到一边。',
    ]);
    this.set('inquiry', {
      草药: '石伯停下手里的活计，想了半天才开口：「晒药嘛……七分靠天，三分靠人。太阳太毒了不行，药晒焦了就废了。阴天也不行，不干透会发霉。做这个活，就是看老天的脸色。」',
      天气: '石伯望了望远处的山头：「那边云厚了，下午怕是有雨。得赶紧把这几匾收了。」他说着就加快了手上的动作。',
      default: '石伯嗯了一声，继续翻他的药。看样子他不太习惯跟生人说话。',
    });
  }
}
