/**
 * 流浪野犬 — 洛阳废都·东城墙残段 / 西城墙残段
 * 在废都残墙一带流窜觅食的野犬，见人就凶，
 * 是初级玩家的练手怪
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class WildDog extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '流浪野犬');
    this.set('short', '一条瘦骨嶙峋的野狗');
    this.set(
      'long',
      '一条在废都城墙一带流浪的野犬，皮毛凌乱，肋骨在薄薄的皮肤下清晰可数。' +
        '它的耳朵一只已经破了个豁口，可能是跟别的野犬或什么动物打架留下的。' +
        '它的眼睛是浅黄色的，在废墟的阴影里透出一种警觉的光，盯着陌生人的方式像是在衡量对方值不值得扑上去。' +
        '流浪太久让它把一切陌生的靠近都当成威胁。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('attitude', 'hostile');
    this.set('level', 5);
    this.set('max_hp', 150);
    this.set('hp', 150);
    this.set('combat_exp', 30);
    this.set('chat_chance', 5);
    this.set('chat_msg', [
      '流浪野犬警惕地竖起耳朵，喉咙里发出低沉的呜咽，一步一步向后退。',
      '流浪野犬在残墙下翻找着什么，瘦削的肋骨随着呼吸起伏，突然察觉到你的存在，猛地抬起头。',
    ]);
  }
}
