/**
 * 银匠老银 — 雾岚寨·银匠铺
 * 苗银手艺人，沉默内敛，手艺精湛，打造的银饰是寨中最好的
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class SilversmithLaoyin extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '老银');
    this.set('short', '一个正在敲打银片的老匠人');
    this.set(
      'long',
      '他是个干瘦的老头，头发花白却梳得一丝不苟，用一根银簪别在脑后。' +
        '面前的小矮桌上摆满了银丝、银片、小锤和各种叫不出名字的精细工具。' +
        '他的双手布满老茧，但十根手指灵活得不像这个年纪的人，' +
        '小锤敲在银片上，叮叮当当，节奏均匀得像在打拍子。' +
        '他身上系着一条沾满银粉的旧围裙，围裙上的银粉在光线下微微发亮。' +
        '寨里人管他叫「老银」，没人知道他的真名，' +
        '他自己也不在意，好像这辈子除了银子，别的什么都不重要。',
    );
    this.set('title', '银匠');
    this.set('gender', 'male');
    this.set('faction', Factions.BAI_MAN);
    this.set('visible_faction', '雾岚寨');
    this.set('attitude', 'friendly');
    this.set('level', 9);
    this.set('max_hp', 320);
    this.set('hp', 320);
    this.set('personality', 'stoic');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 20);
    this.set('chat_msg', [
      '老银的小锤敲在银片上，叮叮当当，声音细密而有节奏，像山间的雨打在竹叶上。',
      '老银拿起一枚刚打好的银耳环，对着光转了转，然后放下，微微摇头，又拿起锤子。',
      '老银用一根细如发丝的银线穿过银珠，手指稳得像是长在桌子上，没有一丝颤抖。',
    ]);
    this.set('inquiry', {
      银饰: '老银头也不抬，手上的小锤没停：「苗家的银，不是拿来看的，是拿来传的。阿妈传阿女，一代一代，银子会旧，手艺不会旧。」',
      手艺: '老银停下锤子，看了看自己的手：「学了六十年。从我阿爷那里学的，他从他阿爷那里学的。这双手打过的银子，怕是比你走过的路还多。」',
      买卖: '老银皱了皱眉：「银是给寨里人的。你若诚心想要，拿东西来换。不收银子——拿银子换银子，那不是笑话么。」',
      default: '老银瞥了你一眼，又低头继续敲打，锤声就是他的回答。',
    });
  }
}
