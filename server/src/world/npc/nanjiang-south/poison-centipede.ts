/**
 * 毒蜈蚣 — 雾岚寨·毒雾谷
 * 毒雾谷中横行的巨型蜈蚣，剧毒无比
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class PoisonCentipede extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '毒蜈蚣');
    this.set('short', '一只通体漆黑的巨型蜈蚣');
    this.set(
      'long',
      '这只蜈蚣有小臂长短，通体漆黑发亮，像一截活动的乌木。' +
        '无数条细足在地面上飞速划动，发出令人牙酸的嚓嚓声。' +
        '它的头部两侧各有一对暗红色的毒颚，尖端微微弯曲，' +
        '颚尖上不断渗出黏稠的淡黄色毒液，滴在石头上便嗤嗤地冒出白烟。' +
        '毒雾谷的蜈蚣比别处的更大更毒，据说是常年浸泡在谷中的毒瘴里，' +
        '毒性浸入了骨髓，连鸟雀都不敢在它们出没的地方落脚。' +
        '它正弓起前半段身体，毒颚张开，像是在警告一切靠近的活物。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'hostile');
    this.set('level', 12);
    this.set('max_hp', 350);
    this.set('hp', 350);
    this.set('combat_exp', 80);
    this.set('personality', 'aggressive');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 5);
    this.set('chat_msg', [
      '毒蜈蚣弓起身体，无数条细足在地面上疯狂划动，像一台失控的机器。',
      '毒蜈蚣的毒颚不断开合，淡黄色的毒液滴落在地上，石头表面被腐蚀出浅浅的坑痕。',
      '毒蜈蚣沿着石壁快速爬行，黑色的身躯在潮湿的岩面上反射出幽暗的光泽。',
    ]);
    this.set('inquiry', {
      default: '毒蜈蚣张开毒颚，发出咔咔的威胁声，前半段身体高高弓起。',
    });
  }
}
