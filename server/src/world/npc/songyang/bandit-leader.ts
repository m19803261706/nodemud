/**
 * 山匪头目 — 嵩阳山道乱石坡
 * 中级敌对 NPC，山匪团伙的领头者
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class BanditLeader extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '山匪头目');
    this.set('short', '一个满脸横肉的山匪头目');
    this.set(
      'long',
      '此人身材魁梧，披着一件半旧的皮甲，左臂上缠着一圈红布条——据说是这伙山匪认头目的标记。他右手握着一柄开山刀，刀背上有几道缺口，显然经历过不少搏杀。脸上的络腮胡里藏着一道旧伤疤，目露凶光。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'hostile');
    this.set('level', 11);
    this.set('max_hp', 520);
    this.set('hp', 520);
    this.set('combat_exp', 150);
    this.set('personality', 'aggressive');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 8);
    this.set('chat_msg', [
      '山匪头目拿刀背拍了拍掌心，斜眼打量着过路的行人。',
      '山匪头目朝手下吼道：「都机灵着点！别让肥羊跑了！」',
      '山匪头目靠在大石上，用刀尖剔着指甲缝里的泥。',
    ]);
    this.set('inquiry', {
      default: '山匪头目冷笑道：「嵩阳宗的人我都不怕，就凭你？把值钱的东西交出来！」',
    });
  }
}
