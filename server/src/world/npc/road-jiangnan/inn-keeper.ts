/**
 * 酒家掌柜 — 水路·水边酒家
 * 杏花村酒家的胖掌柜，热情好客，见多识广
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class InnKeeper extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '酒家掌柜');
    this.set('short', '笑眯眯的杏花村酒家掌柜');
    this.set(
      'long',
      '掌柜是个圆脸胖子，笑起来眼睛眯成一条缝，' +
        '怎么看都像个弥勒佛似的人物。' +
        '他穿着一件干净的灰布长衫，腰间系着白围裙，' +
        '上面沾着几点酒渍和油星，那是常年在灶台边忙碌留下的。' +
        '手里总擦着一只粗瓷碗，擦得锃亮，似乎永远也擦不够。' +
        '别看他笑容可掬的样子，这条水路上的江湖事他门清，' +
        '谁是正道谁走偏门，他心里一本账记得清清楚楚。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'friendly');
    this.set('level', 6);
    this.set('max_hp', 180);
    this.set('hp', 180);
    this.set('combat_exp', 35);
    this.set('personality', 'cheerful');
    this.set('speech_style', 'plain');
    this.set('chat_chance', 12);
    this.set('chat_msg', [
      '酒家掌柜将一壶温好的黄酒端上桌，酒香弥漫开来。',
      '酒家掌柜倚在柜台后面，笑呵呵地听客人们闲聊。',
      '酒家掌柜用抹布仔细擦拭着桌面，嘴里哼着江南小调。',
    ]);
    this.set('inquiry', {
      default:
        '酒家掌柜笑呵呵地招呼道：「客官里边坐！本店黄酒是用镇上老井水酿的，' +
        '配一碟桂花糟鱼，保管你吃了还想吃。' +
        '对了，前面柳堤上最近不太安宁，水贼又活络起来了，你路过当心些。」',
    });
  }
}
