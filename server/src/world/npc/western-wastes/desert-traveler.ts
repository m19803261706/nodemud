/**
 * 异域旅人法提玛 — 黄沙驿·绿洲湖畔
 * 来自极西之地的女旅者，独自行走丝路，见多识广
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class DesertTraveler extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '法提玛');
    this.set('short', '一个坐在湖边洗脚的异域女子');
    this.set(
      'long',
      '她把鞋子脱在岸边，光脚泡在湖水里，脸上是走了很远的路之后那种放松的表情。' +
        '深棕色的皮肤，高鼻梁，眼睛又大又亮，是极西之地的面貌。' +
        '头上缠着一条蓝色的长纱巾，既遮阳又防风沙。' +
        '身边放着一个旧皮包，鼓鼓囊囊的，不知道装着什么。' +
        '她一个人走丝路，这在西域并不多见——一个女人独行大漠，' +
        '需要的不只是胆量，还有足够的本事。' +
        '她的手腕上有纹身，是某种异域的护身符文，蓝色的线条蜿蜒如蛇。',
    );
    this.set('title', '');
    this.set('gender', 'female');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'neutral');
    this.set('level', 15);
    this.set('max_hp', 550);
    this.set('hp', 550);
    this.set('personality', 'adventurous');
    this.set('speech_style', 'thoughtful');
    this.set('chat_chance', 25);
    this.set('chat_msg', [
      '法提玛在湖边静静地坐着，注视着水面上天空的倒影，似乎在想很远的事。',
      '法提玛从包里取出一本封皮磨损的手抄本，翻到某一页，用炭笔写了几行字。',
      '法提玛往水里扔了一颗石子，看涟漪一圈一圈扩开，嘴角微微上扬。',
      '法提玛轻轻哼着一首异域的歌谣，曲调奇异而好听，在湖面上飘散。',
    ]);
    this.set('inquiry', {
      旅行: '法提玛笑了笑：「我从蓝海之滨出发，走了两年才到这里。一个人走路有个好处——你什么时候停下来，什么时候出发，全由自己。」',
      极西: '法提玛眺望西方：「极西之地有白色的城邦、蓝色的海。那里的人用橄榄和葡萄酿酒，用另一种文字写诗。和这里完全不同，但一样美。」',
      纹身: '法提玛展示手腕上的蓝色纹路：「这是我家乡的护身符文。据说能保佑旅人平安。有没有用？」她想了想，「走了两年还活着，大概有用吧。」',
      default: '法提玛抬头看你，用不太流利的中原话说：「你好。坐一坐？水很凉，很舒服。」',
    });
  }
}
