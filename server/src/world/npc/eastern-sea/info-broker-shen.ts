/**
 * 情报贩子沈耳 — 潮汐港·黑市
 * 靠贩卖消息为生的独眼男人，什么都知道，什么都卖
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class InfoBrokerShen extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '沈耳');
    this.set('short', '独眼阴笑的消息贩子');
    this.set(
      'long',
      '沈耳是个矮瘦的男人，左眼蒙着一块脏兮兮的黑布，' +
        '右眼却亮得像夜猫子，转来转去不停地打量四周。' +
        '他穿着一件灰扑扑的长衫，看不出原来是什么颜色，' +
        '袖子里藏着数不清的口袋，里面鼓鼓囊囊不知装了什么。' +
        '他总是靠在黑市某个角落的墙上，嘴角挂着一丝意味不明的笑，' +
        '像是随时都在盘算着什么。' +
        '在潮汐港，沈耳是最危险的人之一——' +
        '不是因为他能打，而是因为他什么都知道，' +
        '而知道得太多的人，要么是最有用的，要么是最先死的。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'neutral');
    this.set('level', 18);
    this.set('max_hp', 550);
    this.set('hp', 550);
    this.set('combat_exp', 0);
    this.set('personality', 'cunning');
    this.set('speech_style', 'sly');
    this.set('chat_chance', 35);
    this.set('chat_msg', [
      '沈耳的独眼滴溜溜转了一圈，似乎又记下了什么有意思的事。',
      '沈耳从袖子里掏出一张纸条看了一眼，随即塞回去，嘴角的笑意更深了。',
      '沈耳靠着墙闭目养神，但他那只独眼的眼皮微微颤动，显然没真的在休息。',
    ]);
    this.set('inquiry', {
      消息: '沈耳咧嘴一笑，伸出三根手指：「三种价，三种消息。铜板买街头传闻，银子买确切消息，金子嘛——买命不嫌贵。你出多少？」',
      朝廷: '沈耳压低声音，独眼精光闪闪：「朝廷的事？这可是大买卖。最近东海水师在调动，三条大船往南去了。至于为什么——你得加钱。」',
      散盟: '沈耳歪着头想了想：「散盟最近不太平，几个头目在争地盘。你要是想找他们做生意，我可以帮你牵线。当然，牵线费另算。」',
      default: '沈耳打量你一番，发出嘶嘶的笑声：「初来乍到？很好很好。新人身上的消息最值钱——你不用付钱，你自己就是一条消息。」',
    });
  }
}
