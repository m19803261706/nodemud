/**
 * 马倌小六 — 朔云关·马厩
 * 沉默寡言的年轻马倌，与马为伴，不善与人交际
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class StableHand extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '小六');
    this.set('short', '一个蹲在马栏边、满身草屑的年轻人');
    this.set(
      'long',
      '十七八岁的模样，瘦小黝黑，面相比实际年龄老成得多。' +
        '穿着一件沾满草屑和马毛的旧袄，袖口用麻绳扎着，' +
        '身上始终带着一股马粪和干草混合的味道。' +
        '他不怎么说话，大部分时间都蹲在马栏边，' +
        '用一把木梳给马匹梳理鬃毛，动作轻柔得像在抚摸自家孩子。' +
        '马匹见了他都格外温驯，会主动把头凑过来蹭他的手掌。' +
        '据说他是个孤儿，三年前饿得半死被巡逻的骑兵捡回来的，' +
        '从此就留在马厩里，跟马比跟人亲。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.CHENG_TIAN);
    this.set('visible_faction', '承天朝');
    this.set('attitude', 'friendly');
    this.set('level', 6);
    this.set('max_hp', 150);
    this.set('hp', 150);
    this.set('personality', 'fearful');
    this.set('speech_style', 'terse');
    this.set('chat_chance', 30);
    this.set('chat_msg', [
      '小六蹲在马栏边，轻轻拍着一匹枣红马的脖子，嘴里含混地哼着不成调的歌。',
      '小六默默地往食槽里添了一把干草，那匹瘦马立刻低头嚼了起来。',
      '小六抱着一捆稻草从棚子那头走过来，步子轻得几乎没有声音。',
    ]);
    this.set('inquiry', {
      马: '小六低着头，半天才挤出几个字：「马……马不够吃。精料断了。」他抬头看你一眼，又迅速低下去，「你……你要是有多余的粮食……马吃杂粮也行。」',
      骑兵: '小六想了想，声音很轻：「骑兵哥哥们……对马好的，马也对他们好。上次出关……有三匹马没回来。」他蹲下身，抱住膝盖，不再说话。',
      default: '小六缩了缩肩膀，小声说：「别……别踩到马粪。」',
    });
  }
}
