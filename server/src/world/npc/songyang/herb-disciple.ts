/**
 * 药童弟子 — 嵩阳宗药圃
 * 非战斗 NPC，在药圃打理灵草的年轻弟子
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class HerbDisciple extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '药童弟子');
    this.set('short', '一名在药田中忙碌的年轻弟子');
    this.set(
      'long',
      '一个十五六岁的少年，袖子挽到肘弯，双手沾满泥土。他蹲在药田旁小心翼翼地拔着杂草，不时凑近闻一闻灵草的气味，嘴里念念有词地背诵药性口诀。腰间别着一把小铲，身旁放着一只竹篓，里面装着刚采的几味草药。',
    );
    this.set('title', '嵩阳宗');
    this.set('gender', 'male');
    this.set('faction', Factions.SONG_YANG);
    this.set('visible_faction', '嵩阳宗');
    this.set('attitude', 'friendly');
    this.set('level', 3);
    this.set('max_hp', 120);
    this.set('hp', 120);
    this.set('combat_exp', 20);
    this.set('personality', 'shy');
    this.set('speech_style', 'timid');
    this.set('sect_id', 'songyang');
    this.set('chat_chance', 15);
    this.set('chat_msg', [
      '药童弟子擦了擦额头上的汗，又低头继续摆弄药草。',
      '药童弟子轻声念道：「金线草，味苦性凉，入肺经……」',
      '药童弟子把一株药草小心放进竹篓，满意地点了点头。',
      '药童弟子抬头看了看天色，自言自语：「该浇水了。」',
    ]);
    this.set('inquiry', {
      药草: '药童弟子腼腆地说：「师兄要什么药草？圃里种的多是常见药材，要珍稀的得去后山找。」',
      门派: '药童弟子道：「我入门不久，只会打理药圃。师兄要问门派的事，找执事院的赵执事吧。」',
      default: '药童弟子挠了挠头：「师兄找我有事么？我……我只懂些种药的事。」',
    });
  }
}
