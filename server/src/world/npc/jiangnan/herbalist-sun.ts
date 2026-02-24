/**
 * 老药师孙济仁 — 烟雨镇·济世药铺
 * 行医数十年的老药师，医术高超，性情古怪
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class HerbalistSun extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '孙济仁');
    this.set('short', '戴老花镜的白发老药师');
    this.set(
      'long',
      '孙济仁是个须发皆白的老者，鼻梁上架着一副铜框老花镜，' +
        '镜片后面的眼睛却出奇地亮。他穿着一件灰布对襟褂子，' +
        '腰间系着药囊，里面装着几味应急的药材。' +
        '他的手指因常年研磨药材而微微泛黄，指甲修剪得极短。' +
        '说话时声音不大，但每个字都透着一股不容置疑的笃定。' +
        '在烟雨镇行医四十年，救过的人自己都记不清了，' +
        '只是脾气越老越倔，不合他心意的病人他是真敢赶出去的。',
    );
    this.set('title', '济世药铺 坐堂大夫');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '济世药铺');
    this.set('attitude', 'friendly');
    this.set('level', 10);
    this.set('max_hp', 380);
    this.set('hp', 380);
    this.set('combat_exp', 0);
    this.set('personality', 'grumpy');
    this.set('speech_style', 'blunt');
    this.set('chat_chance', 35);
    this.set('chat_msg', [
      '孙济仁推了推老花镜，低头仔细辨认药方上的字迹，嘴里嘟囔着什么。',
      '孙济仁打开一个药柜抽屉，取出一撮药材放在鼻下嗅了嗅，满意地点头。',
      '孙济仁用铜秤仔细称量药材，多一分少一分都不行。',
      '孙济仁摇摇头，把一张药方撕了重写，嘴里念叨着：「这剂量不对。」',
    ]);
    this.set('inquiry', {
      药材:
        '孙济仁扶了扶老花镜：「药材这东西，讲究道地。' +
        '同一味药，产地不同效果天差地别。我这铺子的药，' +
        '每一味都是我亲手把关，以次充好的事我做不来。」',
      伤势:
        '孙济仁上下打量你一番：「嗯……气色倒还行。' +
        '在外面跑江湖的，受点伤是常事，但别硬撑。' +
        '内伤拖久了可不是闹着玩的，我见过太多逞能的年轻人了。」',
      default:
        '孙济仁头也没抬：「看病还是抓药？看病坐下来，伸手让我号脉。' +
        '抓药拿方子来。闲聊的话……请便，老夫忙着呢。」',
    });
  }
}
