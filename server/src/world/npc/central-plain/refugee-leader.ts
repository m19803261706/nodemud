/**
 * 麻三 — 洛阳废都·流民棚户
 * 棚户区实际管事人，精明圆滑，以保护费为纽带维持脆弱秩序
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class RefugeeLeader extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '麻三');
    this.set('short', '一个满脸麻子的精壮汉子');
    this.set(
      'long',
      '一个三十出头的精壮汉子，脸上布满麻点，看起来像是曾经生过天花，' +
        '却熬过来了——这张脸本身就是一份履历表。' +
        '他习惯把草根叼在嘴角，两眼打量人的方式像是在估价，' +
        '算的不是你值多少钱，而是你有没有价值。' +
        '棚户区的人叫他麻三，不带姓，不带敬称，但该给的保护费一文不少。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'friendly');
    this.set('level', 10);
    this.set('max_hp', 380);
    this.set('hp', 380);
    this.set('personality', 'cunning');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 35);
    this.set('chat_msg', [
      '麻三叼着草根，靠在棚柱上，眯眼打量每一个从这里经过的人。',
      '麻三跟一个流民嘀咕了几句什么，流民点头哈腰地走了，麻三抱着胳膊，满意地哼了声。',
      '麻三数着手里的铜板，一枚一枚地拨，数完一叠，露出了心满意足的笑容。',
    ]);
    this.set('inquiry', {
      住处:
        '麻三笑呵呵道：「要住？一天五十文，包个棚子位，遮风挡雨，还能睡个安稳觉。不贵吧？比露宿街头强多了。」他竖起一根指头，「一手交钱，一手安排位子。」',
      消息:
        '麻三压低声音，往你身边凑了凑：「消息嘛……要看什么消息了。有些便宜，有些贵。你先说想知道什么，我报个价，成不成另说。」',
      default:
        '麻三抱着胳膊，笑着打量你：「新来的？这片是我的地盘，有什么需要尽管问，能帮的帮，帮不了的……那就另当别论了。」',
    });
  }
}
