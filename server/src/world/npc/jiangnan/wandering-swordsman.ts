/**
 * 流浪剑客叶孤鸿 — 烟雨镇·画桥
 * 浪迹天涯的独行剑客，在桥上喝酒赏景
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class WanderingSwordsman extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '叶孤鸿');
    this.set('short', '倚栏饮酒的青年剑客');
    this.set(
      'long',
      '叶孤鸿年约二十五六，身形修长，穿着一件半旧的青灰色劲装，' +
        '背上斜挎一柄窄身长剑，剑鞘上系着一条褪色的红穗。' +
        '他靠在桥栏上，一手端着一壶酒，一手搭在剑柄上，' +
        '目光散漫地望着河面，像是在看风景，又像是在等什么人。' +
        '他的面容清秀但不算英俊，下巴上有一圈青色的胡茬，' +
        '透着风餐露宿的疲惫。' +
        '尽管看起来漫不经心，但偶尔有人走近时，' +
        '他握剑柄的手会不自觉地微微收紧。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'neutral');
    this.set('level', 11);
    this.set('max_hp', 480);
    this.set('hp', 480);
    this.set('combat_exp', 0);
    this.set('personality', 'loner');
    this.set('speech_style', 'laconic');
    this.set('chat_chance', 25);
    this.set('chat_msg', [
      '叶孤鸿仰头饮了一口酒，目光掠过桥下的乌篷船，又收了回来。',
      '叶孤鸿把手中的酒壶晃了晃，似乎在估量还剩多少。',
      '叶孤鸿用指尖弹了弹剑身，发出一声清越的嗡鸣，旋即消散。',
    ]);
    this.set('inquiry', {
      来历:
        '叶孤鸿淡淡一笑：「来历？从北边来的。' +
        '要去哪也不知道，走到哪算哪。' +
        '江湖上像我这样的人多得是，不值得好奇。」',
      剑法:
        '叶孤鸿低头看了看手中的剑，沉默了一会儿才说：' +
        '「剑法是师父教的，师父已经不在了。' +
        '这把剑也该找个地方歇一歇了……不过还不是时候。」',
      default: '叶孤鸿侧过头看了你一眼：「坐下喝一杯？' + '这桥上的风景不错，就是酒差了些。」',
    });
  }
}
