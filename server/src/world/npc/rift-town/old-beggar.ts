/**
 * 老乞丐 — 裂隙镇南街
 * 看似落魄的乞丐，可能隐藏着秘密
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class OldBeggar extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '老乞丐');
    this.set('short', '一个蓬头垢面的老乞丐');
    this.set(
      'long',
      '南街墙角蹲着一个蓬头垢面的老乞丐，身上裹着一件破烂不堪的麻衣，' +
        '面前放着一个缺了口的破碗。他看起来瘦骨嶙峋、老态龙钟，' +
        '但偶尔抬起头时，那双浑浊的眼睛里似乎闪过一丝不同寻常的光芒。' +
        '镇上的人说他在这儿待了十几年了，没人知道他从哪来。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'neutral');
    this.set('level', 10);
    this.set('max_hp', 300);
    this.set('hp', 300);
    this.set('chat_chance', 10);
    this.set('chat_msg', [
      '老乞丐缩了缩身子，裹紧了破烂的麻衣。',
      '老乞丐咕哝着什么，听不太清楚。',
      '老乞丐呆呆地望着天空，嘴里含混地哼着不知名的调子。',
    ]);
    this.set('inquiry', {
      来历: '老乞丐嘿嘿笑了两声：「老叫花子嘛，哪来的不重要，有口饭吃就行。行行好，赏个铜板呗？」',
      裂谷: '老乞丐突然抬起头，眼神变得清明了一瞬：「裂谷……嘿嘿，那下面的东西，可不是你们能碰的。」随即又恢复了浑浑噩噩的模样。',
      default: '老乞丐迷迷糊糊地摇了摇头：「嗯？啥？行行好赏口饭吃……」',
    });
    this.set('equipment', [{ blueprintId: 'rift-town/torn-rags', position: 'body' }]);
  }
}
