/**
 * 黑市打手 — 烟雨镇·暗巷
 * 暗巷的看门人，凶狠敌对，拦截不速之客
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class DarkAlleyThug extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '黑市打手');
    this.set('short', '横眉冷目的花臂汉子');
    this.set(
      'long',
      '这汉子身材粗壮，两条胳膊上纹满了密密麻麻的纹身，' +
        '从手腕一直蔓延到脖子根。他的脸上没什么表情，' +
        '或者说，冷漠本身就是他的表情。' +
        '手里把玩着一把匕首，刀刃在昏暗的光线下闪着寒光。' +
        '他蹲在暗巷入口处，像一尊不会说话的门神，' +
        '用目光丈量着每一个经过的人，判断是自己人还是不速之客。' +
        '他身上有股混着汗味和铁锈的气息，是常年见血的人才有的味道。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.AN_HE);
    this.set('visible_faction', '');
    this.set('attitude', 'hostile');
    this.set('level', 9);
    this.set('max_hp', 380);
    this.set('hp', 380);
    this.set('combat_exp', 50);
    this.set('personality', 'aggressive');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 25);
    this.set('chat_msg', [
      '黑市打手把匕首在磨刀石上来回蹭了几下，眼睛却始终盯着巷口。',
      '黑市打手往嘴里塞了块干肉，咀嚼时腮帮子鼓起一块。',
      '黑市打手伸了个懒腰，骨节嘎嘎作响，又恢复了那副冷冰冰的样子。',
    ]);
    this.set('inquiry', {
      黑市:
        '黑市打手冷冷地盯着你：「什么黑市？这就是条普通的巷子。' +
        '你要是闲着没事做，去别处转悠，这里不欢迎闲人。」',
      default: '黑市打手连眼皮都没抬：「走。」',
    });
  }
}
