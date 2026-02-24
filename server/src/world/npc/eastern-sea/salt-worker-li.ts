/**
 * 盐工老李 — 潮汐港·晒盐场
 * 老实本分的盐工，靠卖私盐养活一家老小
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class SaltWorkerLi extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '老李');
    this.set('short', '弯腰耙盐的黝黑汉子');
    this.set(
      'long',
      '老李是个四十多岁的汉子，皮肤被烈日和海盐侵蚀得又黑又粗糙，' +
        '手掌和脚掌上全是白色的盐渍裂纹，像干裂的河床。' +
        '他赤着脚站在盐田里，弯着腰用木耙一下下地把粗盐拢成堆，' +
        '动作机械而沉默，仿佛已经重复了一万遍。' +
        '他的眼神有些浑浊，但偶尔会露出精明的一闪——' +
        '在潮汐港晒私盐不是个简单活，' +
        '不仅要应付天气和潮水，还要应付朝廷的缉私船。' +
        '不过这些年朝廷的手伸不到这里来，' +
        '盐工们最大的烦恼，反倒是霍三刀的盐税涨价了。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'friendly');
    this.set('level', 15);
    this.set('max_hp', 480);
    this.set('hp', 480);
    this.set('combat_exp', 0);
    this.set('personality', 'honest');
    this.set('speech_style', 'folksy');
    this.set('chat_chance', 30);
    this.set('chat_msg', [
      '老李擦了擦额头的汗，看了看天色，又弯下腰继续耙盐。',
      '老李拎起一袋盐掂了掂分量，满意地系紧袋口放到推车上。',
      '老李蹲下来捏了一撮粗盐放在舌尖尝了尝，点了点头。',
    ]);
    this.set('inquiry', {
      盐: '老李停下手里的活，擦了擦手：「这盐啊，别看卖不上价，可离了它，海上的人活不下去。腌鱼、腌肉、防腐，全靠这玩意。」',
      生活: '老李叹了口气：「苦是苦，但比在海上拼命强。至少脚踩着地，心里踏实。家里还有两个娃等着吃饭呢。」',
      default: '老李朴实地笑笑：「客人好，来买盐？咱这盐虽然粗了点，但实诚。」',
    });
  }
}
