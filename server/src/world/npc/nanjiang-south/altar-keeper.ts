/**
 * 祭司通灵 — 雾岚寨·祭坛
 * 祭坛守护者，负责祭祀仪式与祖灵沟通，年迈而威严
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class AltarKeeper extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '通灵');
    this.set('short', '一个披着羽毛斗篷的老祭司');
    this.set(
      'long',
      '他年纪很大了，大到连寨中最年长的老人也说不清他到底多少岁。' +
        '身上披着一件用各色鸟羽编缀的斗篷，白色的、灰色的、翠绿的羽毛层层叠叠，' +
        '在微风中轻轻抖动，像一只收拢翅膀的巨鸟。' +
        '面部刺着复杂的图腾纹样，两道深蓝色的线从额头一直延伸到下巴，' +
        '那是只有祭司才能刺的「通灵纹」。' +
        '他双目半阖，口中不断低声念诵着什么，偶尔从身边的铜盘里抓起一把香草粉洒进祭火中，' +
        '火焰便变成蓝绿色，发出嗤嗤的响声。' +
        '他的存在本身就像一种仪式——安静的、持续的、不可打断的。',
    );
    this.set('title', '祭司');
    this.set('gender', 'male');
    this.set('faction', Factions.BAI_MAN);
    this.set('visible_faction', '雾岚寨');
    this.set('attitude', 'friendly');
    this.set('level', 14);
    this.set('max_hp', 520);
    this.set('hp', 520);
    this.set('personality', 'philosophical');
    this.set('speech_style', 'scholarly');
    this.set('chat_chance', 15);
    this.set('chat_msg', [
      '通灵抓起一把香草粉洒入祭火，火焰变为蓝绿色，空气中弥漫着辛辣的气味。',
      '通灵低声吟诵着古老的祭词，声音低沉而绵长，像是从地底传来的回响。',
      '通灵闭目端坐，身上的羽毛斗篷在微风中轻轻抖动，整个人像一尊苍老的石像。',
    ]);
    this.set('inquiry', {
      祭祀: '通灵缓缓睁开浑浊的双眼：「祭祀不是给活人看的，是给先人听的。火烧起来，烟升上去，先人就知道后人还记得他们。记得，就不会断。」',
      祖灵: '通灵往火中丢了一片干叶：「祖灵不是鬼，是根。树没了根，风一吹就倒。人没了祖灵，走路都不稳当。」',
      图腾: '通灵用枯瘦的手指指了指自己脸上的刺青：「这不是画上去的，是刻上去的。每一道线，都要念七天的咒才能动刀。痛了七天，也记了七天。」',
      default: '通灵半睁着眼看了你一会，又闭上了：「心不静的人，先去山里走一圈再来。」',
    });
  }
}
