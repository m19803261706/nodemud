/**
 * 酒楼掌柜周胖子 — 烟雨镇·望江酒楼
 * 热情的胖掌柜，八面玲珑，消息灵通
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class TavernKeeper extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '周胖子');
    this.set('short', '笑容满面的胖掌柜');
    this.set(
      'long',
      '周胖子人如其名，圆滚滚的身材像一只倒扣的水缸，' +
        '走起路来地板都跟着颤。他的脸上永远堆着笑，' +
        '笑起来眼睛眯成一条缝，看着就让人觉得亲切。' +
        '他穿着一件绛红色的缎面马褂，胸前的扣子被肚子撑得紧绷绷的。' +
        '虽然看着憨厚，但能在这鱼龙混杂的酒楼做了十几年掌柜，' +
        '没点本事是不行的。他的耳朵特别灵，' +
        '大堂里几十桌人同时说话，他能准确地听出哪桌在聊什么。',
    );
    this.set('title', '望江酒楼 掌柜');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '望江酒楼');
    this.set('attitude', 'friendly');
    this.set('level', 8);
    this.set('max_hp', 320);
    this.set('hp', 320);
    this.set('combat_exp', 0);
    this.set('personality', 'friendly');
    this.set('speech_style', 'casual');
    this.set('chat_chance', 55);
    this.set('chat_msg', [
      '周胖子扯着嗓子招呼客人：「里边请，楼上雅座还有位子！」',
      '周胖子亲自端着一盘招牌菜上桌，笑着说了几句讨喜的话。',
      '周胖子站在柜台后面算账，胖手指在算盘上飞快地拨弄。',
      '周胖子笑眯眯地给常客续酒，顺便问几句家长里短。',
    ]);
    this.set('inquiry', {
      招牌菜:
        '周胖子拍了拍圆滚滚的肚皮：「要说咱望江酒楼的招牌，' +
        '那必须是桂花酿配醉虾。这桂花酿是我自家酿的，' +
        '用的是镇外桂花山上的金桂，别处喝不到。' +
        '不谦虚地说，整个江南就这一味。」',
      江湖事:
        '周胖子凑近了些，压低声音：「开酒楼的嘛，什么人都见。' +
        '最近来了几拨外地人，喝酒时遮遮掩掩的。' +
        '我看啊，不是寻仇的就是寻宝的。你自己留个心眼。」',
      default:
        '周胖子热情地迎上来：「哎呀，新面孔！来来来，' +
        '先尝尝我们的桂花酿，第一壶算我请的，交个朋友！」',
    });
  }
}
