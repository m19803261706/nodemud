/**
 * 卜先生 — 洛阳废都·禅修废园
 * 神秘卦师，斗笠遮面，言语隐晦，知晓天裂之前的星象
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class FortuneTeller extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '卜先生');
    this.set('short', '一个戴着斗笠的瘦削男子');
    this.set(
      'long',
      '一个坐在竹林下的瘦削男子，斗笠压得极低，遮住了大半张脸。' +
        '他的手指长而枯黄，操弄铜钱和龟壳时却异常灵活，' +
        '一看便知是常年钻研此道的人。' +
        '桌上的龟壳已经磨得发亮，铜钱正反两面各有不同的磨痕。' +
        '他不主动招揽生意，只是静静地坐着，' +
        '让人说不清他到底是在等客，还是在算什么只有他自己知道的事。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'friendly');
    this.set('level', 14);
    this.set('max_hp', 450);
    this.set('hp', 450);
    this.set('personality', 'mysterious');
    this.set('speech_style', 'cryptic');
    this.set('chat_chance', 30);
    this.set('chat_msg', [
      '卜先生把三枚铜钱抛起又接住，自言自语：「乾上坤下……有意思。」',
      '卜先生对着龟壳出神，偶尔用手指敲敲壳面。',
      '卜先生抬头看了看竹叶间的天空，若有所思。',
    ]);
    this.set('inquiry', {
      卜卦: '卜先生摇了摇铜钱：「你的卦……嗯，三分天意七分人为。给你一句话——『向南走，别回头。』至于什么意思，你自己悟。」',
      星图: '卜先生压低声音：「池底那幅？不是现在的星象，是天裂之前的。你对比一下，就知道天裂改变了什么。」',
      default:
        '卜先生微笑道：「要算一卦？不贵，一个铜板。算不准不要钱。」',
    });
  }
}
