/**
 * 探子燕七 — 朔云关·烽燧台
 * 游走于各势力之间的情报贩子，立场模糊，见钱开口
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class SpyYan extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '燕七');
    this.set('short', '一个独立台上、若有所思的瘦削男子');
    this.set(
      'long',
      '年岁看不准，可能三十，也可能四十，那种长年风吹日晒的脸让人难以判断。' +
        '穿着普通的灰色布衫，没有任何门派或势力的标记，' +
        '看起来像个落魄书生，又像个走惯了江湖的行脚商。' +
        '他习惯站在烽燧台上远眺，手里把玩着一枚铜钱，' +
        '转得飞快，却从不落地。' +
        '说话声音不大，总带着一种掌握着什么秘密的从容，' +
        '令人捉摸不透他究竟在卖力给谁。' +
        '据说承天朝、狼庭、甚至暗河的人都找过他，' +
        '但没人知道他最终向哪边倾斜。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'friendly');
    this.set('level', 12);
    this.set('max_hp', 350);
    this.set('hp', 350);
    this.set('personality', 'cunning');
    this.set('speech_style', 'formal');
    this.set('chat_chance', 30);
    this.set('chat_msg', [
      '燕七站在台边，凝视北方草原的远处，铜钱在指间翻飞，眼神却没有焦距。',
      '燕七取出一个小册子，用毛笔快速写了几行字，然后合上，揣回怀里。',
      '燕七若有所思地点头，像是在回应某个只有他自己知道的问题。',
    ]);
    this.set('inquiry', {
      情报:
        '燕七收起铜钱，侧身看你，微微一笑：「情报是有，但消息从来不是白给的。' +
        '你要什么？北漠的，朝廷的，还是江湖各派的？价格不同，准确性也不同。' +
        '不过我卖的东西，从来没有让人失望过……活下来的都这么说。」',
      消息:
        '燕七压低声音：「告诉你一件免费的事——北境现在至少有三方势力的人混在关城里，' +
        '你看到的任何一个"普通旅人"都可能是某人的眼线。' +
        '包括我。」他顿了顿，再次微笑，「当然，我比他们更贵，也更可靠。」',
      default: '燕七偏头看你，微笑道：（微笑）「风大，说话小声些。」',
    });
  }
}
