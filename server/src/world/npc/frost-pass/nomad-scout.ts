/**
 * 北漠斥候 — 朔云关·关外哨所
 * 狼庭的游骑斥候，在草原边缘出没，敌对
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class NomadScout extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '北漠斥候');
    this.set('short', '一个骑在矮马上、手持弯弓的草原骑手');
    this.set(
      'long',
      '皮肤被草原的烈日和寒风刻出深深的纹路，面色赤铜。' +
        '穿着北漠特有的羊皮短袍，腰间扎着牛皮带，' +
        '带上挂着一把弯刀和一个装箭的皮囊。' +
        '手中的弯弓已经上了弦，随时可以射出致命的一箭。' +
        '他骑着一匹矮壮的草原马，马匹虽小但耐力极佳，' +
        '能在草原上连续奔跑一整天不歇。' +
        '他的眼神警惕而冷漠，像草原上的狼一样盯着你，' +
        '在判断你是猎物还是威胁。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.LANG_TING);
    this.set('visible_faction', '北漠·狼庭');
    this.set('attitude', 'hostile');
    this.set('level', 8);
    this.set('max_hp', 300);
    this.set('hp', 300);
    this.set('personality', 'stern');
    this.set('speech_style', 'terse');
    this.set('chat_chance', 30);
    this.set('chat_msg', [
      '北漠斥候勒住马缰，远远盯着城墙的方向，手指搭在弓弦上。',
      '北漠斥候低声说了几句听不懂的北漠话，然后催马向前移动了几步。',
      '北漠斥候从马背上取下水囊灌了一口，擦了擦嘴，眼睛始终没有离开你。',
    ]);
    this.set('inquiry', {
      default: '北漠斥候用生硬的中原话说：「南人……滚回你的石墙后面去。草原不是你的地方。」',
    });
  }
}
