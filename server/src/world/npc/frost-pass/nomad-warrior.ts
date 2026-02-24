/**
 * 北漠游骑 — 朔云关·关外哨所
 * 狼庭的巡逻骑兵，比斥候更强悍，敌对
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class NomadWarrior extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '北漠游骑');
    this.set('short', '一个身披狼皮、手持弯刀的草原骑兵');
    this.set(
      'long',
      '体格健壮，肩膀宽阔，披着一张灰狼皮做成的披风，' +
        '狼头搭在肩膀上，空洞的眼窝朝着前方。' +
        '手中的弯刀刀刃微微发亮，刀柄缠着牛皮条，被汗渍浸透。' +
        '他的脸上有三道蓝色的纹身，那是狼庭勇士的标记——' +
        '每杀一个敌人就纹一道，三道纹身意味着至少三条人命。' +
        '他骑的马比斥候的更高大，马鞍上挂着一面小皮盾和一支短矛。' +
        '整个人散发着一股野兽般的气息，' +
        '眼神里带着对南人城墙的蔑视和对战斗的渴望。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.LANG_TING);
    this.set('visible_faction', '北漠·狼庭');
    this.set('attitude', 'hostile');
    this.set('level', 10);
    this.set('max_hp', 400);
    this.set('hp', 400);
    this.set('personality', 'stern');
    this.set('speech_style', 'terse');
    this.set('chat_chance', 25);
    this.set('chat_msg', [
      '北漠游骑拔出弯刀在手中翻转了一圈，刀光映着草原上惨白的日光。',
      '北漠游骑用北漠语低声吼了一句，催马绕着哨所转了半圈，像在寻找破绽。',
      '北漠游骑从马背上取下短矛掂了掂，朝城墙的方向虚掷了一下，嘴角露出轻蔑的笑。',
    ]);
    this.set('inquiry', {
      default: '北漠游骑冷笑一声，用弯刀指着你：「长生天会收走你的命。」',
    });
  }
}
