/**
 * 商行柳玉珠 — 洛阳废都·残灯酒肆
 * 暗河旗下的江南商行驻人，表面做买卖，实则经营情报网络
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class MerchantLiu extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '柳玉珠');
    this.set('short', '一位精明的女掌柜');
    this.set(
      'long',
      '一位三十出头的女子，穿着讲究的织锦褙子，头上簪着一支简洁的玉钗。' +
        '她坐在靠窗的位置，面前摆着一盏清茶和一本账册，' +
        '右手拨弄着一枚核桃，姿态闲适而从容。' +
        '眼神清亮，笑意浅淡，说话时声音不高不低，字字分明。' +
        '周围偶尔有一两个手下打扮成伙计的人侍立，' +
        '她低声吩咐几句，伙计便无声地离开，不知去做什么。' +
        '她自称是江南商行在洛阳的驻地掌柜，做的是货物买卖的生意。',
    );
    this.set('title', '掌柜');
    this.set('gender', 'female');
    this.set('faction', Factions.AN_HE);
    this.set('visible_faction', '江南商行');
    this.set('attitude', 'friendly');
    this.set('level', 12);
    this.set('max_hp', 400);
    this.set('hp', 400);
    this.set('personality', 'cunning');
    this.set('speech_style', 'merchant');
    this.set('chat_chance', 50);
    this.set('chat_msg', [
      '柳玉珠轻轻拨了一下算盘，珠子碰撞的声音清脆而有节律。',
      '柳玉珠端起茶盏轻抿一口，目光若有所思地望向窗外。',
      '柳玉珠凑近手下低语几句，手下无声颔首，悄悄退出酒肆。',
    ]);
    this.set('inquiry', {
      买卖: '柳玉珠微微一笑：「您想要什么？本行经手各类货物，只要价格合适，没有办不到的。」她推开账册，「您先说说需求。」',
      消息: '柳玉珠抬头看了你一眼，声音放低：「消息是有，但这东西不便宜。你有什么能换的？」她轻敲桌面，「我们商行不做亏本买卖。」',
      default: '柳玉珠对你展露一个职业性的微笑：「这位客官，初次见面。洛阳虽乱，生意照做——您有什么需要，尽管开口。」',
    });
  }
}
