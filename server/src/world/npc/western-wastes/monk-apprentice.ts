/**
 * 密宗学徒贡嘎 — 黄沙驿·经堂
 * 达摩旃的弟子，年轻而虔诚，负责抄经和维护经堂
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class MonkApprentice extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '贡嘎');
    this.set('short', '一个正在抄写经文的年轻僧侣');
    this.set(
      'long',
      '他很年轻，大约十七八岁，头顶剃得光光的，但后脑勺留了一撮短发，' +
        '是密宗初级弟子的发式。穿着洗得发白的棕色僧袍，赤着脚。' +
        '他跪坐在矮桌前，一笔一画地抄写经文，笔锋还不太稳，' +
        '偶尔写错一个字，就小心翼翼地用小刀刮掉重写。' +
        '脸上有种年轻人特有的认真和紧张，似乎对外面的世界充满好奇，' +
        '但又努力保持出家人应有的沉静。' +
        '他是三年前达摩旃在路边收留的孤儿，从此跟着师父修行。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.XI_YU);
    this.set('visible_faction', '密宗');
    this.set('attitude', 'friendly');
    this.set('level', 10);
    this.set('max_hp', 300);
    this.set('hp', 300);
    this.set('personality', 'earnest');
    this.set('speech_style', 'shy');
    this.set('chat_chance', 25);
    this.set('chat_msg', [
      '贡嘎埋头抄经，写到某个字时停下来想了想，然后小心翼翼地落笔。',
      '贡嘎偷偷抬头看了看外面的集市方向，又赶紧低下头，脸微微红了。',
      '贡嘎给酥油灯添了一点油，灯火亮了一些，在他脸上映出暖黄色的光。',
      '贡嘎拿着经卷轻声诵读，声音稚嫩但很认真，偶尔会卡在某个生僻的梵文上。',
    ]);
    this.set('inquiry', {
      师父: '贡嘎恭敬道：「师父在禅修帐中打坐，他很少说话，但每一句都值得记一辈子。」他犹豫了一下，「师父说，我还需要五年才能出师。」',
      修行: '贡嘎双手合十：「修行就是每天做同样的事——抄经、打坐、扫地、挑水。师父说，把简单的事做到极致，就是修行。」',
      经文: '贡嘎指了指桌上的经卷：「这是《金刚心要》，密宗的基础经文。我已经抄了三遍了，但每次都觉得理解得不够。」',
      default: '贡嘎双手合十，微微低头：「施主好。请轻声，这里是诵经的地方。」',
    });
  }
}
