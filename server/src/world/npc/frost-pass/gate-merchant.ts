/**
 * 货郎马九 — 朔云关·关前集市
 * 走南闯北的行商，专做边关生意，消息灵通
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class GateMerchant extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '马九');
    this.set('short', '一个裹着厚棉袍、挑着担子的走货郎');
    this.set(
      'long',
      '四十来岁，面色黧黑，一看就是常年在风沙里讨生活的人。' +
        '穿着一件看不出原色的厚棉袍，上面缝了好几个暗袋，' +
        '里面装着什么只有他自己知道。' +
        '两头挑着的担子里货物琳琅满目：针线、火折子、药粉、干果、' +
        '甚至还有几把不知从哪里搞来的小匕首。' +
        '他嘴角总挂着一丝精明的笑，说话时习惯性地搓着双手，' +
        '像是随时准备开始一笔买卖。' +
        '据说他跑过的路比关城里任何人都远，' +
        '从中原到北境，从东海到西域，' +
        '没有他不敢走的路，也没有他不敢卖的货。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'friendly');
    this.set('level', 8);
    this.set('max_hp', 250);
    this.set('hp', 250);
    this.set('personality', 'cunning');
    this.set('speech_style', 'casual');
    this.set('chat_chance', 45);
    this.set('chat_msg', [
      '马九摆弄着担子里的货物，冲路过的人吆喝：「看看看，南边来的好货，过了这村没这店！」',
      '马九蹲在摊位前，用牙咬了咬一枚铜钱，辨别真伪，然后满意地揣进怀里。',
      '马九跟旁边的摊贩低声交谈着什么，两人都笑了笑，然后各自散开，神色如常。',
    ]);
    this.set('inquiry', {
      买卖: '马九搓着手笑道：「客官好眼光！我这担子里东西虽然杂，但都是实用的好货。边关的行情你也知道，什么都缺。我这价格公道，绝不坑人——好吧，稍微贵了那么一点点，但这是边关价，南边的东西运到这里，路费就不少。」',
      消息: '马九四下看了看，压低声音：「消息嘛，走南闯北的，听到的不少。最近南边来的商队越来越少了，路上不太平。北境官道上出了几伙马匪，不知道是哪来的，专劫运粮车。还有啊——」他顿了顿，伸出手搓了搓拇指和食指，「详细的得加钱。」',
      default: '马九笑嘻嘻地说：「买不买没关系，看看总是免费的嘛。」',
    });
  }
}
