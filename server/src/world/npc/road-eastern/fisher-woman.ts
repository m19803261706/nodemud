/**
 * 渔村妇人 — 海路·渔村码头
 * 渔村中清理鱼获的妇人，朴实热心
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class FisherWoman extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '渔村妇人');
    this.set('short', '一个蹲在码头边收拾鱼获的妇人');
    this.set(
      'long',
      '妇人三十来岁模样，头上包着一块蓝花布巾，' +
        '几缕碎发被海风吹得贴在脸颊上。' +
        '她手脚麻利地将鱼开膛破肚，鱼鳞刮得干干净净，' +
        '丢进身旁的木桶里，动作快得让人眼花缭乱。' +
        '手背上有几道细小的刀痕，都是日积月累留下的。' +
        '她嘴角带着淡淡的笑意，对来往的人总是热情招呼。',
    );
    this.set('title', '');
    this.set('gender', 'female');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'friendly');
    this.set('level', 3);
    this.set('max_hp', 100);
    this.set('hp', 100);
    this.set('combat_exp', 15);
    this.set('personality', 'cheerful');
    this.set('speech_style', 'plain');
    this.set('chat_chance', 12);
    this.set('chat_msg', [
      '渔村妇人将一条大鱼摔在案板上，手起刀落，三两下便收拾利索。',
      '渔村妇人朝盘旋的海鸥挥挥手：「去去去，这些是要卖钱的！」',
      '渔村妇人哼着渔歌，节奏轻快，像是海浪拍岸的韵律。',
    ]);
    this.set('inquiry', {
      default:
        '渔村妇人抬头笑道：「外乡人吧？想吃鱼就说一声，' +
        '我家当家的今早打了好多黄花鱼，新鲜得很呢。' +
        '往东走就到潮汐港了，那边东西可比咱村贵多了。」',
    });
  }
}
