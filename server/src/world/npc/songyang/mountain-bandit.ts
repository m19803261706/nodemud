/**
 * 山匪 — 嵩阳山道乱石坡
 * 低级敌对 NPC，盘踞在山间打劫
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class MountainBandit extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '山匪');
    this.set('short', '一个鬼鬼祟祟的山匪');
    this.set(
      'long',
      '一个面色黝黑的汉子，身穿补丁摞补丁的粗布衣，腰间插着一把生锈的柴刀。他的目光游移不定，看见有人经过便下意识缩了缩脖子，又很快露出贪婪的神色。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'hostile');
    this.set('level', 6);
    this.set('max_hp', 250);
    this.set('hp', 250);
    this.set('combat_exp', 60);
    this.set('personality', 'cowardly');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 10);
    this.set('chat_msg', [
      '山匪东张西望，似乎在寻找下手的目标。',
      '山匪蹲在石头后面，啃着不知哪里偷来的干粮。',
      '山匪嘿嘿笑了两声，朝掌心吐了口唾沫搓了搓手。',
    ]);
    this.set('inquiry', {
      default: '山匪凶狠地叫道：「少废话！留下买路钱！」',
    });
  }
}
