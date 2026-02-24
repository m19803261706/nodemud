/**
 * 驼夫哈桑 — 黄沙驿·马厩驼圈
 * 经验丰富的驼夫，熟知大漠中的一切路线与危险
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class CamelDriver extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '哈桑');
    this.set('short', '一个正在给骆驼修蹄的黝黑男子');
    this.set(
      'long',
      '他皮肤黝黑如铁，脸上的皱纹像是沙漠里的风蚀纹路，深刻而粗犷。' +
        '头上缠着一圈脏兮兮的白色头巾，颈后的布垂下来遮住后脖子，防晒用的。' +
        '手掌上全是老茧，指甲缝里嵌着洗不掉的沙粒。' +
        '他蹲在骆驼旁边，用一把小刀熟练地修整驼蹄，' +
        '骆驼安安静静地任他摆弄，偶尔扭头蹭他一下，像是老朋友的亲昵。' +
        '走了大半辈子丝路的人，腿有点弯，走路略带摇晃，' +
        '但一上驼背就像换了个人，稳如泰山。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'friendly');
    this.set('level', 10);
    this.set('max_hp', 350);
    this.set('hp', 350);
    this.set('personality', 'calm');
    this.set('speech_style', 'folksy');
    this.set('chat_chance', 30);
    this.set('chat_msg', [
      '哈桑轻轻拍了拍骆驼的脖子，骆驼低下头来蹭他的手掌。',
      '哈桑检查着鞍具上的绳结，一个一个慢慢拉紧，不紧不慢。',
      '哈桑往水槽里倒了一桶水，骆驼们争先恐后地凑过来喝。',
      '哈桑蹲在阴凉处啃着一块干馕，眯着眼睛看远处的天际线。',
    ]);
    this.set('inquiry', {
      路线: '哈桑用手指在沙地上画了几条线：「去长安走北线，三十天。去天竺走南线，四十天。但你要是第一次走，最好跟商队，一个人进沙海，十有八九回不来。」',
      骆驼: '哈桑拍了拍身边骆驼的脖子：「骆驼比马好用。马到了沙漠里就抓瞎，骆驼不一样，它能闻到地底下的水。你信不信？不信你可以试试。」',
      沙漠: '哈桑抬头看了看天色：「沙漠里最怕的不是沙匪，是迷路。白天看太阳，晚上看北极星，但起了沙暴，什么都看不见——那就只能靠命了。」',
      default:
        '哈桑点了点头，露出被风沙磨得不太整齐的牙齿：「你是要雇驼队？先说去哪儿，我给你报个价。」',
    });
  }
}
