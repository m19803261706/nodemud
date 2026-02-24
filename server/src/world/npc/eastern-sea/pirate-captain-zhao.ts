/**
 * 海盗头目赵黑风 — 潮汐港·海盗窝
 * 散盟中层头目，手下有一条快船，残忍狡诈
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class PirateCaptainZhao extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '赵黑风');
    this.set('short', '盯着海图沉思的黑面汉子');
    this.set(
      'long',
      '赵黑风是个面色黝黑的中年汉子，浓眉如刀，颧骨高耸，' +
        '一双鹰眼里透着阴狠与精明。' +
        '他的头发用一条黑布扎在脑后，耳垂上穿着一枚银环，' +
        '穿一件半旧的黑色劲装，腰间佩着一柄弯月形的海刀。' +
        '赵黑风在散盟里算不上大头目，但他的"黑风号"是东海最快的船之一，' +
        '专门在商船必经的航道上设伏，得手后转眼就消失在岛屿之间。' +
        '他的手下对他又敬又畏——' +
        '敬的是他分赃从不克扣，畏的是他下手从不留活口。',
    );
    this.set('title', '黑风号船长');
    this.set('gender', 'male');
    this.set('faction', Factions.SAN_MENG);
    this.set('visible_faction', '东海·散盟');
    this.set('attitude', 'hostile');
    this.set('level', 22);
    this.set('max_hp', 1050);
    this.set('hp', 1050);
    this.set('combat_exp', 55);
    this.set('personality', 'aggressive');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 25);
    this.set('chat_msg', [
      '赵黑风用匕首在海图上划了一道，嘴角露出残忍的笑意。',
      '赵黑风抽出海刀在灯光下端详，刀刃上映出他冰冷的面孔。',
      '赵黑风低声对手下吩咐了几句，手下们面色一变，连忙去准备。',
    ]);
    this.set('inquiry', {
      黑风号:
        '赵黑风冷哼一声：「想上我的船？先问问这把刀答不答应。黑风号不收废物，上船就是拼命的买卖。」',
      航线: '赵黑风眯起眼，声音像刀子一样锋利：「航线？你要是想探路，我倒可以送你一程。不过——有去无回的那种。」',
      散盟: '赵黑风不耐烦地挥了挥手：「散盟的事轮不到你来操心。你要是有本事，拿战功来说话。没本事？那就老实待着别碍眼。」',
      default:
        '赵黑风抬眼打量你，目光像在估量一件货物的价值：「你不像是来混江湖的。说吧，找我什么事？」',
    });
  }
}
