/**
 * 阿婆细妹 — 雾岚寨·竹楼群
 * 苗寨老居民，热心肠的老阿婆，喜欢拉家常
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class BambooVillager extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '细妹');
    this.set('short', '一个坐在竹楼前搓麻线的老阿婆');
    this.set(
      'long',
      '她已经很老了，脸上的皱纹深得能夹住一粒米，但精神还算硬朗。' +
        '穿着一身浆洗得发白的靛蓝衣裳，袖口和领口的绣花虽然褪了色，花样却还清晰。' +
        '她坐在竹楼前的矮凳上，腿边放着一筐麻线，双手不停地搓啊搓，' +
        '手上的动作完全不需要眼睛看，因为她的眼睛一直在打量来来往往的人。' +
        '寨里人都叫她「细妹阿婆」——据说她年轻时是寨中最漂亮的姑娘，' +
        '如今虽然老了，说起往事来眼睛还是亮亮的。',
    );
    this.set('title', '');
    this.set('gender', 'female');
    this.set('faction', Factions.BAI_MAN);
    this.set('visible_faction', '雾岚寨');
    this.set('attitude', 'friendly');
    this.set('level', 8);
    this.set('max_hp', 250);
    this.set('hp', 250);
    this.set('personality', 'talkative');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 45);
    this.set('chat_msg', [
      '细妹阿婆一边搓麻线，一边碎碎念着什么，大概是在数着今天已经搓了多少根。',
      '细妹阿婆冲路过的小孩喊了一声，让他别跑那么快，小心摔着。',
      '细妹阿婆抬起头看了看天色，嘟囔道：「又要落雨了，晒的药怕是收不及了。」',
      '细妹阿婆从衣兜里摸出几颗炒熟的苞谷粒，慢慢地嚼着，神情很是满足。',
    ]);
    this.set('inquiry', {
      寨子: '细妹阿婆来了精神：「你问这寨子？我在这里住了七十多年嘞！从我阿妈嫁过来那会儿算起，那时候寨门还是木头的，现在都换了石头了。变了好多，又好像什么都没变。」',
      往事: '细妹阿婆眯起眼睛，像是在看很远的地方：「我年轻那会儿啊，跳月的时候，阿哥们排着队来吹芦笙。我只看了一个人——就是后来你们叫的那个老猎头。他走了好些年了……」她叹了口气。',
      外人: '细妹阿婆摆摆手：「外面来的人，好的坏的都有。你是好人还是坏人，我看不出来。不过你要在寨子里待着，就守寨子的规矩。规矩不多，就一条——不害人。」',
      default: '细妹阿婆冲你招招手：「来来来，坐这儿歇会儿。你从哪儿来的？走了多远的路？饿不饿？」她的热情让人有些招架不住。',
    });
  }
}
