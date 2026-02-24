/**
 * 沙漠蝎子 — 黄沙驿·沙窟/废弃营地
 * 沙漠中常见的危险生物，体型巨大，毒性不弱
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class SandScorpion extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '沙漠蝎子');
    this.set('short', '一只巴掌大的赤红色蝎子');
    this.set(
      'long',
      '这只蝎子有巴掌大小，通体赤红色，像是被沙漠的烈日晒透了。' +
        '两只大螯高高举起，尾巴弯成弧形，尾尖的毒刺闪着幽暗的光泽。' +
        '它在沙地上快速移动，八条腿踩出细密的沙痕，动作敏捷而无声。' +
        '沙漠蝎子是这片荒漠里最常见的危险生物之一，' +
        '被蛰一下不至于致命，但伤口会红肿疼痛数日，' +
        '如果是老弱之人，就很难说了。' +
        '它们喜欢藏在石缝和沙洞里，白天蛰伏，夜晚出来捕食。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'hostile');
    this.set('level', 10);
    this.set('max_hp', 280);
    this.set('hp', 280);
    this.set('combat_exp', 65);
    this.set('personality', 'aggressive');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 5);
    this.set('chat_msg', [
      '沙漠蝎子举着大螯，警惕地在沙地上横行，尾巴高高翘起。',
      '沙漠蝎子钻进沙里，只露出两只小眼睛和尾尖的毒刺。',
      '沙漠蝎子用螯夹住一只小虫，迅速送进口中，吃得嘎吱作响。',
    ]);
    this.set('inquiry', {
      default: '沙漠蝎子挥舞着大螯，尾巴的毒刺对准你，发出嘶嘶的威胁声。',
    });
  }
}
